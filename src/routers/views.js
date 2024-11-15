const express = require('express')

const routers = express.Router()

// Route for rendering the index page
routers.get('', (req, res) => {
    res.render('index')
})

// Route for rendering the student page
routers.get('/student', (req, res) => {
    res.render('student')
})

// Route for rendering the student buy page
routers.get('/student/buy', (req, res) => {
    res.render('studentBuy')
})

// Route for rendering the student credit page
routers.get('/student/credit', (req, res) => {
    res.render('studentCredit')
})

// Route for rendering the student change password page
routers.get('/student/changepass', (req, res) => {
    res.render('studentChangePass')
})

// Route for rendering the student help page
routers.get('/student/help', (req, res) => {
    res.render('studentHelp')
})

// Route for rendering the admin page
routers.get('/admin', (req, res) => {
    res.render('admin')
})

// Route for rendering the admin login page
routers.get('/admin/login', (req, res) => {
    res.render('adminLogin')
})

// Route for rendering the admin change password page
routers.get('/admin/changepass', (req, res) => {
    res.render('adminChangePass')
})

// Route for rendering the admin student page
routers.get('/admin/student', (req, res) => {
    res.render('adminStudent')
})

// Route for rendering the admin student orders page
routers.get('/admin/student/orders', (req, res) => {
    res.render('adminStudentOrders')
})

// Route for rendering the admin student payments page
routers.get('/admin/student/payments', (req, res) => {
    res.render('adminStudentPayments')
})

// Route for rendering the admin kitchen page
routers.get('/admin/kitchen', (req, res) => {
    res.render('adminKitchen')
})

// Route for rendering the admin days page
routers.get('/admin/days', (req, res) => {
    res.render('adminDays')
})

// Route for rendering the admin one day page
routers.get('/admin/day', (req, res) => {
    res.render('adminOneDay')
})

// Route for rendering the kitchen login page
routers.get('/kitchen/login', (req, res) => {
    res.render('kitchenLogin')
})

// Route for rendering the kitchen page
routers.get('/kitchen', (req, res) => {
    res.render('kitchen')
})

// Route for rendering the kitchen days page
routers.get('/kitchen/days', (req, res) => {
    res.render('kitchenDays')
})

// Route for rendering the kitchen check student page
routers.get('/kitchen/student', (req, res) => {
    res.render('kitchenCheck')
})

// Route for rendering the kitchen change password page
routers.get('/kitchen/changepass', (req, res) => {
    res.render('kitchenChangePass')
})

module.exports = routers