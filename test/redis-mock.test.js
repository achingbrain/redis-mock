var redismock = require("../"),
  should = require("should"),
  events = require("events");


if (process.env['VALID_TESTS']) {
  redismock = require('redis');
}

// Clean the db after each test
afterEach(function (done) {
  r = redismock.createClient();
  r.flushdb(function () {
    r.end();
    done();
  });
});

describe("redis-mock", function () {

  it("should create an instance of RedisClient which inherits from EventEmitter", function () {

    should.exist(redismock.createClient);

    var r = redismock.createClient();
    should.exist(r);
    r.should.be.an.instanceof(redismock.RedisClient);
    r.should.be.an.instanceof(events.EventEmitter);

    r.end();

  });

  it("should call a callback when selecting a database", function (done) {
    var r = redismock.createClient();

    r.select(0, function(error) {
      should.not.exist(error);
      done();
    });
  });

  it("should emit ready and connected when creating client", function (done) {

    var r = redismock.createClient();

    var didEmitOther = true;
    var didOtherPassed = false

    r.on("ready", function () {

      if (didEmitOther && !didOtherPassed) {

        didOtherPassed = true;

        r.end();

        done();
      }

    });

    r.on("connect", function () {

      if (didEmitOther && !didOtherPassed) {

        didOtherPassed = true;

        r.end();

        done();
      }

    });

  });

  /** This test doesn't seem to work on node_redis
   it("should have function end() that emits event 'end'", function (done) {

        var r = redismock.createClient();

        r.on("end", function () {

            done();

        });

        r.end();

    });
   */
});

describe("redis-error-mock", function () {
    it("should emit a connection error", function (done) {

		// Skip this when testing against actual Redis
		if (process.env['VALID_TESTS']) {
			done();
			return;
		}

        var redis = new redismock.RedisErrorMock();

        var r = redis.createClient();
        should.exist(r);

        r.once("error", function (err) {
            err.should.equal("Connection error");
            done();
        });
    });
});
