const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
  },
  ingredients: {
    type: Array,
    required: true,
    minlength: 1,
    trim: true,
  },
  instructions: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const Recipe = mongoose.model('Recipe', RecipeSchema);

module.exports = { Recipe };
