const jwt = require('jsonwebtoken')
require('dotenv').config()

const checkAuth = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1]
    // console.log(token);
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.userData = decode
        next()
    } catch(err) {
        console.log('JWT Token verification failed.', err);
        return res.status(401).json({success: true, error: "You're not authorized."})
    }
}
module.exports = checkAuth