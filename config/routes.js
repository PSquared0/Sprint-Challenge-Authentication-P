const axios = require("axios");
const db = require("../database/dbConfig");
const { authenticate } = require("../auth/authenticate");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

module.exports = server => {
  server.post("/api/register", register);
  server.post("/api/login", login);
  server.get("/api/jokes", authenticate, getJokes);
};

const secret = process.env.JWT_SECRET;

function generateToken(user) {
  const payload = {
    username: user.username
  };
  const options = {
    expiresIn: "1hr",
    jwtid: "12345"
  };
  return jwt.sign(payload, secret, options);
}

function register(req, res) {
  const user = req.body;
  user.password = bcrypt.hashSync(user.password, 12);
  db.insert(user)
    .then(ids => {
      const id = ids[0];
      db.findUsers(id)
        .then(user => {
          const token = generateToken(user);
          res
            .status(201)
            .json({ id: user.id, token, message: "you are registered" });
        })
        .catch(err => {
          res.status(404).send({ err: "404" });
        });
    })
    .catch(err => {
      res.status(500).send({ err: "you cannot register" });
    });
}

function login(req, res) {
  const login = req.body;
  if (login.username && login.password) {
    db.findByUsername(login.username)
      .then(users => {
        if (
          users.length &&
          bcrypt.compareSync(login.password, users[0].password)
        ) {
          const token = generateToken(users[0]);
          res.status(200).json({ token, message: "you are logged in" });
        } else {
          res.status(404).send("You shall not pass!");
        }
      })
      .catch(err => {
        res.status(500).send({ err: "500" });
      });
  } else
    res.status(400).json({ err: "please provide a username and password" });
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: "application/json" }
  };
  axios
    .get("https://icanhazdadjoke.com/search", requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: "Error Fetching Jokes", error: err });
    });
}
