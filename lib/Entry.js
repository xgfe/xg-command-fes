const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
const child_process = require('child_process');
const install = require('./install');


function Entry(opt, cwd) {
    this.name = opt.name;
    this.version = opt.version;
    this.dirname = cwd;
}

Entry.prototype.initialize = function () {
    return install.git.exec(['checkout', this.version]).then(() => {
        return install.git.exec(['checkout', this.version]).then(() => {
            return install.git.exec(['rev-parse', 'HEAD'], {
                cwd: this.dirname
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
        this._package = JSON.parse(fs.readFileSync(path.resolve(this.dirname, 'package.json'), 'utf8'));
        return this._package;
    }
};

exports = module.exports = Entry;
