var db = require('../db')

exports.add = function (buyer, cb) {
  var key = makeKey(buyer.id);
  db.hset('buyers', key, JSON.stringify(buyer), cb);
}

exports.get = function (buyerId, cb) {
  var key = makeKey(buyerId);
  db.hget('buyers', key, cb);
}

exports.route = function (state, cb) {
  db.hgetall('buyers', function (err, allBuyers) {
    if (err) cb(err)

    var highestOffer = null;
    var processed = 0;
    var offers = [];

    Object.keys(allBuyers).forEach(function (buyerId, idx, buyerKeys) {

      allBuyers[buyerId] = JSON.parse(allBuyers[buyerId])

      allBuyers[buyerId].offers.forEach(function (offer) {
        offer['buyerKey'] = buyerId
        offer['sold'] = false
        offers.push(offer)
      })
    })

    // Cache offers with sold status
    db.get('sold', function (err, cachedOffers) {
      if (err) cb(err)
      if (!cachedOffers) {
        db.set('sold', JSON.stringify(offers), function (err, result) {
          if (err) cb(err)
          findHighestMatchingOffer(offers, state, cb)          
        })
      } else {
        cachedOffers = JSON.parse(cachedOffers)      
        findHighestMatchingOffer(cachedOffers, state, cb)
      }
    })
  });
}

function makeKey (buyerId) {
  return 'buyer:' + buyerId
}

function findHighestMatchingOffer (offers, state, cb) {
  var highest;
  
  try {
    highest = offers.filter(function (offer) {
      return !offer.sold && offer.criteria.state.indexOf(state) !== -1
    }).reduce(function (prev, current) {
      return (prev.value > current.value) ? prev : current
    })

    cb(null, highest.location)
  } catch (err) {
    cb(err)
  }
}
