const Benchmark = require('benchmark');
const later = require('../..');
const suite = new Benchmark.Suite('next');

const schedSimple = later.parse.cron('* */5 * * * *');
const compiledSimple = later.schedule(schedSimple);

const schedComplex = later.parse.cron('0 5 15W * ?');
const compiledComplex = later.schedule(schedComplex);

suite
  .add('simple next', function () {
    compiledSimple.next();
  })
  .add('complex next', function () {
    compiledComplex.next();
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .run({ async: false });
