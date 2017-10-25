var db = require('../db')

var sold = []

exports.add = function (buyer, cb) {
  var key = buyerKey(buyer.id)

  buyer.offers.forEach(function (offer) {
    db.zadd('offers:location', offer.value, offer.location)

    offer.criteria.device.forEach( function (deviceName) {
      db.sadd(deviceName, offer.location)
    })

    offer.criteria.hour.forEach( function (offerHour) {
      db.sadd('hour:' + String(offerHour), offer.location)
    })

    offer.criteria.day.forEach( function (offerDay) {
      db.sadd('day:' + String(offerDay), offer.location)
    })

    offer.criteria.state.forEach( function (offerState) {
      db.sadd(offerState, offer.location)
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
  var route
  
  multi.zrangebyscore('offers:location', '-inf', '+inf')
       .sinterstore('matching', 'hour:' + hour, 'day:' + day, device, state)
       .smembers('matching')
       .exec(function (err, replies) {
          if (err) cb(err)
          var sortedLocations = replies[0].reverse()
          var matchingLocations = replies[2]

          console.log(state + ' ' + hour + ' ' + day + ' ' + device)
          console.log("Matching locations --- ")
          console.log(matchingLocations)

          var matched = sortedLocations.filter(function (location) {
            return matchingLocations.indexOf(location) !== -1 &&
                  sold.indexOf(location) === -1;
          })

          if (matched.length === 1) {
            console.log("Matched " + matched[0])
            sold.push(matched[0])
            cb(null, matched[0])
          }
       })
}

function buyerKey (buyerId) {
  return 'buyers:' + buyerId
}
