// Well need the model of account
var Favorites = require('../models/Favorites')
var Account = require('../models/Account')
var Post = require('../models/Post')
var config = require('../config.js')
var r = require('rethinkdb')
var auth = require('../auth.js')
var email = require('../email.js')
var util = require('util')
var handlerUtil = require('./handlerUtil.js')

var FavoritesHandler = function () {
  this.createFavorites = handleCreateFavoritesRequest
  this.getUserFavorites = handleGetUserFavoritesRequest
  this.getPostFavorites = handleGetPostFavoritesRequest
  this.updateFavorites = handleUpdateFavoritesRequest
  this.deleteFavorites = handleDeleteFavoritesRequest
}

var connection = null;
r.connect( {host: config.rethinkdb.host, port: config.rethinkdb.port}, function(err, conn) {
  if (err) throw err;
  connection = conn
})

// called when a user logs in, add userId to DB if not present
// create Account object, add data to DB using thinky
function handleCreateFavoritesRequest (req, res) {
  if (!auth.assertHasUser(req)) return

    r.db(config.rethinkdb.db).table('favorites').filter({userId: parseInt(req.headers.userid), postId: req.body.postId}).run(
      connection, function (err, cursor) {
      if (err) throw err
        cursor.toArray(function (err, result) {
          if (err) throw err
            if (result.length > 0)
              res.status(500).send({error: "Duplicate favorite on post"})
          else{
            // create Favorites object
            var favorites = new Favorites(
              <`2`>{userId: parseInt(req.headers.userid),
                postId: req.body.postId})
                console.log("PostId: "+ req.body.postId)
                // use Thinky to save Favorites data
                favorites.save().then(function (result) {
                  res.status(200).send(JSON.stringify(result))
                  r.db(config.rethinkdb.db).table('posts').get(req.body.postId).run(
                    connection, function (err, res) {
                    if (err){
                      console.log("Error favorites: "+ err.message)
                      throw err
                    }
                    console.log("RESULT "+ JSON.stringify(res))
                    Account.filter({"userId":parseInt(req.headers.userid)}).run().then(function(user){
                      console.log("res.title: " + res.title)
                      email.sendToUser(res.userId,
                                       user[0].name + " favorited your post!",
                                       "Your friend " + user[0].name +
                                         " favorited your post " + res.title + "!", res)
                    }).error(function(err){
                      console.log(err)
                      throw(err)
                    })
                  }
                  )
                }).error(function (error) {
                  // something went wrong
                  res.status(500).send({error: error.message})
                })
          }
        })
    })

}

function handleGetUserFavoritesRequest(req,res) {
  if (!auth.assertHasUser(req)) return
    num_posts = +req.headers.numposts || 10
  offset    = +req.headers.offset   || 0
  Account.get(parseInt(req.headers.userid)).getJoin({favorites: true}).run().then(function(account) {
    var postIds = account.favorites.map(function(a) {return a.postId})
    if (postIds.length === 0) {
      res.status(200).send([])
      return
    }
    console.log(postIds)
    r.db(config.rethinkdb.db).table('posts').getAll(r.args(postIds)).orderBy(r.desc('timePosted')).skip(offset).
      limit(num_posts).run(connection, function (err, cursor) {
      if (err) throw err
        handlerUtil.doCursorWithUser(res, cursor, connection, function(result) {
          res.status(200).send(JSON.stringify(result, null, 2))
        })
    })
  }).error(function (error) {
    // something went wrong
    console.log("Error: "+ error.message)
    res.status(500).send({error: error.message})
  })
}

function handleGetPostFavoritesRequest(req,res) {
  //Pass in postId in URL query
  Post.get(req.query["postId"]).getJoin({favorites: true}).run().then(function(post) {
    res.status(200).send(JSON.stringify(post.favorites, null, 2))
  }).error(function (error) {
    // something went wrong
    res.status(500).send({error: error.message})
  })
}

function handleGetFavoritesRequest (req, res) {
  // Check if there is a query string passed in, slightly primitive implementation right now
  var queried = false
  for (var q in req.query) {
    if (req.query.hasOwnProperty(q)) {
      queried = true
      r.db(config.rethinkdb.db).table('favorites').filter(r.row(q).eq(req.query[q])).run(
        connection, function (err, cursor) {
        if (err) throw err
          handlerUtil.sendCursor(res, cursor)
      }
      )
    }
  }
  if (!queried) {
    r.db(config.rethinkdb.db).table('users').run(connection, function(err, cursor) {
      if (err) throw err;
      handlerUtil.sendCursor(res, cursor)
    })
  }
}

function handleUpdateFavoritesRequest (req, res) {
  console.log('handleUpdateAccountRequest called with ' + JSON.stringify(req.route))
  if (req.query.hasOwnProperty("userId")){  r.db(config.rethinkdb.db).table("favorites").filter({"userId": req.headers.userid}).update(req.body).run(
    connection, function(err, cursor){
    if (err) throw err
  }).then(function(result) {
    res.json({
      result: result
    })
  })
  }

}
function handleDeleteFavoritesRequest (req, res) {
  queryObj = false
  userId = req.body.userId
  postId = req.body.postId

  if (userId && postId)
    queryObj = {"userId": parseInt(userId), "postId": postId}
  else if (userId)
    queryObj = {"userId": parseInt(userId)}
  else if (postId)
    queryObj = {"postId": postId}

  Favorites.filter(queryObj).delete().run().then(function(result){
    res.status(200).send(JSON.stringify(result, null, 2))
  })
}


module.exports = FavoritesHandler
