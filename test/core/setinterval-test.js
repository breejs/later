const later = require('../..');
const should = require('should');
const sinon = require('sinon');

describe('Set interval', function () {
  it('should execute a callback after the specified amount of time', function (done) {
    this.timeout(0);

    const s = later.parse.recur().every(1).second();
    const t = later.setInterval(test, s);
    let count = 0;

    function test() {
      later.schedule(s).isValid(new Date()).should.eql(true);
      count++;
      if (count > 2) {
        t.clear();
        done();
      }
    }
  });

  it('should allow clearing of the timeout', function (done) {
    this.timeout(0);

    const s = later.parse.recur().every(2).second();

    function test() {
      should.not.exist(true);
    }

    const t = later.setInterval(test, s);
    t.clear();

    setTimeout(done, 3000);
  });

  it('should call .setTimeout() with a timezone param', (done) => {
    sinon.spy(later, 'setTimeout');

    const s = later.parse
      .recur()
      .on(new Date(Date.now() + 1e3))
      .fullDate();
    later.setInterval(
      () => {
        /* noop */
      },
      s,
      'America/New_York'
    );
    should.equal(later.setTimeout.calledOnce, true);
    should.equal(later.setTimeout.getCall(0).args[2], 'America/New_York');
    done();
  });
});
