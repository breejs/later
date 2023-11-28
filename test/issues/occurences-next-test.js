const later = require('../..');
const { schedule } = later;
const should = require('should');

/*
describe('Schedule', function () {
  later.date.UTC();

  describe('next', function () {
    const d = new Date('2021-01-01T00:00:00Z');
    const e = new Date('2016-01-01T00:00:00Z');

    it('should return next three (3) valid dates from a composite schedule', function () {
      const s = {
        schedules: [
          { s: [0], m: [30], h: [18], D: [1], M: [2] },
          { s: [0], m: [30], h: [17], D: [2], M: [2], Y: [2023] }
        ],
        exceptions: []
      };
      schedule(s)
        .next(3)
        .should.eql([
          new Date('2023-02-01T18:30:00Z'),
          new Date('2023-02-02T17:30:00Z'),
          new Date('2024-02-01T18:30:00Z')
        ]);
    });

    it('should return next three (3) valid dates from a composite schedule', function () {
      const s = {
        schedules: [
          { s: [0], m: [30], h: [17], D: [2], M: [2], Y: [2021] },
          { s: [0], m: [30], h: [18], D: [1], M: [1] }
        ],
        exceptions: []
      };
      schedule(s)
        .next(3)
        .should.eql([
          new Date('2023-02-01T18:30:00Z'),
          new Date('2023-02-02T17:30:00Z'),
          new Date('2024-02-01T18:30:00Z')
        ]);
    });
  });
});
*/
