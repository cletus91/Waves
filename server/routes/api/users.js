const express = require("express");
const router = express.Router();
require("dotenv").config();
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");

// @route  POST api/users/register
// @desc   Register route
// @access Public

router.post(
  "/",
  [
    check("email", "Enter a valid email").isEmail(),
    check("name", "Name is required").not().isEmpty(),
    check("lastname", "Last name is required").not().isEmpty(),
    check("password", "Password should be a minimun of 8 characters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, lastname, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(500).json({ msg: "User already exists" });
      }

      user = new User({
        email,
        name,
        lastname,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      return res.send(user);
    } catch (err) {
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
