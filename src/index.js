'use strict';

const ip2long = require('locutus/php/network/ip2long'),
    long2ip = require('locutus/php/network/long2ip'),
    Calculator = require('ip-subnet-calculator'),
    
    /**
     * Finds the appropriate block or
     * bucket for the given IP to be
     * inserted in. Another way
     * @param collection
     * @param key
     * @param ipAddress
     */
    block = (collection, key, ipAddress) => {
        if (!collection) {
            collection = {};
        }
        
        if (!collection[key]) {
            collection[key] = [];
        }
        
        collection[key].push(ipAddress);
    },
    /**
     * Converts an array of IP address
     * strings into long integers (instanceof Number.)
     * @param ipAddresses
     */
    convertAndSort = ipAddresses => {
        return ipAddresses.map((currentIp, index) => {
            if (currentIp) {
                return ip2long(currentIp);
            }
        }).sort();
    }

class CIDR {
    /**
     * Returns the IP range (start & end)
     * for a given IP/CIDR
     * @param cidr
     * @returns {Object}
     */
    range (cidr) {
        if (!(cidr.indexOf('/') > -1)) {
            return null;
        }
        
        const range = {},
            parts = cidr.split('/');
            
        if (parts[1] > 32) {
            return null;
        }
        
        range.start = long2ip((ip2long(parts[0])) & ((-1 << (32 - +parts[1]))));
        range.end = long2ip((ip2long(range.start)) + Math.pow(2, (32 - +parts[1])) - 1);
        
        return range;
    }
    
    /**
     * Returns a list of
     * ip values within the range of a
     * given cidr block.
     *
     * @param cidr
     * @return {Array}
     */
    list (cidr) {
        if (typeof cidr === 'undefined') {
            return null;
        }
        
        const range = this.range(cidr);
        
        if (!range) {
            return null;
        }
        
        const list = [];
        
        let startLong = ip2long(range.start),
            endLong = ip2long(range.end);
        
        list.push(range.start);
        
        while (startLong++ < endLong) {
            list.push(long2ip(startLong));
        }
        
        return list;
    }
    
    /**
     * Filter the array by grouping
     * IPs where all 32 bits are contiguous
     * 127.0.0.0, 127.0.0.1, 127.0.0.2, etc
     * @returns {Object}
     */
    filter (ipArray) {
        if (!(ipArray instanceof Array) || ipArray.length <= 0) {
            return null;
        }
        
        ipArray = convertAndSort(ipArray);
        
        let cont = true,
            key = 0;
        
        if (ipArray.length === 1) {
            return block({}, 0, long2ip(ipArray[0]));
        }
        
        return ipArray.reduce((results, currentIp, index) => {
            const nextIp = ipArray[index + 1],
                previousIp = currentIp;
            
            if (!cont) {
                key += 1;
            }
            
            if (nextIp) {
                if ((nextIp - currentIp) === 1) {
                    block(results, key, long2ip(currentIp));
                    cont = true;
                } else {
                    block(results, key, long2ip(currentIp));
                    cont = false;
                }
            } else {
                if (previousIp) {
                    if ((currentIp - previousIp) === 1) {
                        block(results, key, long2ip(currentIp));
                        cont = true;
                    } else {
                        block(results, ++key, long2ip(currentIp));
                    }
                }
            }
            
            return results;
        }, {});
    }
    
    /**
     * Returns arrays grouped
     * contiguously.
     *
     * @returns {Array}
     */
    getBlocks(ipArray) {
        const blocks = this.filter(ipArray),
            results = [];
        
        for (let i in blocks) {
            const block = blocks[i];
            
            if (block.length === 1) {
                results.push(block[0]);
                continue;
            }
            
            const start = block.shift(),
                end = block.pop(),
                ranges = Calculator.calculate(start, end);
            
            for (let j in ranges) {
                results.push(ranges[j].ipLowStr + '/' + ranges[j].prefixSize);
            }
        }
        
        return results;
    }
};

module.exports = CIDR;
