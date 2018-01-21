const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Recipe } = require('./../models/Recipe');

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


beforeEach((done) => {
  Recipe.remove({}).then(() => {
    return Recipe.insertMany(dummyData);
  }).then(() => done());
});

describe('POST /recipes', () => {
  it('should create a new recipe', (done) => {
    const body = {
      title: 'testing ziemniaczki',
      ingredients: ['burak', 'kalafior', 'buraczek'],
      instructions: 'zagotowac wode i dziala',
    };
    request(app)
      .post('/recipes')
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.title).toBe(body.title);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        Recipe.find({ title: 'testing ziemniaczki' }).then((recipes) => {
          expect(recipes.length).toBe(1);
          expect(recipes[0].title).toBe(body.title);
          done();
        }).catch(error => done(error));
      });
  });

  it('should not create recipe with invalid data', (done) => {
    request(app)
      .post('/recipes')
      .send({})
      .expect(400)
      .end((err) => {
        if (err) {
          return done(err);
        }
        return Recipe.find().then((recipes) => {
          expect(recipes.length).toBe(3);
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
        expect(res.body.recipes.length).toBe(3);
      })
      .end(done);
  });
});

describe('GET /recipes:id', () => {
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
      .expect(404)
      .end(done);
  });
});

describe('DELETE /recipes:id', () => {
  it('should remove a recipe', (done) => {
    const idToRemove = dummyData[1]._id.toHexString();
    request(app)
      .delete(`/recipes/${idToRemove}`)
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
  it('should return 404 if recipe not found', (done) => {
    const randomId = new ObjectID().toHexString();
    request(app)
      .delete(`/recipes/${randomId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object IDs', (done) => {
    request(app)
      .delete('/recipes/123')
      .expect(404)
      .end(done);
  });
});

describe('PATCH /recipes:id', () => {
  const idToUpdate = dummyData[1]._id.toHexString();
  it('should update the title', (done) => {
    request(app)
      .patch(`/recipes/${idToUpdate}`)
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
  it('should update only requested fields', (done) => {
    request(app)
      .patch(`/recipes/${idToUpdate}`)
      .send({
        title: 'kalafiorowa testowa',
        ingredients: ['burak', 'kalafior', 'japka'],
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
