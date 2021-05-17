const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const passport = require('passport');
const connection = mysql.createConnection(process.env.LOCAL_DATABASE_URL);
const { ensureAuthenticated2 } = require('../config/auth2')
//Login Page
router.get("/login",ensureAuthenticated2, (req, res) => res.render("login"));
//Register Page
router.get("/register",ensureAuthenticated2, (req, res) => res.render("register"));

//Register Handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //Check required field
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  //Check password match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  //Check pass length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, name, email });
  } else {
    const queryText = `SELECT * From users WHERE user_email = '${email}'`;

    connection.query(queryText, function (error, results, fields) {
      if (error) throw error;

      if (results[0]) {
        errors.push({ msg: "Email already registerd" });
        res.render("register", { errors, name, email });
      } else {
        const newUser = {
          name,
          email,
          password,
          date: new Date()
        };

        bcrypt.genSalt(10, (err, salt) =>{
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err) throw err;
                newUser.password = hash

                const queryText = `INSERT INTO users (user_email, user_password, user_created) VALUES(?, ?, ?)`;
                connection.query(queryText, [newUser.email, newUser.password, newUser.date], (err, results, fields) => {
                  if (err) throw err
                  console.log(results)
                  req.flash('success_msg', 'You are now registerd and can login')
                  res.redirect('/users/login')
                })
            })
        })
      }
    });
  }
});

//login handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
})

//logout handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login')
})

module.exports = router;
