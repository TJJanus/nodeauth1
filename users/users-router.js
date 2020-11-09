const router = require('express').Router();

const Users = require('../users/users-model')

function secure(req, res, next) {

    if(req.session && req.session.user) {
        next()
      } else {
        res.status(401).json({ message: 'Unauthorized'})
      } 
}



// router.get("/api/users/all", secure, (req, res) => {
//     Users.findUser()
//       .then(users => {
//         res.status(200).json(users);
//       })
//       .catch(err => res.send(err));
//   });

module.exports = router;