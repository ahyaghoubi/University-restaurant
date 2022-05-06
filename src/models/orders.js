const mongoose = require('mongoose')

const ordersSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Price must be a postive number!')
            }
        }
    },
    date: {
        type: Number,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    }
}, {
    timestamp: true
})

const Orders = mongoose.model('Orders', ordersSchema)

module.exports = Orders