require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors')
const favicon = require('express-favicon');
const logger = require('morgan');
const passport = require('./config/passport');
const path = require('path')

const mainRouter = require('./routes/mainRouter.js');
const authRouter = require('./routes/authRouter.js');
const challengesRouter = require('./routes/challengesRouter.js')
const userRouter = require ('./routes/userRouter.js')

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(express.static('public'))
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(passport.initialize());

//routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/challenges', challengesRouter);
app.use('/api/v1', mainRouter);
app.use('/api/v1/users', userRouter)

module.exports = app;