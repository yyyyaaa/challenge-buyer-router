var db = require('../db')
var soldOffers = []

exports.add = function (buyer, cb) {
  var key = makeKey(buyer.id)
  db.hset('buyers', key, JSON.stringify(buyer), cb)
}

exports.get = function (buyerId, cb) {
  var key = makeKey(buyerId)
  db.hget('buyers', key, cb)
}

exports.route = function (state, cb) {
  db.hgetall('buyers', function (err, allBuyers) {
    if (err) cb(err)

    var highestOffer = null
    var offers = []

    Object.keys(allBuyers).forEach(function (buyerId, idx, buyerKeys) {
      allBuyers[buyerId] = JSON.parse(allBuyers[buyerId])

      allBuyers[buyerId].offers.forEach(function (offer) {
        offer['buyerKey'] = buyerId
        offers.push(offer)
      })
    })
    highestOffer = findHighestMatchingOffer(offers, state)
    soldOffers.push(highestOffer.location)
    cb(null, highestOffer.location)
  })
}

function makeKey (buyerId) {
  return 'buyer:' + buyerId
}

function findHighestMatchingOffer (offers, state) {
  return offers.filter(function (offer) {
    return !isSold(offer) && matchState(offer, state)
  }).reduce(function (prev, current) {
    return (prev.value > current.value) ? prev : current
  })
}

function isSold (offer) {
  return soldOffers.indexOf(offer.location) !== -1
}

function matchState (offer, state) {
  return offer.criteria.state.indexOf(state) !== -1
}
