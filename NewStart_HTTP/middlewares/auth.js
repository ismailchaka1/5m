const jwt = require('jsonwebtoken');

function auth (req, res, next) {
   const token = req.header('x-auth-token');
   if (!token) return res.status(401).send('Access rejected...!');
   
   try {
      const decode = jwt.verify(token, 'privateKey_e6jK?q7?;tqP+!U');
      req.license = decode.license;
      next();

   } catch {
      res.status(400).send('Wrong token...');
   }
}

module.exports = auth;