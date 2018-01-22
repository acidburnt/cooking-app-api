# COOKING RECIPES API
### This is a simple API for backend of Cooking application
### The API is deployed on Heroku with MongoDB as database.
https://thawing-wildwood-30315.herokuapp.com/
## Routes for recipes:
* GET /recipes  -  gets all recipes
* GET /recipes/:id  -  gets single recipe

* POST /recipes - adds a recipe, see fields below, requires to be logged in
```json
{
  "title": "",
  "ingredients": [ , , , ],
  "steps": [ , , , ],
  "img_url": ""
}
```

* DELETE /recipes/:id - deletes single recipe, requires to be logged in
* PATCH /recipes/:id  - updates a recipe, requires to be logged in

## Routes for users:
* POST /users  -  creates user account, see fields below
```json
{
  "email": "",
  "password": ""
}
```
* GET /users/me  -  gets logged user
* POST /users/login - logs in a user
* DELETE  /users/me/token - logs out a user