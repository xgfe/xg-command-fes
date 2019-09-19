#!/usr/bin/env node


(function() {
    const fes = require('../lib/fes');
    const version = require('../package.json').version;

    console.log('xg-fes version', version);

    const argv = {};
    process.argv.forEach(function (arg) {
        if (/^--/.test(arg)) {
            let key = arg;
            let value = ''
            const i = arg.indexOf('=');
            if (i > -1) {
                key = arg.slice(0, i);
                value = arg.slice(i + 1);
            }
            key = key.replace(/^--/, '').replace(/-(.)?/g, function(match, $1) {
                return $1 ? $1.toUpperCase() : '';
            });
            argv[key] = value;
        }
    });

    const fesArgv = {
        configEnv: argv.configEnv,
        configFile: argv.configFile,
        configRemote: argv.configRemote,
    };

    fes(fesArgv).then(function (ctx) {
    }).catch(function (error) {
        console.error(error);
        process.exit(1);
    });
}());
