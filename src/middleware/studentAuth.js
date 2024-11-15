const jwt = require('jsonwebtoken')
const Student = require('../models/student')

// Middleware to authenticate student users
const studentAuth = async (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const token = req.header('Authorization').replace('Bearer ', '')

        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Find the student user associated with the token
        const student = await Student.findOne({ _id: decoded._id, 'tokens.token': token })

        // If no student is found, throw an error
        if (!student) {
            throw new Error()
        }

        // Attach the token and student to the request object
        req.token = token
        req.student = student

        // Proceed to the next middleware or route handler
        next()
    } catch (e) {
        // Send a 401 Unauthorized response if authentication fails
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = studentAuth