const path = require('path');
const Module = require('./Module');
const getOption = require('./getOption');


const defaultOption = {
    modules: [{
        name: '',
        url: '',
    }],
    structure: {
        moduleName: 'relativepath'
    },
};
exports = module.exports = function(argv, cli, env) {
    getOption(argv, cli, env).then(function (option) {
        return {
            src: option.src,
            modules: option.modules.map(function (mod) {
                return new Module(mod);
            }),
            option: option,
        };
    }).then(function (ctx) {
        return promiseSerial(ctx.modules.map(function (mod) {
            return function () {
                return mod.install();
            };
        }));
    }).then(function (ctx) {
        fis.log.info('success');
    }).catch(function (error) {
        fis.log.error(e);
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
                });
            } else {
                resolve(queueResult);
            }
        }
    });
}
