'use strict';

/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');

/**
 * Expose `Interstate Analytics` integration.
 */

var Interstate = module.exports = integration('Interstate Analytics')
  .global('interstate')
  .option('siteId', '')
  .tag('<script src="https:////cdn.interstateanalytics.com/main/{{ siteId }}/project.js">');

/**
 * Initialize.
 *
 * @api public
 */

Interstate.prototype.initialize = function() {
  window.interstate = window.interstate || [];
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Interstate.prototype.loaded = function() {
  return !!(window.interstate && typeof window.interstate.track === 'object');
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Interstate.prototype.identify = function(identify) {
  if (identify.userId()) {
    window.interstate.alias(identify.userId());
  }
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

Interstate.prototype.track = function(track) {
  window.interstate.track(track.event(), track.properties());
};
