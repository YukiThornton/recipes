let express = require('express');
let router = express.Router();
let db = require('mongoose');
db.Promise = global.Promise;
let Recipe = require('../models/recipe');

router.get('/recipes', function(req, res) {
  Recipe.find()
    .exec()
    .then(function(recipes){
      res.json({recipes: recipes});
    })
    .catch(function(err) {
      res.status(500).json({err: err});
    });
});

router.delete('/recipes', function(req, res) {
  Recipe.find()
    .remove()
    .exec()
    .then(function(result){
      res.json({result: result});
    })
    .catch(function(err) {
      res.status(500).json({err: err});
    });
});

router.post('/recipe', function(req, res) {
  if (!req.body.hasOwnProperty('title') || !req.body.hasOwnProperty('content')) {
    res.status(400).json({err: 'Bad Request'});
  }
  new Recipe({
      title: req.body.title,
      content: req.body.content
  }).save(function (err, recipe){
    if(err) {
      res.status(500).json({err: err});
    } else {
      res.status(201).json(recipe);
    }
  })
});

router.get('/recipe/:id', function(req, res) {
  Recipe.findOne({
    _id: req.params.id
  })
    .exec()
    .then(function(recipe){
      if (recipe == null) {
        res.status(404).json({err: 'Not Found'});
      } else {
        res.json(recipe);
      }
    })
    .catch(function(err) {
      res.status(500).json({err: err});
    });
});

router.put('/recipe/:id', function(req, res) {
  let body = req.body;
  body.last_modified_at = Date.now();
  Recipe.findOneAndUpdate({
    _id: req.params.id
  }, body, {new: true}, function(err, recipe) {
    if(err) {
      res.status(500).json({err: err});
    } else {
      res.json(recipe);
    }
  });
});

router.delete('/recipe/:id', function(req, res) {
  Recipe.findOne({
    _id: req.params.id
  })
    .remove()
    .exec()
    .then(function(result){
      res.json({result: result});
    })
    .catch(function(err) {
      res.status(500).json({err: err});
    });
});

module.exports = router;
