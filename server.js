const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
require('dotenv').config();
const flash = require('connect-flash')
const session = require('express-session');
const passport = require('passport');

require('./config/passport')(passport);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use('/public', express.static('public'));


//express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session())

// connect flash
app.use(flash());

//global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

//Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`) });