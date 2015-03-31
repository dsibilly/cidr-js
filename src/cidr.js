var php = require('phpjs');
var math = Math;

var Calculator = require( 'ip-subnet-calculator' );

var Subnet = function(ips) {
    this.blocks = {};
    this.ranges = [];
    this.ips = ips;
};

/**
 * Parses the given IP to get the
 * last 8 bytes for testing if
 * the IPs are contigous
 * @param ip
 * @returns {Object}
 */
var parse = function(ip) {
    var tmp = ip.split('.')

    return {
        ip: ip,
        decimal: Calculator.toDecimal(ip),
        key: tmp.splice(0, 3).join('')
    };
};

/**
 * Finds the appropriate block or
 * bucket for the given IP to be
 * inserted in. Another way
 * @param key
 * @param ip
 */
var block = function(key, ip) {
    if (!this.blocks) {
        this.blocks = {};
    }

    if (!this.blocks[key]) {
        this.blocks[key] = [];
    }

    this.blocks[key].push(ip);
};

/**
 * Convert the IP to a
 * string of numbers.
 *
 * @param ip
 * @returns {string}
 */
var hash = function(ip) {
    return ip.split('.').join('');
};

/**
 * Filter the array by grouping
 * IPs where all 32 bits are contiguous
 * 127.0.0.0, 127.0.0.1, 127.0.0.2, etc
 * @returns {Subnet}
 */
Subnet.prototype.filter = function(ips, bits) {
    this.ips = ips || this.ips;

    if (!(this.ips instanceof Array) || this.ips.length <= 0) {
        return this;
    }

    var ips = this.ips;

    if (ips.length === 1) {
        block.call(this, hash(ips[0]), ips[0]);
        return this;
    }

    var previous = parse(ips.shift());

    console.log(previous);

    block.call(this, previous.key, previous.ip);

    var len = ips.length;

    for (var i=0; i<len; i++) {
        var current = parse(ips[i]);
        if ((current.decimal - previous.decimal) === 1) {
            block.call(this, current.key, ips[i]);
        } else if (ips[(i+1)]) {
            var next = parse(ips[(i+1)]);
            if ((next.decimal - current.decimal) === 1) {
                block.call(this, current.key, ips[i]);
            } else {
                block.call(this, hash(current.ip), current.ip);
            }
        } else {
            block.call(this, hash(current.ip), current.ip);
        }

        previous = current;
    }

    return this;
};

/**
 * Returns arrays grouped
 * contiguously.
 *
 * @returns {Array}
 */
Subnet.prototype.getBlocks = function() {
    if (this.ranges.length > 0) {
        return this.blocks;
    }

    for (var i in this.blocks) {
        var block = this.blocks[i];
        if (block.length === 1) {
            this.ranges.push(block[0]);
            continue;
        }
        var start = block.shift();
        var end = block.pop();
        var ranges = Calculator.calculate(start, end);

        for (var j in ranges) {
            this.ranges.push([
                ranges[j].ipLowStr, '/', ranges[j].prefixSize
            ].join(''));
        }
    }

    return this.ranges;
};

var subnet = new Subnet();
exports.Subnet = Subnet;
exports.filter = subnet.filter.bind(subnet);
exports.getBlocks = subnet.getBlocks.bind(subnet);


/**
 * Returns the range or the start and end
 * IPs for a given cidr block.
 *
 * @param cidr
 * @returns {Objects}
 */
exports.range = function(cidr) {
    if (!(cidr.indexOf('/') > -1)) {
        return null;
    }

    var range = {};
    var parts = cidr.split('/');

    if ((parts[1] > 32)) {
        return null;
    }

    range.start = php.long2ip((php.ip2long(parts[0])) & ((-1 << (32 - +parts[1]))));
    range.end = php.long2ip((php.ip2long(parts[0])) + math.pow(2, (32 - +parts[1])) - 1);

    return range;
};

/**
 * Returns a contiguous list of ips
 * within a given cidr block.
 * @param cidr
 * @returns {Array}
 */
exports.list = function(cidr) {
    if (typeof (cidr) === 'undefined') {
        return null;
    }

    var range = exports.range(cidr);

    if (!range) {
        return null;
    }

    var ip2long = php.ip2long;
    var long2ip = php.long2ip;
    var list = [];
    var index = 0;
    var startLong = ip2long(range.start);
    var endLong = ip2long(range.end);

    list[index++] = range.start;

    while((startLong++ < endLong)) {
        list[index++] = long2ip(startLong);
    }

    return list;
};
