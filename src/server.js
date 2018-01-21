const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Recipe } = require('./models/Recipe');
const { User } = require('./models/User');

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

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


app.listen(port, () => {
  console.log(`Started up on port ${port}.`);
});

module.exports = { app };
