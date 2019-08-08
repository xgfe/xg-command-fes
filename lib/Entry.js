const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
const child_process = require('child_process');
const install = require('./install');


function Entry(opt, cwd) {
    this.name = opt.name;
    this.version = opt.version;
    this.target = cwd;
}

Entry.prototype.initialize = function () {
    return install.git.exec(['checkout', this.version]).then(() => {
        return install.git.exec(['checkout', this.version]).then(() => {
            return install.git.exec(['rev-parse', 'HEAD'], {
                cwd: this.target
            }).then(sha => {
                sha = sha.trim();
                this.sha = sha;
                return sha;
            });
        });
    });
};

Entry.prototype.info = function() {
    if (this._package) {
        return this._package;
    } else {
        this._package = JSON.parse(fs.readFileSync(path.resolve(this.target, 'package.json'), 'utf8'));
        return this._package;
    }
};

exports = module.exports = Entry;
