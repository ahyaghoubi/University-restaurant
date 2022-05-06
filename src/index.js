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
const port = process.env.PORT

app.use(express.json())
app.use(sqlInjection)
app.use(adminRouter)
app.use(kitchenRouter)
app.use(studentRouter)

const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

app.use(express.static(publicDirectoryPath))

app.use(viewsRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
