const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const fsExtra = require('fs-extra');
const readConfig = require('./util/readConfig');
const Entry = require('./Entry');
const Module = require('./Module');
const generateOption = require('./generateOption');


exports = module.exports = function(argv) {
    return generateOption(argv).then(function (option) {
        const module_entry = option.package.module_entry;
        const module_dependencies = option.package.module_dependencies;
        option.module_entry = Object.assign({
            name: module_entry
        }, module_dependencies[module_entry]);
        option.module_dependencies = Object.keys(option.package.module_dependencies).filter(function (module_name) {
            return module_name !== module_entry;
        }).map(module_name => Object.assign({
            name: module_name
        }, module_dependencies[module_name]));
        return option;
    }).then(function (ctx) {
        ctx.module_entry = new Entry(ctx.module_entry, ctx.cwd);
        console.log('[KIWI] cwd:         ', ctx.cwd);
        console.log('[KIWI] config:      ', ctx.type, ctx.raw);
        console.log('[KIWI] entry:       ', ctx.package.module_entry);
        console.log('[KIWI] dependencies:', Object.keys(ctx.package.module_dependencies).join(','));
        console.log('[KIWI] Checkout Entry:', ctx.module_entry.name + '@' + ctx.module_entry.version);
        return ctx.module_entry.initialize().then(function (sha) {
            console.log(`               commit: ${sha}`);

            const packageFes = readConfig(path.resolve(ctx.cwd, 'package-fes.json')) || {};
            ctx.modulesDirname = path.resolve(ctx.cwd, packageFes.modulesDirname || 'modules');
            ctx.dependenceFilepath = path.resolve(ctx.cwd, packageFes.dependenceFilepath || 'dependence.js');
            try {
                ctx.dependenceTemplate = fs.readFileSync(path.resolve(ctx.cwd, packageFes.dependenceTemplate || '.xg.fes.tpl'), 'utf8');
            } catch (error) {
                throw new Error('dependence template not exist');
            }
        }).then(function () {
            fsExtra.removeSync(ctx.modulesDirname);
            console.log(`         deps dirname: (force delete) ${ctx.modulesDirname}`);

            ctx.module_dependencies = ctx.module_dependencies.map(function (data) {
                return new Module({
                    name: data.name,
                    version: data.version,
                    resolved: data.resolved,
                    key: data.key,
                    dirname: ctx.modulesDirname
                });
            });
            return promiseSerial(ctx.module_dependencies.map(function (mod) {
                return function () {
                    console.log(`[KIWI] Install Module: ${mod.name}@${mod.version}`);
                    console.log(`               target: ${mod.target}`);
                    console.log(`             resolved: ${mod.resolved}`);
                    return mod.install().then((sha => {
                        console.log(`               commit: ${sha}`);
                    }));
                };
            }));
        }).then(function () {
            console.log('[KIWI] dynamic-dependence');
            console.log('====================================');
            console.log('file path:', ctx.dependenceFilepath);

            const entryInfo = ctx.module_entry.info();
            const dependenceData = {
                cwd: ctx.cwd,
                entry: {
                    name: ctx.module_entry.name,
                    package: {
                        name: entryInfo.name,
                        version: entryInfo.version,
                        main: entryInfo.main,
                    },
                },
                dependencies: ctx.module_dependencies.map(i => {
                    const pkgInfo = i.info();
                    return {
                        name: i.name,
                        package: {
                            name: pkgInfo.name,
                            version: pkgInfo.version,
                            main: pkgInfo.main,
                        },
                    };
                })
            };

            console.log('------------ file data -------------\n', JSON.stringify(dependenceData));
            console.log('------------ file template ---------\n', JSON.stringify(ctx.dependenceTemplate));
            const dependenceFile = ejs.render(ctx.dependenceTemplate, dependenceData, {});
            console.log('------------ file content  ---------\n', JSON.stringify(dependenceFile));
            console.log('====================================');

            fsExtra.removeSync(ctx.dependenceFilepath);
            fs.writeFileSync(ctx.dependenceFilepath, dependenceFile, 'utf8');

            console.log('[KIWI] success');
        });
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
