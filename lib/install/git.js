const which = require('which');
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const fsExtra = require('fs-extra');

let GITPATH
try {
  GITPATH = which.sync('git')
} catch (e) {}


exports.clone = function (repo, target, pem) {
    const opts = {
        env: {
            GIT_ASKPASS: 'echo',
        },
    };
    if (pem) {
        // TODO 并行
        const pemFile = path.resolve(__dirname, 'key.pem');
        fsExtra.removeSync(pemFile);
        fsExtra.outputFileSync(pemFile, pem, {
            mode: 0o600
        });
        opts.env.GIT_SSH = path.resolve(__dirname, 'key.sh');
    }
    return execGit([
        'clone', repo, target,
    ], opts);
};

exports.exec = execGit;
function execGit (gitArgs, gitOpts) {
  return checkGit().then(gitPath => {
    return new Promise(function (resolve, reject) {
        cp.execFile(gitPath, gitArgs, gitOpts, function (error, stdout, stderr) {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
  })
}

function checkGit () {
    return new Promise((resolve, reject) => {
        if (!GITPATH) {
            const err = new Error('No git binary found in $PATH')
            err.code = 'ENOGIT'
            reject(err);
        } else {
            resolve(GITPATH);
        }
    });
}
