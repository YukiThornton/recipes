const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Recipe = require('../models/recipe');

const returnBadRequest = (res) => {
  res.status(400).json({err: 'Bad Request'});
}

const returnNotFound = (res) => {
  res.status(404).json({message: 'Not Found'});
}

const returnInternalServerError = (res) => {
  res.status(500).json({message: 'Internal Server Error'});
}

router.get('/recipes', function(req, res) {
  Recipe.find()
    .exec()
    .then(function(recipes){
      res.json({recipes: recipes});
    })
    .catch(function(err) {
      console.log(err);
      returnInternalServerError(res);
    });
});

router.delete('/recipes', function(req, res) {
  Recipe.remove({}, function(err, removeResult){
    res.json({
      count: removeResult.result.n,
      ok: removeResult.result.ok,
    });
  })
    .catch(function(err) {
      console.log(err);
      returnInternalServerError(res);
    });
});

router.post('/recipe', function(req, res) {
  if (!req.body.hasOwnProperty('title') || !req.body.hasOwnProperty('content')) {
    returnBadRequest(res);
    return;
  }
  new Recipe({
      title: req.body.title,
      content: req.body.content
  }).save(function (err, recipe){
    if(!err) {
      res.status(201).json(recipe);
    } else {
      console.log(err);
      returnInternalServerError(res);
    }
  })
});

router.get('/recipe/:id', function(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    returnNotFound(res);
    return;
  }
  Recipe.findOne({
    _id: req.params.id
  })
    .exec()
    .then(function(recipe){
      if (recipe != null) {
        res.json(recipe);
      } else {
        returnNotFound(res);
      }
    })
    .catch(function(err) {
      console.log(err);
      returnInternalServerError(res);
    });
});

router.put('/recipe/:id', function(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    returnNotFound(res);
    return;
  }
  if (!req.body.hasOwnProperty('title') && !req.body.hasOwnProperty('content')) {
    returnBadRequest(res);
    return;
  }
  req.body.last_modified_at = Date.now();
  Recipe.findOneAndUpdate({
    _id: req.params.id
  }, req.body, {new: true}, function(err, recipe) {
    if(!err) {
      if (recipe != null) {
        res.json(recipe);
      } else {
        returnNotFound(res);
      }
    } else {
      console.log(err);
      returnInternalServerError(res);
    }
  });
});

router.delete('/recipe/:id', function(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    returnNotFound(res);
    return;
  }
  Recipe.remove({
    _id: req.params.id
  }, function(err, removeResult){
    if (removeResult.result.n > 0) {
      res.json({
        count: removeResult.result.n,
        ok: removeResult.result.ok,
      });
    } else {
      returnNotFound(res);
    }
  })
    .catch(function(err) {
      console.log(err);
      returnInternalServerError(res);
    });
});

module.exports = router;
