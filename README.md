# ITP AMQP Node

[![Greenkeeper badge](https://badges.greenkeeper.io/inthepocket/itp-amqp-node.svg)](https://greenkeeper.io/)

[![NPM version][npm-version-image]][npm-url] [![MIT License][license-image]][license-url]

A lightweight AMQP client for Node.js

## Installation

    npm install itp-amqp-node

## Example

### Producer

```javascript
const AMQPProducer = require('itp-amqp-node').AMQPProducer;

const producer = new AMQPProducer({
  exchange: 'itp.demo',
  exchange_type: 'topic',
  amqp_uri: process.env.RABBITMQ_URI || 'amqp://localhost'
});

producer.start()
.then(() => {
  console.log('Connected to producer');
  const routing_key = 'key.hello_world';
  const message = JSON.stringify('Hello World');
  producer.publish(routing_key, new Buffer(message));
}, (err) => {
  console.error('Error while connecting to producer', err);
});
```

### Consumer

```javascript
const AMQPConsumer = require('itp-amqp-node').AMQPConsumer;

class ConsoleConsumer extends AMQPConsumer {
  handleMessage (msg, resolve, reject) {
    try {
      const jsonMsg = msg.content.toString('utf-8');
      console.log(JSON.parse(jsonMsg));
      resolve();
    } catch (e) {
      console.error(e);
      reject(e);
    }
  }
}

const opts = {
  exchange : 'itp.demo',
  exchange_type : 'topic',
  amqp_uri : process.env.RABBITMQ_URI || 'amqp://localhost',
  routing_key : 'key.hello_world'
};

const consoleConsumer = new ConsoleConsumer(opts);
consoleConsumer.start();
```

## License

ITP-AMQP-Node is freely distributable under the terms of the [MIT license](https://github.com/inthepocket/itp-amqp-node/blob/master/LICENSE).

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[npm-url]: https://npmjs.org/package/itp-amqp-node
[npm-version-image]: http://img.shields.io/npm/v/itp-amqp-node.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/itp-amqp-node.svg?style=flat
