
var _ = require('underscore'),
    fs = require('fs-extra'),
    path = require('path'),
    sandbox = require('sandboxed-module'),
    temp = require('temp');

var matchers = require('./support/matchers'),
    support = require('./support/db'),
    Config = require('./support/mocks/config'),
    MemoryDb = sandbox.require('../lib/db/memory', {
      requires : {}
    }),
    YamlDb = sandbox.require('../lib/db/yaml', {
      requires : {}
    });

var tmpDir;

beforeEach(function() {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.removeSync(tmpDir);
  }
  tmpDir = temp.mkdirSync();
});

describe("Memory Database", function() {

  support.testDb(function() {
    return new MemoryDb(new Config());
  });
});

describe("YAML Database", function() {

  support.testDb(function() {
    return new YamlDb(new Config({ db : { file : path.join(tmpDir, 'db.yml') } }));
  });
});
