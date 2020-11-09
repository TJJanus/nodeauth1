const express = require('express')
const bcrypt = require('bcryptjs');
const Users = require('../users/users-model');
const usersRouter = require('../users/users-router');

const server = express();
server.use(express.json());

server.use('/api/users', usersRouter)

const session = require('express-session')
const sessionStore = require('connect-session-knex')(session);

server.use(session({
    name: 'cookie',
    secret: 'this should come from process.env',
    cookie: {
      maxAge: 1000 * 20,
      secure: false, // in production do true (https is a musts)
      httpOnly: true, // this means the JS on the page cannot read the cookie
    },
    resave: false,
    saveUninitialized: false,
    store: new sessionStore({
      knex: require('../data/connection'),
      tablename: 'sessions',
      sidfieldname: 'sid',
      createTable: true,
      clearInterval: 1000 * 60 * 60,
    })
  }));


server.post('/api/users/register', async (req , res) => {
    try {
        const { username, password } = req.body
        const hash = bcrypt.hashSync(password, 10);
        const user = {username, password: hash, role: 2 };
        const addedUser = await Users.add(user);
        res.json(addedUser)
    } catch (err) {
        res.status(500).json({ message: err.message})  
    }
})


server.post('/api/users/login', async (req, res) => {
    try {
        const [user] = await Users.findBy({ username: req.body.username })
        if(user && bcrypt.compareSync(req.body.password, user.password )) {
            req.session.user = user;
            res.json({ message: `Welcome back , ${user.username}`})
        } else {
            res.status(401).json({ message: 'bad credentials'})
        }
    } catch (err) {
        res.status(500).json({ message: err.message}) 
    }
})

server.get('/api/users/logout', (req , res) => {
    if (req.session && req.session.user) {
      // we need to destroy the session
      req.session.destroy(err => {
        if(err) {
          res.json({ message: 'You cannot leave'})
        } else {
          res.json({ message: 'Good bye'})
        }
      })
    } else {
      res.json({ message: 'You had no session actually'})
    }
  })



  function secure(req, res, next) {

    if(req.session && req.session.user) {
        next()
      } else {
        res.status(401).json({ message: 'You shall not pass'})
      } 
}



server.get("/api/users/all", secure, (req, res) => {
    Users.findUser()
      .then(users => {
        res.status(200).json(users);
      })
      .catch(err => res.send(err));
  });



module.exports = server;