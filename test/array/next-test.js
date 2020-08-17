const later = require('../..');
const should = require('should');

describe('Later.array.next', function () {
  it('should exist', function () {
    should.exist(later.array.next);
  });

  it('should return the next highest value', function () {
    const array = [1, 2, 4, 5];
    const cur = 3;
    const extent = [1, 5];
    const expected = 4;
    const actual = later.array.next(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the next highest value with array size of 1', function () {
    const array = [1];
    const cur = 3;
    const extent = [1, 5];
    const expected = 1;
    const actual = later.array.next(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the next highest value with array size of 1 with same value', function () {
    const array = [1];
    const cur = 1;
    const extent = [1, 5];
    const expected = 1;
    const actual = later.array.next(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the next highest value with array size of 1 with zero value', function () {
    const array = [0];
    const cur = 30;
    const extent = [1, 31];
    const expected = 0;
    const actual = later.array.next(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the next highest value which might be the first value', function () {
    const array = [1, 2, 3, 4, 5];
    const cur = 0;
    const extent = [1, 5];
    const expected = 1;
    const actual = later.array.next(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the next highest value, wrapping if needed', function () {
    const array = [0, 1, 2, 3, 4, 5];
    const cur = 6;
    const extent = [0, 5];
    const expected = 0;
    const actual = later.array.next(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the next highest value, which might be zero', function () {
    const array = [1, 2, 3, 4, 5, 0];
    const cur = 6;
    const extent = [1, 10];
    const expected = 0;
    const actual = later.array.next(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return current value when it is in the list', function () {
    const array = [1, 2, 4, 5, 0];
    const cur = 4;
    const extent = [1, 10];
    const expected = 4;
    const actual = later.array.next(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the next highest value when cur is greater than last value', function () {
    const array = [1, 2, 4, 5, 0];
    const cur = 12;
    const extent = [1, 10];
    const expected = 1;
    const actual = later.array.next(cur, array, extent);

    actual.should.eql(expected);
  });
});
