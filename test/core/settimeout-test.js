const later = require('../..');
const should = require('should');
const sinon = require('sinon');

const noop = () => {
  /* noop */
};

describe('Set timeout', function () {
  it('should execute a callback after the specified amount of time', function (done) {
    this.timeout(3000);

    const s = later.parse.recur().every(2).second();

    function test() {
      later.schedule(s).isValid(new Date()).should.eql(true);
      done();
    }

    later.setTimeout(test, s);
  });

  it('should allow clearing of the timeout', function (done) {
    this.timeout(3000);

    const s = later.parse.recur().every(1).second();

    function test() {
      should.not.exist(true);
    }

    const t = later.setTimeout(test, s);
    t.clear();

    setTimeout(done, 2000);
  });

  it('should not execute a far out schedule immediately', function (done) {
    this.timeout(3000);

    const s = later.parse.recur().on(2017).year();

    function test() {
      should.not.exist(true);
    }

    const t = later.setTimeout(test, s);

    setTimeout(function () {
      t.clear();
      done();
    }, 2000);
  });

  it('should execute a callback for a one-time occurrence after the specified amount of time', function (done) {
    this.timeout(3000);

    const offsetInMilliseconds = 2000;
    const now = new Date();
    const nowOffset = now.getTime() + offsetInMilliseconds;
    const s = later.parse.recur().on(new Date(nowOffset)).fullDate();

    function test() {
      done();
    }

    later.setTimeout(test, s);
  });

  describe('timezone support', () => {
    it('should accept IANA timezone strings', (done) => {
      should.doesNotThrow(() => {
        const s = later.parse
          .recur()
          .on(new Date(Date.now() + 1e3))
          .fullDate();
        later.setTimeout(noop, s, 'America/New_York');
      });
      done();
    });

    it('should accept "local" as a valid timezone string', (done) => {
      should.doesNotThrow(() => {
        const s = later.parse
          .recur()
          .on(new Date(Date.now() + 1e3))
          .fullDate();
        later.setTimeout(noop, s, 'local');
      });
      done();
    });

    it('should accept "system" as a valid timezone string', (done) => {
      should.doesNotThrow(() => {
        const s = later.parse
          .recur()
          .on(new Date(Date.now() + 1e3))
          .fullDate();
        later.setTimeout(noop, s, 'system');
      });
      done();
    });

    it('should throw a RangeError when given an invalid or unsupported timezone string', (done) => {
      should.throws(() => {
        const s = later.parse
          .recur()
          .on(new Date(Date.now() + 1e3))
          .fullDate();
        later.setTimeout(noop, s, 'bogus_zone');
      }, 'RangeError');
      done();
    });

    it('should adjust scheduled time if the local timezone is ahead of the one specified', (done) => {
      const datetimeNow = new Date('2021-08-22T10:30:00.000-04:00'); // zone = America/New_York
      const timezone = 'America/Mexico_City'; // time now = 2021-08-22T09:30:00.000-05:00
      const msHalfHour = 18e5;

      // Run half hour later.
      // Intended datetime: 2021-08-22T10:00:00.000-05:00
      // But instead, we don't specify timezone here
      const intendedDatetime = '2021-08-22T10:00:00.000';
      // And so, `new Date()` will use it's local timezone:
      // Assumed datetime: 2021-08-22T10:00:00.000-04:00
      const assumedTimezone = '-04:00';
      const s = later.parse
        .recur()
        .on(new Date(intendedDatetime + assumedTimezone))
        .fullDate();

      const clock = sinon.useFakeTimers({
        now: datetimeNow.getTime()
      });
      clock.Date.prototype.getTimezoneOffset = () => 240;

      clock.setTimeout = (fn, ms) => {
        should.equal(ms, msHalfHour);
      };

      later.setTimeout(noop, s, timezone);

      clock.uninstall();
      done();
    });

    it('should adjust scheduled time if the local timezone is behind of the one specified', (done) => {
      const datetimeNow = new Date('2021-08-22T10:30:00.000-04:00'); // zone = America/New_York
      const timezone = 'Europe/Athens'; // time now = 2021-08-22T17:30:00.000+03:00
      const msHalfHour = 18e5;

      // Run half hour later.
      // Intended datetime: 2021-08-22T18:00:00.000+03:00
      // But instead, we don't specify timezone here
      const intendedDatetime = '2021-08-22T18:00:00.000';
      // And so, `new Date()` will use it's local timezone:
      // Assumed datetime: 2021-08-22T18:00:00.000-04:00
      const assumedTimezone = '-04:00';
      const s = later.parse
        .recur()
        .on(new Date(intendedDatetime + assumedTimezone))
        .fullDate();

      const clock = sinon.useFakeTimers({
        now: datetimeNow.getTime()
      });
      clock.Date.prototype.getTimezoneOffset = () => 240;

      clock.setTimeout = (fn, ms) => {
        should.equal(ms, msHalfHour);
      };

      later.setTimeout(noop, s, timezone);

      clock.uninstall();
      done();
    });

    it('should not adjust time if specified and local timezones are the same', (done) => {
      const datetimeNow = new Date('2021-08-22T10:30:00.000-04:00'); // zone = America/New_York
      const timezone = 'America/New_York';
      const msOneHour = 36e5;

      // Intended run time is one hour later: 2021-08-22 at 11:30, New York time
      const intendedRunTime = '2021-08-22T11:30:00.000-04:00';

      const s = later.parse.recur().on(new Date(intendedRunTime)).fullDate();

      const clock = sinon.useFakeTimers({
        now: datetimeNow.getTime()
      });
      clock.Date.prototype.getTimezoneOffset = () => 240;

      clock.setTimeout = (fn, ms) => {
        should.equal(ms, msOneHour);
      };

      later.setTimeout(noop, s, timezone);

      clock.uninstall();
      done();
    });
  });
});
