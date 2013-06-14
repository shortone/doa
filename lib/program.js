
var _ = require('underscore'),
    daemon = require('daemon'),
    pkg = require('../package'),
    program = require('commander');

program
  .version(pkg.version)
  .option('-c, --config [FILE]', 'read configuration from FILE')
  .option('-p, --port [PORT]', 'listen on PORT (default: 3000)')
  .option('-e, --env [ENV]', 'use ENV environment (default: development)')
  .option('-l, --log [LOGFILE]', 'output to LOGFILE (default: console)')
  .option('-g, --log-level [LEVEL]', 'set log level to LEVEL (default: info)')
  .option('-d, --daemonize', 'run daemonized in the background')
  .option('--pid [PIDFILE]', 'save process id in PIDFILE')
  .parse(process.argv);

var options = _.pick(program, 'config', 'port', 'daemonize', 'env');
options.pidFile = program.pid;
options.logFile = program.log;
options.logLevel = program['log-level'];

if (options.daemonize) {
  daemon();
}

new (require('./app'))(options).start();
