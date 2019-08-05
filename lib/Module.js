const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
const child_process = require('child_process');
const install = require('./install');


function Module(opt) {
    this.name = opt.name;
    this.version = opt.version;
    this.resolved = opt.resolved;
    this.key = opt.key;
    this.dirname = opt.dirname;
    this.target = path.resolve(this.dirname, this.name);
}

Module.prototype.install = function () {
    const target = this.target;
    const resolved = this.resolved;
    const version = this.version;
    const pem = this.key;

    fsExtra.removeSync(target);
    return install.git.clone(resolved, target, pem).then(function () {
        return install.git.exec(['checkout', version], {
            cwd: target
        });
    });
};

Module.prototype.info = function() {
    if (this._package) {
        return this._package;
    } else {
        this._package = JSON.parse(fs.readFileSync(path.resolve(this.target, 'package.json'), 'utf8'));
        return this._package;
    }
};


exports = module.exports = Module;
