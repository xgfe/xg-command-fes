const fs = require('fs');
const path = require('path');


exports = module.exports = function(file, ...args) {
    return new Promise((resolve, reject) => {
        if (file) {
            fs.access(file, error => {
                if (error) {
                    reject(error);
                } else {
                    try {
                        resolve(require(file)(...args))
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        } else {
            resolve();
        }
    });
};
