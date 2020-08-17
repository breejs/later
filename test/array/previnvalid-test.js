const later = require('../..');
const should = require('should');

describe('Later.array.prevInvalid', function () {
  it('should exist', function () {
    should.exist(later.array.prevInvalid);
  });

  it('should return the previous invalid value', function () {
    const array = [1, 2, 5];
    const extent = [1, 5];
    const cur = 5;
    const expected = 4;
    const actual = later.array.prevInvalid(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the previous invalid value when less than arr', function () {
    const array = [2, 3, 5];
    const extent = [1, 10];
    const cur = 3;
    const expected = 1;
    const actual = later.array.prevInvalid(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the previous invalid value when zero value is largest', function () {
    const array = [1, 2, 5, 0];
    const extent = [1, 31];
    const cur = 31;
    const expected = 30;
    const actual = later.array.prevInvalid(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the previous invalid value when zero value is smallest', function () {
    const array = [0, 1, 2, 5, 10];
    const extent = [0, 10];
    const cur = 2;
    const expected = 9;
    const actual = later.array.prevInvalid(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return the current value if it is invalid', function () {
    const array = [0, 1, 2, 5, 10];
    const extent = [0, 10];
    const cur = 4;
    const expected = 4;
    const actual = later.array.prevInvalid(cur, array, extent);

    actual.should.eql(expected);
  });

  it('should return undefined if there is no invalid value', function () {
    const array = [0, 1, 2, 3, 4, 5];
    const extent = [0, 5];
    const cur = 4;

    should.not.exist(later.array.prevInvalid(cur, array, extent));
  });
});
