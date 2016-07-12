var assert        = require('assert');
var AMQPConsumer  = require('../').AMQPConsumer;

describe('AMQPConsumer',function(){

  var test = "hello";
  before(function(done) {

    test = "world";
    done();
  });


  describe('User model',function() {
    it('#find',function(done) {

      assert.equal(test,"world");
      done();

    });
  });

  after(function() {


  });
});
