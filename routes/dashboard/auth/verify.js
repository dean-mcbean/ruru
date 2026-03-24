const { getUserByEmail } = require("../../../fetch/slack/get_user.js");
const Users = require("../../../storage/Users.js");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const verifyCode = (codeCache) => async (req, res) => {
  try {
    const { email, code } = req.body;
    const expected = codeCache.get(email);
    if (code !== expected) return res.status(401).send("Invalid code");

    let user = await Users.findOne({ email });
    const slackUser = await getUserByEmail(email);

    if (!user) {
      user = await Users.insertOne({
        email,
        slackId: slackUser.id,
        verified: true,
      });
    } else {
      user.verified = true;
      await Users.updateOne({ email }, { $set: { verified: true } });
    }

    const tokenJSON = {
      email,
      first_name: slackUser.profile.first_name,
      last_name: slackUser.profile.last_name,
      profile_image: slackUser.profile.image_192,
    };

    const refreshToken = jwt.sign(tokenJSON, JWT_SECRET, { expiresIn: "30d" });
    const accessToken = jwt.sign(tokenJSON, JWT_SECRET, { expiresIn: "15m" });

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.lastLogin = new Date();
    user.slack = slackUser;
    console.log("slackUser", slackUser);
    await user.save();

    res.status(200).send({ accessToken, refreshToken });
  } catch (err) {
    console.error("[verify] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = verifyCode;
