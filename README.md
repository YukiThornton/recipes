# recipes

Simple restful api for recipes.  
My first project with [Express](http://expressjs.com/) and [MongoDB](https://www.mongodb.com/)/[mongoose](https://mongoosejs.com/). This API is used as a server-side app for [helpanto](https://github.com/YukiThornton/helpanto).

## Getting Started

```sh
git clone https://github.com/YukiThornton/recipes.git
cd recipes

# change db volume path in docker-compose.yml if needed
docker-compose up
```

## Usage

### Concepts

* This API deals with any types of recipes.
* You can get or delete stored recipes without specifying recipe types.
* To create or update a recipe, you must specify a recipe type.
* Currently supported recipe types:
  * Memo: Contains a title and short text. You can jot down your special sauce ratios.
* Recipe types to implement in the future:
  * Weblink: Contains a title, a link and short text. You can save good recipes from other websites and leave some comments.
  * Picture: Contains a title, at least one picture and short text. You can save good recipes from recipe books and leave some comments.
  * Full Recipe: Contains a title, ingredients and directions.

### List all recipes

* Request
  * Method: `GET`
  * Path: `/recipes`
* Response
  * Status Code: `200`
  * Response Body:
    ```json
    {
      "recipes": [
        {
          "id": "<Recipe ID>",
          "kind": "<Type of recipe>",
          "title": "<Title of recipe>",
          "created_at": "<Created time>",
          "last_modified_at": "<Last updated time>",
          "content": {}
        },

      ],
    }
    ```
    * content: Object of recipe content

### Get specified recipe

* Request
  * Method: `GET`
  * Path: `/recipe/:id`
* Response
  * Status Code: `200`
  * Response Body:
    ```json
    {
      "id": "<Recipe ID>",
      "kind": "<Type of recipe>",
      "title": "<Title of recipe>",
      "created_at": "<Created time>",
      "last_modified_at": "<Last updated time>",
      "content": {}
    }
    ```
    * content: Object of recipe content

### Create a new memo

* Request
  * Method: `POST`
  * Path: `/memo`
  * Body:
    ```json
    {
      "title": "<memo title>",
      "content": {
        "memo": "<memo content>"
      }
    }
    ```
* Response
  * Status Code: `201`
  * Response Body:
    ```json
    {
      "id": "<Recipe ID>",
      "kind": "<Type of recipe>",
      "title": "<Title of recipe>",
      "created_at": "<Created time>",
      "last_modified_at": "<Last updated time>",
      "content": {
        "memo": "<memo content>"
      }
    }
    ```

### Update specified memo

* Request
  * Method: `PUT`
  * Path: `/memo/:id`
  * Body:
    ```json
    {
      "title": "<memo title>",
      "content": {
        "memo": "<memo content>"
      }
    }
    ```
* Response
  * Status Code: `200`
  * Response Body:
    ```json
    {
      "id": "<Recipe ID>",
      "kind": "<Type of recipe>",
      "title": "<Title of recipe>",
      "created_at": "<Created time>",
      "last_modified_at": "<Last updated time>",
      "content": {
        "memo": "<memo content>"
      }
    }
    ```

### Delete specified recipe

* Request
  * Method: `DELETE`
  * Path: `/recipe/:id`
* Response
  * Status Code: `200`
  * Response Body:
    ```json
    {
      "deleted": true,
      "deletedRecipe": {
        "id": "<Recipe ID>",
        "kind": "<Type of recipe>",
        "title": "<Title of recipe>",
        "created_at": "<Created time>",
        "last_modified_at": "<Last updated time>",
        "content": {}
      }
    }
    ```
    * content: Object of recipe content

### Delete all recipes

* Request
  * Method: `DELETE`
  * Path: `/recipes`
* Response
  * Status Code: `200`
  * Response Body:
    ```json
    {
      "count": 2,
      "ok": 2
    }
    ```
    * count: Number of recipes
    * ok: Number of deleted recipes
