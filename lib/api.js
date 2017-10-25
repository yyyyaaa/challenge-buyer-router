var body = require('body/json')
var send = require('send-data/json')
var querystring = require('querystring')

var Buyers = require('./models/buyers')

module.exports = {
  buyers: {
    post: post,
    get: get,
    route: route
  }
}

function get (req, res, opts, cb) {
  Buyers.get(opts.params.id, function (err, value) {
    if (err) return cb(err)
    send(req, res, JSON.parse(value))
  })
}

function post (req, res, opts, cb) {
  body(req, res, function (err, data) {
    if (err) return cb(err)

    Buyers.add(data, function (err, result) {
      if (err) return cb(err)
      send(req, res, {
        body: data,
        statusCode: 201
      })
    })
  })
}

function route (req, res, opts, cb) {
  var queryParams = querystring.parse(removePath(req.url))
  var parsedTime = parseTimestamp(queryParams.timestamp)
  queryParams['day'] = parsedTime.day
  queryParams['hour'] = parsedTime.hour
  Buyers.route(queryParams, function (err, location) {
    if (err) return cb(err)
    send(req, res, {
      headers: {
        location: location
      },
      statusCode: 302
    })
  })
}

function removePath (pathWithQuery) {
  return pathWithQuery.substring(pathWithQuery.indexOf('?') + 1)
}

function parseTimestamp (timestamp) {
  var date = new Date(timestamp)
  return {
    day: date.getUTCDay(),
    hour: date.getUTCHours()
  }
}
