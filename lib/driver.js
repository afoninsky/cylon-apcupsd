'use strict';

var Cylon = require('cylon'),
    events = require('./events'),
    _ = require('lodash');

var Driver = module.exports = function Driver() {
  Driver.__super__.constructor.apply(this, arguments);

  var commands = this.commands = {};
  ['state', 'power', 'charge', 'timeleft'].forEach(function (item) {
    commands[item] = this[item];
  }.bind(this));

  this.events = events;
  _.each(events, this.defineDriverEvent.bind(this));
  _.bindAll(this);

};

Cylon.Utils.subclass(Driver, Cylon.Driver);

Driver.prototype.start = function(callback) {
  callback();
};

Driver.prototype.halt = function(callback) {
  callback();
};

Driver.prototype.state = function () {
  return this.connection.getState.apply(null, arguments);
};

Driver.prototype.power = function (callback) {
  return this.connection.getState(function (err, stat) {
    return err ? callback(err) : callback(null, stat.STATUS === 'ONLINE');
  });
};

Driver.prototype.charge = function (callback) {
  return this.connection.getState(function (err, stat) {
    return err ? callback(err) : callback(null, parseInt(stat.BCHARGE, 10));
  });
};

Driver.prototype.timeleft = function (callback) {
  return this.connection.getState(function (err, stat) {
    return err ? callback(err) : callback(null, parseInt(stat.TIMELEFT, 10));
  });
};
