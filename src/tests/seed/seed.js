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
    token: jwt.sign({ _id: userOneId, access: 'auth' }, 'abc123'),
  }],
}, {
  _id: userTwoId,
  email: 'test@test.com',
  password: 'userTwoPass',
}];

const dummyData = [
  {
    _id: new ObjectID(),
    title: 'ziemniaczki',
    ingredients: ['burak', 'kalafior', 'cebula'],
    instructions: 'ugotowac wode i dziala',
  },
  {
    _id: new ObjectID(),
    title: 'kalafiorowa',
    ingredients: ['burak', 'kalafior', 'japka'],
    instructions: 'zagotowac wode i dziala',
  },
  {
    _id: new ObjectID(),
    title: 'zupa z trupa',
    ingredients: ['burak', 'buraczek'],
    instructions: 'obrac buraki',
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
