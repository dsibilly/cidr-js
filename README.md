# Strong CIDR
Forked from [Kirk Gordon's cidr-js](https://github.com/krg7880/strong-cidr) and updated to
ECMAScript 2018. Now with async!

A utility for obtaining metadata from CIDR blocks. Can provide a list of valid IP addresses (sorted in ascending order) or the range (start &amp; end) of the block.

[![NPM](https://nodei.co/npm/strong-cidr.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/strong-cidr/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Maintainability](https://api.codeclimate.com/v1/badges/9eefac0052de9568c9f4/maintainability)](https://codeclimate.com/github/dsibilly/cidr-js/maintainability)

## Documentation

### Instance Methods
* [`filter`](#filter)
* [`getCIDRBlocks`](#getCIDRBlocks)
* [`list`](#list)
* [`range`](#range)


## Instance Methods

<a name="filter"></a>

### filter(*Array* ipArray)

Filters `ipArray` into contiguous ranges (if possible).
Returns a Promise.

__Arguments__

* `ipArray` - An Array of IP address strings.

__Example__
```javascript
const CIDR = require('strong-cidr');
const cidr = new CIDR();

cidr.range([
  // contiguous block
  '127.0.0.0',
  '127.0.0.1',
  '127.0.0.2',
  '127.0.0.3',
  '127.0.0.4',
  '127.0.0.5',
  '127.0.0.6',

  // new contiguous block
  '127.0.1.1',
  '127.0.1.2',
  '127.0.1.3',

  // dangling block
  '127.0.1.5'
]).then(results => {
  /*
  results = {
    '12700': [
      '127.0.0.1',
      '127.0.0.2',
      '127.0.0.3',
      '127.0.0.4',
      '127.0.0.5',
      '127.0.0.6'
    ],
    '12701': [
      '127.0.1.1',
      '127.0.1.2',
      '127.0.1.3'
    ],
    '127015': [
      '127.0.1.5'
    ]
  }
  */
});
```

---------------------------------------

### getCIDRBlocks(*Array* ipArray)

<a name="getCIDRBlocks"></a>

Derives largest possible CIDR blocks from a list of IP addresses.
Returns a Promise.

__Arguments__

* `ipArray` - An Array of IP address strings.

__Example__
```javascript
const CIDR = require('strong-cidr');
const cidr = new CIDR();
const ipArray = [
  // contiguous block
  '127.0.0.0',
  '127.0.0.1',
  '127.0.0.2',
  '127.0.0.3',
  '127.0.0.4',
  '127.0.0.5',
  '127.0.0.6',

  // new contiguous block
  '127.0.1.1',
  '127.0.1.2',
  '127.0.1.3',

  // dangling block
  '127.0.1.5'
];

cidr.getCIDRBlocks(ipArray).then(result => {
  /*
  results = [
    '127.0.0.0/30',
    '127.0.0.4/31',
    '127.0.0.6/32',
    '127.0.1.1/32',
    '127.0.1.2/31',
    '127.0.1.5'
  ]
  */
});
```

---------------------------------------

<a name="list"></a>

### list(*String* cidr)

Expands a valid CIDR block into an Array of all valid IPs within that range.
Returns a Promise

__Arguments__

* `cidr` - A String containing a valid CIDR block, e.g. '192.168.200.44/30'

__Example__
```javascript
const CIDR = require('strong-cidr');
const cidr = new CIDR();
const cidrBlock = '192.168.200.44/30';

cidr.list(cidrBlock).then(results => {
  // results = [ '192.168.200.44', '192.168.200.45', '192.168.200.46', '192.168.200.47' ]
});
```

---------------------------------------

<a name="range"></a>

### range(*String* cidr)

Derives the start and end of a provided CIDR block.
Returns a Promise.

__Arguments__

* `cidr` - A String containing a valid CIDR block, e.g. '10.250.254.32/31'

__Example__
```javascript
const CIDR = require('strong-cidr');
const cidr = new CIDR();
const cidrBlock = '10.250.254.32/31';

cidr.range(cidrBlock).then(results => {
  // results = { start: '10.250.254.32', end: '10.250.254.33' }
});
```
