const express = require('express')

const routers = express.Router()

routers.get('', (req, res) => {
    res.render('index')
})

routers.get('/student', (req, res) => {
    res.render('student')
})

routers.get('/student/buy', (req, res) => {
    res.render('studentBuy')
})

routers.get('/student/credit', (req, res) => {
    res.render('studentCredit')
})

routers.get('/student/changepass', (req, res) => {
    res.render('studentChangePass')
})

routers.get('/student/help', (req, res) => {
    res.render('studentHelp')
})

routers.get('/admin', (req, res) => {
    res.render('admin')
})

routers.get('/admin/login', (req, res) => {
    res.render('adminLogin')
})

routers.get('/admin/changepass', (req, res) => {
    res.render('adminChangePass')
})

routers.get('/admin/student', (req, res) => {
    res.render('adminStudent')
})

routers.get('/admin/student/orders', (req, res) => {
    res.render('adminStudentOrders')
})

routers.get('/admin/student/payments', (req, res) => {
    res.render('adminStudentPayments')
})

routers.get('/admin/kitchen', (req, res) => {
    res.render('adminKitchen')
})

routers.get('/admin/days', (req, res) => {
    res.render('adminDays')
})

routers.get('/admin/day', (req, res) => {
    res.render('adminOneDay')
})

routers.get('/kitchen/login', (req, res) => {
    res.render('kitchenLogin')
})

routers.get('/kitchen', (req, res) => {
    res.render('kitchen')
})

routers.get('/kitchen/days', (req, res) => {
    res.render('kitchenDays')
})

routers.get('/kitchen/student', (req, res) => {
    res.render('kitchenCheck')
})

routers.get('/kitchen/changepass', (req, res) => {
    res.render('kitchenChangePass')
})

module.exports = routers