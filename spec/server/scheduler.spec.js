
var _ = require('underscore');

var cronJobMock = null,
    cronJobOptions = null,
    cronMock = {
      CronJob : function(options) {
        cronJobOptions = options;
        cronJobMock = jasmine.createSpyObj('cronJob', [ 'start', 'stop' ]);
        return cronJobMock;
      }
    };

var clearMockData = function() {
  cronJobMock = null;
  cronJobOptions = null;
};

var Config = require('./support/mocks/config'),
    Logger = require('./support/mocks/logger'),
    matchers = require('./support/matchers'),
    Scheduler = require('../../lib/scheduler').inject({
      cron : cronMock,
      Logger : Logger
    });

var newScheduler = function(options) {
  
  var config = new Config(_.extend({
    // TODO: add schedule in default options
  }, options || {}));

  var scheduler = new Scheduler({ config : config, emit : jasmine.createSpy() });
  config.change();
  return scheduler;
};

var startScheduler = function(options) {

  var scheduler = newScheduler(options),
      startErr = null,
      started = true;

  runs(function() {
    scheduler.start(function(err) {
      startErr = err;
      started = true;
    });
  });

  waitsFor(function() {
    return started;
  }, "The scheduler should have started", 250);

  runs(function() {
    expect(startErr).toBeUndefined();
  });

  return scheduler;
};

describe("Scheduler", function() {

  var scheduler;

  beforeEach(function() {
    clearMockData();
  });

  it("should create a cron job with default values when started", function() {

    var scheduler = startScheduler();

    runs(function() {
      expect(cronJobOptions).toEqual({
        cronTime : '*/10 * * * * *',
        onTick : scheduler.trigger,
        start : true,
        timeZone : 'UTC'
      });
    });
  });

  it("should log that it has started", function() {

    var scheduler = startScheduler();

    runs(function() {
      expect(scheduler.log).toHaveLogged('info', 'checked');
    });
  });

  it("should stop the cron job when stopped", function() {

    var scheduler = startScheduler(),
        stopErr = null,
        stopped = false;

    runs(function() {
      scheduler.stop(function(err) {
        stopErr = err;
        stopped = true;
      });
    });

    waitsFor(function() {
      return stopped;
    }, "The scheduler should have stopped", 250);

    runs(function() {
      expect(stopErr).toBeUndefined();
      expect(cronJobMock.stop).toHaveBeenCalled();
    });
  });

  it("should emit a watch event on the application when the job is triggered", function() {
    var scheduler = newScheduler();
    scheduler.trigger();
    expect(scheduler.app.emit).toHaveBeenCalledWith('watch');
  });
});
