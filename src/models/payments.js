const mongoose = require('mongoose')

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
                throw new Error('Amount must be a postive number!')
            }
        }
    },
    studentcredit: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Credit must be a postive number!')
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
    timestamp: true
})

const Payments = mongoose.model('Payments', paymentSchema)

module.exports = Payments