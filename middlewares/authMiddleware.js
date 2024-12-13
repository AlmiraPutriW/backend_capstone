const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken;
 
    if (!token) {
        return res.status(401).json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Waktu Login habis, silahkan login kembali' });
    }
};

module.exports = verifyToken;

