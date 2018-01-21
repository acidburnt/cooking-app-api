require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { mongoose } = require('./db/mongoose');
const { Recipe } = require('./models/Recipe');
const { User } = require('./models/User');

// middleware
const { authenticate } = require('./middleware/authenticate');

// setting up the port
const port = process.env.PORT;

const app = express();
app.use(bodyParser.json());

// Routes for Recipes
app.post('/recipes', authenticate, (req, res) => {
  const recipe = new Recipe({
    ...req.body,
    creator: req.user._id,
  });
  recipe.save().then(
    doc => res.send(doc),
    e => res.status(400).send(e),
  );
});

app.get('/recipes', (req, res) => {
  Recipe.find({}).then(
    recipes => res.send({ recipes }),
    e => res.status(400).send(e),
  );
});

app.get('/recipes/:id', (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Recipe.findOne({
    _id: id,
  }).then(
    (recipe) => {
      if (!recipe) {
        return res.status(404).send({ msg: 'Not in DB.' });
      }
      return res.status(200).send({ recipe });
    },
    e => res.status(400).send(e),
  ).catch(error => res.status(400).send(error));
});

app.delete('/recipes/:id', authenticate, (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Recipe.findOneAndRemove({
    _id: id,
    creator: req.user._id,
  }).then(
    (recipe) => {
      if (!recipe) {
        return res.status(404).send({ msg: 'Not in DB.' });
      }
      return res.status(200).send({ recipe });
    },
    e => res.status(400).send(e),
  ).catch(error => res.status(400).send(error));
});

app.patch('/recipes/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const body = _.pick(req.body, ['title', 'ingredients', 'instructions']);
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Recipe.findOneAndUpdate({ _id: id, creator: req.user._id }, { $set: body }, { new: true })
    .then((recipe) => {
      if (!recipe) {
        return res.status(404).send();
      }
      return res.send({ recipe });
    }).catch(e => res.status(400).send(e));
});

// POST /users
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

app.listen(port, () => {
  console.log(`Started up on port ${port}.`);
});

module.exports = { app };
