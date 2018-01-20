let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Recipe = new Schema({
    recipe_type: String,
    title: String,
    content: {
      memo: String
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    last_modified_at: {
      type: Date,
      default: Date.now
    }
});

module.exports = mongoose.model('Recipe', Recipe);
