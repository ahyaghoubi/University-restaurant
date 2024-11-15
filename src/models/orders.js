const mongoose = require('mongoose')

// Define the schema for an order
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
                throw new Error('Price must be a positive number!')
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
    timestamps: true // Fixed typo from 'timestamp' to 'timestamps'
})

// Create the Orders model from the schema
const Orders = mongoose.model('Orders', ordersSchema)

module.exports = Orders