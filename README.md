# cidr-js
Forked from [krg7880/cidr-js](https://github.com/krg7880/cidr-js) and updated to
ECMAScript 2018. Now with async!

[![Maintainability](https://api.codeclimate.com/v1/badges/9eefac0052de9568c9f4/maintainability)](https://codeclimate.com/github/dsibilly/cidr-js/maintainability)

A utility for obtaining metadata from CIDR blocks. Can provide a list of valid IP addresses (sorted in ascending order) or the range (start &amp; end) of the block.

## Install
```bash
npm install cidr-js
```

## Example Usage
**range()**: Get the range (start &amp; end) of a CIDR block

```javascript
const CIDR = require('cidr-js');
const cidr = new CIDR();

const block = '127.0.0.0/31';
cidr.range(block).then(results => {
  // results = ['127.0.0.0', '127.0.0.1']
  console.log(results);
});
```

**list()**: Get a list of IP addresses in a given CIDR block
```javascript
const CIDR = require('cidr-js');
const cidr = new CIDR();

const block = '127.0.0.0/30';

cidr.list(block).then(results => {
  // results = [ '127.0.0.0', '127.0.0.1', '127.0.0.2', '127.0.0.3' ]
  console.log(results);
});
```

**filter()**: Filter a list of IP addresses into contiguous blocks
```javascript
const ips = [
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

const CIDR = require('cidr-js');
const cidr = new CIDR();

cidr.filter(ips).then(results => {
  console.log(results);
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

**getBlocks()**: Derive CIDR blocks from a list of IPs
```javascript
const ips = [
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
const CIDR = require('cidr-js');
const cidr = new CIDR();

cidr.getBlocks(ips).then(results => {
  console.log(results);
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

## Testing
```bash
npm test
```
