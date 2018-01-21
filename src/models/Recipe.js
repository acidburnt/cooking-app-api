const mongoose = require('mongoose');

const Recipe = mongoose.model('Recipe', {
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

});

module.exports = { Recipe };
