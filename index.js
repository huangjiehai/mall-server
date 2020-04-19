const koa = require('koa');
const Router = require('koa-router');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
const passport = require('koa-passport');

const app = new koa();

// Input your database configuration
// ex: mongodb+srv://user:password@cluster0-cracm.mongodb.net/test
const db = require('./config/keys').db;

const users = require('./routes/api/users');
const router = new Router();
router.use('/api/users', users);

mongoose.connect(
  db, {
  useNewUrlParser: true, 
  useUnifiedTopology: true
})
.then(() => {
  console.log('mongodb is connected!')
})
.catch((error) => {
  console.log(error)
});

app
  .use(bodyParser())
  .use(passport.initialize())
  .use(passport.session())
  .use(router.routes())
  .use(router.allowedMethods());

require('./config/passport')(passport);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server started on ${port}`)
});