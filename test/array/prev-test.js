const later = require('../..');
const should = require('should');

describe('Later.array.prev', function () {
  it('should exist', function () {
    should.exist(later.array.prev);
  });

  it('should return the prev highest value', function () {
    const array = [1, 2, 4, 5];
    const cur = 3;
    const extent = [1, 5];
    const expected = 2;
    const actual = later.array.prev(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the prev highest value with array size of 1', function () {
    const array = [1];
    const cur = 3;
    const extent = [1, 5];
    const expected = 1;
    const actual = later.array.prev(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the prev highest value with array size of 1 with zero value', function () {
    const array = [0];
    const cur = 10;
    const extent = [1, 5];
    const expected = 0;
    const actual = later.array.prev(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the prev highest value which might be the last value', function () {
    const array = [1, 2, 3, 4, 5];
    const cur = 6;
    const extent = [1, 5];
    const expected = 5;
    const actual = later.array.prev(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the prev highest value, wrapping if needed', function () {
    const array = [1, 2, 3, 4, 5];
    const cur = 0;
    const extent = [0, 5];
    const expected = 5;
    const actual = later.array.prev(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the prev highest value, which might be zero value', function () {
    const array = [2, 3, 4, 5, 0];
    const cur = 1;
    const extent = [1, 10];
    const expected = 0;
    const actual = later.array.prev(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return current value when it is in the list', function () {
    const array = [1, 2, 4, 5, 0];
    const cur = 4;
    const extent = [1, 10];
    const expected = 4;
    const actual = later.array.prev(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the prev highest value when cur is greater than last value', function () {
    const array = [1, 2, 4, 5, 0];
    const cur = 12;
    const extent = [1, 10];
    const expected = 0;
    const actual = later.array.prev(cur, array, extent);

    actual.should.eql(expected);
  });
});
