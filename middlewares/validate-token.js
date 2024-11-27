const jwt = require('jsonwebtoken')

 const verifyToken = (req, res, next) => {
    const token = req.header('auth-token')
    if (!token) return res.status(401).json({ error: 'Access danied!' })
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = verified
        next()
    } catch (error) {
        res.status(400).json({error: 'get token failed'})
    }
}

module.exports = verifyToken;