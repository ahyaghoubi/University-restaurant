const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const kitchenSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        default: 'سلف'
    },
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},{
    timestamps: true
})


kitchenSchema.methods.toJSON = function () {
    const kitchen = this
    const kitchenObject = kitchen.toObject()

    delete kitchenObject.password
    delete kitchenObject.tokens

    return kitchenObject
}


kitchenSchema.methods.generateAuthToken = async function () {
    const kitchen = this
    const token = jwt.sign({ _id: kitchen._id.toString() }, process.env.JWT_SECRET)
    kitchen.tokens = kitchen.tokens.concat({ token })
    await kitchen.save()

    return token
}

kitchenSchema.statics.findByCredentials = async (username, password) => {
    const kitchen = await Kitchen.findOne({ username })

    if (!kitchen) {
        throw new Error('Unable to login!')
    }

    const isMatch = await bcrypt.compare(password, kitchen.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return kitchen
}

kitchenSchema.pre('save', async function (next) {
    const kitchen = this

    if (kitchen.isModified('password')) {
        kitchen.password = await bcrypt.hash(kitchen.password, 8)
    }

    next()
})

const Kitchen = mongoose.model('Kitchen', kitchenSchema)

module.exports = Kitchen