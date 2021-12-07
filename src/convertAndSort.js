'use strict';

const ip2long = require('locutus/php/network/ip2long');

/**
 * Converts an array of IP address strings into long integers (instanceof Number.)
 * @param ipAddresses
 */
module.exports = ipAddresses => new Promise((resolve, reject) => {
    resolve(ipAddresses.map((currentIp, index) => {
        return ip2long(currentIp);
    }).sort());
});