const path = require('path')
const express = require('express')
const hbs = require('hbs')
require('./db/mongoose')
const sqlInjection = require('./middleware/sqlInjection')
const adminRouter = require('./routers/admin')
const kitchenRouter = require('./routers/kitchen')
const studentRouter = require('./routers/student')
const viewsRouter = require('./routers/views')

const app = express()
const port = process.env.PORT || 3000

// Middleware to parse JSON requests
app.use(express.json())

// Middleware to prevent SQL injection
app.use(sqlInjection)

// Routers for different routes
app.use(adminRouter)
app.use(kitchenRouter)
app.use(studentRouter)

// Paths for static files and views
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setting up Handlebars as the view engine
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Serving static files
app.use(express.static(publicDirectoryPath))

// Router for view routes
app.use(viewsRouter)

// Starting the server
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})