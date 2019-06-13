const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readConfig = require('./util/readConfig');


function request(url) {
    return axios.get(url).then(function (response) {
        if (response.status !== 200) {
            throw new Error('[failed] response status' + response.status);
        }
        return response.data;
    });
}

// XG_FES="config" xg fes --config-env="XG_FES"
function getEnvConfig(argv) {
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
        resolve(config.remote ? request(config.remote) : config);
    });
}

// xg fes --config-file="filepath"
function getFileConfig(argv) {
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
function getRemoteConfig(argv) {
    return new Promise(function (resolve, reject) {
        const ENV_NAME = typeof argv.configRemote === 'string' ? argv.configRemote : 'XG_FES_REMOTE';
        const remoteConfig = (process.env[ENV_NAME] || '').trim();
        if (!remoteConfig) {
            return resolve(null);
        }
        resolve(request(remoteConfig))
    });
}

// XG_FES_PEM="url" xg fes --pem="XG_FES_PEM"
// XG_FES_PEM_REMOTE="url" xg fes --pem-remote="XG_FES_PEM_REMOTE"
function getPEM(argv, option) {
    return new Promise(function (resolve, reject) {
        const PEM_NAME = typeof argv.pem === 'string' ? argv.pem : 'XG_FES_PEM';
        const PEM_REMOTE_NAME = typeof argv.pemRemote === 'string' ? argv.pemRemote : 'XG_FES_PEM_REMOTE';
        const pem = process.env[PEM_NAME] || option.pem;
        const pemRemote = process.env[PEM_REMOTE_NAME] || option.pemRemote;
        if (pem) {
            resolve(pem);
        } else if (pemRemote) {
            resolve(request(pemRemote))
        } else {
            resolve();
        }
    });
}

exports = module.exports = function(argv) {
    return getEnvConfig(argv).then(function(option) {
        return option || getFileConfig(argv).then(function(option) {
            return option || getRemoteConfig(argv);
        });
    }).then(function(option) {
        if (!option) {
            throw new Error('option not exist');
        }
        return getPEM(argv, option).then(function (pem) {
            const cwd = process.cwd();
            const packageFes = readConfig(path.resolve(cwd, 'package-fes.json')) || {};
            option.cwd = cwd;
            option.pem = pem;
            option.modulesDirname = path.resolve(cwd, packageFes.modulesDirname || 'modules');
            return option;
        });
    });
};
