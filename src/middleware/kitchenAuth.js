// Import required modules
const jwt = require('jsonwebtoken')
const Kitchen = require('../models/kitchen')

// Middleware to authenticate kitchen users
const kitchenAuth = async (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const token = req.header('Authorization').replace('Bearer ', '')

        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Find the kitchen user associated with the token
        const kitchen = await Kitchen.findOne({ _id: decoded._id, 'tokens.token': token })

        // If no kitchen is found, throw an error
        if (!kitchen) {
            throw new Error()
        }

        // Attach the token and kitchen to the request object
        req.token = token
        req.kitchen = kitchen

        // Proceed to the next middleware or route handler
        next()
    } catch (e) {
        // Send a 401 Unauthorized response if authentication fails
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

// Export the kitchenAuth middleware
module.exports = kitchenAuth