const expect = require('chai').expect;
const mongoose = require('mongoose');
const Recipe = require('../app/models/recipe');
const server = require('../server');
const request = require('supertest');
const config = require('config');

const RECIPE_RES_PROPERTIES = ['title', 'content', 'id', 'created_at', 'last_modified_at'];

const data = [
  {
    title: 'test recipe title 1',
    content: 'test recipe content 1'
  },
  {
    title: 'test recipe title 2',
    content: 'test recipe content 2'
  },
  {
    title: 'test recipe title 3',
    content: 'test recipe content 3'
  }
];

function containsRecipeProperties(obj) {
  expect(obj).to.include.keys(RECIPE_RES_PROPERTIES);
}

function isSameRecipe(actual, expected) {
  containsRecipeProperties(actual);
  expect(actual.title).to.equal(expected.title);
  expect(actual.content).to.equal(expected.content);
  expect(actual.id).to.equal('' + expected._id);
  expect(actual.created_at).to.equal(expected.created_at.toISOString());
  expect(actual.last_modified_at).to.equal(expected.last_modified_at.toISOString());
}

function areSameRecipes(actual, expected) {
  expect(actual).to.have.lengthOf(expected.length);
  for (var i = 0; i < actual.length; i++) {
    isSameRecipe(actual[i], expected[i]);
  }
}

