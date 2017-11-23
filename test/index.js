let expect = require('chai').expect;
let mongoose = require('mongoose');
let Recipe = require('../app/models/recipe');
let server = require('../server');
let request = require('supertest');
let config = require('config');

describe('Recipe Route', function() {
  beforeEach((done) => {
    Recipe.remove({}, (err) => {
       done();
    });
  });

  after(() => {
    mongoose.connection.close();
  });

  let data = [
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
  const RECIPE_RES_PROPERTIES = ['title', 'content', '_id', 'created_at', 'last_modified_at'];

  function isSameRecipe(actual, expected) {
    expect(actual).to.have.property('title', expected.title);
    expect(actual).to.have.property('content', expected.content);
    expect(actual).to.have.property('_id', '' + expected._id);
    expect(actual).to.have.property('created_at', expected.created_at.toISOString());
    expect(actual).to.have.property('last_modified_at', '' + expected.last_modified_at.toISOString());
  }

  function areSameRecipes(actual, expected) {
    expect(actual).to.have.lengthOf(expected.length);
    for (var i = 0; i < actual.length; i++) {
      isSameRecipe(actual[i], expected[i]);
    }
  }

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
          expect(res.body).to.include.keys(RECIPE_RES_PROPERTIES);
          expect(res.body.title).to.equal(data[0].title);
          expect(res.body.content).to.equal(data[0].content);
          Recipe.find({_id: res.body._id})
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

});
