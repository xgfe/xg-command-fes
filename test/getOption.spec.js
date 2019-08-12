const getOption = require('../lib/getOption');


getOption({
    configEnv: 'XG_FES',
    configFile: '.xg.fes.config',
    configRemote: 'XG_FES_REMOTE',
}, {}, process.env).then(option => {
    console.log('OK', option);
}).catch(error => {
    console.log('error', error.message);
});
