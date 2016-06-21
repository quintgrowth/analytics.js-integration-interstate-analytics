'use strict';

var Analytics = require('@segment/analytics.js-core').constructor;
var integration = require('@segment/analytics.js-integration');
var sandbox = require('@segment/clear-env');
var tester = require('@segment/analytics.js-integration-tester');
var Interstate = require('../lib/');

describe('Interstate Analytics', function() {
  var analytics;
  var interstate;
  var options = {
    apiKey: 'abccbaabccbaabccbaabccbaabccbaabccbaabcd'
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
      .option('apiKey', ''));
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
        it('should send email as an alias', function() {
          analytics.identify('somemail@interstateanalytics.com');
          analytics.called(window.interstate.alias, 'somemail@interstateanalytics.com');
        });
        it('should not send to stub if there is no userId()', function() {
          analytics.identify({ trait: true });
          analytics.didNotCall(window.interstate.alias);
        });
        it('should send email from trait as an alias', function() {
          analytics.identify('abc123', { email: 'exceptional@interstateanalytics.com' });
          analytics.called(window.interstate.alias, 'exceptional@interstateanalytics.com');
        });
        it('should send email from userId even though there is another email in trait', function() {
          analytics.identify('first@interstateanalytics.com', { email: 'exceptional@interstateanalytics.com' });
          analytics.called(window.interstate.alias, 'first@interstateanalytics.com');
        });
        it('should fallback to userId if there is no email in trait', function() {
          analytics.identify('abc123', { name: 'xyz123' });
          analytics.called(window.interstate.alias, 'abc123');
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
    });
  });
});
