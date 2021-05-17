const express = require("express");
const router = express.Router()
const mysql = require("mysql");;
const { ensureAuthenticated } = require('../config/auth');
const { ensureAuthenticated2 } = require('../config/auth2');
const { v4: uuidv4 } = require('uuid');

const connection = mysql.createConnection(process.env.LOCAL_DATABASE_URL);

//welcome page
router.get("/",ensureAuthenticated2, (req, res) => res.render("welcome"));

//dashboard
router.get("/dashboard",ensureAuthenticated, (req, res) => {

  queryText = `SELECT todo_id, todo_status, todo_text, user_email from todo join users on todo_user = user_id where user_id = ${req.user}`
 
  connection.query(queryText, function (error, results, fields) {
    if (error) throw error;
    console.log(results)
    for (i = 0; i < results.length; i++) {
      if (results[i].todo_status == 1) {
        results[i].todo_status = 'checked';
      } else {
        results[i].todo_status = '';
      }
    }

    res.render('dashboard', { item: results, email: results[0] === undefined ? `Welcome user number ${req.user}` : results[0].user_email });

  });
 
})

router.post('/addTodo', (req, res) => {
  if (req.body.todoText !== '') {
    const id = uuidv4();
    const queryText = `INSERT INTO todo(todo_id, todo_text, todo_user) VALUES(?, ?, ?)`

    connection.query(queryText, [id, req.body.todoText, req.user], function (error, results, fields) {
      if (error) throw error;
      console.log(results);
      res.redirect('/dashboard');
    });
  } else {
    res.redirect('/dashboard');
  }
})

router.delete('/deleteTodo/:id', (req, res) => {
  console.log(req.params.id)
  const queryText = `DELETE FROM todo WHERE todo_id = '${req.params.id}'`;

  connection.query(queryText, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    res.send({ status: 'done' })
  });
})

router.put('/changeStatus/:id', (req, res) => {
  const queryText = `UPDATE todo SET todo_status = ${req.body.status} WHERE todo_id = '${req.params.id}'`
  connection.query(queryText, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    res.send({ status: 'done' })
  });
})

module.exports = router;