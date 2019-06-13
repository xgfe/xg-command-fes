const getOption = require('../lib/getOption');

// process.env = {
//     // XG_FES: '{"remote":"https://s3plus.meituan.net/v1/mss_877fd457c4cf425388a58130e2279ae8/file/6680fd2b942782dbef8bc67306481f3a.config"}',
//     // XG_FES: '{"name": "驼峰业务管理后台", "type": "env"}',
//     XG_FES_REMOTE: 'https://s3plus.meituan.net/v1/mss_877fd457c4cf425388a58130e2279ae8/file/6680fd2b942782dbef8bc67306481f3a.config',
// };
getOption({
    configEnv: 'XG_FES',
    configFile: '.xg.fes.config',
    configRemote: 'XG_FES_REMOTE',
}, {}, process.env).then(option => {
    console.log('OK', option);
}).catch(error => {
    console.log('error', error.message);
});
