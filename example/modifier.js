/**
 * Modifier
 * (c) 2013 Bill, BunKat LLC.
 *
 * Example of creating a custom modifier. See
 * http://bunkat.github.io/later/modifiers.html#custom for more details.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

const later = require('..');

// create the new modifier
later.modifier.month = later.modifier.m = function (period, values) {
  if (period.name !== 'month') {
    throw new Error('Month modifier only works with months!');
  }

  return {
    name: 'reIndexed ' + period.name,
    range: period.range,
    val(d) {
      return period.val(d) - 1;
    },
    isValid(d, value) {
      return period.isValid(d, value + 1);
    },
    extent(d) {
      return [0, 11];
    },
    start: period.start,
    end: period.end,
    next(d, value) {
      return period.next(d, value + 1);
    },
    prev(d, value) {
      return period.prev(d, value + 1);
    }
  };
};

// use our new modifier in a schedule
const sched = later.parse.recur().customModifier('m', 2).month();
const next = later.schedule(sched).next(1, new Date(2013, 3, 21));

console.log(next.toUTCString());
// Sat, 01 Mar 2014 00:00:00 GMT
