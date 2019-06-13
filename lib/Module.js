const path = require('path');
const fsExtra = require('fs-extra');
const child_process = require('child_process');
const install = require('./install');


function Module(opt) {
    this.name = opt.name;
    this.config = opt.config;
    this.dirname = opt.dirname;
    this.pem = opt.pem;
}

Module.prototype.install = function () {
    const target = path.resolve(this.dirname, this.name);
    const resolved = this.config.resolved;
    const version = this.config.version;
    const pem = this.pem;

    console.log('Install module', this.name + '@' + version, 'from', resolved);
    fsExtra.removeSync(target);
    return install.git.clone(resolved, target, pem).then(function () {
        return install.git.exec(['checkout', version], {
            cwd: target
        });
    });
};

exports = module.exports = Module;
