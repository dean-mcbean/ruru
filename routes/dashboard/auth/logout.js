const Users = require("../../../storage/Users.js");

const logout = async (req, res) => {
  const { email } = req.body;
  await Users.updateOne({ email }, { $unset: { refreshTokenHash: "" } });
  res.send({ message: "Logged out" });
};

module.exports = logout;
