const verifyRole = (requiredRole) => {
    return (req, res, next) => {
      const userRole = req.user.role; 

      console.log(userRole)
      if (userRole !== requiredRole) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    };
  };
  
 module.exports = verifyRole;