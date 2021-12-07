'use strict';

const chai = require('chai'),
    expect = chai.expect,
    
    block = require(__dirname + '/../src/block');
    
describe('block', () => {
    it('exports a function', () => {
        expect(block).to.be.a('function');
    });
    
    it('correctly inserts values into the indicated array', done => {
        const collection = {
            a: [1, 2, 3],
            b: [4, 5],
            c: []
        };
        
        block(collection, 'a', 6)
            .then(result => block(result, 'b', 7))
            .then(result => block(result, 'c', 8))
            .then(result => {
               expect(result['a'].indexOf(6)).to.equal(3);
               expect(result['b'].indexOf(7)).to.equal(2);
               expect(result['c'].indexOf(8)).to.equal(0);
               done(); 
            });
    });
    
    it('sends an error to callback when given an empty or falsey collection', () => {
        block(null, 'a', 6).catch(error => {
            expect(error).to.be.an('error'); 
        });
    });
});