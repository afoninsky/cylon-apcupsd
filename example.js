'use strict';
var Cylon = require('cylon'),
    config = require('config');

Cylon.robot({
  name: 'Maria',
  config: config,
  connections: {
    apc: { adaptor: 'apcupsd' }
  },
  devices: {
    apc: {driver: 'apcupsd' }
  },
  work: function () {
    console.log('im alive!!!');
  }
});

Cylon.api('http', config.api);
Cylon.start();
