const fes = require('../lib/fes');


exports = module.exports = function(argv, cli, env) {
    const fesArgv = {
        configEnv: argv.configEnv,
        configFile: argv.configFile,
        configRemote: argv.configRemote,
    };
    fes(fesArgv).then(function (ctx) {
        fis.log.info('success');
    }).catch(function (error) {
        fis.log.error(error);
    });
};

exports.env = require('./env');
