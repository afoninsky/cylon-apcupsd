'use strict';

var Cylon = require('cylon'),
    exec = require('child-process-promise').exec,
    config = require('config'),
    _ = require('lodash'),
    fs = require('fs'),
    Tail = require('tail').Tail,
    events = require('./events'),
    EventEmitter = require('events').EventEmitter;

function parseApcOutput(result) {
  var stat = {};
  (result.stdout || '').split('\n').forEach(function(v) {
    var arr = v.split(':');
      if (arr[1]) {
        stat[arr[0].trim()] = arr[1].trim();
      }
    });
  return stat;
}

function readEventFromString(line) {
  // ex.: "2014-12-08 08:38:20 +0000  Power is back. UPS running on mains."

  var eventStr = line.split(' ').slice(3).join(' ');
  if (eventStr.indexOf('Power failure') !== -1) { // power failure
    return ['power', false];
  } else if (eventStr.indexOf('Power is back') !== -1) { // power is back
    return ['power', true];
  }
}

function ensureFilesExists(cfg) {
  if(!fs.existsSync(cfg.apcupsdEventFile)) {
    return new Error(cfg.apcupsdEventFile + ' doesnt exist, is apcupsd installed?');
  }
  if (!fs.existsSync(cfg.apcaccessBinary)) {
    return new Error(cfg.apcaccessBinary + ' doesnt exist, is apcupsd installed?');
  }
}

var Adaptor = module.exports = function Adaptor(opts) {
  // opts: adaptor, test, robot: {}, name: {}, ...
  Adaptor.__super__.constructor.apply(this, arguments);
  this.opts = _.extend({}, config, _.pick(opts, _.keys(config)));
  this.robot = opts.robot;

  this.events = events;
  this.commands = ['state'];

  this.connector = new EventEmitter();
  events.listenAll(this.defineAdaptorEvent.bind(this));
};

Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);

Adaptor.prototype.connect = function (callback) {

  if(this.opts.connection !== 'direct') {
    return callback(new Error('connections except direct is not supported, feel free to PR'));
  }

  var err = ensureFilesExists(this.opts);
  if(err) {
    return callback(err);
  }

  this.state().then(function (info) {
    // save actual info about connected UPS
    this.robot.info = info;
    // emit events from logfile
     var tail = this.tail = new Tail(this.opts.apcupsdEventFile);
     tail.on('line', function (line) {
       var event = readEventFromString(line);
       if(event) {
         this.emit.apply(this, event);
       }
     });
     tail.on('error', console.log);
  }.bind(this)).then(function () {
    callback();
  }).catch(callback);

};

Adaptor.prototype.disconnect = function (callback) {
  if(this.tail) {
    this.tail.unwatch();
  }
  callback();
};

Adaptor.prototype.state = function (callback) {
  callback = callback || function (err, res) {
    if(err) { throw err; }
    return res;
  };

  return exec(this.opts.apcaccessBinary)
    .then(function (out) {
      var stat = parseApcOutput(out);
      if(!stat.UPSNAME) {
        throw new Error('ups info not found');
      }
      return callback(null, stat);
    })
    .catch(callback);
};
