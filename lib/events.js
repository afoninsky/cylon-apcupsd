'use strict';

var events = [
  /**
   * Emitted whenever UPS connecton status changed
   *
   * @event power true|false
   * @value value
   */
  'power',
  /**
   * How much (in percent) charge left
   *
   * @event charge
   * @value value 0-100
   */
  'charge',
  /**
   * Approx. how much time (in seconds) left
   *
   * @event time
   * @value value amount of seconds
   */
  'time'
];

module.exports = events;
module.exports.listenAll = events.forEach;