describe('Recipe Route', function() {
  beforeEach((done) => {
    Recipe.remove({}, (err) => {
       done();
    });
  });

  after(() => {
    mongoose.connection.close();
  });

  describe('GET /recipes', function() {
    it ('should get all recipes (size > 0)', function(done) {
      Recipe.create(data, (err, createdRecipes) => {
        request(server)
          .get('/recipes')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect((res) => {
            expect(res.body).to.have.property('recipes');
            areSameRecipes(res.body.recipes, createdRecipes);
          })
          .end(done);
      });
    });

    it ('should get all recipes (size == 0)', function(done) {
      request(server)
        .get('/recipes')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body).to.have.property('recipes');
          expect(res.body.recipes).to.have.lengthOf(0);
        })
        .end(done);
    });
  });

  describe('DELETE /recipes', function() {
    it ('should delete all recipes (size > 0)', function(done) {
      Recipe.create(data, () => {
        request(server)
          .delete('/recipes')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(() => {
            Recipe.find()
              .exec()
              .then(function(recipes){
                expect(recipes).to.have.lengthOf(0);
              })
          })
          .end(done);
      });
    });

    it ('should delete all recipes (size == 0)', function(done) {
      request(server)
        .delete('/recipes')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(() => {
          Recipe.find()
            .exec()
            .then(function(recipes){
              expect(recipes).to.have.lengthOf(0);
            })
        })
        .end(done);
    });
  });

  describe('POST /recipe', function() {
    it ('should create a recipe', function(done) {
      request(server)
        .post('/recipe')
        .send(data[0])
        .expect('Content-Type', /json/)
        .expect(201)
        .expect((res) => {
          containsRecipeProperties(res.body);
          expect(res.body.title).to.equal(data[0].title);
          expect(res.body.content).to.equal(data[0].content);
          Recipe.find({_id: res.body.id})
            .exec()
            .then(function(recipes){
              expect(recipes).to.have.lengthOf(1);
            })
        })
        .end(done);
    });

    it ('should fail without a title in request', function(done) {
      request(server)
        .post('/recipe')
        .send({content: 'test recipe content'})
        .expect('Content-Type', /json/)
        .expect(400)
        .end(done);
    });

    it ('should fail without content in request', function(done) {
      request(server)
        .post('/recipe')
        .send({title: 'test recipe title'})
        .expect('Content-Type', /json/)
        .expect(400)
        .end(done);
    });
  });

  describe('GET /recipe/:id', function() {
    it ('should get specified recipe', function(done) {
      Recipe.create(data[0], (err, createdRecipe) => {
        request(server)
          .get(`/recipe/${createdRecipe._id}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect((res) => {
            isSameRecipe(res.body, createdRecipe);
          })
          .end(done);
      });
    });

    it ('should return 404 when specified recipe id is invalid', function(done) {
      request(server)
        .get('/recipe/wrongid')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done);
    });

    it ('should return 404 when specified recipe does not exist', function(done) {
      request(server)
        .get('/recipe/53cb6b9b4f4ddef1ad47f943')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done);
    });
  });

  describe('PUT /recipe/:id', function() {
    it ('should update specified recipe when request body has title and content', function(done) {
      Recipe.create(data[0], (err, createdRecipe) => {
        request(server)
          .put(`/recipe/${createdRecipe._id}`)
          .send(data[1])
          .expect('Content-Type', /json/)
          .expect(200)
          .expect((res) => {
            containsRecipeProperties(res.body);
            expect(res.body.title).to.equal(data[1].title);
            expect(res.body.content).to.equal(data[1].content);
            expect(res.body.created_at).to.equal(createdRecipe.created_at.toISOString());
            expect(res.body.last_modified_at).does.not.equal(createdRecipe.last_modified_at.toISOString());
          })
          .end(done);
      });
    });

    it ('should update specified recipe when request body has title', function(done) {
      Recipe.create(data[0], (err, createdRecipe) => {
        request(server)
          .put(`/recipe/${createdRecipe._id}`)
          .send({title: data[1].title})
          .expect('Content-Type', /json/)
          .expect(200)
          .expect((res) => {
            containsRecipeProperties(res.body);
            expect(res.body.title).to.equal(data[1].title);
            expect(res.body.content).to.equal(createdRecipe.content);
            expect(res.body.created_at).to.equal(createdRecipe.created_at.toISOString());
            expect(res.body.last_modified_at).does.not.equal(createdRecipe.last_modified_at.toISOString());
          })
          .end(done);
      });
    });

    it ('should update specified recipe when request body has content', function(done) {
      Recipe.create(data[0], (err, createdRecipe) => {
        request(server)
          .put(`/recipe/${createdRecipe._id}`)
          .send({content: data[1].content})
          .expect('Content-Type', /json/)
          .expect(200)
          .expect((res) => {
            containsRecipeProperties(res.body);
            expect(res.body.title).to.equal(createdRecipe.title);
            expect(res.body.content).to.equal(data[1].content);
            expect(res.body.created_at).to.equal(createdRecipe.created_at.toISOString());
            expect(res.body.last_modified_at).does.not.equal(createdRecipe.last_modified_at.toISOString());
          })
          .end(done);
      });
    });

    it ('should return 404 when specified recipe id is invalid', function(done) {
      request(server)
        .put('/recipe/wrongid')
        .send(data[0])
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done);
    });

    it ('should return 404 when specified recipe does not exist', function(done) {
      request(server)
        .put('/recipe/53cb6b9b4f4ddef1ad47f943')
        .send(data[0])
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done);
    });

    it ('should return 400 when request body has neither title nor content', function(done) {
      Recipe.create(data[0], (err, createdRecipe) => {
        request(server)
          .put(`/recipe/${createdRecipe._id}`)
          .send({})
          .expect('Content-Type', /json/)
          .expect(400)
          .end(done);
      });
    });
  });

  describe('DELETE /recipe/:id', function() {
    it ('should delete specified recipe', function(done) {
      Recipe.create(data[0], (err, createdRecipe) => {
        request(server)
          .delete(`/recipe/${createdRecipe._id}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect((res) => {
            expect(res.body.deleted).to.be.true;
            expect(res.body.deletedRecipe.id).to.equal('' + createdRecipe._id);
            Recipe.findOne({
              _id: createdRecipe._id
            })
              .exec()
              .then(function(recipe){
                expect(recipe).to.be.null;
              });
          })
          .end(done);
      });
    });

    it ('should return 404 when specified recipe id is invalid', function(done) {
      request(server)
        .delete('/recipe/wrongid')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done);
    });

    it ('should return 404 when specified recipe does not exist', function(done) {
      request(server)
        .delete('/recipe/53cb6b9b4f4ddef1ad47f943')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done);
    });
  });
});
