const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const fsExtra = require('fs-extra');
const readConfig = require('./util/readConfig');
const hooks = require('./hooks');
const Entry = require('./Entry');
const Module = require('./Module');
const generateOption = require('./generateOption');


const padStart = (str, len) => ' '.repeat(Math.max(len - str.length, 0)) + str;
const padEnd = (str, len) => str + ' '.repeat(Math.max(len - str.length, 0));

function log(sign, type, ...args) {
    console.log(`${sign} ${padEnd(type, 16)} ${args.length > 0 && args[0] ? ':' : ''}`, ...args)
}
const logInfo = (type, ...args) => log('[Loon]', type, ...args);
const logSubInfo = (type, ...args) => log(' '.repeat(6), type, ...args);
const logError = (type, error) => log('[Loon:ERROR]', type, typeof error === 'string' ? error : (
    error ? error.message : ''
));


exports = module.exports = function(argv) {
    return generateOption(argv).then(option => {
        return option;
    }).then(option => { // 初始化ctx数据结构
        const ctx = option;
        const module_entry = ctx.package.module_entry;
        const module_dependencies = ctx.package.module_dependencies;
        const module_info = (module_name, module_info) => Object.assign({ name: module_name }, module_info);
        // 模块安装目录
        ctx.module_dirname = path.resolve(ctx.cwd, 'loon_modules');
        // 模块入口
        ctx.module_entry = module_info(module_entry, module_dependencies[module_entry]);
        // 模块依赖
        ctx.module_dependencies = Object.keys(module_dependencies)
            .filter(module_name => module_name !== module_entry)
            .map(module_name => module_info(module_name, module_dependencies[module_name]));
        return ctx;
    }).then(ctx => { // 初始化Entry
        ctx.module_entry = new Entry(ctx.module_entry, ctx.cwd);
        logInfo('cwd', ctx.cwd);
        logInfo('config', ctx.type, ctx.raw);
        logInfo('entry', ctx.package.module_entry);
        logInfo('dependencies', Object.keys(ctx.package.module_dependencies).join(','));
        logInfo('Initialize Entry', ctx.module_entry.name + '@' + ctx.module_entry.version);
        return ctx.module_entry.initialize().then(sha => {
            logSubInfo('commit', sha);
            return ctx;
        });
    }).then(ctx => { // 初始化hooks
        const entry_module = ctx.module_entry;
        const entry_package = entry_module.info();
        const entry_scripts = ((entry_package.config || {})['loon'] || {}).scripts || {};
        const preinstall = entry_scripts.preinstall ? path.resolve(entry_module.dirname, entry_scripts.preinstall) : '';
        const postinstall = entry_scripts.postinstall ? path.resolve(entry_module.dirname, entry_scripts.postinstall) : '';
        ctx.hooks = {
            preinstall: preinstall,
            postinstall: postinstall,
        };
        return ctx;
    }).then(ctx => { // hooks preinstall
        return hooks(ctx.hooks.preinstall, ctx, {
            fs: fsExtra
        }).then(() => {
            logInfo('Hooks preinstall', ctx.hooks.preinstall);
            return ctx;
        }, error => {
            logError('Hooks preinstall', error);
            throw error;
        });
    }).then(ctx => { // 安装依赖
        // 清理安装目录
        fsExtra.removeSync(ctx.module_dirname);
        logInfo('cleandir', ctx.module_dirname);

        // 下载文件
        ctx.module_dependencies = ctx.module_dependencies.map(data => new Module({
            name: data.name,
            version: data.version,
            resolved: data.resolved,
            key: data.key,
            dirname: ctx.module_dirname
        }));
        const installers = ctx.module_dependencies.map(mod => () => {
            logInfo('Install Module', `${mod.name}@${mod.version}`);
            logSubInfo('dirname', mod.dirname);
            logSubInfo('resolved', mod.resolved);
            return mod.install().then(sha => {
                logSubInfo('commit', sha);
                const module_name = mod.name;
                const package_name = mod.info().name;
                if (module_name !== package_name) {
                    throw new Error(`The name of loon(${
                        module_name
                    }) and package.json(${
                        package_name
                    }) must be the same`);
                }
            });
        });
        return promiseSerial(installers).then(() => ctx);
    }).then(ctx => { // 初始化package_information数据结构
        ctx.package_information = {
            cwd: ctx.cwd,
            name: ctx.module_entry.name,
            version: ctx.module_entry.version,
            dirname: ctx.module_entry.dirname,
            module_dirname: ctx.module_dirname,
            entry: {
                name: ctx.module_entry.name,
                version: ctx.module_entry.version,
                dirname: ctx.module_entry.dirname,
                package: ctx.module_entry.info(),
            },
            dependencies: ctx.module_dependencies.map(mod => ({
                name: mod.name,
                version: mod.version,
                resolved: mod.resolved,
                dirname: mod.dirname,
                package: mod.info(),
            }))
        };
        return ctx;
    }).then(ctx => { // hooks postinstall
        return hooks(ctx.hooks.postinstall, ctx.package_information, {
            fs: fsExtra
        }).then(() => {
            logInfo('Hooks postinstall', ctx.hooks.postinstall);
            return ctx;
        }, error => {
            logError('Hooks postinstall', error);
            throw error;
        });
    }).then(ctx => {
        logInfo('Information')
        console.log(JSON.stringify(ctx.package_information));
        logInfo('Install success')
        return ctx;
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
                }, function(error) {
                    reject(error);
                });
            } else {
                resolve(queueResult);
            }
        }
    });
};
