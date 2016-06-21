'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');
var isEmail = require('is-email');

/**
 * Expose `Interstate Analytics` integration.
 */

var Interstate = module.exports = integration('Interstate Analytics')
  .global('interstate')
  .option('apiKey', '')
  .tag('<script src="//cdn.interstateanalytics.com/main/{{ apiKey }}/project.js"></script>');

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
  return !!(window.interstate && window.interstate.track);
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Interstate.prototype.identify = function(identify) {
  var userId = identify.userId();
  if (userId && isEmail(userId)) {
    window.interstate.alias(userId);
  } else if (identify.email()) {
    window.interstate.alias(identify.email());
  } else if (userId) {
    window.interstate.alias(userId);
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
