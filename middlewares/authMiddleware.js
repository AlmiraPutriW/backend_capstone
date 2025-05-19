const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Ambil token dari cookie atau header Authorization
    const tokenFromCookie = req.cookies?.authToken;
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
        return res.status(401).json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = verified;
        req.userId = verified.userId || verified.id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Waktu Login habis, silakan login kembali.' });
    }
};

module.exports = verifyToken;
