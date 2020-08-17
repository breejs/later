const should = require('should');

function runner(later, constraint) {
  function convertToUTC(d) {
    return new Date(
      Date.UTC(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
        d.getSeconds()
      )
    );
  }

  function runSingleTest(fn, data, utc) {
    const date = utc ? convertToUTC(data.date) : data.date;
    const dateString = utc ? date.toUTCString() : date;
    let ex =
      utc && data[fn] instanceof Date ? convertToUTC(data[fn]) : data[fn];
    const exString = utc && ex instanceof Date ? ex.toUTCString() : ex;

    it('should return ' + exString + ' for ' + dateString, function () {
      if (utc) later.date.UTC();
      else later.date.localTime();
      let actual = constraint[fn](date);
      actual = actual instanceof Date ? actual.getTime() : actual;
      ex = ex instanceof Date ? ex.getTime() : ex;
      actual.should.eql(ex);
    });
  }

  function runSweepTest(fn, data, utc) {
    const min = data.extent[0] === 1 ? 0 : data.extent[0];
    const max = data.extent[1] + 1;
    const inc = Math.ceil((max - min) / 200); // max 200 tests per constraint

    for (let i = min; i <= max; i += inc) {
      // test for overbounds
      if (fn === 'next') {
        testNext(data, i, utc); // test all values for amt
      } else {
        testPrevious(data, i, utc); // test all values for amt
      }
    }
  }

  function testNext(data, amt, utc) {
    const date = utc ? convertToUTC(data.date) : data.date;
    const dateString = utc ? date.toUTCString() : date;

    it(
      'should return first date after ' + dateString + ' with val ' + amt,
      function () {
        if (utc) later.date.UTC();
        else later.date.localTime();

        const next = constraint.next(date, amt);
        let ex = amt;
        const outOfBounds =
          ex > constraint.extent(date)[1] || ex > constraint.extent(next)[1];

        // if amt is outside of extent, the constraint should rollover to the
        // first value of the following time period
        if (outOfBounds) ex = constraint.extent(next)[0];

        // hack to pass hour test that crosses DST
        if (
          ex === 2 &&
          constraint.val(next) === 3 &&
          next.getTimezoneOffset() !== date.getTimezoneOffset()
        ) {
          ex = 3;
        }

        // result should match ex, should be greater than date, and should
        // be at the start of the time period
        // if check is hack to support year constraints which can return undefined
        if (
          constraint.name === 'year' &&
          (amt <= constraint.val(date) || amt > later.Y.extent()[1])
        ) {
          next.should.eql(later.NEVER);
        } else {
          constraint.isValid(next, ex).should.eql(true);
          next.getTime().should.be.above(date.getTime());

          // need to special case day of week count since the last nth day may
          // not fall on a week boundary
          if (constraint.name !== 'day of week count' || amt !== 0) {
            constraint.start(next).getTime().should.eql(next.getTime());
          }
        }
      }
    );
  }

  function testPrevious(data, amt, utc) {
    const date = utc ? convertToUTC(data.date) : data.date;
    const dateString = utc ? date.toUTCString() : date;

    it(
      'should return first date before ' + dateString + ' with val ' + amt,
      function () {
        if (utc) later.date.UTC();
        else later.date.localTime();

        const previous = constraint.prev(date, amt);
        let ex = amt;
        const outOfBounds = ex > constraint.extent(previous)[1];

        // if amt is outside of extent, the constraint should rollover to the
        // first value of the following time period
        if (outOfBounds) ex = constraint.extent(previous)[1];

        // result should match ex, should be greater than date, and should
        // be at the start of the time period
        // if check is hack to support year constraints which can return undefined
        if (
          constraint.name === 'year' &&
          (amt >= constraint.val(date) || amt < later.Y.extent()[0])
        ) {
          previous.should.eql(later.NEVER);
        } else {
          constraint.isValid(previous, ex).should.eql(true);
          previous.getTime().should.be.below(date.getTime());
          constraint.end(previous).getTime().should.eql(previous.getTime());
        }
      }
    );
  }

  return {
    run(data, isYear) {
      let i = 0;
      const { length } = data;

      // test both UTC and local times for all functions
      [true, false].forEach(function (utc) {
        // simple tests have the expected value passed in as data
        ['val', 'extent', 'start', 'end'].forEach(function (fn) {
          describe(fn, function () {
            for (i = 0; i < length; i++) {
              runSingleTest(fn, data[i], utc);
            }
          });
        });

        // complex tests do a sweep across all values and validate results
        // using checks verified by the simple tests
        ['next', 'prev'].forEach(function (fn) {
          describe(fn, function () {
            for (i = 0; i < length; i++) {
              runSweepTest(fn, data[i], utc);
            }
          });
        });
      });
    }
  };
}

module.exports = runner;
