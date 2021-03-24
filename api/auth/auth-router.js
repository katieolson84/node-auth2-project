const router = require("express").Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../secrets"); // use this secret!
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');

const User = require('../users/users-model');


router.post("/register", validateRoleName, (req, res, next) => {
    // User.add(req.body)
    // .then(registered => {
    //   res.status(201).json({registered})
    // })
    // .catch(next)
    const credentials = req.body
    if(credentials){
    const rounds = process.env.BCRYPT_ROUNDS || 8
    const hash = bcrypt.hashSync(credentials.password, )
    credentials.password = hash

    User.add(credentials)
      .then(user => {
        res.status(201).json({user})
      })
      .catch(err => {
        res.status(500).json({message: err.message})
      })
    }else{
      res.status(400).json({message: 'must provide username and password'})
    }

  })

//   try{
//     const { username, password, role_name } = req.body
//     const user = await User.findBy({username})
//     if(user) {
//       return res.status(409).json({message: 'Username is taken'})
//     }else{
//       next()
//     }
//     const newUser = await User.add({
//       username, 
//       password: await bcrypt.hash(password, 10), 
//       role_name
//     })
//     res.status(201).json(newUser)
//   }catch(e){
//     next(e)
//   }
// })

  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */


// !THIS WORKS
router.post("/login", checkUsernameExists, (req, res, next) => {
  const { username, password } = req.body;

    User.findBy(username)
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          const token = buildToken(user);

          res.status(200).json({
            message: `${user.username} is back!`,
            token: token
          });
        } else {
          res.status(401).json({ message: 'Invalid credentials' });
        }
      })
      .catch(next);
    })

  function buildToken(user) {
    const payload = {
      subject: user.user_id,
      username: user.username,
      role_name: user.role_name,
    }
    const config = {
      expiresIn: '1d',
    }
    return jwt.sign(payload, JWT_SECRET, config)
  }
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */

module.exports = router;
