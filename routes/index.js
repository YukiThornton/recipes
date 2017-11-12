var db = require('mongoose');
var Recipe = db.model('Recipe');

exports.listAllRecipes = function(req, res) {
  Recipe.find()
    .exec()
    .then(function(recipes){
      res.send(recipes);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
};

exports.deleteAllRecipes = function(req, res) {
  Recipe.find()
    .remove()
    .exec()
    .then(function(result){
      res.send(result);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
};

exports.createRecipe = function(req, res) {
  new Recipe({
      title: req.body.title,
      content: req.body.content
  }).save(function (err, recipe){
    if(err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(recipe);
    }
  })
};

exports.getRecipe = function(req, res) {
  Recipe.findOne({
    _id: req.params.id
  })
    .exec()
    .then(function(recipe){
      res.send(recipe);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
};

exports.updateRecipe = function(req, res) {
  var body = req.body;
  body.last_modified_at = Date.now();
  Recipe.findOneAndUpdate({
    _id: req.params.id
  }, body, {new: true}, function(err, recipe) {
    if(err) {
      res.status(500).send(err);
    } else {
      res.send(recipe);
    }
  });
};

exports.deleteRecipe = function(req, res) {
  Recipe.findOne({
    _id: req.params.id
  })
    .remove()
    .exec()
    .then(function(result){
      res.send(result);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
};
