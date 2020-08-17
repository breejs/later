const later = require('../..');
const should = require('should');

describe('Later.array.nextInvalid', function () {
  it('should exist', function () {
    should.exist(later.array.nextInvalid);
  });

  it('should return the next invalid value', function () {
    const array = [1, 2, 5];
    const extent = [1, 5];
    const cur = 2;
    const expected = 3;
    const actual = later.array.nextInvalid(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the next invalid value when greater than arr', function () {
    const array = [1, 2, 5];
    const extent = [1, 10];
    const cur = 5;
    const expected = 6;
    const actual = later.array.nextInvalid(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the next invalid value when zero value is largest', function () {
    const array = [1, 2, 5, 0];
    const extent = [1, 31];
    const cur = 31;
    const expected = 3;
    const actual = later.array.nextInvalid(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the next invalid value when zero value is smallest', function () {
    const array = [0, 1, 2, 5, 10];
    const extent = [0, 10];
    const cur = 10;
    const expected = 3;
    const actual = later.array.nextInvalid(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the current value if it is invalid', function () {
    const array = [0, 1, 2, 5, 10];
    const extent = [0, 10];
    const cur = 4;
    const expected = 4;
    const actual = later.array.nextInvalid(cur, array, extent);

    actual.should.eql(expected);
  });
});
