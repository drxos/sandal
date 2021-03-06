const LocalStrategy   = require('passport-local').Strategy
const User = require('../models')
const bcrypt   = require('bcrypt-nodejs')

module.exports = (passport) => {

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })

  passport.use('local-signup', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback : true
    },
    (req, email, password, done) => {          
      process.nextTick(() => {
        User.findOne({'local.email': email}, (err, user) => {
          if (err) return done(err)
          if (user) {
            return done(null, false, req.flash('signupMessage', 'That email is already exist.'))
          } else {
            const newUser = new User()
            newUser.local.email = email
            newUser.local.password = newUser.generateHash(password)
            newUser.save((err) => {
              if (err) throw err
              return done(null, newUser)
            })
          }
        })
      })
    }
  ))

  passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    (req, email, password, done) => {
      User.findOne({'local.email': email}, (err, user) => {
        if (err) { return done(err) }
        console.log()
        if (!user) {
          return done(null, false, req.flash('loginMessage', 'Incorrect username'))
        }
        if(!user.validPassword(password, user))
          return done(null, false, req.flash('loginMessage', 'Wrong password!'))

        return done(null, user)
      })
    }
  ))
}
