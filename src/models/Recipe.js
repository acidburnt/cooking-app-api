const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
    trim: true,
    unique: true,
  },
  ingredients: {
    type: Array,
    required: true,
    minlength: 1,
    maxlength: 20,
    trim: true,
  },
  steps: {
    type: Array,
    required: true,
    minlength: 1,
    maxlength: 30,
    trim: true,
  },
  img_url: {
    type: String,
    required: false,
    minlength: 1,
    maxlength: 300,
    trim: true,
    unique: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const Recipe = mongoose.model('Recipe', RecipeSchema);

module.exports = { Recipe };
