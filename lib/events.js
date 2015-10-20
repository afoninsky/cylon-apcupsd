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
   * Approx. how much time (in minutes) left
   *
   * @event timeleft
   * @value value amount of seconds
   */
  'timeleft'
];

module.exports = events;
