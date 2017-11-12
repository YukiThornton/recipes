var db = require('mongoose');
var Recipe = db.model('Recipe');

exports.listAllRecipes = function(req, res) {
  Recipe.find()
    .exec()
    .then(function(recipes){
      res.json({recipes: recipes});
    })
    .catch(function(err) {
      res.status(500).json({err: err});
    });
};

exports.deleteAllRecipes = function(req, res) {
  Recipe.find()
    .remove()
    .exec()
    .then(function(result){
      res.json({result: result});
    })
    .catch(function(err) {
      res.status(500).json({err: err});
    });
};

exports.createRecipe = function(req, res) {
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
};

exports.getRecipe = function(req, res) {
  Recipe.findOne({
    _id: req.params.id
  })
    .exec()
    .then(function(recipe){
      res.json(recipe);
    })
    .catch(function(err) {
      res.status(500).json({err: err});
    });
};

exports.updateRecipe = function(req, res) {
  var body = req.body;
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
};

exports.deleteRecipe = function(req, res) {
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
};
