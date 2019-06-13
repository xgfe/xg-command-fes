const fs = require('fs');
const path = require('path');
const axios = require('axios');


function fetchOption(url) {
    return axios.get(url).then(function (response) {
        if (response.status !== 200) {
            throw new Error('[failed] config-remote response status' + response.status);
        }
        return response.data;
    });
}

// XG_FES="config" xg fes --config-env="XG_FES"
function getEnvConfig(argv, cli, env) {
    return new Promise(function (resolve, reject) {
        const ENV_NAME = typeof argv.configEnv === 'string' ? argv.configEnv : 'XG_FES';
        const envConfig = (process.env[ENV_NAME] || '').trim();
        if (!envConfig) {
            return resolve(null);
        }
        const config = JSON.parse(envConfig);
        if (!config) {
            throw new Error('config-env error');
        }
        // { remote: 'url' }
        resolve(config.remote ? fetchOption(config.remote) : config);
    });
}

// xg fes --config-file="filepath"
function getFileConfig(argv, cli, env) {
    return new Promise(function (resolve, reject) {
        const CONFIG_PATH = typeof argv.configFile === 'string' ? argv.configFile : '.xg.fes.config';
        const fileConfig = path.resolve(process.cwd(), CONFIG_PATH);
        if (!fs.existsSync(fileConfig)) {
            return resolve(null);
        }
        resolve(JSON.parse(fs.readFileSync(fileConfig)))
    });
}

// XG_FES_REMOTE="url" xg fes --config-remote="XG_FES_REMOTE"
function getRemoteConfig(argv, cli, env) {
    return new Promise(function (resolve, reject) {
        const ENV_NAME = typeof argv.configRemote === 'string' ? argv.configRemote : 'XG_FES_REMOTE';
        const remoteConfig = (process.env[ENV_NAME] || '').trim();
        if (!remoteConfig) {
            return resolve(null);
        }
        resolve(fetchOption(remoteConfig))
    });
}

exports = module.exports = function(argv, cli, env) {
    return getEnvConfig(argv, cli, env).then(function(option) {
        return option || getFileConfig(argv, cli, env).then(function(option) {
            return option || getRemoteConfig(argv, cli, env);
        });
    }).then(function(option) {
        if (!option) {
            throw new Error('option not exist');
        }
        option.src = process.cwd();
        return option;
    });
};
