require("dotenv").config();
require("./configs/database").connect();

const express = require("express");
const User = require("./models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authentication = require("./middlewares/authentication");

const app = express();

app.use(express.json());

app.post("/welcome", authentication, (req, res) => {
  res.status(200).send("welcome 🙌 ");
});

app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    if (!(firstname && lastname && email && password)) {
      return res.status(400).send("all fields are required");
    }

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).send("user already exists");
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    const token = jwt.sign(
      {
        user_id: user._id,
        email,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    user.token = token;
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).send("all fields are required");
    }

    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowerCaseEmail });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        {
          user_id: user._id,
          email: lowerCaseEmail,
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      user.token = token;
      return res.status(200).json(user);
    }

    res.status(400).send("invalid credentials");
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
