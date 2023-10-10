const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateToken(user) {
  return jwt.sign({ id: user.id, nombre_usuario: user.nombre_usuario }, 'tu_secreto', { expiresIn: '1h' });
}

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token || typeof token !== 'string') {
    return res.status(401).json({ message: 'Token no es String' });
  }

  jwt.verify(token, 'tu_secreto', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    req.user = decoded;
    next();
  });
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = { generateToken, verifyToken, hashPassword };
