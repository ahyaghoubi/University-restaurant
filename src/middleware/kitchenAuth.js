const jwt = require('jsonwebtoken')
const Kitchen = require('../models/kitchen')

const kitchenAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const kitchen = await Kitchen.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!kitchen) {
            throw new Error()
        }

        req.token = token
        req.kitchen = kitchen
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = kitchenAuth