const jwt = require('jsonwebtoken')
const Admin = require('../models/admin')

// Middleware to authenticate admin users
const adminAuth = async (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const token = req.header('Authorization').replace('Bearer ', '')

        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Find the admin user associated with the token
        const admin = await Admin.findOne({ _id: decoded._id, 'tokens.token': token })

        // If no admin is found, throw an error
        if (!admin) {
            throw new Error()
        }

        // Attach the token and admin to the request object
        req.token = token
        req.admin = admin

        // Proceed to the next middleware or route handler
        next()
    } catch (e) {
        // Send a 401 Unauthorized response if authentication fails
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = adminAuth