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

  let recipe = {
    title: 'test recipe title',
    content: 'test recipe content'
  };

  describe('GET /recipes', function() {
    it ('should get all recipes (size > 0)', function(done) {
      let newRecipe = new Recipe(recipe);
      newRecipe.save(function(err, createdRecipe) {
        request(server)
          .get('/recipes')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect((res) => {
            expect(res.body).to.have.property('recipes');
            expect(res.body.recipes).to.have.lengthOf(1);
            expect(res.body.recipes[0]).to.have.property('title', recipe.title);
            expect(res.body.recipes[0]).to.have.property('content', recipe.content);
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
});
