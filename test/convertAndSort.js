'use strict';

const chai = require('chai'),
    expect = chai.expect,
    
    ips = require(`${__dirname}/fixtures/ips`).ips,
    convertAndSort = require(`${__dirname}/../src/convertAndSort`);

describe('convertAndSort', () => {
    it('exports a function', () => {
        expect(convertAndSort).to.be.a('function');
    });
   
    it('returns an array of Numbers', done => {
        convertAndSort(ips).then(result => {
            expect(result).to.be.a('array');
            result.forEach(element => {
                expect(element).to.be.a('number');
            });
            done();
        });
    });
    
    it('converts IP addresses into long integers', done => {
        convertAndSort(ips).then(result => {
            expect(result.length).to.equal(11);
            expect(result[0]).to.equal(2130706432);
            expect(result[1]).to.equal(2130706433);
            expect(result[2]).to.equal(2130706434);
            expect(result[3]).to.equal(2130706435);
            expect(result[4]).to.equal(2130706436);
            expect(result[5]).to.equal(2130706437);
            expect(result[6]).to.equal(2130706438);
            expect(result[7]).to.equal(2130706689);
            expect(result[8]).to.equal(2130706690);
            expect(result[9]).to.equal(2130706691);
            expect(result[10]).to.equal(2130706693);
            done();
        });
    });
});