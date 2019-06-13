function Module(config) {
    this.config = config;
    this.dirname = '';
}

Module.prototype.install = function () {
    console.log(this.config);
};

exports = module.exports = Module;
