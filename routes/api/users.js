const Router = require("koa-router");
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('koa-passport');
const User = require('../../models/Users');
const tools = require('../../config/tools');

const router = new Router();

/**
 * @method POST api/users/register
 * @desc 注册
 * @access public
 */
router.post("/register", async (ctx) => {
  const findResult = await User.find({
    email: ctx.request.body.email
  });

  if (findResult.length > 0) {
    ctx.status = 500;
    ctx.body = {
      status: ctx.status,
      msg: '邮箱已被占用'
    }
  } else {
    const avatar = gravatar.url(ctx.request.body.email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    });
    const newUser = new User({
      name: ctx.request.body.name,
      email: ctx.request.body.email,
      password: tools.enbcrypt(ctx.request.body.password),
      avatar,
    });

    // 保存到数据库
    await newUser.save();

    ctx.status = 200;
    ctx.body = {
      status: ctx.status,
      msg: 'success',
      data: newUser
    };
  }
});

/**
 * @method GET api/users/user-info
 * @desc 用户信息
 * @access private
 */
router.get('/user-info', passport.authenticate('jwt', { session: false }), async ctx => {
  ctx.body = ctx.state.user;
});

/**
 * @method POST api/users/login
 * @desc 登录
 * @access public
 */
router.post('/login', async ctx => {
  const findUser = await User.find({email: ctx.request.body.email});

  if (findUser.length === 0) {
    ctx.status = 404;
    ctx.body = {
      status: ctx.status,
      msg: '用户不存在'
    }
  } else {
    const user = findUser[0];
    const compareResult = bcrypt.compareSync(ctx.request.body.password, user.password);

    const params = {
      id: user.id,
      name: user.name,
      avatar: user.avatar
    };
    const token = jwt.sign(params, 'secret', {
      expiresIn: 30 * 24 * 60 *60
    });

    if (compareResult) {
      ctx.status = 200;
      ctx.body = {
        status: ctx.status,
        msg: 'success',
        data: {
          token: `Bearer ${token}`,
          email: user.email,
          ...params
        }
      }
    } else {
      ctx.status = 400;
      ctx.body = {
        status: ctx.status,
        msg: '密码错误'
      }
    }
  }
})

module.exports = router.routes();