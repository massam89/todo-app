const LocalStrategy = require("passport-local").Strategy;
const mysql = require("mysql");
const bcrypt = require("bcryptjs");

const connection = mysql.createConnection(process.env.LOCAL_DATABASE_URL);
let User;

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      //Match User
      const queryText = `SELECT * FROM users WHERE user_email = ? `;
      connection.query(queryText, [email], (err, results, fields) => {
        if (err) throw err;

        if (results[0]) {
          User = results[0];
          bcrypt.compare(password, results[0].user_password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, results[0]);
            } else {
              return done(null, false, { message: "password incorrect" });
            }
          });
        } else {
          return done(null, false, { message: "This email is not registered" });
        }
      });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.user_id);
  });

  passport.deserializeUser((id, done) => {
    done(null, User.user_id);
  });
};
