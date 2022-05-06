const express = require('express')
const moment = require('moment-jalaali')
const bcrypt = require('bcryptjs')
const studentAuth = require('../middleware/studentAuth')
const Student = require('../models/student')
const Orders = require('../models/orders')
const Days = require('../models/days')
const Payments = require('../models/payments')
const router = new express.Router()

moment.loadPersian({dialect: 'persian-modern'})

router.post('/api/student/login', async (req, res) => {
    try {
        const student = await Student.findByCredentials(req.body.studentNumber, req.body.password)
        const token = await student.generateAuthToken()
        res.send({ firstName: student.firstName, lastName:student.lastName, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/api/student/logout', studentAuth, async (req, res) => {
    try {
        req.student.tokens = []
        await req.student.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/api/student', studentAuth, async (req, res) => {
    try {
        res.send(req.student)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/api/student', studentAuth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['currentPass', 'newPass', 'repeatNewPass']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        if (!req.body.newPass === req.body.repeatNewPass) {
            return res.status(400).send({ error: 'Passwords do NOT match!' })
        }
        const student = await Student.findOne({ studnetNumber: req.student.studentNumber })
        if (!student) {
            throw new Error('Unable to fine student!')
        }
        const isMatch = await bcrypt.compare(req.body.currentPass, student.password)
        
        if (!isMatch) {
            throw new Error('Old password is wrong')
        }
        
        student.password = req.body.newPass
        await student.save()
        res.send(student)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/api/student/getdays', studentAuth, async (req, res) => {
    try {
        const days = await Days.find()
        const now = moment().unix()
        let daysWithFaDes = []
        days.forEach((day) => {
            if (day.date > now && day.capacity > 0 && day.active) {
                const m = moment.unix(day.date)
                daysWithFaDes.push({
                    description: day.description,
                    price: day.price,
                    date: day.date,
                    year: m.jYear(),
                    month:m.format('jMMMM'),
                    day: m.jDate(),
                    dow: m.format('dddd')
                })
            }
        })
        daysWithFaDes.sort((a, b) => a.date - b.date)
        res.send(daysWithFaDes)
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/api/student/orders', studentAuth, async (req, res) => {
    try {
        const resSend = async (orderList) => {
            res.status(201).send(orderList)
        }

        const now = moment().unix()
        let total = 0
        req.body.listoforders.forEach((item) => {
            if (item.date < now) throw new Error('Date should be in the future!')
            if (item.paidwithcredit) total += item.price
        })

        const student = await Student.payWithCredit(req.student.studentNumber, total)

        req.body.listoforders.forEach(async (orderitem, index) => {
            try {
                const day = await Days.findOne({ date: orderitem.date })
                if(!day) return res.status(400).send('Day does not exsit!')
                
                const existorder = await Orders.findOne({ date: orderitem.date, owner: req.student._id })
                if (existorder) return res.status(400).send('Order Exist!')
    
                const order = new Orders({
                    description: day.description,
                    price: day.price,
                    date: day.date,
                    owner: req.student._id
                })
                if (orderitem.paidwithcredit) {
                    const payment = new Payments({
                        paidwithcredit: true,
                        amount: order.price,
                        dateofpaidday: order.date,
                        studentcredit: student.credit,
                        owner: student._id
                    })
                    await payment.save()
                } else {
                    const payment = new Payments({
                        amount: order.price,
                        dateofpaidday: order.date,
                        studentcredit: req.student.credit,
                        owner: req.student._id
                    })
                    await payment.save()
                }
                await Days.reduceCapacityByOne(orderitem.date)
                await order.save()
                if ((index + 1) === req.body.listoforders.length) await resSend(req.body.listoforders)
            } catch (e) {
                console.log(e)
                res.status(400).send()
            }
        })
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /api/student/orders?limit=10&skip=20
router.get('/api/student/orders', studentAuth, async (req, res) => {
    try {
        const sort = {
            date: 1
        }
        await req.student.populate({
            path: 'orders',
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        const now = moment().unix()
        let ordersWithFaDes = []
        req.student.orders.forEach((order) => {
            if (order.date > now) {
                const m = moment.unix(order.date)
                ordersWithFaDes.push({
                    description: order.description,
                    price: order.price,
                    date: order.date,
                    year: m.jYear(),
                    month:m.format('jMMMM'),
                    day: m.jDate(),
                    dow: m.format('dddd')
                })
            }
        })
        res.send(ordersWithFaDes)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.delete('/api/student/orders', studentAuth, async (req, res) => {
    try {
        const order = await Orders.findOne({
            owner: req.student._id,
            date: req.body.date
        })

        if (!order) {
            return res.status(404).send()
        }

        const now = moment().unix()
        if ((order.date - now) < 172800) {
            return res.status(400).send('You can not delete this order anymore!')
        }

        await Orders.findOneAndDelete({
            owner: req.student._id,
            date: req.body.date
        })

        const student = await Student.raiseCredit(req.student.studentNumber, order.price)
        const payment = new Payments({
            returnmoney: true,
            amount: order.price,
            studentcredit: student.credit,
            dateofpaidday: order.date,
            owner: student._id
        })
        await payment.save()

        await Days.raiseCapacityByOne(req.body.date)

        res.send(order)
    } catch (e) {
        res.status(500).send(e)
    }

})

router.post('/api/student/raisecredit', studentAuth, async (req, res) => {
    try {
        const student = await Student.raiseCredit(req.student.studentNumber, Number(req.body.amount))
        const payment = new Payments({
            raisecredit: true,
            amount: req.body.amount,
            studentcredit: student.credit,
            owner: student._id
        })
        await payment.save()
        res.send(student)
    } catch (e) {
        res.status(500).send()
    }
})

// GET /api/student/orders?limit=10&skip=20
router.get('/api/student/payments', studentAuth, async (req, res) => {
    try {
        const sort = {
            createdAt: -1
        }

        await req.student.populate({
            path: 'payments',
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })

        res.send(req.student.payments)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router