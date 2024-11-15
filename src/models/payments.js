const mongoose = require('mongoose')

// Define the schema for a payment
const paymentSchema = new mongoose.Schema({
    raisecredit: {
        type: Boolean,
        default: false
    },
    paidwithcredit: {
        type: Boolean,
        default: false
    },
    returnmoney: {
        type: Boolean,
        default: false
    },
    amount: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Amount must be a positive number!')
            }
        }
    },
    studentcredit: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Credit must be a positive number!')
            }
        }
    },
    dateofpaidday: {
        type: Number,
        default: 0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    }
}, {
    timestamps: true // Fixed typo from 'timestamp' to 'timestamps'
})

// Create the Payments model from the schema
const Payments = mongoose.model('Payments', paymentSchema)

module.exports = Payments