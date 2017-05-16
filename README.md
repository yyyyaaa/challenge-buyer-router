# Code Challenge

This challenge is to route traffic according to buyer rules. You will set up an http server that can create and retrieve "buyers". The http server will also route traffic according to the preferences of the buyers.

Create a module `lib/server.js` that exports a function. This function, `createServer`, when invoked, should return an http server with the following endpoints:

* `POST /buyers`
* `GET /buyers/:id`
* `GET /route`

All persistence should use [redis](http://redis.io). 
Source code should be in `src` dir and use redis client factory from `src/redis.js`

See `test/index.js` for more details.

### `POST /buyers`

This endpoint accepts a JSON body representing a "buyer" like the following example:

```
{
  "id": "c",
  "offers": [
    {
      "criteria": {
        "device": ["desktop"],
        "hour": [0, 1, 2],
        "day": [0],
        "state": ["CA"]
      },
      "value": 50,
      "location": "http://0.c.com"
    }
  ]
}
```

The buyer has two top-level properties, `id` and `offers`. `offers` is an array of what the "buyer" is offering to buy. In the example, if a request object has the device "desktop", an hour that is one of "0", "1", or "2", a day of "0", and state "CA", that buyer will pay a value of 50 for it to go to location "http://0.c.com".

### `GET /buyers/:id`

This retrieves a "buyer" document by `:id`. Example `/buyers/c` for the above "buyer".

### `GET /route`

This will compare a request object to the offers of the "buyers" and route traffic to the highest valued matching location. Parameters for this endpoint:

* `timestamp`: ISO timestamp (e.g. `new Date().toISOString()`)
* `device`: `"desktop"` or `"mobile"`
* `state`: US State (e.g. "CA", "NY")

Example Request:

`GET /route?timestamp=2017-03-12T10%3A30%3A00.000Z&state=NV&device=mobile`

Example Response Headers:

`{ location: http://0.c.com }`
