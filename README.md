# Cylon.js for APC UPS

Cylon.js (http://cylonjs.com) is a JavaScript framework for robotics, physical computing, and the Internet of Things (IoT).

This repository contains the adaptor/driver to work with APC UPS. It communicates overt [apcupsd](http://www.apcupsd.org) daemon. It can be used to receive current APC power consuption, raise events on power lost etc.

[place for badges]

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
    console.log('im alive!!!');
  }
});

Cylon.api('http', config.api);
Cylon.start();
```

## Documentation

Nope, sorry. Launch example and point your browser to `http://127.0.0.1:3000` - you will see all available methods and events. Also, please read official documentation on cylon.js. Good luck.

## License

Copyright (c) 2015. Licensed under the Apache 2.0 license.
