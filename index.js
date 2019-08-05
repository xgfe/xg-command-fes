const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const version = require('./package.json').version;

const run = require('./cli/fis');


exports.name = 'fes';
exports.desc = 'xg fes pulgin';
exports.options = {
  '-v, --version': 'version',
  '-h, --help': 'print this help message'
};

exports.run = function(argv, cli, env) {
  // 显示帮助信息
  if (argv.h || argv.help) {
    return cli.help(exports.name, exports.options);
  }

  if (argv.v || argv.version) {
    console.log(`xg-command-fes version ${version}`);
    return;
  }

  fis.log.info(`xg-command-fes@v${version}`);

  const command = argv['_'][1];
  if (command) {
    // init, env, test
    return typeof run[command] === 'function'
      ? run[command](argv, cli, env)
      : fis.log.error('invalid command');
  }

  return run(argv, cli, env);
};
