const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Recipe = require('../models/recipe');
const Memo = require('../models/recipe');
const recipeKinds = require('../constants/recipe-kinds');

const returnBadRequest = (res) => {
  res.status(400).json({err: 'Bad Request'});
};

const returnNotFound = (res) => {
  res.status(404).json({message: 'Not Found'});
};

const returnInternalServerError = (res) => {
  res.status(500).json({message: 'Internal Server Error'});
};

const createResponseRecipe = (dbRecipe) => {
  const recipe = {
    id: dbRecipe._id,
    kind: dbRecipe.kind,
    title: dbRecipe.title,
    created_at: dbRecipe.created_at,
    last_modified_at: dbRecipe.last_modified_at,
  };
  switch(recipe.kind) {
    case recipeKinds.MEMO:
      recipe.content = {
        memo: dbRecipe.content.memo
      };
      break;
    default:
      break;
  }
  return recipe;
};

const isValidMemoContent = (content) => {
  return (Object.keys(content).length === 1) && (typeof content.memo === 'string');
};

const hasValidMemoContent = (requestBody) => {
  if (requestBody.hasOwnProperty('content')) {
    return isValidMemoContent(requestBody.content);
  } else {
    return false;
  }
};

router.get('/recipes', function(req, res) {
  Recipe.find()
    .exec()
    .then(function(recipes){
      const recipeArray = [];
      recipes.map((recipe => recipeArray.push(createResponseRecipe(recipe))));
      res.json({recipes: recipeArray});
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

router.post('/memo', function(req, res) {
  if (!req.body.hasOwnProperty('title') || !hasValidMemoContent(req.body)) {
    returnBadRequest(res);
    return;
  }
  new Memo({
    title: req.body.title,
    content: {
      memo: req.body.content.memo
    },
  }).save(function (err, memo){
    if(!err) {
      res.status(201).json(createResponseRecipe(memo));
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
        res.json(createResponseRecipe(recipe));
      } else {
        returnNotFound(res);
      }
    })
    .catch(function(err) {
      console.log(err);
      returnInternalServerError(res);
    });
});

router.put('/memo/:id', function(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    returnNotFound(res);
    return;
  }
  var shouldUpdateTitle = req.body.hasOwnProperty('title');
  var shouldUpdateContent = req.body.hasOwnProperty('content');
  if ((!shouldUpdateTitle && !shouldUpdateContent) || (shouldUpdateContent && !isValidMemoContent(req.body.content))) {
    returnBadRequest(res);
    return;
  }
  Recipe.findOne({
    _id: req.params.id
  })
    .exec()
    .then(function(foundRecipe){
      if (foundRecipe === null) {
        returnNotFound(res);
        return;
      }
      if (foundRecipe.kind !== recipeKinds.MEMO) {
        returnBadRequest(res);
        return;
      }
      var updateContent = {
        last_modified_at:  Date.now()
      };
      if (shouldUpdateTitle) {
        updateContent.title = req.body.title;
      }
      if (shouldUpdateContent) {
        updateContent.content = {
          memo: req.body.content.memo
        };
      }
      Recipe.findOneAndUpdate({
        _id: req.params.id
      }, updateContent, {new: true}, function(err, recipe) {
        if(!err) {
          if (recipe != null) {
            res.json(createResponseRecipe(recipe));
          } else {
            returnNotFound(res);
          }
        } else {
          console.log(err);
          returnInternalServerError(res);
        }
      });
    })
    .catch(function(err) {
      console.log(err);
      returnInternalServerError(res);
    });
});

router.delete('/recipe/:id', function(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    returnNotFound(res);
    return;
  }
  Recipe.findOneAndRemove({
    _id: req.params.id
  })
    .exec(function(err, removedRecipe){
      if (removedRecipe != null) {
        res.json({
          deleted: true,
          deletedRecipe: createResponseRecipe(removedRecipe),
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
