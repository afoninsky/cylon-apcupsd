# Cylon.js for APC UPS
[![Build Status via Travis CI](https://travis-ci.org/afoninsky/cylon-apcupds.svg?branch=master)](https://travis-ci.org/afoninsky/cylon-apcupds)
[![NPM version](http://img.shields.io/npm/v/cylon-apcupds.svg)](https://www.npmjs.org/package/cylon-apcupds)
[![Coverage Status](https://coveralls.io/repos/afoninsky/cylon-apcupds/badge.svg?branch=master&service=github)](https://coveralls.io/github/afoninsky/cylon-apcupds?branch=master)

Cylon.js (http://cylonjs.com) is a JavaScript framework for robotics, physical computing, and the Internet of Things (IoT).

This repository contains the adaptor/driver to work with APC UPS. It communicates overt [apcupsd](http://www.apcupsd.org) daemon. It can be used to receive current APC power consuption, raise events on power lost etc.

## How to Install

1) Plug your APC UPS to computer and install apcupsd daemon:

    $ apt-get install apcupsd
    $ edit /etc/apcupsd/apcupsd.conf
    $ service apcupsd start

2) Ensure binary and log files are exists: `/sbin/apcaccess`, `/var/log/apcupsd.events`

3) Install cylon with apc support:

    $ npm install cylon cylon-apcupsd

## How to Use

```javascript
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
```

## Documentation

Nope, sorry. Please read and launch example, point your browser to `http://127.0.0.1:3000` - you will see all available methods and events. Also, please read official documentation on cylon.js. Good luck.

## License

Copyright (c) 2015. Licensed under the Apache 2.0 license.
