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
    var device = this.devices.apc;

    // functions:
    // device.state() - return JSON with full UPS info
    // device.power() - return current power state
    // device.charge() - return current UPS charge (in %)
    // device.timeleft() - return current time till charge is over (in minutes %)
    //
    // events:
    // >> device.on('{event}', function (newValue, oldValue) { ... });
    // 'power' - emitted whenever UPS connecton status changed (true|false)
    // 'charge' - emitted whenever charge is changes (0-100)
    // 'timeleft' - emitted when time left changed

    device.timeleft(function (err, minutes) {
      console.log('>>> UPS will remain active %s minutes if power suddenly dissapear', minutes);
    });

    device.on('power', function (status) {
      console.log('>>> power is:', status ? 'enabled now' : 'disabled');
    });

  }
});

Cylon.api('http', config.api);
Cylon.start();
