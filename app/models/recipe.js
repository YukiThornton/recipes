const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const recipeKinds = require('../constants/recipe-kinds');

const options = {
  discriminatorKey: 'kind'
};
const RecipeSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    created_at: {
      type: Date,
      required: true,
      default: Date.now
    },
    last_modified_at: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  options
);

const Recipe = mongoose.model(recipeKinds.BASE, RecipeSchema);
module.exports = Recipe;

const memoSchema = new Schema(
  {
    content: {
      memo: {
        type: String,
        required: true
      }
    }
  },
  options
);

const Memo = Recipe.discriminator(recipeKinds.MEMO, memoSchema);
module.exports = Memo;

const webLinkSchema = new Schema(
  {
    content: {
      url: {
        type: String,
        required: true
      }
    }
  },
  options
);

const WebLink = Recipe.discriminator(recipeKinds.WEB_LINK, webLinkSchema);
module.exports = WebLink;
