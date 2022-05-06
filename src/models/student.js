const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const studentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    studentNumber: {
        type: Number,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Student Number must be a positive!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
    },
    credit: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Credit must be a positive!')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

studentSchema.virtual('orders', {
    ref: 'Orders',
    localField: '_id',
    foreignField: 'owner'
})

studentSchema.virtual('payments', {
    ref: 'Payments',
    localField: '_id',
    foreignField: 'owner'
})

studentSchema.set('toObject', { virtuals: true })
studentSchema.set('toJSON', { virtuals: true })

studentSchema.methods.toJSON = function () {
    const student = this
    const studentObject = student.toObject()

    delete studentObject.password
    delete studentObject.tokens

    return studentObject
}


studentSchema.methods.generateAuthToken = async function () {
    const student = this
    const token = jwt.sign({ _id: student._id.toString() }, process.env.JWT_SECRET)

    student.tokens = student.tokens.concat({ token })
    await student.save()

    return token
}

studentSchema.statics.findByCredentials = async (studentNumber, password) => {
    const student = await Student.findOne({ studentNumber })

    if (!student) {
        throw new Error('Unable to login!')
    }

    const isMatch = await bcrypt.compare(password, student.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return student
}

studentSchema.statics.raiseCredit = async (studentNumber, amount) => {
    if (amount < 0) throw new Error('Amount can not be negative!')
    
    const student = await Student.findOne({ studentNumber })

    if (!student) throw new Error('Could not find the student!')

    student.credit = student.credit + amount

    student.save()
    return student
}

studentSchema.statics.payWithCredit = async (studentNumber, amount) => {
    
    if (amount < 0) throw new Error('Amount can not be negative!')
    
    const student = await Student.findOne({ studentNumber })
    
    if (amount === 0) return student
    
    if (!student) throw new Error('Could not find the student!')

    student.credit = student.credit - amount

    if (student.credit < 0) throw new Error('Credit can NOT be negative!')

    student.save()
    return student
}

studentSchema.pre('save', async function (next) {
    const student = this

    if (student.isModified('password')) {
        student.password = await bcrypt.hash(student.password, 8)
    }

    next()
})

const Student = mongoose.model('Student', studentSchema)

module.exports = Student