/**
 * Created by tmons on 12/03/15.
 */
var amqp = require('amqplib');
var Promise = require('bluebird');

/**
 * Creates a new AMQPConsumer.
 *
 * @param opts An <code>options</code> object that can contain the following keys:
 *  <ul>
 *    <li><code>amqp_uri</code> : The URI of the AMQP server</li>
 *    <li><code>exchange</code> : The name of the AMQP exchange point the associated queue should be bound to</li>
 *    <li><code>routing_key</code> : The name of the routing_key that is used for the bind to the exchange point</li>
 *    <li><code>queue_name</code> : The name of the AMQP queue</li>
 *    <li><code>prefetch_count</code> : The maximum number of messages sent over the channel that can be awaiting acknowledgement</li>
 *  </ul>
 *
 * @constructor
 */
var AMQPConsumer = function(opts) {
  this.exchange       = opts.exchange || '';
  this.exchange_type  = opts.exchange_type || 'direct';
  this.routing_key    = opts.routing_key || '';
  this.queue_name     = opts.queue_name || '';
  this.amqp_uri       = opts.amqp_uri || 'amqp://localhost';
  this.prefetch_count = opts.prefetch_count || 200;
  this.connection     = undefined;
  this.channel        = undefined;
  this.queue          = undefined;
  this.consumerTag    = undefined;
};

AMQPConsumer.prototype.start = function() {

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

      }).then(function() {

        var durable = (_this.queue_name !== undefined && _this.queue_name.length > 0);
        return _this.channel.assertQueue(_this.queue_name, { durable : durable, autoDelete : !durable });

      }).then(function(qok) {

        _this.queue = qok.queue;
        return _this.channel.bindQueue(_this.queue, _this.exchange, _this.routing_key);

      }).then(function() {

        return _this.channel.prefetch(_this.prefetch_count);

      }).then(function() {

        return _this.channel.consume(_this.queue, _this._receivedMessage.bind(_this));

      }).then(function(obj) {
        _this.consumerTag = obj.consumerTag;
        resolve();
      }, function(err) {
        console.error(err);
        reject(err);
      });
    }
  });
};

AMQPConsumer.prototype.stop = function() {

  var _this = this;

  return new Promise(function(resolve, reject) {
    _this.channel.cancel(_this.consumerTag).then(function(obj) {
      _this.consumerTag = null;
      return _this.channel.close.bind(_this.channel);
    }).then(function() {
      _this.channel = null;
      _this.connection.close.bind(_this.connection);
    }).then(function() {
      _this.connection = null;
      resolve();
    }, function(err) {
      console.warn(err);
      _this.consumerTag = null;
      _this.channel = null;
      _this.connection = null;
      reject();
    });
  });

};

AMQPConsumer.prototype._receivedMessage = function(msg) {

  var _this = this;

  return new Promise(function(resolve, reject) {
    _this.handleMessage.call(_this, msg, function(obj) {
      _this.channel.ack(msg);
      resolve(obj);
    }, function(err) {
      // If no error is passed, we assume a recoverable error occurred
      if (err == undefined) {
        // Put the message back in the queue
        _this.channel.nack(msg,false,true);
      } else {
        // Discard the message
        _this.channel.nack(msg,false,false);
      }
    });
  });
};

/**
 *
 * @param msg A <code>message</code> object that can contain the following keys:
 *  <ul>
 *    <li><code>content (Buffer)</code> : The actual content</li>
 *    <li><code>fields (Object)</code> : A handful of bookkeeping values largely of interest only to the library code</li>
 *    <li><code>properties (Object)</code> : Properties that were passed with the publish of the message</li>
 *  </ul>
 * @param resolve
 * @param reject
 */
AMQPConsumer.prototype.handleMessage = function(msg, resolve, reject) {
  console.log("[WorkerQueue] - handleMessage");


};

module.exports = AMQPConsumer;
