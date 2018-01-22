const _ = require('lodash');
const { authenticate } = require('./../middleware/authenticate');
const { User } = require('./../models/User');

module.exports = (app) => {
  app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);

    user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      res.header('x-auth', token).send(user);
    }).catch((e) => {
      res.status(400).send(e);
    });
  });

  app.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password)
      .then((user) => {
        user.generateAuthToken()
          .then((token) => {
            res.header('x-auth', token).send(user);
          });
      })
      .catch((e) => {
        res.status(400).send(e);
      });
  });


  app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
  });

  app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(
      () => res.status(200).send({ msg: 'logged out' }),
      () => res.status(400).send(),
    );
  });
};
