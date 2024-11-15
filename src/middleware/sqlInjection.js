// Function to detect SQL injection patterns in a given value
const detector = (value) => {
    let isSI = false
    // Regular expression to detect common SQL meta-characters
    const sql_meta = new RegExp('(%27)|(--)|(%23)|(#)', 'i')
    if (sql_meta.test(value)) {
        isSI = true
    }
    // Regular expression to detect SQL meta-characters with equal sign
    const sql_meta2 = new RegExp('((%3D)|(=))[^\n]*((%27)|(--)|(%3B)|(;))', 'i')
    if (sql_meta2.test(value)) {
        isSI = true
    }
    // Regular expression to detect typical SQL injection patterns
    const sql_typical = new RegExp('w*((%27)|(\'))((%6F)|o|(%4F))((%72)|r|(%52))', 'i')
    if (sql_typical.test(value)) {
        isSI = true
    }
    // Regular expression to detect SQL union keyword
    const sql_union = new RegExp('((%27)|(\'))union', 'i')
    if (sql_union.test(value)) {
        isSI = true
    }
    return isSI
}

// Middleware to detect SQL injection in request URLs and body
const sqlInjection = (req, res, next) => {
    // Check for SQL injection in the original URL
    if (req.originalUrl && detector(req.originalUrl)) {
        return res.status(403).send({ error: 'SQL injection detected' })
    }
    // Check for SQL injection in the request body
    const keys = Object.keys(req.body)
    for (const key of keys) {
        const allowedKeys = ['password', 'currentPass', 'newPass', 'repeatNewPass']
        if ((!allowedKeys.includes(key)) && detector(req.body[key])) {
            return res.status(403).send({ error: 'SQL injection detected' })
        }
    }
    return next()
}

module.exports = sqlInjection