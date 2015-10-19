'use strict';

var Cylon = require('cylon'),
    events = require('./events');

var Driver = module.exports = function Driver() {
  Driver.__super__.constructor.apply(this, arguments);

  var commands = this.commands = {};
  ['info', 'power', 'charge', 'time'].forEach(function (item) {
    commands[item] = this[item];
  }.bind(this));

  this.events = events;
  events.listenAll(this.defineDriverEvent.bind(this));

};

Cylon.Utils.subclass(Driver, Cylon.Driver);

Driver.prototype.start = function(callback) {
  callback();
};

Driver.prototype.halt = function(callback) {
  callback();
};

Driver.prototype.info = function () {
  return this.connection.state.apply(null, arguments);
};

Driver.prototype.power = function () {
  return this.connection.state().then(function (stat) {
    return stat.STATUS === 'ONLINE';
  });
};

Driver.prototype.charge = function () {
  return this.connection.state().then(function (stat) {
    return parseInt(stat.BCHARGE, 10);
  });
};

Driver.prototype.time = function () {
  return this.connection.state().then(function (stat) {
    return parseInt(stat.TIMELEFT, 10);
  });
};
