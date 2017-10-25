var db = require('../db')

exports.add = function (buyer, cb) {
  var key = buyerKey(buyer.id)

  buyer.offers.forEach(function (offer) {
    db.zadd('locations', offer.value, offer.location)
    db.sadd('unsold', offer.location)

    offer.criteria.device.forEach(function (offerDevice) {
      db.sadd(locationByDevice(offerDevice), offer.location)
    })

    offer.criteria.hour.forEach(function (offerHour) {
      db.sadd(locationByHour(offerHour), offer.location)
    })

    offer.criteria.day.forEach(function (offerDay) {
      db.sadd(locationByDay(offerDay), offer.location)
    })

    offer.criteria.state.forEach(function (offerState) {
      db.sadd(locationByState(offerState), offer.location)
    })
  })

  db.set(key, JSON.stringify(buyer), cb)
}

exports.get = function (buyerId, cb) {
  var key = buyerKey(buyerId)
  db.get(key, cb)
}

exports.route = function (queryParams, cb) {
  var state = queryParams.state
  var hour = String(queryParams.hour)
  var day = String(queryParams.day)
  var device = queryParams.device
  var multi = db.multi()
  multi.zrangebyscore('locations', '-inf', '+inf')
       .sinterstore('matching',
                    'unsold',
                    locationByHour(hour),
                    locationByDay(day),
                    locationByDevice(device),
                    locationByState(state))
       .smembers('matching')
       .exec(function (err, replies) {
          if (err) cb(err)
          var sortedLocations = replies[0].reverse()
          var matchingLocations = replies[2]

          sortedLocations.forEach(function (location) {
            if (matchingLocations.indexOf(location) !== -1) {
              db.srem('unsold', location, function (err, result) {
                if (result === 1) {
                  return cb(null, location)
                }
              })
            }
          })
       })
}

function buyerKey (buyerId) {
  return 'buyers:' + buyerId
}

function locationByDevice (device) {
  return 'device:' + device + ':locations'
}

function locationByHour (hour) {
  return 'hour:' + hour + ':locations'
}

function locationByDay (day) {
  return 'day:' + day + ':locations'
}

function locationByState (state) {
  return 'state:' + state + ':locations'
}