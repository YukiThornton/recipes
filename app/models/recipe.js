let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Recipe = new Schema({
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

module.exports = mongoose.model('Recipe', Recipe);