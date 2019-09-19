const fes = require('../lib/fes');


exports = module.exports = function(argv, cli, env) {
    const fesArgv = {
        configEnv: argv.configEnv,
        configFile: argv.configFile,
        configRemote: argv.configRemote,
    };
    fes(fesArgv).then(function (ctx) {
        fis.log.info('fes success');
    }).catch(function (error) {
        try {
            fis.log.on.error(error.message);
            fis.log.debug(error.stack);
        } catch (e) {
        } finally {
            process.exit(1);
        }
    });
};
