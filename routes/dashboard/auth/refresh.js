const Users = require('../../../storage/Users.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.JWT_SECRET;

const refreshCode = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const user = await Users.findOne({ email: payload.email });
    if (!user) return res.status(404).send('User not found');

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash || '');
    if (!valid) return res.status(403).send('Invalid token');

    const newAccessToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    res.send({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).send('Token expired or invalid');
  }
}

module.exports = refreshCode;