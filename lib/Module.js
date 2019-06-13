const path = require('path');
const fsExtra = require('fs-extra');
const child_process = require('child_process');


function Module(opt) {
    this.name = opt.name;
    this.config = opt.config;
    this.dirname = opt.dirname;
}

Module.prototype.install = function () {
    const dirname = path.resolve(this.dirname, this.name);
    const resolved = this.config.resolved;
    const version = this.config.version;
    return new Promise(function(resolve, reject) {
        fsExtra.removeSync(dirname);
        child_process.execSync(
            `git clone -l -b ${version} ${resolved} ${dirname}`
        );
        resolve();
    });
};

exports = module.exports = Module;
