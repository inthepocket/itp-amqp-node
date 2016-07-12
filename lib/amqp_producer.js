var amqp = require('amqplib');
var Promise = require('bluebird');

var AMQPProducer = function(opts) {
  this.exchange       = opts.exchange || '';
  this.exchange_type  = opts.exchange_type || 'direct';
  this.amqp_uri       = opts.amqp_uri || 'amqp://localhost';
  this.connection     = undefined;
  this.channel        = undefined;
};

/**
 *
 * @returns {bluebird}
 */
AMQPProducer.prototype.start = function() {

  var _this = this;

  return new Promise(function(resolve, reject) {

    if (_this.connection !== undefined) {
      reject();
    } else {

      amqp.connect(_this.amqp_uri).then(function(conn) {
        _this.connection = conn;
        return conn.createChannel();

      }).then(function(channel) {

        _this.channel = channel;
        return channel.assertExchange(_this.exchange, _this.exchange_type);

      }).then(resolve, reject);

    }
  });
};

/**
 *
 * @returns {bluebird}
 */
AMQPProducer.prototype.stop = function() {

  var _this = this;

  return new Promise(function(resolve, reject) {

    _this.channel.close().then(function() {
      _this.channel = undefined;
      _this.connection.close.bind(_this.connection);

    }).then(function() {
      _this.connection = undefined;
      resolve();

    }, function(err) {
      console.warn(err);
      _this.consumerTag = undefined;
      _this.channel = undefined;
      _this.connection = undefined;
      reject();
    });

  });

};

/**
 *
 * @param routing_key
 * @param message
 * @param options
 * @returns {*}
 */
AMQPProducer.prototype.publish = function(routing_key, message, options) {
  return this.channel.publish(this.exchange, routing_key, message, options);

};

module.exports = AMQPProducer;
