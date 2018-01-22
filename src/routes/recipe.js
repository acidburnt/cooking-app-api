const _ = require('lodash');
const { ObjectID } = require('mongodb');
const { authenticate } = require('./../middleware/authenticate');
const { Recipe } = require('./../models/Recipe');

module.exports = (app) => {
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
};
