const express = require('express')
const moment = require('moment-jalaali')
const bcrypt = require('bcryptjs')
const kitchenAuth = require('../middleware/kitchenAuth')
const Kitchen = require('../models/kitchen')
const Student = require('../models/student')
const Orders = require('../models/orders')
const Days = require('../models/days')
const router = new express.Router()

// Route for kitchen login
router.post('/api/kitchen/login', async (req, res) => {
    try {
        const kitchen = await Kitchen.findByCredentials(req.body.username, req.body.password)
        const token = await kitchen.generateAuthToken()
        res.send({ kitchen, token })
    } catch (e) {
        res.status(400).send()
    }
})

// Route for kitchen logout
router.post('/api/kitchen/logout', kitchenAuth, async (req, res) => {
    try {
        req.kitchen.tokens = []
        await req.kitchen.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Route for updating kitchen password
router.patch('/api/kitchen', kitchenAuth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['currentPass', 'newPass', 'repeatNewPass']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        if (req.body.newPass !== req.body.repeatNewPass) {
            return res.status(400).send({ error: 'Passwords do NOT match!' })
        }
        const kitchen = await Kitchen.findOne({ username: req.kitchen.username })
        if (!kitchen) {
            throw new Error('Unable to find kitchen!')
        }
        const isMatch = await bcrypt.compare(req.body.currentPass, kitchen.password)
        if (!isMatch) {
            throw new Error('Old password is wrong')
        }
        kitchen.password = req.body.newPass
        await kitchen.save()
        res.send(kitchen)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Route for fetching student orders
router.post('/api/kitchen/studentorders', kitchenAuth, async (req, res) => {
    try {
        const student = await Student.findOne({ studentNumber: req.body.studentNumber })
        const sort = { date: 1 }
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
                    month: m.format('jMMMM'),
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

// Route for creating a new day
router.post('/api/kitchen/day', kitchenAuth, async (req, res) => {
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

// Route for fetching all days
router.get('/api/kitchen/day', kitchenAuth, async (req, res) => {
    try {
        let listOfDays = []
        const resSendFunc = () => {
            listOfDays.sort((a, b) => a.date - b.date)
            res.send({ listOfDays })
        }
        const days = await Days.find({})
        const now = moment().unix()
        days.forEach(async (day, index) => {
            const orders = await Orders.find({ date: day.date })
            if (day.date > now) {
                const m = moment.unix(day.date)
                listOfDays.push({
                    description: day.description,
                    price: day.price,
                    date: day.date,
                    year: m.jYear(),
                    month: m.format('jMMMM'),
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

// Route for updating a day
router.patch('/api/kitchen/day', kitchenAuth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'price', 'year', 'month', 'day', 'capacity', 'date', 'monthInNum']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const day = await Days.findOne({ date: req.body.date })

        if (!day) {
            throw new Error('Day does not exist')
        }

        const date = moment(`${req.body.year}/${req.body.monthInNum}/${req.body.day}`, 'jYYYY/jM/jD').unix()
        day.description = req.body.description
        day.price = req.body.price
        day.date = date
        day.capacity = req.body.capacity
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

// Route for deleting a day
router.delete('/api/kitchen/day', kitchenAuth, async (req, res) => {
    try {
        const day = await Days.findOneAndDelete({ date: req.body.date })
        const orders = await Orders.find({ date: req.body.date })
        for (const order of orders) {
            const st = await order.populate('owner')
            st.owner.credit += order.price
            st.owner.save()
        }
        await Orders.deleteMany({ date: req.body.date })
        !day ? res.status(404).send() : res.send(day)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Route for activating/deactivating a day
router.post('/api/kitchen/activeDay', kitchenAuth, async (req, res) => {
    try {
        const day = await Days.findOne({ date: req.body.date })

        if (!day) {
            throw new Error('Day does not exist')
        }

        day.active = req.body.value
        await day.save()
        res.send(day)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router