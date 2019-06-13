const readConfig = require('../lib/util/readConfig');
const stringify2ENV = require('../lib/util/stringify2ENV');


exports = module.exports = function(argv, cli, env) {
    const configPath = argv['_'][2];
    if (!configPath) {
        return fis.log.error('configPath not exist');
    }

    const config = readConfig(configPath);

    if (!config) {
        return fis.log.error('config not exist');
    }

    fis.log.info(stringify2ENV(config));
};
