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

function extractStates(stat) {
  return {
    power: stat.STATUS === 'ONLINE',
    charge: parseInt(stat.BCHARGE, 10),
    timeleft: parseInt(stat.TIMELEFT, 10)
  };
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

var Adaptor = module.exports = function Adaptor(cfg) {
  // opts: adaptor, test, robot: {}, name: {}, ...
  Adaptor.__super__.constructor.apply(this, arguments);
  this.cfg = _.extend({}, config, _.pick(cfg, _.keys(config)));
  this.states = {};

  this.events = events;
  this.connector = new EventEmitter();
  this.commands = ['getState'];

  _.each(events, this.defineAdaptorEvent.bind(this));
};

Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);

// start reading UPS stats on connect
Adaptor.prototype.connect = function (callback) {

  var cfg = this.cfg, adaptor = this;
  if(cfg.connection !== 'direct') {
    return callback(new Error('connections except direct is not supported, feel free to PR'));
  }

  var err = ensureFilesExists(cfg);
  if(err) {
    return callback(err);
  }

  adaptor.getState().then(function (info) {

    // fill states first time
    adaptor.states = extractStates(info);

    // start emit events from logfile
    var tail = adaptor.tail = new Tail(cfg.apcupsdEventFile);
    tail.on('line', function (line) {
      var event = readEventFromString(line);
      if(event) {
        adaptor.emit.apply(adaptor, event);
      }
    });
    tail.on('error', console.log);

    // start emit events from binary
    adaptor.interval = setInterval(adaptor.checkEvents, cfg.pollInterval);

  }).then(function () {
    callback();
  }).catch(callback);

};

// close all handlers
Adaptor.prototype.disconnect = function (callback) {
  if(this.tail) {
    this.tail.unwatch();
  }
  clearInterval(this.interval);
  callback();
};

// get latest values from UPS and emit events if they changed
Adaptor.prototype.checkEvents = function () {

  var oldStates = _.clone(this.states), states = this.states,
      emit = this.emit.bind(this);

  return this.getState().then(function (info) {
    var last = extractStates(info);
    _.each(last, function (v, k) {
      if(v !== states[k]) {
        states[k] = v;
        emit(k, states[k], oldStates[k]);
      }
    });
  });
};

// return info about connected UPS
Adaptor.prototype.getState = function (callback) {

  var self = this;
  callback = callback || function (err, res) {
    if(err) { throw err; }
    return res;
  };

  return exec(this.cfg.apcaccessBinary)
    .then(function (out) {
      var stat = parseApcOutput(out);
      if(!stat.UPSNAME) {
        throw new Error('ups info not found');
      }
      self.stat = stat;
      return callback(null, stat);
    })
    .catch(callback);
};
