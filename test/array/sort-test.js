const later = require('../..');
const should = require('should');

describe('Later.array.sort', function () {
  it('should exist', function () {
    should.exist(later.array.sort);
  });

  it('should not modify arrays that are already sorted', function () {
    const array = [1, 2, 3, 4, 5];
    const expected = [1, 2, 3, 4, 5];

    later.array.sort(array);
    array.should.eql(expected);
  });

  it('should sort in natural order', function () {
    const array = [6, 9, 2, 4, 3];
    const expected = [2, 3, 4, 6, 9];

    later.array.sort(array);
    array.should.eql(expected);
  });

  it('should put zero at the front by default', function () {
    const array = [6, 9, 2, 0, 4, 3];
    const expected = [0, 2, 3, 4, 6, 9];

    later.array.sort(array);
    array.should.eql(expected);
  });

  it('should put zero at the end if zeroIsLast is true', function () {
    const array = [6, 9, 2, 0, 4, 3];
    const expected = [2, 3, 4, 6, 9, 0];

    later.array.sort(array, true);
    array.should.eql(expected);
  });
});
