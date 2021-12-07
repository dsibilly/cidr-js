'use strict';

const ip2long = require('locutus/php/network/ip2long'),
    long2ip = require('locutus/php/network/long2ip'),
    Calculator = require('ip-subnet-calculator'),
    block = require('./block'),
    convertAndSort = require('./convertAndSort');

class CIDR {
    /**
     * Returns the IP range (start & end)
     * for a given IP/CIDR
     * @param cidr
     * @returns {Object}
     */
    async range (cidr) {
        if (!(cidr.indexOf('/') > -1)) {
            throw new Error(`range(): Malformed CIDR string ${cidr} is missing a subnet mask`);
        }
        
        const range = {},
            parts = cidr.split('/');
            
        if (parts[1] > 32) {
            throw new Error(`range(): Malformed CIDR string ${cidr} has an invalid subnet mask`);
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
     * @return Promise({Array})
     */
    async list (cidr) {
        if (typeof cidr === 'undefined') {
            throw new Error('list(): Malformed CIDR string is undefined');
        }
        
        const range = await this.range(cidr);
        
        // Any input that would cause range() to return a falsy value would
        // also cause range() to reject with an Error...
        // if (!range) {
        //     throw new Error(`list(): CIDR ${cidr} has an invalid range`);
        // }
        
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
     * @returns Promise({Object})
     */
    async filter (ipArray) {
        if (!(ipArray instanceof Array) || ipArray.length <= 0) {
            throw new Error('filter(): An Array of positive, non-zero length is required');
        }
        
        ipArray = await convertAndSort(ipArray);
        
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
     * Returns arrays grouped contiguously.
     *
     * @returns Promise({Array})
     */
    async getCIDRBlocks(ipArray) {
        const blocks = await this.filter(ipArray),
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
