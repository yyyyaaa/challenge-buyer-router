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
    var allOffers = [];
    var highestOffer = null;
    var processed = 0;

    Object.keys(allBuyers).forEach(function (buyerId, idx, buyerKeys) {
      processed += 1

      allBuyers[buyerId] = JSON.parse(allBuyers[buyerId])

      allBuyers[buyerId].offers.forEach(function (offer) {
        offer['buyerKey'] = buyerId

        if (offer.criteria.state.indexOf(state) !== -1) {
          // Init highestOffer
          if (!highestOffer) highestOffer = offer
  
          if (highestOffer.value < offer.value) {
            highestOffer = offer
          }
        }
      })

      if (processed === buyerKeys.length) {
        // delete that buyer's bid
        db.hdel('buyers', highestOffer.buyerKey, function(err, resp) {
          cb(err, highestOffer.location)
        })
      }
    })

  });
}

function makeKey (buyerId) {
  return 'buyer:' + buyerId
}
