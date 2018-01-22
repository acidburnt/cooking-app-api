const { ObjectID } = require('mongodb');
const { Recipe } = require('./../../models/Recipe');
const { User } = require('./../../models/User');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'locky@gmail.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString(),
  }],
}, {
  _id: userTwoId,
  email: 'test@test.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString(),
  }],
}];

const dummyData = [
  {
    _id: new ObjectID(),
    title: 'ziemniaczki',
    ingredients: ['burak', 'kalafior', 'cebula'],
    steps: ['step1', 'step2', 'step3', 'step4', 'step5'],
    creator: userOneId,
  },
  {
    _id: new ObjectID(),
    title: 'kalafiorowa',
    description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minima, enim? Quisquam aliquid dolore neque ratione totam quam magnam assumenda maiores a voluptates, reiciendis numquam dolorem sapiente, ducimus, eius laudantium corporis?',
    ingredients: ['burak', 'kalafior', 'banany'],
    steps: ['step1', 'step2', 'step3', 'step4', 'step5'],
    creator: userTwoId,
  },
];


const populateRecipes = (done) => {
  Recipe.remove({}).then(() => {
    return Recipe.insertMany(dummyData);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    const userOne = new User(users[0]).save();
    const userTwo = new User(users[1]).save();
    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {
  dummyData,
  users,
  populateRecipes,
  populateUsers,
};
