const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Recipe = require('../models/recipe');
const recipeTypes = require('../constants/recipe-types');

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
  return {
    id: dbRecipe._id,
    recipe_type: dbRecipe.recipe_type,
    title: dbRecipe.title,
    content: dbRecipe.content,
    created_at: dbRecipe.created_at,
    last_modified_at: dbRecipe.last_modified_at,
  };
};

const hasValidRecipeType = (requestBody) => {
  if (requestBody.hasOwnProperty('recipe_type')) {
    var types = Object.keys(recipeTypes);
    for (var i = 0; i < types.length; i++) {
      if (recipeTypes[types[i]] === requestBody.recipe_type) {
        return true;
      }
    }
  }
  return false;
}

const isValidRecipeContent = (content, recipe_type) => {
  switch (recipe_type) {
    case recipeTypes.RECIPE_TYPE_MEMO:
      return (Object.keys(content).length === 1) && (typeof content.memo === 'string');

    default:
      return false;
  }
}

const hasValidRecipeContent = (requestBody) => {
  if (requestBody.hasOwnProperty('content')) {
    return isValidRecipeContent(requestBody.content, requestBody.recipe_type);
  } else {
    return false;
  }
}

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

router.post('/recipe', function(req, res) {
  if (!req.body.hasOwnProperty('title') || !hasValidRecipeType(req.body) || !hasValidRecipeContent(req.body)) {
    returnBadRequest(res);
    return;
  }
  new Recipe({
    recipe_type: req.body.recipe_type,
    title: req.body.title,
    content: req.body.content,
  }).save(function (err, recipe){
    if(!err) {
      res.status(201).json(createResponseRecipe(recipe));
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

router.put('/recipe/:id', function(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    returnNotFound(res);
    return;
  }
  if (req.body.hasOwnProperty('recipe_type')) {
    returnBadRequest(res);
    return;
  }
  var shouldUpdateTitle = req.body.hasOwnProperty('title');
  var shouldUpdateContent = req.body.hasOwnProperty('content');
  if (!shouldUpdateTitle && !shouldUpdateContent) {
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
      if (shouldUpdateContent && !isValidRecipeContent(req.body.content, foundRecipe.recipe_type)) {
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
        switch (foundRecipe.recipe_type) {
          case recipeTypes.RECIPE_TYPE_MEMO:
            updateContent.content = {
              memo: req.body.content.memo
            };
            break;
          default:
            returnInternalServerError(res);
            return;
        }
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
