const mongoose = require('mongoose')
const moment = require('moment')

// Define the schema for a day
const daySchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
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
        unique: true,
        required: true,
        validate(value) {
            const now = moment().subtract(1, 'hour').unix()
            if (value < now) {
                throw new Error('You can NOT create a day in the past!')
            }
        }
    },
    capacity: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Capacity for this day is over!')
            }
        }
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Fixed typo from 'timestamp' to 'timestamps'
})

// Static method to reduce the capacity of a day by one
daySchema.statics.reduceCapacityByOne = async (date) => {
    const day = await Days.findOne({ date })

    if (!day) {
        throw new Error('Day does not exist!')
    }

    day.capacity = day.capacity - 1

    await day.save()

    return day
}

// Static method to increase the capacity of a day by one
daySchema.statics.raiseCapacityByOne = async (date) => {
    const day = await Days.findOne({ date })

    if (!day) {
        throw new Error('Day does not exist!')
    }

    day.capacity = day.capacity + 1

    await day.save()

    return day
}

// Create the Days model from the schema
const Days = mongoose.model('Days', daySchema)

module.exports = Days