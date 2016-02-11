'use strict';

var Analytics = require('analytics.js-core').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Interstate = require('../lib/');

describe('Interstate Analytics', function() {
  var analytics;
  var interstate;
  var options = {
    siteId: 'abccbaabccbaabccbaabccbaabccbaabccbaabcd'
  };

  beforeEach(function() {
    analytics = new Analytics();
    interstate = new Interstate(options);
    analytics.use(Interstate);
    analytics.use(tester);
    analytics.add(interstate);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    interstate.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(Interstate, integration('Interstate Analytics')
      .global('interstate')
      .option('siteId', ''));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(interstate, 'load');
    });

    describe('#initialize', function() {
      it('should create the window.interstate object', function() {
        analytics.assert(!window.interstate);
        analytics.initialize();
        analytics.assert(window.interstate);
      });

      it('should call #load', function() {
        analytics.initialize();
        analytics.called(interstate.load);
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(interstate, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#identify', function() {
      describe('stubbed tests', function() {
        beforeEach(function() {
          analytics.stub(window.interstate, 'alias');
        });
        it('should send an alias', function() {
          analytics.identify('somemail@interstateanalytics.com');
          analytics.called(window.interstate.alias, 'somemail@interstateanalytics.com');
        });
        it('should not send to stub if there is no userId()', function() {
          analytics.identify({ trait: true });
          analytics.didNotCall(window.interstate.alias);
        });
      });

      describe('deep logic test', function() {
        it('should send visit just after initialize', function() {
          var log = window.interstate.getLogHistory()[0];
          analytics.assert(log.metadata.event_name === 'visit');
          analytics.assert(log.metadata.project_key === options.siteId);
          analytics.assert(log.metadata.version_date === '2015-06-09');
        });

        it('should send an alias', function() {
          analytics.identify('somemail@interstateanalytics.com');
          var logs = window.interstate.getLogHistory();
          analytics.assert(logs.length === 2);

          var visitLog = logs[0];
          analytics.assert(visitLog.metadata.event_name === 'visit');
          analytics.assert(visitLog.metadata.project_key === options.siteId);
          analytics.assert(visitLog.metadata.version_date === '2015-06-09');

          var aliasLog = logs[1];
          analytics.assert(aliasLog.metadata.event_name === 'alias_user');
          analytics.assert(aliasLog.metadata.aliased_name === 'somemail@interstateanalytics.com');
          analytics.assert(aliasLog.metadata.version_date === '2015-06-09');

          analytics.assert(visitLog.metadata.user_identifier === aliasLog.metadata.user_identifier);
        });

        it('should not send if there is no userId()', function() {
          analytics.identify({ trait: true });
          var logs = window.interstate.getLogHistory();
          analytics.assert(logs.length === 1);

          var visitLog = logs[0];
          analytics.assert(visitLog.metadata.event_name === 'visit');
          analytics.assert(visitLog.metadata.project_key === options.siteId);
          analytics.assert(visitLog.metadata.version_date === '2015-06-09');
        });
      });
    });

    describe('#track', function() {
      describe('stubbed tests', function() {
        beforeEach(function() {
          analytics.stub(window.interstate, 'track');
        });
        it('should send a signup conversion to stub', function() {
          analytics.track('signup');
          analytics.called(window.interstate.track, 'signup');
        });
        it('should send a purchase conversion with properties to stub', function() {
          analytics.track('purchase', { revenue: 31.95, order_number: 'abc123' });
          analytics.called(window.interstate.track, 'purchase', { revenue: 31.95, order_number: 'abc123' });
        });
      });

      describe('deep logic test', function() {
        it('should send a signup conversion', function() {
          analytics.track('signup');

          var logs = window.interstate.getLogHistory();
          analytics.assert(logs.length === 2);

          var visitLog = logs[0];
          analytics.assert(visitLog.metadata.event_name === 'visit');
          analytics.assert(visitLog.metadata.project_key === options.siteId);
          analytics.assert(visitLog.metadata.version_date === '2015-06-09');

          var conversionLog = logs[1];
          analytics.assert(conversionLog.metadata.event_name === 'conversion');
          analytics.assert(conversionLog.metadata.conversion_name === 'signup');
          analytics.assert(conversionLog.metadata.version_date === '2015-06-09');
          analytics.assert(!conversionLog.metadata.order_number);
          analytics.assert(!conversionLog.metadata.price);

          analytics.assert(visitLog.metadata.user_identifier === conversionLog.metadata.user_identifier);
        });

        it('should send a purchase conversion with properties', function() {
          analytics.track('purchase', { revenue: 31.95, order_number: 'abc123' });
          var logs = window.interstate.getLogHistory();
          analytics.assert(logs.length === 2);

          var visitLog = logs[0];
          analytics.assert(visitLog.metadata.event_name === 'visit');
          analytics.assert(visitLog.metadata.project_key === options.siteId);
          analytics.assert(visitLog.metadata.version_date === '2015-06-09');

          var conversionLog = logs[1];
          analytics.assert(conversionLog.metadata.event_name === 'conversion');
          analytics.assert(conversionLog.metadata.conversion_name === 'purchase');
          analytics.assert(conversionLog.metadata.version_date === '2015-06-09');
          analytics.assert(conversionLog.metadata.order_number === 'abc123');
          analytics.assert(conversionLog.metadata.price === 31.95);

          analytics.assert(visitLog.metadata.user_identifier === conversionLog.metadata.user_identifier);
        });
      });
    });
  });
});
