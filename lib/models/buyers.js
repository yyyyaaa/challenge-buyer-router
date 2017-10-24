var db = require('../db')
var soldOffers = []

exports.add = function (buyer, cb) {
  var key = buyerKey(buyer.id)

  buyer.offers.forEach(function (offer) {
    db.zadd('offers:location', offer.value, offer.location)
    
    console.log('---------------')
    offer.criteria.device.forEach( function (deviceName) {
      console.log(deviceName + ' +++ ' + offer.location)
      db.sadd(deviceName, offer.location)
    })

    offer.criteria.hour.forEach( function (offerHour) {
      console.log(String(offerHour) + ' +++ ' + offer.location)
      db.sadd('hour:' + String(offerHour), offer.location)
    })

    offer.criteria.day.forEach( function (offerDay) {
      console.log(String(offerDay) + ' +++ ' + offer.location)
      db.sadd('day:' + String(offerDay), offer.location)
    })

    offer.criteria.state.forEach( function (offerState) {
      console.log(offerState + ' +++ ' + offer.location)
      db.sadd(offerState, offer.location)
    })
    console.log('---------------')
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

  console.log(state + ' ' + hour + ' ' + day + ' ' + device)
  
  // Find matching state, hour, day, device locations
  
  multi.zrangebyscore('offers:location', '-inf', '+inf')
       .sinterstore('temp_matching', 'hour:' + hour, 'day:' + day, device, state)
       .sdiffstore('matching', 'temp_matching', 'sold')
       .smembers('matching')
       .exec(function (err, replies) {
         if (err) cb(err)
         var sortedLocations = replies[0].reverse()
         var matchingLocations = replies[3]

         sortedLocations.forEach(function (location) {
          if (matchingLocations.indexOf(location) !== -1) {
            route = location
            db.sadd('sold', location, function(err, result) {
              if (err) cb(err)
              cb(null, location)
            })
          }
         })
       })
}

function buyerKey (buyerId) {
  return 'buyers:' + buyerId
}