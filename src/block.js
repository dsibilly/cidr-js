'use strict';

/**
 * @param objectOfArrays
 * @param key
 * @param ipAddress
 */
module.exports = (objectOfArrays, key, ipAddress) => new Promise ((resolve, reject) => {
    if (!objectOfArrays) {
        return reject(Error('objectOfArrays must contain an object of arrays'));
    }
    
    if (!objectOfArrays[key]) {
        // If the key doesn't exist, create it with an empty array...
        objectOfArrays[key] = [];
    }
    
    objectOfArrays[key].push(ipAddress);
    
    resolve(objectOfArrays);
});