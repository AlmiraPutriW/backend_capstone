const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            nama : user.nama,
            password: user.password,
            telp : user.telp,
            role : user.role,
            image: user.image,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '24h' }
    );
};

module.exports = { generateToken };
