const path = require('path');
const Module = require('./Module');
const generateOption = require('./generateOption');


exports = module.exports = function(argv) {
    return generateOption(argv).then(function (option) {
        return {
            modules: Object.keys(option.modules || []).map(function (moduleName) {
                return new Module({
                    name: moduleName,
                    config: option.modules[moduleName],
                    dirname: option.modulesDirname,
                    pem: option.pem,
                });
            }),
            option: option,
        };
    }).then(function (ctx) {
        return promiseSerial(ctx.modules.map(function (mod) {
            return function () {
                return mod.install();
            };
        }));
    });
};


function promiseSerial(q) {
    return new Promise(function(resolve, reject) {
        const queueResult = [];
        const queue = [].concat(q || []);
        serial();
        function serial(priorResult) {
            const promise = queue.shift();
            if (typeof promise === 'function') {
                promise(priorResult).then(function(result) {
                    queueResult.push(result);
                    serial(result);
                }, function (error) {
                    reject(error);
                });
            } else {
                resolve(queueResult);
            }
        }
    });
};
