
var _ = require('underscore'),
    fs = require('fs-extra'),
    path = require('path'),
    temp = require('temp');

var matchers = require('./support/matchers'),
    support = require('./support/db'),
    Config = require('./support/mocks/config'),
    MemoryDb = require('../../lib/db/memory'),
    YamlDb = require('../../lib/db/yaml');

var tmpDir;

beforeEach(function() {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.removeSync(tmpDir);
  }
  tmpDir = temp.mkdirSync();
});

describe("Memory Database", function() {

  var generator = function() {
    return new MemoryDb(new Config());
  };

  support.testDb(generator);
  support.testDbVolatility(generator);
});

describe("YAML Database", function() {

  var generator = function() {
    return new YamlDb(new Config({ db : { file : path.join(tmpDir, 'db.yml') } }));
  };

  support.testDb(generator);
  support.testDbPersistence(generator);
});
