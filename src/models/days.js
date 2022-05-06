const mongoose = require('mongoose')
const moment = require('moment')

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
                throw new Error('Price must be a postive number!')
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
    timestamp: true
})

daySchema.statics.reduceCapacityByOne = async (date) => {
    const day = await Days.findOne({ date })

    day.capacity = day.capacity - 1

    await day.save()

    return day
}

daySchema.statics.raiseCapacityByOne = async (date) => {
    const day = await Days.findOne({ date })

    if (!day) {
        throw new Error('Day does not exist!')
    }
    day.capacity = day.capacity + 1

    await day.save()

    return day
}

const Days = mongoose.model('Days', daySchema)

module.exports = Days