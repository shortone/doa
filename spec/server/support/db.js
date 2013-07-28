
var _ = require('underscore');

var testOpenDb = function(db) {

  var open;

  runs(function() {
    db.open(function(err) {
      open = !err;
    });
  });

  waitsFor(function() {
    return typeof(open) != 'undefined';
  }, "The database should be open", 250);

  runs(function() {
    expect(open).toBe(true);
  });
};

var testCloseDb = function(db) {

  var closed;

  runs(function() {
    db.close(function(err) {
      closed = !err;
    });
  });

  waitsFor(function() {
    return typeof(closed) != 'undefined';
  }, "The database should be closed", 250);

  runs(function() {
    expect(closed).toBe(true);
  });
};

var testAddWatch = function(db, watchToAdd) {

  var addErr = null,
      addedWatch = null;

  runs(function() {
    db.addWatch(watchToAdd, function(err, watch) {
      addErr = err;
      addedWatch = watch;
    });
  });

  waitsFor(function() {
    return addedWatch !== null || addErr !== null;
  }, "The database should add the watch", 250);

  runs(function() {
    expect(addErr).toBe(undefined);
    expect(addedWatch).toEqual(watchToAdd);
  });
};

var testWatchExists = function(db, token, expected) {

  var existsErr = null,
      watchExists = null;

  runs(function() {
    db.watchExists(token, function(err, exists) {
      existsErr = err;
      watchExists = exists;
    });
  });

  waitsFor(function() {
    return existsErr !== null || watchExists !== null;
  }, "The database should check if the watch exists", 250);

  runs(function() {
    expect(existsErr).toBe(undefined);
    expect(watchExists).toBe(expected);
  });
};

var testGetWatch = function(db, token, expected) {

  var getErr = null,
      gottenWatch = null;

  runs(function() {
    db.getWatch(token, function(err, watch) {
      getErr = err;
      gottenWatch = watch;
    });
  });

  waitsFor(function() {
    return getErr !== null || gottenWatch !== null;
  }, "The database should get the watch", 250);

  runs(function() {
    expect(getErr).toBe(undefined);
    if (expected) {
      expect(gottenWatch).toEqual(expected);
    } else {
      expect(gottenWatch).toBe(null);
    }
  });
};

var testGetWatches = function(db, expected) {

  var getErr = null,
      gottenWatches = null;

  runs(function() {
    db.getWatches(function(err, watches) {
      getErr = err;
      gottenWatches = watches;
    });
  });

  waitsFor(function() {
    return getErr !== null || gottenWatches !== null;
  }, "The database should get the watches", 250);

  runs(function() {
    expect(getErr).toBe(undefined);
    expect(gottenWatches).toEqual(expected);
  });
};

var testUpdateWatch = function(db, update) {

  var updateErr = null,
      updatedWatch = null;

  runs(function() {
    db.updateWatch(update, function(err, watch) {
      updateErr = err;
      updatedWatch = watch;
    });
  });

  waitsFor(function() {
    return updateErr !== null || updatedWatch !== null;
  }, "The database should update the watch", 250);

  runs(function() {
    expect(updateErr).toBe(undefined);
    expect(updatedWatch).toEqual(update);
  });
};

var testUpdateOutdatedWatches = function(db, date, expected) {
  
  var updateErr = null,
      updateResult = null;

  runs(function() {
    db.updateOutdatedWatches(date, function(err, result) {
      updateErr = err;
      updateResult = result;
    });
  });

  waitsFor(function() {
    return updateErr !== null || updateResult !== null;
  }, "The database should update outdated watches", 250);

  runs(function() {
    expect(updateErr).toBe(undefined);
    expect(updateResult).toEqual(expected);
  });
};

var testRemoveWatch = function(db, token) {

  var removeErr = null;

  runs(function() {
    db.removeWatch(token, function(err) {
      removeErr = err;
    });
  });

  waitsFor(function() {
    return removeErr !== null;
  }, "The database should remove the watch", 250);

  runs(function() {
    expect(removeErr).toBe(undefined);
  });
};

