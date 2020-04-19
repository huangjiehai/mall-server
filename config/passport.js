const mongoose = require('mongoose');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';
const User = mongoose.model('users')

module.exports = passport => {
  passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
    const user = await User.findById(jwt_payload.id);
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  }));
}