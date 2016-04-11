var assert = require('assert')
    request = require('request')
    app = require('../app')
    testUserId = '112186842507184'
    testAccessToken = 'CAAIAH9y5RLgBAKtjhOYDJwpJNcglmjXExqn7MtnaE4vZAHH3Q80AyoEOp71aKZBdxRPGjALstG2vRDhnZAvtXJIpyU4CafM0heYflHIFNK6ZBEt3wJdMZBNKNJMRAKuVSvPZCCh9pkwUjCtwKF5p3jHFDAnHYJXkYJUYG7ThjXm33SCql0lMTUZCy3kgMC6zgEWJLZBlEUt5HwZDZD';

describe('Account Endpoint Tests', function() {
  it('post, get, delete request', function (done) {
    process.env.CRS_DEBUG = 1

    var postOptions = {
      url: "http://localhost:3000/api/accounts/",
      headers: {
        'userid' : testUserId,
        'accesstoken' : testAccessToken
      }
    }

    request.post(postOptions, function (err, res, body) {
      assert.equal(200, res.statusCode, "response was not a 200")
      var result = JSON.parse(res.body)
      assert.equal(testUserId, result.userId)
      var getOptions = {
        url: "http://localhost:3000/api/accounts/?userId="+testUserId,
        headers: {
          'userid' : testUserId,
          'Content-Type' : 'application/json',
          'accesstoken' : testAccessToken
        }
      }
      request.get(getOptions, function (err, res, body) {
        assert.equal(200, res.statusCode, "response was not a 200")
        var result = JSON.parse(res.body)
        assert.equal(1, result.length)
        assert.equal(testUserId, result[0].userId)
          
        var deleteOptions = {
          url: "http://localhost:3000/api/accounts/",
          headers: {
            'userid' : testUserId,
            'Content-Type' : 'application/json',
            'accesstoken' : testAccessToken
          }
        }
        request.del(deleteOptions, function (err, res, body) {
          assert.equal(200, res.statusCode, "response was not a 200")
          var val = JSON.parse(res.body)
          assert.equal(testUserId, val.userId)
          done()
        })
      })
    })
  })

  function createAccounts(accounts, callback) {
    if (accounts.length == 0) {
      callback()
      return
    }
    request.post({
      url: "http://localhost:3000/api/accounts/",
      headers: {'userid' : accounts[accounts.length - 1]}
    }, function (err, res, body) {
      assert.equal(200, res.statusCode)
      accounts.pop()
      createAccounts(accounts, callback)
    })
  }
  function createPosts(accounts, posts, callback) {
    if (accounts.length == 0) {
      callback()
      return
    }
    request.post({
      url: "http://localhost:3000/api/posts/",
      headers: {'userid': accounts[accounts.length - 1]},
      body: '{"title": "' + posts[posts.length - 1] + '"}'
    }, function (err, res, body) {
      assert.equal(200, res.statusCode)
      accounts.pop()
      posts.pop()
      createPosts(accounts, posts, callback)
    })
  }
  function getFeed(account, callback) {
    request.get({
      url: "http://localhost:3000/api/posts/",
      headers: {'userid': account}
    }, function (err, res, body) {
      assert.equal(200, res.statusCode)
      callback(JSON.parse(res.body))
    })
  }
  var adam = 100463527019300
  var brad = 107662552963871
  var greg = 153655315025677
  it('block, unblock request', function (done) {
    process.env.CRS_DEBUG = 1
    createAccounts([adam, brad, greg], function () {
      createPosts([brad, greg], ['fries', 'soda'], function () {
        getFeed(adam, function(feed) {
          assert.equal(2, feed.length)
          request.post({
            url: "http://localhost:3000/api/accounts/block/",
            headers: {
              'userid': adam
            },
            body: '{"userid": ' + brad + '}'
          }, function (err, res, body) {
            assert.equal(200, res.statusCode)
            getFeed(adam, function(feed) {
              assert.equal(1, feed.length)
              assert.equal('soda', feed[0].title)
            })
          })
        })
      })
    })
  })
})
