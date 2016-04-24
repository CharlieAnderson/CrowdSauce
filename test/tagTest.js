var assert = require('assert')
    request = require('request')
    app = require('../app')
    testUserId = '112186842507184'
    testAccessToken = 'CAAIAH9y5RLgBAKtjhOYDJwpJNcglmjXExqn7MtnaE4vZAHH3Q80AyoEOp71aKZBdxRPGjALstG2vRDhnZAvtXJIpyU4CafM0heYflHIFNK6ZBEt3wJdMZBNKNJMRAKuVSvPZCCh9pkwUjCtwKF5p3jHFDAnHYJXkYJUYG7ThjXm33SCql0lMTUZCy3kgMC6zgEWJLZBlEUt5HwZDZD';

describe('Tag Endpoint Tests', function () {

  process.env.CRS_DEBUG = 1

  it('post, get, delete requests', function (done) {
    var postOptions = {
      url: "http://localhost:3000/api/accounts/",
      headers: {
        'userid': testUserId,
        'accesstoken': testAccessToken
      }
    }
    request.post(postOptions, function (err, res, body) {
      var postId = 0
      var postBody = {
        "ingredients": ["salt", "pepper"],
        "directions": ["boil water", "cook"],
        "recipeLink": "google.com"
      }
      var postOptions = {
        url: "http://localhost:3000/api/posts/",
        headers: {
          'userid': testUserId,
          'accesstoken': testAccessToken,
          'Content-Type': "application/json"
        },

        body: JSON.stringify(postBody)
      }
      request.post(postOptions, function (err, res, body) {
        var result = JSON.parse(res.body)
        postId = result.postId
        var tagBody = {"tagName": "breakfast", "postId": postId}
        var tagOptions = {
          url: "http://localhost:3000/api/tags/",
          headers: {
            'userid': testUserId,
            'Content-Type': 'application/json',
            'accesstoken': testAccessToken
          },
          body: JSON.stringify(tagBody)
        }

        request.post(tagOptions, function (err, res, body) {
          assert.equal(200, res.statusCode, "response was not a 200")
          var result = JSON.parse(res.body)
          assert.equal("breakfast", result.tagName)

          var getTagsOptions = {
            url: "http://localhost:3000/api/tags/",
            headers: {
              'userid': testUserId,
              'Content-Type': 'application/json',
              'accesstoken': testAccessToken
            }
          }
          request.get(getTagsOptions, function (err, res, body) {
            assert.equal(200, res.statusCode, "response was not a 200")
            var result = JSON.parse(res.body)
            console.log("RESULT: " + res.body)
            var contains = false
            for (i = 0; i < result.length; i++) {
              if (result[i].tagName == "breakfast")
                contains = true
            }

            assert.equal(true, contains)
          })

          var getPostTagsOptions = {
            url: "http://localhost:3000/api/tags/post/?postId=" + postId,
            headers: {
              'userid': testUserId,
              'Content-Type': 'application/json',
              'accesstoken': testAccessToken
            }
          }

          request.get(getPostTagsOptions, function (err, res, body) {
            assert.equal(200, res.statusCode, "response was not a 200")
            var result = JSON.parse(res.body)
            var contains = false
            for (i = 0; i < result.length; i++) {
              if (result[i].tagName == "breakfast")
                contains = true
            }

            assert.equal(true, contains)
          })

          var deleteTagBody = {"tagName": "breakfast"}
          var deleteTagOptions = {
            url: "http://localhost:3000/api/tags/name",
            headers: {
              'userid': testUserId,
              'Content-Type': 'application/json',
              'accesstoken': testAccessToken
            },

            body: JSON.stringify(deleteTagBody)

          }
          request.del(deleteTagOptions, function (err, res, body) {
            assert.equal(200, res.statusCode, "response was not a 200")
            var val = JSON.parse(res.body)
            assert.equal("1", val.result.deleted)
            var deleteOptions = {
              url: "http://localhost:3000/api/accounts/",
              headers: {
                'userid': testUserId,
                'Content-Type': 'application/json',
                'accesstoken': testAccessToken
              }

            }
            request.del(deleteOptions, function (err, res, body) {
              assert.equal(200, res.statusCode, "response was not a 200")
              done()
            });
          })
        });
      });
    });
  });
});
