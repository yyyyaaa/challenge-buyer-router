var redis = require('../src/redis')

var db = module.exports = redis()

db.healthCheck = function (cb) {
  var now = (new Date()).toISOString()
  db.set('!healthCheck', now, function (err, reply) {
    if (err) return cb(err)

    db.get('!healthCheck', function (err, result) {
      if (err) return cb(err)
      if (now != result) return cb(new Error('Redis db write fail'))
      cb()
    })
  })
}