var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Recipe = new Schema({
    title: String,
    content: String,
    created_at: {
      type: Date,
      default: Date.now
    },
    last_modified_at: {
      type: Date,
      default: Date.now
    }
});

mongoose.model('Recipe', Recipe);
mongoose.connect('mongodb://localhost:27017/recipes');
