const express = require('express')
const moment = require('moment-jalaali')
const adminAuth = require('../middleware/adminAuth')
const Admin = require('../models/admin')
const Student = require('../models/student')
const Kitchen = require('../models/kitchen')
const Payments = require('../models/payments')
const Days = require('../models/days')
const Orders = require('../models/orders')
const router = new express.Router()

// router.post('/api/admin', async (req, res) => {
//     const admin = new Admin(req.body)

//     try {
//         await admin.save()
//         const token = await admin.generateAuthToken()
//         res.status(201).send({ admin, token })
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

router.post('/api/admin/login', async (req , res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.username, req.body.password)
        const token = await admin.generateAuthToken()
        res.send({ admin, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/api/admin/logout',adminAuth, async (req, res) => {
    try {
        req.admin.tokens = []
        await req.admin.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/api/admin', adminAuth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['currentPass', 'newPass', 'repeatNewPass']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        req.admin.password = req.body.newPass
        await req.admin.save()
        res.send(req.admin)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/api/admin/student', adminAuth, async (req, res) => {
    try {
        const student = new Student(req.body)
        await student.save()
        res.status(201).send(student)
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/api/admin/onestudent', adminAuth, async (req, res) => {
    try {
        const student = await Student.findOne({ studentNumber: req.body.studentNumber })
        if (!student) return res.status(404).send('Could Not find student!')
        res.send(student)
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/api/admin/students', adminAuth, async (req, res) => {
    try {
        const students = await Student.find({})
        const numofstudents = students.length
        res.send({ students, numofstudents })
    } catch (e) {
        res.status(400).send()
    }
})

router.patch('/api/admin/student', adminAuth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['firstName', 'lastName', 'studentNumber', 'credit']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const student = await Student.findOne({ studentNumber: req.body.studentNumber })


        if(!student) {
            throw new Error('Studnet does not exist')
        }
        
        updates.forEach((update) => student[update] = req.body[update])
        await student.save()
        res.send(student)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/api/admin/studentorders', adminAuth, async (req, res) => {
    try {
        const student = await Student.findOne({ studentNumber: req.body.studentNumber })
        const sort = {
            date: 1
        }
        await student.populate({
            path: 'orders',
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        
        const now = moment().unix()
        let ordersWithFaDes = []
        student.orders.forEach((order) => {
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
        res.send({ student, studentOrders: ordersWithFaDes })
    } catch (e) {
        res.status(400).send()
    }
})

router.delete('/api/admin/studentorders', adminAuth, async (req, res) => {
    try {
        
        const order = await Orders.findOneAndDelete({
            owner: req.body.student._id,
            date: req.body.date
        })
        
        const student = await Student.raiseCredit(req.body.student.studentNumber, order.price)
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

router.post('/api/admin/studentpayments', adminAuth, async (req, res) => {
    try {
        const student = await Student.findOne({ studentNumber: req.body.studentNumber })

        const sort = {
            createdAt: 1
        }
        await student.populate({
            path: 'payments',
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        let paymentsWithFaDes = []
        student.payments.forEach((payment) => {
            if(payment.dateofpaidday) {
                const m = moment(payment._id.getTimestamp())
                const paidDayDate = moment.unix(payment.dateofpaidday)
                paymentsWithFaDes.push({
                    raisecredit: payment.raisecredit,
                    paidwithcredit: payment.paidwithcredit,
                    returnmoney: payment.returnmoney,
                    amount: payment.amount,
                    studentcredit: payment.studentcredit,
                    dateofpaidday: `${paidDayDate.format('dddd')} ${paidDayDate.jDate()} ${paidDayDate.format('jMMMM')} ${paidDayDate.jYear()}`,
                    faFullDate: `${m.format('dddd')} ${m.jDate()} ${m.format('jMMMM')} ${m.jYear()} در ساعت ${m.hours()}:${m.minutes()}:${m.seconds()}`,
                    date: moment(payment._id.getTimestamp()).unix()
                })
            } else {
                const m = moment(payment._id.getTimestamp())
                paymentsWithFaDes.push({
                    raisecredit: payment.raisecredit,
                    paidwithcredit: payment.paidwithcredit,
                    returnmoney: payment.amount,
                    amount: payment.amount,
                    studentcredit: payment.studentcredit,
                    faFullDate: `${m.format('dddd')} ${m.jDate()} ${m.format('jMMMM')} ${m.jYear()} ${m.hours()}:${m.minutes()}:${m.seconds()}`,
                    date: moment(payment._id.getTimestamp()).unix()
                })
            }
            
        })
        paymentsWithFaDes.sort((a, b) => a.date - b.date)
        res.send({ student, studentPayments: paymentsWithFaDes })
    } catch (e) {
        res.status(400).send()
    }
})

router.delete('/api/admin/student', adminAuth, async (req, res) => {
    try {
        const student = await Student.findOneAndDelete({ studentNumber: req.body.studentNumber })

        !student ? res.status(404).send() :
        
        res.send(student)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/api/admin/kitchen', adminAuth, async (req, res) => {
    const kitchen = new Kitchen(req.body)

    try {
        await kitchen.save()
        res.status(201).send({ kitchen })
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/api/admin/kitchen', adminAuth, async (req, res) => {
    try {
        const kitchens = await Kitchen.find()
        res.send(kitchens)
    } catch (e) {
        res.status(400).send()
    }
})

router.patch('/api/admin/kitchen', adminAuth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'username','password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const kitchen = await Kitchen.findOne({ username: req.body.username })

        if(!kitchen) {
            throw new Error('Kitchen does not exist')
        }
        
        updates.forEach((update) => kitchen[update] = req.body[update])
        await kitchen.save()
        res.send(kitchen)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/api/admin/kitchen', adminAuth, async (req, res) => {
    try {
        const kitchen = await Kitchen.findOneAndDelete({ username: req.body.username })

        !kitchen ? res.status(404).send() :
        
        res.send(kitchen)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/api/admin/day', adminAuth, async (req, res) => {
    try {
        const date = moment(`${req.body.day.year}/${req.body.day.monthInNum}/${req.body.day.day}`, 'jYYYY/jM/jD').add(12, 'hours').unix()
        const dayToSave = {
            description: req.body.day.description,
            price: req.body.day.price,
            date,
            capacity: req.body.day.capacity
        }
        const day = new Days(dayToSave)
        await day.save()

        res.status(201).send(day)
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/api/admin/day', adminAuth, async (req, res) => {
    try {
        let listOfDays = []
        const resSendFunc = () => {
            listOfDays.sort((a, b) => a.date - b.date)
            res.send({ listOfDays })
        }
        const days = await Days.find({})
        const now = moment().unix()
        days.forEach(async (day, index) => {
            const orders = await Orders.find({date: day.date})
            if (day.date > now) {
                const m = moment.unix(day.date)
                listOfDays.push({
                    description: day.description,
                    price: day.price,
                    date: day.date,
                    year: m.jYear(),
                    month:m.format('jMMMM'),
                    day: m.jDate(),
                    dow: m.format('dddd'),
                    numOfOrder: orders.length,
                    capacity: day.capacity,
                    monthInNum: m.jMonth() + 1,
                    active: day.active
                })
            }
            if ((index + 1) === days.length) resSendFunc()
        })
    } catch (e) {
        res.status(400).send()
    }
})

router.patch('/api/admin/day', adminAuth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'price', 'year', 'month', 'day', 'capacity', 'date', 'monthInNum']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    
    try {
        const day = await Days.findOne({ date: req.body.date })

        if(!day) {
            throw new Error('Day does not exist')
        }
        
        const date = moment(`${req.body.year}/${req.body.monthInNum}/${req.body.day}`, 'jYYYY/jM/jD').unix()
        day.description = req.body.description
        day.price = req.body.price
        day.date = date
        day.capacity = day.capacity
        if (day.isModified('date')) {
            const orders = await Orders.find({ date: req.body.date })
            for (const order of orders) {
                order.date = date
                await order.save()
            }
        }
        await day.save()
        res.send(day)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/api/admin/day', adminAuth, async (req, res) => {
    try {
        const day = await Days.findOneAndDelete({ date: req.body.date })
        const orders = await Orders.find({ date: req.body.date })
        for (const order of orders) {
            const st = await order.populate('owner')
            st.owner.credit += order.price 
            st.owner.save()
        }
        await Orders.deleteMany({ date: req.body.date })
        !day ? res.status(404).send() :
        
        res.send(day)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/api/admin/activeDay', adminAuth, async (req, res) => {
    try {
        const day = await Days.findOne({ date: req.body.date })

        if(!day) {
            throw new Error('Day does not exist')
        }
        
        day.active = req.body.value
        await day.save()
        res.send(day)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/api/admin/getoneDay', adminAuth, async (req, res) => {
    try {
        const day = await Days.findOne({ date: req.body.date })

        const m = moment.unix(day.date)
        const dayToSend = {
            description: day.description,
            price: day.price,
            date: day.date,
            year: m.jYear(),
            month:m.format('jMMMM'),
            day: m.jDate(),
            dow: m.format('dddd'),
            capacity: day.capacity,
            monthInNum: m.jMonth() + 1
        }
        res.send(dayToSend)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/api/admin/oneDay', adminAuth, async (req, res) => {
    try {
        const orders = await Orders.find({ date: req.body.date })
        
        let students = []
        for (const order of orders) {
            const student = await Student.findById(order.owner)
            students.push(student)
        }
        
        res.send(students)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router