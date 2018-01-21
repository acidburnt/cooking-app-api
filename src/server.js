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
app.post('/recipes', (req, res) => {
  const recipe = new Recipe(req.body);
  recipe.save().then(
    doc => res.send(doc),
    e => res.status(400).send(e),
  );
});

app.get('/recipes', (req, res) => {
  Recipe.find().then(
    recipes => res.send({ recipes }),
    e => res.status(400).send(e),
  );
});

app.get('/recipes/:id', (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Recipe.findById(id).then(
    (recipe) => {
      if (!recipe) {
        return res.status(404).send({ msg: 'Not in DB.' });
      }
      return res.status(200).send({ recipe });
    },
    e => res.status(400).send(e),
  ).catch(error => res.status(400).send(error));
});

app.delete('/recipes/:id', (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Recipe.findByIdAndRemove(id).then(
    (recipe) => {
      if (!recipe) {
        return res.status(404).send({ msg: 'Not in DB.' });
      }
      return res.status(200).send({ recipe });
    },
    e => res.status(400).send(e),
  ).catch(error => res.status(400).send(error));
});

app.patch('/recipes/:id', (req, res) => {
  const { id } = req.params;
  const body = _.pick(req.body, ['title', 'ingredients', 'instructions']);
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Recipe.findByIdAndUpdate(id, { $set: body }, { new: true }).then((recipe) => {
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

app.listen(port, () => {
  console.log(`Started up on port ${port}.`);
});

module.exports = { app };
