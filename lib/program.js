
var _ = require('underscore'),
    pkg = require('../package'),
    program = require('commander');

program
  .version(pkg.version)
  .option('-c, --config [FILE]', 'read configuration from FILE')
  .option('-p, --port [PORT]', 'use PORT (default: 3000)')
  .option('-e, --env [ENV]', 'use ENV for defaults (default: development)')
  //.option('-l, --log [LOGFILE]', 'output to LOGFILE (default: console)')
  //.option('-g, --log-level [LEVEL]', 'set log level to LEVEL (default: info)')
  //.option('-d, --daemonize', 'run daemonized in the background')
  //.option('-p, --pid [PIDFILE]', 'save process id in PIDFILE')
  .parse(process.argv);

var options = _.pick(program, 'config', 'port', 'env');

new (require('./app'))(options).start();
