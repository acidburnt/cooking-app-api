
const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Recipe } = require('./../models/Recipe');
const { User } = require('./../models/User');

const {
  dummyData,
  populateRecipes,
  populateUsers,
  users,
} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateRecipes);

describe('POST /recipes', () => {
  it('should create a new recipe', (done) => {
    const body = {
      title: 'obiad',
      ingredients: ['burak', 'kalafior', 'buraczek'],
      instructions: 'zagotowac wode i dziala',
    };
    request(app)
      .post('/recipes')
      .set('x-auth', users[0].tokens[0].token)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.title).toBe(body.title);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        return Recipe.find({ title: 'obiad' }).then((recipes) => {
          expect(recipes.length).toBe(1);
          expect(recipes[0].title).toBe(body.title);
          done();
        }).catch(error => done(error));
      });
  });

  it('should not create recipe with invalid data', (done) => {
    request(app)
      .post('/recipes')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err) => {
        if (err) {
          return done(err);
        }
        return Recipe.find().then((recipes) => {
          expect(recipes.length).toBe(2);
          done();
        }).catch(error => done(error));
      });
  });
});

describe('GET /recipes', () => {
  it('should get all recipes', (done) => {
    request(app)
      .get('/recipes')
      .expect(200)
      .expect((res) => {
        expect(res.body.recipes.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /recipes/:id', () => {
  it('should return correct recipe', (done) => {
    request(app)
      .get(`/recipes/${dummyData[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.recipe.title).toBe(dummyData[0].title);
      })
      .end(done);
  });
  it('should return 404 if recipe not found', (done) => {
    const randomId = new ObjectID().toHexString();
    request(app)
      .get(`/recipes/${randomId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object IDs', (done) => {
    request(app)
      .get('/recipes/123')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /recipes:id', () => {
  it('should remove a recipe', (done) => {
    const idToRemove = dummyData[1]._id.toHexString();
    request(app)
      .delete(`/recipes/${idToRemove}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.recipe._id).toBe(idToRemove);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Recipe.findById(idToRemove).then((recipe) => {
          expect(recipe).toBeFalsy();
          done();
        }).catch(e => done(e));
      });
  });
  it('should not remove recipe of other user', (done) => {
    const idToRemove = dummyData[0]._id.toHexString();
    request(app)
      .delete(`/recipes/${idToRemove}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Recipe.findById(idToRemove).then((recipe) => {
          expect(recipe).toBeTruthy();
          done();
        }).catch(e => done(e));
      });
  });
  it('should return 404 if recipe not found', (done) => {
    const randomId = new ObjectID().toHexString();
    request(app)
      .delete(`/recipes/${randomId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object IDs', (done) => {
    request(app)
      .delete('/recipes/123')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /recipes:id', () => {
  const idToUpdate = dummyData[1]._id.toHexString();
  it('should update the title', (done) => {
    request(app)
      .patch(`/recipes/${idToUpdate}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        title: 'kalafiorowa testowa',
        ingredients: ['burak', 'kalafior', 'japka'],
        instructions: 'zagotowac wode i dziala',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.recipe.title).toBe('kalafiorowa testowa');
      })
      .end(done);
  });

  it('should not be able update the title as other user', (done) => {
    request(app)
      .patch(`/recipes/${idToUpdate}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        title: 'kalafiorowa testowa',
        ingredients: ['burak', 'kalafior', 'japka'],
        instructions: 'zagotowac wode i dziala',
      })
      .expect(404)
      .end(done);
  });

  it('should update only requested fields', (done) => {
    request(app)
      .patch(`/recipes/${idToUpdate}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        title: 'kalafiorowa testowa',
        ingredients: ['burak', 'kalafior', 'banany'],
        instructions: 'zagotowac wode i dziala',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.recipe.ingredients).toEqual(dummyData[1].ingredients);
        expect(res.body.recipe.instructions).toEqual(dummyData[1].instructions);
      })
      .end(done);
  });
});

describe('GET /user/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = 'examle@gmail.com';
    const password = 'password123!';
    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        return User.findOne({ email }).then((user) => {
          expect(user).toBeTruthy();
          // expect(user.password).toNotBe(password);
          done();
        }).catch(e => done(e));
      });

  });
  it('return validation errors is request invalid', (done) => {
    const email = 'ziemni';
    const password = 'password123!';
    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });
  it('should not create user if email is in DB', (done) => {
    const email = 'locky@gmail.com';
    const password = 'userOnePass';
    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });
});

describe('POST /user/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          done(err);
        }
        User.findByIdAndUpdate(users[1]._id)
          .then((user) => {
            expect(user.tokens[1].token).toEqual(res.headers['x-auth']);
            done();
          }).catch(e => done(e));
      });
  });
  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'jaja',
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
        done();
      })
      .catch(e => done(e));
  });
});
describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err) => {
        if (err) {
          return done(err);
        }
        return User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch(e => done(e));
      });
  });
});
