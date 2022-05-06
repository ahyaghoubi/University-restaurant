const detector = (value) => {
    let isSI = false
    const sql_meta = new RegExp('(%27)|(\')|(--)|(%23)|(#)', 'i')
    if (sql_meta.test(value)) {
        isSI = true
    }
    const sql_meta2 = new RegExp('((%3D)|(=))[^\n]*((%27)|(\')|(--)|(%3B)|(;))', 'i')
    if (sql_meta2.test(value)) {
        isSI = true
    }

    const sql_typical = new RegExp('w*((%27)|(\'))((%6F)|o|(%4F))((%72)|r|(%52))', 'i')
    if (sql_typical.test(value)) {
        isSI = true
    }

    const sql_union = new RegExp('((%27)|(\'))union', 'i')
    if (sql_union.test(value)) {
        isSI = true
    }

    return isSI
}

const sqlInjection = (req, res, next) => {
    if (req.originalUrl && detector(req.originalUrl)) {
            return res.status(403).send({ error: 'SQL injection detected' })
    }
    const keys = Object.keys(req.body)
    keys.forEach((key) => {
        const allowedKeys = ['password', 'currentPass', 'newPass', 'repeatNewPass']
        if((!allowedKeys.includes(key)) && detector(req.body[key])) {
            return res.status(403).send({ error: 'SQL injection detected' })
        }
    })
    return next()
}

module.exports = sqlInjection