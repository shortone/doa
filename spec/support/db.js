
var _ = require('underscore');

var openDb = function(db) {

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

var closeDb = function(db) {

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

var addWatch = function(db, watchToAdd) {

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

module.exports = {

  testDb : function(dbGenerator) {

    var db;

    beforeEach(function() {
      db = dbGenerator();
    });

    it("should get watches", function() {

      openDb(db);

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
        expect(gottenWatches).toEqual([]);
      });

      var watchesToAdd = [
        { token : 'abcdef', a : 'b' },
        { token : 'bcdefg', b : 'c' },
        { token : 'cdefgh', c : 'd' }
      ];

      _.each(watchesToAdd, function(watchToAdd) {
        addWatch(db, watchToAdd);
      });

      runs(function() {
        getErr = null;
        gottenWatches = null;
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
        expect(gottenWatches).toEqual(watchesToAdd);
      });

      closeDb(db);
    });

    it("should add, get, update and delete a watch", function() {
      
      var token = 'abcdef',
          watchToAdd = { token : token, foo : 'bar' };

      openDb(db);

      addWatch(db, watchToAdd);

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
        expect(gottenWatch).toEqual(watchToAdd);
      });

      var watchUpdate = { token : token, foo : 'oof', bar : 'rab' },
          updateErr = null,
          updatedWatch = null;

      runs(function() {
        db.updateWatch(watchUpdate, function(err, watch) {
          updateErr = err;
          updatedWatch = watch;
        });
      });

      waitsFor(function() {
        return updateErr !== null || updatedWatch !== null;
      }, "The database should update the watch", 250);

      runs(function() {
        expect(updateErr).toBe(undefined);
        expect(updatedWatch).toEqual(watchUpdate);
      });

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


      runs(function() {
        getErr = null;
        gottenWatch = null;
        db.getWatch(token, function(err, watch) {
          getErr = err;
          gottenWatch = watch;
        });
      });

      waitsFor(function() {
        return getErr !== null;
      }, "The database should get the watch", 250);

      runs(function() {
        expect(getErr).toBe(undefined);
        expect(gottenWatch).toBe(null);
      });

      closeDb(db);
    });
  }
};