module.exports = {

  testDb : function(dbGenerator) {

    var db;
    beforeEach(function() {
      db = dbGenerator();
    });

    it("should get watches", function() {

      testOpenDb(db);
      testGetWatches(db, []);

      var watchesToAdd = [
        { token : 'abcdef', a : 'b' },
        { token : 'bcdefg', b : 'c' },
        { token : 'cdefgh', c : 'd' }
      ];

      _.each(watchesToAdd, function(watchToAdd) {
        testAddWatch(db, watchToAdd);
      });

      testGetWatches(db, watchesToAdd);
      testCloseDb(db);
    });

    it("should add, get, update and delete a watch", function() {
      
      var token = 'abcdef',
          watchToAdd = { token : token, foo : 'bar' },
          watchUpdate = { token : token, foo : 'oof', bar : 'rab' };

      testOpenDb(db);
      testAddWatch(db, watchToAdd);
      testWatchExists(db, token, true);
      testGetWatch(db, token, watchToAdd);
      testUpdateWatch(db, watchUpdate);
      testRemoveWatch(db, token);
      testWatchExists(db, token, false);
      testGetWatch(db, token, null);
      testCloseDb(db);
    });

    it("should update outdated watches", function() {

      var date = new Date(),
          thirtySecondsBefore = new Date(date.getTime() - 30000),
          twoMinutesBefore = new Date(date.getTime() - 120000),
          threeMinutesBefore = new Date(date.getTime() - 180000),
          tenMinutesBefore = new Date(date.getTime() - 600000),
          oneMinute = 60,
          fiveMinutes = 300,
          watches = [
            // new, nothing to do
            { token : 'abcdef', status : 'new', interval : oneMinute },
            // live, nothing to do
            { token : 'bcdefg', status : 'up', interval : oneMinute, lastCheckedAt : thirtySecondsBefore, lastPingedAt : thirtySecondsBefore },
            // recently down, nothing to do
            { token : 'cdefgh', status : 'down', interval : oneMinute, lastCheckedAt : thirtySecondsBefore, lastPingedAt : thirtySecondsBefore },
            // up but not seen in last interval, downed++
            { token : 'defghi', status : 'up', interval : oneMinute, lastCheckedAt : twoMinutesBefore, lastPingedAt : twoMinutesBefore },
            // same, downed++
            { token : 'efghij', status : 'up', interval : oneMinute, lastCheckedAt : threeMinutesBefore, lastPingedAt : threeMinutesBefore },
            // up but not checked in last interval, checked++
            { token : 'fghijk', status : 'up', interval : fiveMinutes, lastCheckedAt : tenMinutesBefore, lastPingedAt : twoMinutesBefore },
            // down and not checked in last interval, checked++
            { token : 'ghijkl', status : 'down', interval : oneMinute, lastCheckedAt : twoMinutesBefore, lastPingedAt : threeMinutesBefore },
            // same, checked++
            { token : 'hijklm', status : 'down', interval : oneMinute, lastCheckedAt : tenMinutesBefore, lastPingedAt : threeMinutesBefore }
          ],
          updatedWatches = [
            _.extend({}, watches[0]),
            _.extend({}, watches[1]),
            _.extend({}, watches[2]),
            _.extend({}, watches[3], { status : 'down', lastCheckedAt : date }),
            _.extend({}, watches[4], { status : 'down', lastCheckedAt : date }),
            _.extend({}, watches[5], { lastCheckedAt : date }),
            _.extend({}, watches[6], { lastCheckedAt : date }),
            _.extend({}, watches[7], { lastCheckedAt : date })
          ];

      testOpenDb(db);
      _.each(watches, function(watch) { testAddWatch(db, watch); });
      testUpdateOutdatedWatches(db, date, { downed : 2, checked : 3 });
      _.each(updatedWatches, function(watch) { testGetWatch(db, watch.token, watch); });
      testCloseDb(db);
    });
  },

  testDbPersistence : function(dbGenerator) {

    var db;
    beforeEach(function() {
      db = dbGenerator();
    });

    it("should persist data", function() {

      var token = 'abcdef',
          watchToAdd = { token : token, foo : 'bar' };
  
      testOpenDb(db);
      testAddWatch(db, watchToAdd);
      testCloseDb(db);

      testOpenDb(db);
      testWatchExists(db, token, true);
      testGetWatch(db, token, watchToAdd);
      testCloseDb(db);
    });
  },

  testDbVolatility : function(dbGenerator) {
  
    var db;
    beforeEach(function() {
      db = dbGenerator();
    });

    it("should not persist data", function() {

      var token = 'abcdef',
          watchToAdd = { token : token, foo : 'bar' };

      testOpenDb(db);
      testAddWatch(db, watchToAdd);
      testGetWatches(db, [ watchToAdd ]);
      testCloseDb(db);

      db = dbGenerator();
      testOpenDb(db);
      testWatchExists(db, token, false);
      testGetWatch(db, token, null);
      testGetWatches(db, []);
      testCloseDb(db);
    });
  }
};
