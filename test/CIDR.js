'use strict';

const chai = require('chai'),
    expect = chai.expect,
    ips = require(__dirname + '/fixtures/ips').ips,
    CIDR = require(__dirname + '/../src/CIDR');
    
describe('CIDR', () => {
    const cidr = new CIDR();
    
    describe('filter()', () => {
        it('is a function', () => {
            expect(cidr.filter).to.be.a('function');
        });
        
        it('should filter IP addresses into contiguous blocks', done => {
           cidr.filter(ips.slice()).then(results => {
               const keys = Object.keys(results);
               
               expect(keys.length).to.equal(3);
               
               return done();
           }); 
        });
        
        it('resolves with a single block when given a single IP', done => {
            cidr.filter(['127.0.0.1']).then(results => {
                const keys = Object.keys(results);
                
                expect(keys.length).to.equal(1);

                return done();
            });
        });
        
        it('should reject with an Error when given a non-Array as input', done => {
            cidr.filter('str').catch(error => {
                expect(error).to.be.an('error');
                expect(error.message).to.equal('filter(): An Array of positive, non-zero length is required');
                
                return done();
            });
        });
        
        it('should reject with an Error when given a zero-length Array as input', done => {
            cidr.filter([]).catch(error => {
                expect(error).to.be.an('error');
                expect(error.message).to.equal('filter(): An Array of positive, non-zero length is required');
                
                return done();
            });
        });
    });
    
    describe('getCIDRBlocks()', () => {
        it('is a function', () => {
           expect(cidr.getCIDRBlocks).to.be.a('function');
        });
        
        it('should return arrays grouped contiguously', done => {            
            cidr.getCIDRBlocks(ips.slice()).then(results => {
                expect(results.length).to.equal(6);
                expect((results.indexOf('127.0.0.0/30') > -1)).to.equal(true);
                expect((results.indexOf('127.0.0.4/31') > -1)).to.equal(true);
                expect((results.indexOf('127.0.0.6/32') > -1)).to.equal(true);
        
                expect((results.indexOf('127.0.1.1/32') > -1)).to.equal(true);
                expect((results.indexOf('127.0.1.2/31') > -1)).to.equal(true);
        
                // verify our dangler is included as a single IP
                expect((results.indexOf('127.0.1.5') > -1)).to.equal(true);
                
                return done();
            });
        });
    });

    describe('list()', () => {
        it('is a function', () => {
            expect(cidr.list).to.be.a('function');
        });
        
        it('should correctly resolve a list for a /24 CIDR block', done => {
            const block = '127.0.0.0/24';
            
            cidr.list(block).then(results => {
                expect(results.length).to.equal(256);
                expect(results[0]).to.equal('127.0.0.0');
                expect(results[255]).to.equal('127.0.0.255');
                expect(results[256]).to.be.undefined;
                
                return done();
            });
        });
        
        it('should resolve a list for a /16 CIDR block', done => {
            const block = '192.168.0.0/16';
            
            cidr.list(block).then(results => {
                expect(results.length).to.equal(65536);
                expect(results[0]).to.equal('192.168.0.0');
                expect(results[65535]).to.equal('192.168.255.255');
                expect(results[65536]).to.be.undefined;
                
                return done(); 
            });
        });
        
        it('should resolve a list for a /8 CIDR block', function (done) {
            const block = '10.0.0.0/8';
            
            this.timeout(20000);
            cidr.list(block).then(results => {
               expect(results.length).to.equal(16777216);
               expect(results[0]).to.equal('10.0.0.0');
               expect(results[16777215]).to.equal('10.255.255.255');
               expect(results[16777216]).to.be.undefined;
               
               return done(); 
            });
        });
        
        it('should reject with an Error when given undefined input', done => {
            cidr.list().catch(error => {
                expect(error).to.be.an('error');
                expect(error.message).to.equal('list(): Malformed CIDR string is undefined');
                
                return done();
            });
        });
    });
    
    describe('range()', () => {
        it('is a function', () => {
            expect(cidr.range).to.be.a('function');
        });
        
        it('should resolve the same start and end range for a /32', done => {
            const block = '127.0.0.0/32';
            
            cidr.range(block).then(results => {
                expect(results.start).to.equal(results.end);
                
                return done();
            });
        });
        
        it('should resolve two distinct IPs for a /31', done => {
            const block = '127.0.0.0/31';
            
            cidr.range(block).then(results => {
                expect(results.start).to.not.equal(results.end);
                expect(results.start).to.equal('127.0.0.0');
                expect(results.end).to.equal('127.0.0.1');
                
                return done(); 
            });
        });
        
        it('should return null for invalid CIDR blocks (e.g. /33)', done => {
            const block = '127.0.0.0/33';
            
            cidr.range(block).catch(error => {
                expect(error).to.be.an('error');
                expect(error.message).to.equal(`range(): Malformed CIDR string ${block} has an invalid subnet mask`)
                
                return done(); 
            });
        });
        
        it('reject with an Error when given a malformed CIDR string', done => {
           const block = '127.0.0.0';
           
           cidr.range(block).catch(error => {
               expect(error).to.be.an('error');
               expect(error.message).to.equal(`range(): Malformed CIDR string ${block} is missing a subnet mask`);
               
               return done();
           });
        });
    });
});