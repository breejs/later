const later = {};

later.array = {};

/**
 * Sort
 * (c) 2013 Bill, BunKat LLC.
 *
 * Sorts an array in natural ascending order, placing zero at the end
 * if zeroIsLast is true.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.array.sort = function (array, zeroIsLast) {
  array.sort(function (a, b) {
    return Number(a) - Number(b);
  });

  if (zeroIsLast && array[0] === 0) {
    array.push(array.shift());
  }
};

/**
 * Next
 * (c) 2013 Bill, BunKat LLC.
 *
 * Returns the next valid value in a range of values, wrapping as needed. Assumes
 * the array has already been sorted.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.array.next = function (value, values, extent) {
  let cur;
  const zeroIsLargest = extent[0] !== 0;
  let nextIdx = 0;

  for (let i = values.length - 1; i > -1; --i) {
    cur = values[i];

    if (cur === value) {
      return cur;
    }

    if (cur > value || (cur === 0 && zeroIsLargest && extent[1] > value)) {
      nextIdx = i;
      continue;
    }

    break;
  }

  return values[nextIdx];
};

/**
 * Next Invalid
 * (c) 2013 Bill, BunKat LLC.
 *
 * Returns the next invalid value in a range of values, wrapping as needed. Assumes
 * the array has already been sorted.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.array.nextInvalid = function (value, values, extent) {
  const min = extent[0];
  const max = extent[1];
  const { length } = values;
  const zeroValue = values[length - 1] === 0 && min !== 0 ? max : 0;
  let next = value;
  let i = values.indexOf(value);
  const start = next;

  while (next === (values[i] || zeroValue)) {
    next++;
    if (next > max) {
      next = min;
    }

    i++;
    if (i === length) {
      i = 0;
    }

    if (next === start) {
      return undefined;
    }
  }

  return next;
};

/**
 * Previous
 * (c) 2013 Bill, BunKat LLC.
 *
 * Returns the previous valid value in a range of values, wrapping as needed. Assumes
 * the array has already been sorted.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.array.prev = function (value, values, extent) {
  let cur;
  const { length } = values;
  const zeroIsLargest = extent[0] !== 0;
  let previousIdx = length - 1;

  for (let i = 0; i < length; i++) {
    cur = values[i];

    if (cur === value) {
      return cur;
    }

    if (cur < value || (cur === 0 && zeroIsLargest && extent[1] < value)) {
      previousIdx = i;
      continue;
    }

    break;
  }

  return values[previousIdx];
};

/**
 * Previous Invalid
 * (c) 2013 Bill, BunKat LLC.
 *
 * Returns the previous invalid value in a range of values, wrapping as needed. Assumes
 * the array has already been sorted.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.array.prevInvalid = function (value, values, extent) {
  const min = extent[0];
  const max = extent[1];
  const { length } = values;
  const zeroValue = values[length - 1] === 0 && min !== 0 ? max : 0;
  let next = value;
  let i = values.indexOf(value);
  const start = next;

  while (next === (values[i] || zeroValue)) {
    next--;

    if (next < min) {
      next = max;
    }

    i--;
    if (i === -1) {
      i = length - 1;
    }

    if (next === start) {
      return undefined;
    }
  }

  return next;
};

/**
 * Day Constraint (D)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a day of month (date) constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.day = later.D = {
  /**
   * The name of this constraint.
   */
  name: 'day',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 86400,

  /**
   * The day value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val(d) {
    return d.D || (d.D = later.date.getDate.call(d));
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid(d, value) {
    return later.D.val(d) === (value || later.D.extent(d)[1]);
  },

  /**
   * The minimum and maximum valid day values of the month specified.
   * Zero to specify the last day of the month.
   *
   * @param {Date} d: The date indicating the month to find the extent of
   */
  extent(d) {
    if (d.DExtent) return d.DExtent;

    const month = later.M.val(d);
    let max = later.DAYS_IN_MONTH[month - 1];

    if (month === 2 && later.dy.extent(d)[1] === 366) {
      max += 1;
    }

    return (d.DExtent = [1, max]);
  },

  /**
   * The start of the day of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start(d) {
    return (
      d.DStart ||
      (d.DStart = later.date.next(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d)
      ))
    );
  },

  /**
   * The end of the day of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end(d) {
    return (
      d.DEnd ||
      (d.DEnd = later.date.prev(later.Y.val(d), later.M.val(d), later.D.val(d)))
    );
  },

  /**
   * Returns the start of the next instance of the day value indicated. Returns
   * the first day of the next month if val is greater than the number of
   * days in the following month.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next(d, value) {
    value = value > later.D.extent(d)[1] ? 1 : value;
    const month = later.date.nextRollover(d, value, later.D, later.M);
    const DMax = later.D.extent(month)[1];

    value = value > DMax ? 1 : value || DMax;

    return later.date.next(later.Y.val(month), later.M.val(month), value);
  },

  /**
   * Returns the end of the previous instance of the day value indicated. Returns
   * the last day in the previous month if val is greater than the number of days
   * in the previous month.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev(d, value) {
    const month = later.date.prevRollover(d, value, later.D, later.M);
    const DMax = later.D.extent(month)[1];

    return later.date.prev(
      later.Y.val(month),
      later.M.val(month),
      value > DMax ? DMax : value || DMax
    );
  }
};

/**
 * Day of Week Count Constraint (dc)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a day of week count constraint type. This constraint is used
 * to specify schedules like '2nd Tuesday of every month'.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.dayOfWeekCount = later.dc = {
  /**
   * The name of this constraint.
   */
  name: 'day of week count',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 604800,

  /**
   * The day of week count value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val(d) {
    return d.dc || (d.dc = Math.floor((later.D.val(d) - 1) / 7) + 1);
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid(d, value) {
    return (
      later.dc.val(d) === value ||
      (value === 0 && later.D.val(d) > later.D.extent(d)[1] - 7)
    );
  },

  /**
   * The minimum and maximum valid day values of the month specified.
   * Zero to specify the last day of week count of the month.
   *
   * @param {Date} d: The date indicating the month to find the extent of
   */
  extent(d) {
    return (
      d.dcExtent || (d.dcExtent = [1, Math.ceil(later.D.extent(d)[1] / 7)])
    );
  },

  /**
   * The first day of the month with the same day of week count as the date
   * specified.
   *
   * @param {Date} d: The specified date
   */
  start(d) {
    return (
      d.dcStart ||
      (d.dcStart = later.date.next(
        later.Y.val(d),
        later.M.val(d),
        Math.max(1, (later.dc.val(d) - 1) * 7 + 1 || 1)
      ))
    );
  },

  /**
   * The last day of the month with the same day of week count as the date
   * specified.
   *
   * @param {Date} d: The specified date
   */
  end(d) {
    return (
      d.dcEnd ||
      (d.dcEnd = later.date.prev(
        later.Y.val(d),
        later.M.val(d),
        Math.min(later.dc.val(d) * 7, later.D.extent(d)[1])
      ))
    );
  },

  /**
   * Returns the next earliest date with the day of week count specified.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next(d, value) {
    value = value > later.dc.extent(d)[1] ? 1 : value;
    let month = later.date.nextRollover(d, value, later.dc, later.M);
    const dcMax = later.dc.extent(month)[1];

    value = value > dcMax ? 1 : value;

    const next = later.date.next(
      later.Y.val(month),
      later.M.val(month),
      value === 0 ? later.D.extent(month)[1] - 6 : 1 + 7 * (value - 1)
    );

    if (next.getTime() <= d.getTime()) {
      month = later.M.next(d, later.M.val(d) + 1);

      return later.date.next(
        later.Y.val(month),
        later.M.val(month),
        value === 0 ? later.D.extent(month)[1] - 6 : 1 + 7 * (value - 1)
      );
    }

    return next;
  },

  /**
   * Returns the closest previous date with the day of week count specified.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev(d, value) {
    const month = later.date.prevRollover(d, value, later.dc, later.M);
    const dcMax = later.dc.extent(month)[1];

    value = value > dcMax ? dcMax : value || dcMax;

    return later.dc.end(
      later.date.prev(
        later.Y.val(month),
        later.M.val(month),
        1 + 7 * (value - 1)
      )
    );
  }
};

/**
 * Day of Week Constraint (dw)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a day of week constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.dayOfWeek = later.dw = later.d = {
  /**
   * The name of this constraint.
   */
  name: 'day of week',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 86400,

  /**
   * The day of week value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val(d) {
    return d.dw || (d.dw = later.date.getDay.call(d) + 1);
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid(d, value) {
    return later.dw.val(d) === (value || 7);
  },

  /**
   * The minimum and maximum valid day of week values. Unlike the standard
   * Date object, Later day of week goes from 1 to 7.
   */
  extent() {
    return [1, 7];
  },

  /**
   * The start of the day of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start(d) {
    return later.D.start(d);
  },

  /**
   * The end of the day of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end(d) {
    return later.D.end(d);
  },

  /**
   * Returns the start of the next instance of the day of week value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next(d, value) {
    value = value > 7 ? 1 : value || 7;

    return later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) +
        (value - later.dw.val(d)) +
        (value <= later.dw.val(d) ? 7 : 0)
    );
  },

  /**
   * Returns the end of the previous instance of the day of week value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev(d, value) {
    value = value > 7 ? 7 : value || 7;

    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) +
        (value - later.dw.val(d)) +
        (value >= later.dw.val(d) ? -7 : 0)
    );
  }
};

/**
 * Day of Year Constraint (dy)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a day of year constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.dayOfYear = later.dy = {
  /**
   * The name of this constraint.
   */
  name: 'day of year',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 86400,

  /**
   * The day of year value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val(d) {
    return (
      d.dy ||
      (d.dy = Math.ceil(
        1 +
          (later.D.start(d).getTime() - later.Y.start(d).getTime()) / later.DAY
      ))
    );
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid(d, value) {
    return later.dy.val(d) === (value || later.dy.extent(d)[1]);
  },

  /**
   * The minimum and maximum valid day of year values of the month specified.
   * Zero indicates the last day of the year.
   *
   * @param {Date} d: The date indicating the month to find the extent of
   */
  extent(d) {
    const year = later.Y.val(d);

    // shortcut on finding leap years since this function gets called a lot
    // works between 1901 and 2099
    return d.dyExtent || (d.dyExtent = [1, year % 4 ? 365 : 366]);
  },

  /**
   * The start of the day of year of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start(d) {
    return later.D.start(d);
  },

  /**
   * The end of the day of year of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end(d) {
    return later.D.end(d);
  },

  /**
   * Returns the start of the next instance of the day of year value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next(d, value) {
    value = value > later.dy.extent(d)[1] ? 1 : value;
    const year = later.date.nextRollover(d, value, later.dy, later.Y);
    const dyMax = later.dy.extent(year)[1];

    value = value > dyMax ? 1 : value || dyMax;

    return later.date.next(later.Y.val(year), later.M.val(year), value);
  },

  /**
   * Returns the end of the previous instance of the day of year value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev(d, value) {
    const year = later.date.prevRollover(d, value, later.dy, later.Y);
    const dyMax = later.dy.extent(year)[1];

    value = value > dyMax ? dyMax : value || dyMax;

    return later.date.prev(later.Y.val(year), later.M.val(year), value);
  }
};

/**
 * Hour Constraint (H)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a hour constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.hour = later.h = {
  /**
   * The name of this constraint.
   */
  name: 'hour',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 3600,

  /**
   * The hour value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val(d) {
    return d.h || (d.h = later.date.getHour.call(d));
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid(d, value) {
    return later.h.val(d) === value;
  },

  /**
   * The minimum and maximum valid hour values.
   */
  extent() {
    return [0, 23];
  },

  /**
   * The start of the hour of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start(d) {
    return (
      d.hStart ||
      (d.hStart = later.date.next(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d),
        later.h.val(d)
      ))
    );
  },

  /**
   * The end of the hour of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end(d) {
    return (
      d.hEnd ||
      (d.hEnd = later.date.prev(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d),
        later.h.val(d)
      ))
    );
  },

  /**
   * Returns the start of the next instance of the hour value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next(d, value) {
    value = value > 23 ? 0 : value;

    let next = later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (value <= later.h.val(d) ? 1 : 0),
      value
    );

    // correct for passing over a daylight savings boundry
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = later.date.next(
        later.Y.val(next),
        later.M.val(next),
        later.D.val(next),
        value + 1
      );
    }

    return next;
  },

  /**
   * Returns the end of the previous instance of the hour value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev(d, value) {
    value = value > 23 ? 23 : value;

    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (value >= later.h.val(d) ? -1 : 0),
      value
    );
  }
};

/**
 * Minute Constraint (m)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a minute constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.minute = later.m = {
  /**
   * The name of this constraint.
   */
  name: 'minute',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 60,

  /**
   * The minute value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val(d) {
    return d.m || (d.m = later.date.getMin.call(d));
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid(d, value) {
    return later.m.val(d) === value;
  },

  /**
   * The minimum and maximum valid minute values.
   */
  extent() {
    return [0, 59];
  },

  /**
   * The start of the minute of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start(d) {
    return (
      d.mStart ||
      (d.mStart = later.date.next(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d),
        later.h.val(d),
        later.m.val(d)
      ))
    );
  },

  /**
   * The end of the minute of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end(d) {
    return (
      d.mEnd ||
      (d.mEnd = later.date.prev(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d),
        later.h.val(d),
        later.m.val(d)
      ))
    );
  },

  /**
   * Returns the start of the next instance of the minute value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next(d, value) {
    const m = later.m.val(d);
    const s = later.s.val(d);
    const inc = value > 59 ? 60 - m : value <= m ? 60 - m + value : value - m;
    let next = new Date(d.getTime() + inc * later.MIN - s * later.SEC);

    // correct for passing over a daylight savings boundry
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 120) * later.MIN - s * later.SEC);
    }

    return next;
  },

  /**
   * Returns the end of the previous instance of the minute value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev(d, value) {
    value = value > 59 ? 59 : value;

    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d),
      later.h.val(d) + (value >= later.m.val(d) ? -1 : 0),
      value
    );
  }
};

/**
 * Month Constraint (M)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a month constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.month = later.M = {
  /**
   * The name of this constraint.
   */
  name: 'month',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 2629740,

  /**
   * The month value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val(d) {
    return d.M || (d.M = later.date.getMonth.call(d) + 1);
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid(d, value) {
    return later.M.val(d) === (value || 12);
  },

  /**
   * The minimum and maximum valid month values. Unlike the native date object,
   * month values in later are 1 based.
   */
  extent() {
    return [1, 12];
  },

  /**
   * The start of the month of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start(d) {
    return (
      d.MStart || (d.MStart = later.date.next(later.Y.val(d), later.M.val(d)))
    );
  },

  /**
   * The end of the month of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end(d) {
    return d.MEnd || (d.MEnd = later.date.prev(later.Y.val(d), later.M.val(d)));
  },

  /**
   * Returns the start of the next instance of the month value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next(d, value) {
    value = value > 12 ? 1 : value || 12;

    return later.date.next(
      later.Y.val(d) + (value > later.M.val(d) ? 0 : 1),
      value
    );
  },

  /**
   * Returns the end of the previous instance of the month value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev(d, value) {
    value = value > 12 ? 12 : value || 12;

    return later.date.prev(
      later.Y.val(d) - (value >= later.M.val(d) ? 1 : 0),
      value
    );
  }
};

/**
 * Second Constraint (s)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a second constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.second = later.s = {
  /**
   * The name of this constraint.
   */
  name: 'second',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 1,

  /**
   * The second value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val(d) {
    return d.s || (d.s = later.date.getSec.call(d));
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid(d, value) {
    return later.s.val(d) === value;
  },

  /**
   * The minimum and maximum valid second values.
   */
  extent() {
    return [0, 59];
  },

  /**
   * The start of the second of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start(d) {
    return d;
  },

  /**
   * The end of the second of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end(d) {
    return d;
  },

  /**
   * Returns the start of the next instance of the second value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next(d, value) {
    const s = later.s.val(d);
    const inc = value > 59 ? 60 - s : value <= s ? 60 - s + value : value - s;
    let next = new Date(d.getTime() + inc * later.SEC);

    // correct for passing over a daylight savings boundry
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 7200) * later.SEC);
    }

    return next;
  },

  /**
   * Returns the end of the previous instance of the second value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev(d, value) {
    value = value > 59 ? 59 : value;

    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d),
      later.h.val(d),
      later.m.val(d) + (value >= later.s.val(d) ? -1 : 0),
      value
    );
  }
};

/**
 * Time Constraint (dy)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a time of day constraint type. Stored as number of seconds
 * since midnight to simplify calculations.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.time = later.t = {
  /**
   * The name of this constraint.
   */
  name: 'time',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 1,

  /**
   * The time value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val(d) {
    return (
      d.t ||
      (d.t = later.h.val(d) * 3600 + later.m.val(d) * 60 + later.s.val(d))
    );
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid(d, value) {
    return later.t.val(d) === value;
  },

  /**
   * The minimum and maximum valid time values.
   */
  extent() {
    return [0, 86399];
  },

  /**
   * Returns the specified date.
   *
   * @param {Date} d: The specified date
   */
  start(d) {
    return d;
  },

  /**
   * Returns the specified date.
   *
   * @param {Date} d: The specified date
   */
  end(d) {
    return d;
  },

  /**
   * Returns the start of the next instance of the time value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next(d, value) {
    value = value > 86399 ? 0 : value;

    let next = later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (value <= later.t.val(d) ? 1 : 0),
      0,
      0,
      value
    );

    // correct for passing over a daylight savings boundry
    if (!later.date.isUTC && next.getTime() < d.getTime()) {
      next = later.date.next(
        later.Y.val(next),
        later.M.val(next),
        later.D.val(next),
        later.h.val(next),
        later.m.val(next),
        value + 7200
      );
    }

    return next;
  },

  /**
   * Returns the end of the previous instance of the time value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev(d, value) {
    value = value > 86399 ? 86399 : value;

    return later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (value >= later.t.val(d) ? -1 : 0),
      0,
      0,
      value
    );
  }
};

/**
 * Week of Month Constraint (wy)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for an week of month constraint type. Week of month treats the
 * first of the month as the start of week 1, with each following week starting
 * on Sunday.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.weekOfMonth = later.wm = {
  /**
   * The name of this constraint.
   */
  name: 'week of month',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 604800,

  /**
   * The week of month value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val(d) {
    return (
      d.wm ||
      (d.wm =
        (later.D.val(d) +
          (later.dw.val(later.M.start(d)) - 1) +
          (7 - later.dw.val(d))) /
        7)
    );
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid(d, value) {
    return later.wm.val(d) === (value || later.wm.extent(d)[1]);
  },

  /**
   * The minimum and maximum valid week of month values for the month indicated.
   * Zero indicates the last week in the month.
   *
   * @param {Date} d: The date indicating the month to find values for
   */
  extent(d) {
    return (
      d.wmExtent ||
      (d.wmExtent = [
        1,
        (later.D.extent(d)[1] +
          (later.dw.val(later.M.start(d)) - 1) +
          (7 - later.dw.val(later.M.end(d)))) /
          7
      ])
    );
  },

  /**
   * The start of the week of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start(d) {
    return (
      d.wmStart ||
      (d.wmStart = later.date.next(
        later.Y.val(d),
        later.M.val(d),
        Math.max(later.D.val(d) - later.dw.val(d) + 1, 1)
      ))
    );
  },

  /**
   * The end of the week of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end(d) {
    return (
      d.wmEnd ||
      (d.wmEnd = later.date.prev(
        later.Y.val(d),
        later.M.val(d),
        Math.min(later.D.val(d) + (7 - later.dw.val(d)), later.D.extent(d)[1])
      ))
    );
  },

  /**
   * Returns the start of the next instance of the week value indicated. Returns
   * the first day of the next month if val is greater than the number of
   * days in the following month.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next(d, value) {
    value = value > later.wm.extent(d)[1] ? 1 : value;

    const month = later.date.nextRollover(d, value, later.wm, later.M);
    const wmMax = later.wm.extent(month)[1];

    value = value > wmMax ? 1 : value || wmMax;

    // jump to the Sunday of the desired week, set to 1st of month for week 1
    return later.date.next(
      later.Y.val(month),
      later.M.val(month),
      Math.max(1, (value - 1) * 7 - (later.dw.val(month) - 2))
    );
  },

  /**
   * Returns the end of the previous instance of the week value indicated. Returns
   * the last day of the previous month if val is greater than the number of
   * days in the previous month.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev(d, value) {
    const month = later.date.prevRollover(d, value, later.wm, later.M);
    const wmMax = later.wm.extent(month)[1];

    value = value > wmMax ? wmMax : value || wmMax;

    // jump to the end of Saturday of the desired week
    return later.wm.end(
      later.date.next(
        later.Y.val(month),
        later.M.val(month),
        Math.max(1, (value - 1) * 7 - (later.dw.val(month) - 2))
      )
    );
  }
};

/**
 * Week of Year Constraint (wy)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for an ISO 8601 week constraint type. For more information about
 * ISO 8601 see http://en.wikipedia.org/wiki/ISO_week_date.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.weekOfYear = later.wy = {
  /**
   * The name of this constraint.
   */
  name: 'week of year (ISO)',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 604800,

  /**
   * The ISO week year value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val(d) {
    if (d.wy) return d.wy;

    // move to the Thursday in the target week and find Thurs of target year
    const wThur = later.dw.next(later.wy.start(d), 5);
    const YThur = later.dw.next(later.Y.prev(wThur, later.Y.val(wThur) - 1), 5);

    // caculate the difference between the two dates in weeks
    return (d.wy =
      1 + Math.ceil((wThur.getTime() - YThur.getTime()) / later.WEEK));
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid(d, value) {
    return later.wy.val(d) === (value || later.wy.extent(d)[1]);
  },

  /**
   * The minimum and maximum valid ISO week values for the year indicated.
   *
   * @param {Date} d: The date indicating the year to find ISO values for
   */
  extent(d) {
    if (d.wyExtent) return d.wyExtent;

    // go to start of ISO week to get to the right year
    const year = later.dw.next(later.wy.start(d), 5);
    const dwFirst = later.dw.val(later.Y.start(year));
    const dwLast = later.dw.val(later.Y.end(year));

    return (d.wyExtent = [1, dwFirst === 5 || dwLast === 5 ? 53 : 52]);
  },

  /**
   * The start of the ISO week of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start(d) {
    return (
      d.wyStart ||
      (d.wyStart = later.date.next(
        later.Y.val(d),
        later.M.val(d),
        // jump to the Monday of the current week
        later.D.val(d) - (later.dw.val(d) > 1 ? later.dw.val(d) - 2 : 6)
      ))
    );
  },

  /**
   * The end of the ISO week of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end(d) {
    return (
      d.wyEnd ||
      (d.wyEnd = later.date.prev(
        later.Y.val(d),
        later.M.val(d),
        // jump to the Saturday of the current week
        later.D.val(d) + (later.dw.val(d) > 1 ? 8 - later.dw.val(d) : 0)
      ))
    );
  },

  /**
   * Returns the start of the next instance of the ISO week value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next(d, value) {
    value = value > later.wy.extent(d)[1] ? 1 : value;

    const wyThur = later.dw.next(later.wy.start(d), 5);
    let year = later.date.nextRollover(wyThur, value, later.wy, later.Y);

    // handle case where 1st of year is last week of previous month
    if (later.wy.val(year) !== 1) {
      year = later.dw.next(year, 2);
    }

    const wyMax = later.wy.extent(year)[1];
    const wyStart = later.wy.start(year);

    value = value > wyMax ? 1 : value || wyMax;

    return later.date.next(
      later.Y.val(wyStart),
      later.M.val(wyStart),
      later.D.val(wyStart) + 7 * (value - 1)
    );
  },

  /**
   * Returns the end of the previous instance of the ISO week value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev(d, value) {
    const wyThur = later.dw.next(later.wy.start(d), 5);
    let year = later.date.prevRollover(wyThur, value, later.wy, later.Y);

    // handle case where 1st of year is last week of previous month
    if (later.wy.val(year) !== 1) {
      year = later.dw.next(year, 2);
    }

    const wyMax = later.wy.extent(year)[1];
    const wyEnd = later.wy.end(year);

    value = value > wyMax ? wyMax : value || wyMax;

    return later.wy.end(
      later.date.next(
        later.Y.val(wyEnd),
        later.M.val(wyEnd),
        later.D.val(wyEnd) + 7 * (value - 1)
      )
    );
  }
};

/**
 * Year Constraint (Y)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a year constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.year = later.Y = {
  /**
   * The name of this constraint.
   */
  name: 'year',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 31556900,

  /**
   * The year value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val(d) {
    return d.Y || (d.Y = later.date.getYear.call(d));
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid(d, value) {
    return later.Y.val(d) === value;
  },

  /**
   * The minimum and maximum valid values for the year constraint.
   * If max is past 2099, later.D.extent must be fixed to calculate leap years
   * correctly.
   */
  extent() {
    return [1970, 2099];
  },

  /**
   * The start of the year of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start(d) {
    return d.YStart || (d.YStart = later.date.next(later.Y.val(d)));
  },

  /**
   * The end of the year of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end(d) {
    return d.YEnd || (d.YEnd = later.date.prev(later.Y.val(d)));
  },

  /**
   * Returns the start of the next instance of the year value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next(d, value) {
    return value > later.Y.val(d) && value <= later.Y.extent()[1]
      ? later.date.next(value)
      : later.NEVER;
  },

  /**
   * Returns the end of the previous instance of the year value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev(d, value) {
    return value < later.Y.val(d) && value >= later.Y.extent()[0]
      ? later.date.prev(value)
      : later.NEVER;
  }
};

/**
 * Full date (fd)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for specifying a full date and time.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.fullDate = later.fd = {
  /**
   * The name of this constraint.
   */
  name: 'full date',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 1,

  /**
   * The time value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val(d) {
    return d.fd || (d.fd = d.getTime());
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid(d, value) {
    return later.fd.val(d) === value;
  },

  /**
   * The minimum and maximum valid time values.
   */
  extent() {
    return [0, 32503680000000];
  },

  /**
   * Returns the specified date.
   *
   * @param {Date} d: The specified date
   */
  start(d) {
    return d;
  },

  /**
   * Returns the specified date.
   *
   * @param {Date} d: The specified date
   */
  end(d) {
    return d;
  },

  /**
   * Returns the start of the next instance of the time value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next(d, value) {
    return later.fd.val(d) < value ? new Date(value) : later.NEVER;
  },

  /**
   * Returns the end of the previous instance of the time value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev(d, value) {
    return later.fd.val(d) > value ? new Date(value) : later.NEVER;
  }
};

later.modifier = {};

/**
 * Before Modifier
 * (c) 2013 Bill, BunKat LLC.
 *
 * Modifies a constraint such that all values that are less than the
 * specified value are considered valid.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

/**
 * Creates a new modified constraint.
 *
 * @param {Constraint} constraint: The constraint to be modified
 * @param {Integer} value: The starting value of the before constraint
 */
later.modifier.before = later.modifier.b = function (constraint, values) {
  const value = values[values.length - 1];

  return {
    /**
     * Returns the name of the constraint with the 'before' modifier.
     */
    name: 'before ' + constraint.name,

    /**
     * Pass through to the constraint.
     */
    range: constraint.range * (value - 1),

    /**
     * The value of the specified date. Returns value for any constraint val
     * that is less than or equal to value.
     *
     * @param {Date} d: The date to calculate the value of
     */
    val: constraint.val,

    /**
     * Returns true if the val is valid for the date specified.
     *
     * @param {Date} d: The date to check the value on
     * @param {Integer} val: The value to validate
     */
    // TODO: this code might need fixed:
    // eslint-disable-next-line no-unused-vars
    isValid(d, value_) {
      return this.val(d) < value;
    },

    /**
     * Pass through to the constraint.
     */
    extent: constraint.extent,

    /**
     * Pass through to the constraint.
     */
    start: constraint.start,

    /**
     * Jump to the end of the range.
     */
    end: constraint.end,

    /**
     * Pass through to the constraint.
     */
    next(startDate, value_) {
      value_ = value_ === value ? constraint.extent(startDate)[0] : value;
      return constraint.next(startDate, value_);
    },

    /**
     * Pass through to the constraint.
     */
    prev(startDate, value_) {
      value_ = value_ === value ? value - 1 : constraint.extent(startDate)[1];
      return constraint.prev(startDate, value_);
    }
  };
};

/**
 * After Modifier
 * (c) 2013 Bill, BunKat LLC.
 *
 * Modifies a constraint such that all values that are greater than the
 * specified value are considered valid.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

/**
 * Creates a new modified constraint.
 *
 * @param {Constraint} constraint: The constraint to be modified
 * @param {Integer} value: The starting value of the after constraint
 */
later.modifier.after = later.modifier.a = function (constraint, values) {
  const value = values[0];

  return {
    /**
     * Returns the name of the constraint with the 'after' modifier.
     */
    name: 'after ' + constraint.name,

    /**
     * Pass through to the constraint.
     */
    range: (constraint.extent(new Date())[1] - value) * constraint.range,

    /**
     * The value of the specified date. Returns value for any constraint val
     * that is greater than or equal to value.
     *
     * @param {Date} d: The date to calculate the value of
     */
    val: constraint.val,

    /**
     * Returns true if the val is valid for the date specified.
     *
     * @param {Date} d: The date to check the value on
     * @param {Integer} val: The value to validate
     */
    isValid(d, value) {
      return this.val(d) >= value;
    },

    /**
     * Pass through to the constraint.
     */
    extent: constraint.extent,

    /**
     * Pass through to the constraint.
     */
    start: constraint.start,

    /**
     * Pass through to the constraint.
     */
    end: constraint.end,

    /**
     * Pass through to the constraint.
     */
    next(startDate, value_) {
      if (value_ !== value) value_ = constraint.extent(startDate)[0];
      return constraint.next(startDate, value_);
    },

    /**
     * Pass through to the constraint.
     */
    prev(startDate, value_) {
      value_ = value_ === value ? constraint.extent(startDate)[1] : value - 1;
      return constraint.prev(startDate, value_);
    }
  };
};

/**
 * Compile
 * (c) 2013 Bill, BunKat LLC.
 *
 * Compiles a single schedule definition into a form from which instances can be
 * efficiently calculated from.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.compile = function (schedDef) {
  const constraints = [];
  let constraintsLength = 0;

  for (const key in schedDef) {
    const nameParts = key.split('_');
    const name = nameParts[0];
    const mod = nameParts[1];
    const vals = schedDef[key];
    const constraint = mod
      ? later.modifier[mod](later[name], vals)
      : later[name];

    constraints.push({ constraint, vals });
    constraintsLength++;
  }

  // sort constraints based on their range for best performance (we want to
  // always skip the largest block of time possible to find the next valid
  // value)
  constraints.sort(function (a, b) {
    const ra = a.constraint.range;
    const rb = b.constraint.range;
    return rb < ra ? -1 : rb > ra ? 1 : 0;
  });

  // this is the smallest constraint, we use this one to tick the schedule when
  // finding multiple instances
  const tickConstraint = constraints[constraintsLength - 1].constraint;

  /**
   * Returns a function to use when comparing two dates. Encapsulates the
   * difference between searching for instances forward and backwards so that
   * the same code can be completely reused for both directions.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   */
  function compareFn(dir) {
    return dir === 'next'
      ? function (a, b) {
          return a.getTime() > b.getTime();
        }
      : function (a, b) {
          return b.getTime() > a.getTime();
        };
  }

  return {
    /**
     * Calculates the start of the next valid occurrence of a particular schedule
     * that occurs on or after the specified start time.
     *
     * @param {String} dir: Direction to search in ('next' or 'prev')
     * @param {Date} startDate: The first possible valid occurrence
     */
    start(dir, startDate) {
      let next = startDate;
      const nextValue = later.array[dir];
      let maxAttempts = 1000;
      let done;

      while (maxAttempts-- && !done && next) {
        done = true;

        // verify all of the constraints in order since we want to make the
        // largest jumps possible to find the first valid value
        for (let i = 0; i < constraintsLength; i++) {
          const { constraint } = constraints[i];
          const curValue = constraint.val(next);
          const extent = constraint.extent(next);
          const newValue = nextValue(curValue, constraints[i].vals, extent);

          if (!constraint.isValid(next, newValue)) {
            next = constraint[dir](next, newValue);
            done = false;
            break; // need to retest all constraints with new date
          }
        }
      }

      if (next !== later.NEVER) {
        next =
          dir === 'next'
            ? tickConstraint.start(next)
            : tickConstraint.end(next);
      }

      // if next, move to start of time period. needed when moving backwards
      return next;
    },

    /**
     * Given a valid start time, finds the next schedule that is invalid.
     * Useful for finding the end of a valid time range.
     *
     * @param {Date} startDate: The first possible valid occurrence
     */
    end(dir, startDate) {
      let result;
      const nextValue = later.array[dir + 'Invalid'];
      const compare = compareFn(dir);

      for (let i = constraintsLength - 1; i >= 0; i--) {
        const { constraint } = constraints[i];
        const curValue = constraint.val(startDate);
        const extent = constraint.extent(startDate);
        const newValue = nextValue(curValue, constraints[i].vals, extent);
        let next;

        if (newValue !== undefined) {
          // constraint has invalid value, use that
          next = constraint[dir](startDate, newValue);
          if (next && (!result || compare(result, next))) {
            result = next;
          }
        }
      }

      return result;
    },

    /**
     * Ticks the date by the minimum constraint in this schedule
     *
     * @param {String} dir: Direction to tick in ('next' or 'prev')
     * @param {Date} date: The start date to tick from
     */
    tick(dir, date) {
      return new Date(
        dir === 'next'
          ? tickConstraint.end(date).getTime() + later.SEC
          : tickConstraint.start(date).getTime() - later.SEC
      );
    },

    /**
     * Ticks the date to the start of the minimum constraint
     *
     * @param {Date} date: The start date to tick from
     */
    tickStart(date) {
      return tickConstraint.start(date);
    }
  };
};

/**
 * Schedule
 * (c) 2013 Bill, BunKat LLC.
 *
 * Returns an object to calculate future or previous occurrences of the
 * specified schedule.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.schedule = function (sched) {
  if (!sched) throw new Error('Missing schedule definition.');
  if (!sched.schedules)
    throw new Error('Definition must include at least one schedule.');

  // compile the schedule components
  const schedules = [];
  const schedulesLength = sched.schedules.length;
  const exceptions = [];
  const exceptionsLength = sched.exceptions ? sched.exceptions.length : 0;

  for (let i = 0; i < schedulesLength; i++) {
    schedules.push(later.compile(sched.schedules[i]));
  }

  for (let j = 0; j < exceptionsLength; j++) {
    exceptions.push(later.compile(sched.exceptions[j]));
  }

  /**
   * Calculates count number of instances or ranges for the current schedule,
   * optionally between the specified startDate and endDate.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Integer} count: The number of instances or ranges to return
   * @param {Date} startDate: The earliest date a valid instance can occur on
   * @param {Date} endDate: The latest date a valid instance can occur on
   * @param {Bool} isRange: True to return ranges, false to return instances
   */
  function getInstances(dir, count, startDate, endDate, isRange) {
    const compare = compareFn(dir); // encapsulates difference between directions
    let loopCount = count;
    let maxAttempts = 1000;
    const schedStarts = [];
    const exceptStarts = [];
    let next;
    let end;
    const results = [];
    const isForward = dir === 'next';
    let lastResult;
    const rStart = isForward ? 0 : 1;
    const rEnd = isForward ? 1 : 0;

    startDate = startDate ? new Date(startDate) : new Date();
    if (!startDate || !startDate.getTime())
      throw new Error('Invalid start date.');

    // Step 1: calculate the earliest start dates for each schedule and exception
    setNextStarts(dir, schedules, schedStarts, startDate);
    setRangeStarts(dir, exceptions, exceptStarts, startDate);

    // Step 2: select the earliest of the start dates calculated
    while (
      maxAttempts-- &&
      loopCount &&
      (next = findNext(schedStarts, compare))
    ) {
      // Step 3: make sure the start date we found is in range
      if (endDate && compare(next, endDate)) {
        break;
      }

      // Step 4: make sure we aren't in the middle of an exception range
      if (exceptionsLength) {
        updateRangeStarts(dir, exceptions, exceptStarts, next);
        if ((end = calcRangeOverlap(dir, exceptStarts, next))) {
          updateNextStarts(dir, schedules, schedStarts, end);
          continue;
        }
      }

      // Step 5: Date is good, if range, find the end of the range and update start dates
      if (isRange) {
        const maxEndDate = calcMaxEndDate(exceptStarts, compare);
        end = calcEnd(dir, schedules, schedStarts, next, maxEndDate);
        const r = isForward
          ? [
              new Date(Math.max(startDate, next)),
              end ? new Date(endDate ? Math.min(end, endDate) : end) : undefined
            ]
          : [
              end
                ? new Date(
                    endDate
                      ? Math.max(endDate, end.getTime() + later.SEC)
                      : end.getTime() + later.SEC
                  )
                : undefined,
              new Date(Math.min(startDate, next.getTime() + later.SEC))
            ];

        // make sure start of this range doesn't overlap with the end of the
        // previous range
        if (lastResult && r[rStart].getTime() === lastResult[rEnd].getTime()) {
          lastResult[rEnd] = r[rEnd];
          loopCount++; // correct the count since this isn't a new range
        } else {
          lastResult = r;
          results.push(lastResult);
        }

        if (!end) break; // last iteration valid until the end of time
        updateNextStarts(dir, schedules, schedStarts, end);
      }
      // otherwise store the start date and tick the start dates
      else {
        results.push(
          isForward
            ? new Date(Math.max(startDate, next))
            : getStart(schedules, schedStarts, next, endDate)
        );

        tickStarts(dir, schedules, schedStarts, next);
      }

      loopCount--;
    }

    // clean the dates that will be returned to remove any cached properties
    // that were added during the schedule process
    for (let i = 0, { length } = results; i < length; i++) {
      const result = results[i];
      results[i] =
        Object.prototype.toString.call(result) === '[object Array]'
          ? [cleanDate(result[0]), cleanDate(result[1])]
          : cleanDate(result);
    }

    return results.length === 0
      ? later.NEVER
      : count === 1
      ? results[0]
      : results;
  }

  function cleanDate(d) {
    if (d instanceof Date && !Number.isNaN(d.valueOf())) {
      return new Date(d);
    }

    return undefined;
  }

  /**
   * Initially sets the first valid next start times
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
   * @param {Date} startDate: Starts earlier than this date will be calculated
   */
  function setNextStarts(dir, schedArray, startsArray, startDate) {
    for (let i = 0, { length } = schedArray; i < length; i++) {
      startsArray[i] = schedArray[i].start(dir, startDate);
    }
  }

  /**
   * Updates the set of cached start dates to the next valid start dates. Only
   * schedules where the current start date is less than or equal to the
   * specified startDate need to be updated.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
   * @param {Date} startDate: Starts earlier than this date will be calculated
   */
  function updateNextStarts(dir, schedArray, startsArray, startDate) {
    const compare = compareFn(dir);

    for (let i = 0, { length } = schedArray; i < length; i++) {
      if (startsArray[i] && !compare(startsArray[i], startDate)) {
        startsArray[i] = schedArray[i].start(dir, startDate);
      }
    }
  }

  /**
   * Updates the set of cached ranges to the next valid ranges. Only
   * schedules where the current start date is less than or equal to the
   * specified startDate need to be updated.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
   * @param {Date} startDate: Starts earlier than this date will be calculated
   */
  function setRangeStarts(dir, schedArray, rangesArray, startDate) {
    for (let i = 0, { length } = schedArray; i < length; i++) {
      const nextStart = schedArray[i].start(dir, startDate);

      if (nextStart) {
        rangesArray[i] = [nextStart, schedArray[i].end(dir, nextStart)];
      } else {
        rangesArray[i] = later.NEVER;
      }
    }
  }

  /**
   * Updates the set of cached ranges to the next valid ranges. Only
   * schedules where the current start date is less than or equal to the
   * specified startDate need to be updated.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
   * @param {Date} startDate: Starts earlier than this date will be calculated
   */
  function updateRangeStarts(dir, schedArray, rangesArray, startDate) {
    const compare = compareFn(dir);

    for (let i = 0, { length } = schedArray; i < length; i++) {
      if (rangesArray[i] && !compare(rangesArray[i][0], startDate)) {
        const nextStart = schedArray[i].start(dir, startDate);

        if (nextStart) {
          rangesArray[i] = [nextStart, schedArray[i].end(dir, nextStart)];
        } else {
          rangesArray[i] = later.NEVER;
        }
      }
    }
  }

  /**
   * Increments all schedules with next start equal to startDate by one tick.
   * Tick size is determined by the smallest constraint within a schedule.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
   * @param {Date} startDate: The date that should cause a schedule to tick
   */
  function tickStarts(dir, schedArray, startsArray, startDate) {
    for (let i = 0, { length } = schedArray; i < length; i++) {
      if (startsArray[i] && startsArray[i].getTime() === startDate.getTime()) {
        startsArray[i] = schedArray[i].start(
          dir,
          schedArray[i].tick(dir, startDate)
        );
      }
    }
  }

  /**
   * Determines the start date of the schedule that produced startDate
   *
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
   * @param {Date} startDate: The date that should cause a schedule to tick
   * @param {Date} minEndDate: The minimum end date to return
   */
  function getStart(schedArray, startsArray, startDate, minEndDate) {
    let result;

    for (let i = 0, { length } = startsArray; i < length; i++) {
      if (startsArray[i] && startsArray[i].getTime() === startDate.getTime()) {
        const start = schedArray[i].tickStart(startDate);

        if (minEndDate && start < minEndDate) {
          return minEndDate;
        }

        if (!result || start > result) {
          result = start;
        }
      }
    }

    return result;
  }

  /**
   * Calculates the end of the overlap between any exception schedule and the
   * specified start date. Returns undefined if there is no overlap.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} rangesArr: The set of cached start dates for the schedules
   * @param {Date} startDate: The valid date for which the overlap will be found
   */
  function calcRangeOverlap(dir, rangesArray, startDate) {
    const compare = compareFn(dir);
    let result;

    for (let i = 0, { length } = rangesArray; i < length; i++) {
      const range = rangesArray[i];

      if (
        range &&
        !compare(range[0], startDate) &&
        (!range[1] || compare(range[1], startDate))
      ) {
        // startDate is in the middle of an exception range
        if (!result || compare(range[1], result)) {
          result = range[1];
        }
      }
    }

    return result;
  }

  /**
   * Calculates the earliest start of an exception schedule, this is the maximum
   * end date of the schedule.
   *
   * @param {Array} exceptsArr: The set of cached exception ranges
   * @param {Array} compare: The compare function to use to determine earliest
   */
  function calcMaxEndDate(exceptsArray, compare) {
    let result;

    for (let i = 0, { length } = exceptsArray; i < length; i++) {
      if (exceptsArray[i] && (!result || compare(result, exceptsArray[i][0]))) {
        result = exceptsArray[i][0];
      }
    }

    return result;
  }

  /**
   * Calculates the next invalid date for a particular schedules starting from
   * the specified valid start date.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
   * @param {Date} startDate: The valid date for which the end date will be found
   * @param {Date} maxEndDate: The latested possible end date or null for none
   */
  function calcEnd(dir, schedArray, startsArray, startDate, maxEndDate) {
    const compare = compareFn(dir);
    let result;

    for (let i = 0, { length } = schedArray; i < length; i++) {
      const start = startsArray[i];

      if (start && start.getTime() === startDate.getTime()) {
        const end = schedArray[i].end(dir, start);

        // if the end date is past the maxEndDate, just return the maxEndDate
        if (maxEndDate && (!end || compare(end, maxEndDate))) {
          return maxEndDate;
        }

        // otherwise, return the maximum end date that was calculated
        if (!result || compare(end, result)) {
          result = end;
        }
      }
    }

    return result;
  }

  /**
   * Returns a function to use when comparing two dates. Encapsulates the
   * difference between searching for instances forward and backwards so that
   * the same code can be completely reused for both directions.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   */
  function compareFn(dir) {
    return dir === 'next'
      ? function (a, b) {
          return !b || a.getTime() > b.getTime();
        }
      : function (a, b) {
          return !a || b.getTime() > a.getTime();
        };
  }

  /**
   * Returns the next value in an array using the function passed in as compare
   * to do the comparison. Skips over null or undefined values.
   *
   * @param {Array} arr: The array of values
   * @param {Function} compare: The comparison function to use
   */
  function findNext(array, compare) {
    let next = array[0];

    for (let i = 1, { length } = array; i < length; i++) {
      if (array[i] && compare(next, array[i])) {
        next = array[i];
      }
    }

    return next;
  }

  return {
    /**
     * Returns true if d is a valid occurrence of the current schedule.
     *
     * @param {Date} d: The date to check
     */
    isValid(d) {
      return getInstances('next', 1, d, d) !== later.NEVER;
    },

    /**
     * Finds the next valid instance or instances of the current schedule,
     * optionally between a specified start and end date. Start date is
     * Date.now() by default, end date is unspecified. Start date must be
     * smaller than end date.
     *
     * @param {Integer} count: The number of instances to return
     * @param {Date} startDate: The earliest a valid instance can occur
     * @param {Date} endDate: The latest a valid instance can occur
     */
    next(count, startDate, endDate) {
      return getInstances('next', count || 1, startDate, endDate);
    },

    /**
     * Finds the previous valid instance or instances of the current schedule,
     * optionally between a specified start and end date. Start date is
     * Date.now() by default, end date is unspecified. Start date must be
     * greater than end date.
     *
     * @param {Integer} count: The number of instances to return
     * @param {Date} startDate: The earliest a valid instance can occur
     * @param {Date} endDate: The latest a valid instance can occur
     */
    prev(count, startDate, endDate) {
      return getInstances('prev', count || 1, startDate, endDate);
    },

    /**
     * Finds the next valid range or ranges of the current schedule,
     * optionally between a specified start and end date. Start date is
     * Date.now() by default, end date is unspecified. Start date must be
     * greater than end date.
     *
     * @param {Integer} count: The number of ranges to return
     * @param {Date} startDate: The earliest a valid range can occur
     * @param {Date} endDate: The latest a valid range can occur
     */
    nextRange(count, startDate, endDate) {
      return getInstances('next', count || 1, startDate, endDate, true);
    },

    /**
     * Finds the previous valid range or ranges of the current schedule,
     * optionally between a specified start and end date. Start date is
     * Date.now() by default, end date is unspecified. Start date must be
     * greater than end date.
     *
     * @param {Integer} count: The number of ranges to return
     * @param {Date} startDate: The earliest a valid range can occur
     * @param {Date} endDate: The latest a valid range can occur
     */
    prevRange(count, startDate, endDate) {
      return getInstances('prev', count || 1, startDate, endDate, true);
    }
  };
};

/**
 * Set Timeout
 * (c) 2013 Bill, BunKat LLC.
 *
 * Works similar to setTimeout() but allows you to specify a Later schedule
 * instead of milliseconds.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.setTimeout = function (fn, sched) {
  const s = later.schedule(sched);
  let t;
  if (fn) {
    scheduleTimeout();
  }

  /**
   * Schedules the timeout to occur. If the next occurrence is greater than the
   * max supported delay (2147483647 ms) than we delay for that amount before
   * attempting to schedule the timeout again.
   */
  function scheduleTimeout() {
    const now = Date.now();
    const next = s.next(2, now);

    if (!next[0]) {
      t = undefined;
      return;
    }

    let diff = next[0].getTime() - now;

    // minimum time to fire is one second, use next occurrence instead
    if (diff < 1000) {
      diff = next[1] ? next[1].getTime() - now : 1000;
    }

    if (diff < 2147483647) {
      t = setTimeout(fn, diff);
    } else {
      t = setTimeout(scheduleTimeout, 2147483647);
    }
  }

  return {
    isDone() {
      return !t;
    },

    /**
     * Clears the timeout.
     */
    clear() {
      clearTimeout(t);
    }
  };
};

/**
 * Set Interval
 * (c) 2013 Bill, BunKat LLC.
 *
 * Works similar to setInterval() but allows you to specify a Later schedule
 * instead of milliseconds.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.setInterval = function (fn, sched) {
  if (!fn) {
    return;
  }

  let t = later.setTimeout(scheduleTimeout, sched);
  let done = t.isDone();

  /**
   * Executes the specified function and then sets the timeout for the next
   * interval.
   */
  function scheduleTimeout() {
    if (!done) {
      fn();
      t = later.setTimeout(scheduleTimeout, sched);
    }
  }

  return {
    isDone() {
      return t.isDone();
    },

    /**
     * Clears the timeout.
     */
    clear() {
      done = true;
      t.clear();
    }
  };
};

later.date = {};

/**
 * Timezone
 * (c) 2013 Bill, BunKat LLC.
 *
 * Configures helper functions to switch between useing local time and UTC. Later
 * uses UTC time by default.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.date.timezone = function (useLocalTime) {
  // configure the date builder used to create new dates in the right timezone
  later.date.build = useLocalTime
    ? function (Y, M, D, h, m, s) {
        return new Date(Y, M, D, h, m, s);
      }
    : function (Y, M, D, h, m, s) {
        return new Date(Date.UTC(Y, M, D, h, m, s));
      };

  // configure the accessor methods
  const get = useLocalTime ? 'get' : 'getUTC';
  const d = Date.prototype;

  later.date.getYear = d[get + 'FullYear'];
  later.date.getMonth = d[get + 'Month'];
  later.date.getDate = d[get + 'Date'];
  later.date.getDay = d[get + 'Day'];
  later.date.getHour = d[get + 'Hours'];
  later.date.getMin = d[get + 'Minutes'];
  later.date.getSec = d[get + 'Seconds'];

  // set the isUTC flag
  later.date.isUTC = !useLocalTime;
};

// friendly names for available timezones
later.date.UTC = function () {
  later.date.timezone(false);
};

later.date.localTime = function () {
  later.date.timezone(true);
};

// use UTC by default
later.date.UTC();

/**
 * Date Constants
 * (c) 2013 Bill, BunKat LLC.
 *
 * Useful constants for dealing with time conversions.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

// Time to milliseconds conversion
later.SEC = 1000;
later.MIN = later.SEC * 60;
later.HOUR = later.MIN * 60;
later.DAY = later.HOUR * 24;
later.WEEK = later.DAY * 7;

// Array of days in each month, must be corrected for leap years
later.DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// constant for specifying that a schedule can never occur
later.NEVER = 0;

/**
 * Next
 * (c) 2013 Bill, BunKat LLC.
 *
 * Creates a new Date object defaulted to the first second after the specified
 * values.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

/**
 * Builds and returns a new Date using the specified values.  Date
 * returned is either using Local time or UTC based on isLocal.
 *
 * @param {Int} Y: Four digit year
 * @param {Int} M: Month between 1 and 12, defaults to 1
 * @param {Int} D: Date between 1 and 31, defaults to 1
 * @param {Int} h: Hour between 0 and 23, defaults to 0
 * @param {Int} m: Minute between 0 and 59, defaults to 0
 * @param {Int} s: Second between 0 and 59, defaults to 0
 */
later.date.next = function (Y, M, D, h, m, s) {
  return later.date.build(
    Y,
    M === undefined ? 0 : M - 1,
    D === undefined ? 1 : D,
    h || 0,
    m || 0,
    s || 0
  );
};

/**
 * Next Rollover
 * (c) 2013 Bill, BunKat LLC.
 *
 * Determines if a value will cause a particualr constraint to rollover to the
 * next largest time period. Used primarily when a constraint has a
 * variable extent.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.date.nextRollover = function (d, value, constraint, period) {
  const cur = constraint.val(d);
  const max = constraint.extent(d)[1];

  return (value || max) <= cur || value > max
    ? new Date(period.end(d).getTime() + later.SEC)
    : period.start(d);
};

/**
 * Prev
 * (c) 2013 Bill, BunKat LLC.
 *
 * Creates a new Date object defaulted to the last second after the specified
 * values.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

/**
 * Builds and returns a new Date using the specified values.  Date
 * returned is either using Local time or UTC based on isLocal.
 *
 * @param {Int} Y: Four digit year
 * @param {Int} M: Month between 0 and 11, defaults to 11
 * @param {Int} D: Date between 1 and 31, defaults to last day of month
 * @param {Int} h: Hour between 0 and 23, defaults to 23
 * @param {Int} m: Minute between 0 and 59, defaults to 59
 * @param {Int} s: Second between 0 and 59, defaults to 59
 */
later.date.prev = function (Y, M, D, h, m, s) {
  const { length } = arguments;
  M = length < 2 ? 11 : M - 1;
  D = length < 3 ? later.D.extent(later.date.next(Y, M + 1))[1] : D;
  h = length < 4 ? 23 : h;
  m = length < 5 ? 59 : m;
  s = length < 6 ? 59 : s;

  return later.date.build(Y, M, D, h, m, s);
};

/**
 * Prev Rollover
 * (c) 2013 Bill, BunKat LLC.
 *
 * Determines if a value will cause a particualr constraint to rollover to the
 * previous largest time period. Used primarily when a constraint has a
 * variable extent.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.date.prevRollover = function (d, value, constraint, period) {
  const cur = constraint.val(d);

  return value >= cur || !value
    ? period.start(period.prev(d, period.val(d) - 1))
    : period.start(d);
};

later.parse = {};

/**
 * Cron
 * (c) 2013 Bill, BunKat LLC.
 *
 * Creates a valid Later schedule from a valid cron expression.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

/**
 * Parses a valid cron expression and produces a valid schedule that
 * can then be used with Later.
 *
 * CronParser().parse('* 5 * * * * *', true);
 *
 * @param {String} expr: The cron expression to parse
 * @param {Bool} hasSeconds: True if the expression uses a seconds field
 * @api public
 */
later.parse.cron = function (expr, hasSeconds) {
  // Constant array to convert valid names to values
  const NAMES = {
    JAN: 1,
    FEB: 2,
    MAR: 3,
    APR: 4,
    MAY: 5,
    JUN: 6,
    JUL: 7,
    AUG: 8,
    SEP: 9,
    OCT: 10,
    NOV: 11,
    DEC: 12,
    SUN: 1,
    MON: 2,
    TUE: 3,
    WED: 4,
    THU: 5,
    FRI: 6,
    SAT: 7
  };

  // Parsable replacements for common expressions
  const REPLACEMENTS = {
    '* * * * * *': '0/1 * * * * *',
    '@YEARLY': '0 0 1 1 *',
    '@ANNUALLY': '0 0 1 1 *',
    '@MONTHLY': '0 0 1 * *',
    '@WEEKLY': '0 0 * * 0',
    '@DAILY': '0 0 * * *',
    '@HOURLY': '0 * * * *'
  };

  // Contains the index, min, and max for each of the constraints
  const FIELDS = {
    s: [0, 0, 59], // seconds
    m: [1, 0, 59], // minutes
    h: [2, 0, 23], // hours
    D: [3, 1, 31], // day of month
    M: [4, 1, 12], // month
    Y: [6, 1970, 2099], // year
    d: [5, 1, 7, 1] // day of week
  };

  /**
   * Returns the value + offset if value is a number, otherwise it
   * attempts to look up the value in the NAMES table and returns
   * that result instead.
   *
   * @param {Int,String} value: The value that should be parsed
   * @param {Int} offset: Any offset that must be added to the value
   */
  function getValue(value, offset, max) {
    return Number.isNaN(value)
      ? NAMES[value] || null
      : Math.min(Number(value) + (offset || 0), max || 9999);
  }

  /**
   * Returns a deep clone of a schedule skipping any day of week
   * constraints.
   *
   * @param {Sched} sched: The schedule that will be cloned
   */
  function cloneSchedule(sched) {
    const clone = {};
    let field;

    for (field in sched) {
      if (field !== 'dc' && field !== 'd') {
        clone[field] = sched[field].slice(0);
      }
    }

    return clone;
  }

  /**
   * Adds values to the specified constraint in the current schedule.
   *
   * @param {Sched} sched: The schedule to add the constraint to
   * @param {String} name: Name of constraint to add
   * @param {Int} min: Minimum value for this constraint
   * @param {Int} max: Maximum value for this constraint
   * @param {Int} inc: The increment to use between min and max
   */
  function add(sched, name, min, max, inc) {
    let i = min;

    if (!sched[name]) {
      sched[name] = [];
    }

    while (i <= max) {
      if (!sched[name].includes(i)) {
        sched[name].push(i);
      }

      i += inc || 1;
    }

    sched[name].sort(function (a, b) {
      return a - b;
    });
  }

  /**
   * Adds a hash item (of the form x#y or xL) to the schedule.
   *
   * @param {Schedule} schedules: The current schedule array to add to
   * @param {Schedule} curSched: The current schedule to add to
   * @param {Int} value: The value to add (x of x#y or xL)
   * @param {Int} hash: The hash value to add (y of x#y)
   */
  function addHash(schedules, curSched, value, hash) {
    // if there are any existing day of week constraints that
    // aren't equal to the one we're adding, create a new
    // composite schedule
    if (
      (curSched.d && !curSched.dc) ||
      (curSched.dc && !curSched.dc.includes(hash))
    ) {
      schedules.push(cloneSchedule(curSched));
      curSched = schedules[schedules.length - 1];
    }

    add(curSched, 'd', value, value);
    add(curSched, 'dc', hash, hash);
  }

  function addWeekday(s, curSched, value) {
    const except1 = {};
    const except2 = {};
    if (value === 1) {
      // cron doesn't pass month boundaries, so if 1st is a
      // weekend then we need to use 2nd or 3rd instead
      add(curSched, 'D', 1, 3);
      add(curSched, 'd', NAMES.MON, NAMES.FRI);
      add(except1, 'D', 2, 2);
      add(except1, 'd', NAMES.TUE, NAMES.FRI);
      add(except2, 'D', 3, 3);
      add(except2, 'd', NAMES.TUE, NAMES.FRI);
    } else {
      // normally you want the closest day, so if v is a
      // Saturday, use the previous Friday.  If it's a
      // sunday, use the following Monday.
      add(curSched, 'D', value - 1, value + 1);
      add(curSched, 'd', NAMES.MON, NAMES.FRI);
      add(except1, 'D', value - 1, value - 1);
      add(except1, 'd', NAMES.MON, NAMES.THU);
      add(except2, 'D', value + 1, value + 1);
      add(except2, 'd', NAMES.TUE, NAMES.FRI);
    }

    s.exceptions.push(except1);
    s.exceptions.push(except2);
  }

  /**
   * Adds a range item (of the form x-y/z) to the schedule.
   *
   * @param {String} item: The cron expression item to add
   * @param {Schedule} curSched: The current schedule to add to
   * @param {String} name: The name to use for this constraint
   * @param {Int} min: The min value for the constraint
   * @param {Int} max: The max value for the constraint
   * @param {Int} offset: The offset to apply to the cron value
   */
  function addRange(item, curSched, name, min, max, offset) {
    // parse range/x
    const incSplit = item.split('/');
    const inc = Number(incSplit[1]);
    const range = incSplit[0];

    // parse x-y or * or 0
    if (range !== '*' && range !== '0') {
      const rangeSplit = range.split('-');
      min = getValue(rangeSplit[0], offset, max);

      // fix for issue #13, range may be single digit
      max = getValue(rangeSplit[1], offset, max) || max;
    }

    add(curSched, name, min, max, inc);
  }

  /**
   * Parses a particular item within a cron expression.
   *
   * @param {String} item: The cron expression item to parse
   * @param {Schedule} s: The existing set of schedules
   * @param {String} name: The name to use for this constraint
   * @param {Int} min: The min value for the constraint
   * @param {Int} max: The max value for the constraint
   * @param {Int} offset: The offset to apply to the cron value
   */
  function parse(item, s, name, min, max, offset) {
    let value;
    let split;
    const { schedules } = s;
    const curSched = schedules[schedules.length - 1];

    // L just means min - 1 (this also makes it work for any field)
    if (item === 'L') {
      item = min - 1;
    }

    // parse x
    if ((value = getValue(item, offset, max)) !== null) {
      add(curSched, name, value, value);
    }
    // parse xW
    else if ((value = getValue(item.replace('W', ''), offset, max)) !== null) {
      addWeekday(s, curSched, value);
    }
    // parse xL
    else if ((value = getValue(item.replace('L', ''), offset, max)) !== null) {
      addHash(schedules, curSched, value, min - 1);
    }
    // parse x#y
    else if ((split = item.split('#')).length === 2) {
      value = getValue(split[0], offset, max);
      addHash(schedules, curSched, value, getValue(split[1]));
    }
    // parse x-y or x-y/z or */z or 0/z
    else {
      addRange(item, curSched, name, min, max, offset);
    }
  }

  /**
   * Returns true if the item is either of the form x#y or xL.
   *
   * @param {String} item: The expression item to check
   */
  function isHash(item) {
    return item.includes('#') || item.indexOf('L') > 0;
  }

  function itemSorter(a, b) {
    return isHash(a) && !isHash(b) ? 1 : a - b;
  }

  /**
   * Parses each of the fields in a cron expression.  The expression must
   * include the seconds field, the year field is optional.
   *
   * @param {String} expr: The cron expression to parse
   */
  function parseExpr(expr) {
    const schedule = { schedules: [{}], exceptions: [] };
    const components = expr.replace(/(\s)+/g, ' ').split(' ');
    let field;
    let f;
    let component;
    let items;

    for (field in FIELDS) {
      f = FIELDS[field];
      component = components[f[0]];
      if (component && component !== '*' && component !== '?') {
        // need to sort so that any #'s come last, otherwise
        // schedule clones to handle # won't contain all of the
        // other constraints
        items = component.split(',').sort(itemSorter);
        let i;
        const { length } = items;
        for (i = 0; i < length; i++) {
          parse(items[i], schedule, field, f[1], f[2], f[3]);
        }
      }
    }

    return schedule;
  }

  /**
   * Make cron expression parsable.
   *
   * @param {String} expr: The cron expression to prepare
   */
  function prepareExpr(expr) {
    const prepared = expr.toUpperCase();
    return REPLACEMENTS[prepared] || prepared;
  }

  const e = prepareExpr(expr);
  return parseExpr(hasSeconds ? e : '0 ' + e);
};

/**
 * Simple API for generating valid schedules for Later.js.  All commands
 * are chainable.
 *
 * Example:
 *
 * Every 5 minutes between minutes 15 and 45 of each hour and also
 * at 9:00 am every day, except in the months of January and February
 *
 * recur().every(5).minute().between(15, 45).and().at('09:00:00')
 *    .except().on(0, 1).month();
 */
later.parse.recur = function () {
  const schedules = [];
  const exceptions = [];
  let cur;
  let curArray = schedules;
  let curName;
  let values;
  let every;
  let modifier;
  let applyMin;
  let applyMax;
  let i;
  let last;

  /**
   * Adds values to the specified constraint in the current schedule.
   *
   * @param {String} name: Name of constraint to add
   * @param {Int} min: Minimum value for this constraint
   * @param {Int} max: Maximum value for this constraint
   */
  function add(name, min, max) {
    name = modifier ? name + '_' + modifier : name;

    if (!cur) {
      curArray.push({});
      cur = curArray[0];
    }

    if (!cur[name]) {
      cur[name] = [];
    }

    curName = cur[name];

    if (every) {
      values = [];
      for (i = min; i <= max; i += every) {
        values.push(i);
      }

      // save off values in case of startingOn or between
      last = { n: name, x: every, c: curName.length, m: max };
    }

    values = applyMin ? [min] : applyMax ? [max] : values;
    const { length } = values;
    for (i = 0; i < length; i += 1) {
      const value = values[i];
      if (!curName.includes(value)) {
        curName.push(value);
      }
    }

    // reset the built up state
    values = every = modifier = applyMin = applyMax = 0;
  }

  return {
    /**
     * Set of constraints that must be met for an occurrence to be valid.
     *
     * @api public
     */
    schedules,

    /**
     * Set of exceptions that must not be met for an occurrence to be
     * valid.
     *
     * @api public
     */
    exceptions,

    /**
     * Specifies the specific instances of a time period that are valid.
     * Must be followed by the desired time period (minute(), hour(),
     * etc). For example, to specify a schedule for the 5th and 25th
     * minute of every hour:
     *
     * recur().on(5, 25).minute();
     *
     * @param {Int} args: One or more valid instances
     * @api public
     */
    on() {
      values = Array.isArray(arguments[0]) ? arguments[0] : arguments;
      return this;
    },

    /**
     * Specifies the recurring interval of a time period that are valid.
     * Must be followed by the desired time period (minute(), hour(),
     * etc). For example, to specify a schedule for every 4 hours in the
     * day:
     *
     * recur().every(4).hour();
     *
     * @param {Int} x: Recurring interval
     * @api public
     */
    every(x) {
      every = x || 1;
      return this;
    },

    /**
     * Specifies the minimum valid value.  For example, to specify a schedule
     * that is valid for all hours after four:
     *
     * recur().after(4).hour();
     *
     * @param {Int} x: Recurring interval
     * @api public
     */
    after(x) {
      modifier = 'a';
      values = [x];
      return this;
    },

    /**
     * Specifies the maximum valid value.  For example, to specify a schedule
     * that is valid for all hours before four:
     *
     * recur().before(4).hour();
     *
     * @param {Int} x: Recurring interval
     * @api public
     */
    before(x) {
      modifier = 'b';
      values = [x];
      return this;
    },

    /**
     * Specifies that the first instance of a time period is valid. Must
     * be followed by the desired time period (minute(), hour(), etc).
     * For example, to specify a schedule for the first day of every
     * month:
     *
     * recur().first().dayOfMonth();
     *
     * @api public
     */
    first() {
      applyMin = 1;
      return this;
    },

    /**
     * Specifies that the last instance of a time period is valid. Must
     * be followed by the desired time period (minute(), hour(), etc).
     * For example, to specify a schedule for the last day of every year:
     *
     * recur().last().dayOfYear();
     *
     * @api public
     */
    last() {
      applyMax = 1;
      return this;
    },

    /**
     * Specifies a specific time that is valid. Time must be specified in
     * hh:mm:ss format using 24 hour time. For example, to specify
     * a schedule for 8:30 pm every day:
     *
     * recur().time('20:30:00');
     *
     * @param {String} time: Time in hh:mm:ss 24-hour format
     * @api public
     */
    time() {
      // values = arguments;
      for (let i = 0, { length } = values; i < length; i++) {
        const split = values[i].split(':');
        if (split.length < 3) split.push(0);
        values[i] =
          Number(split[0]) * 3600 + Number(split[1]) * 60 + Number(split[2]);
      }

      add('t');
      return this;
    },

    /**
     * Seconds time period, denotes seconds within each minute.
     * Minimum value is 0, maximum value is 59. Specify 59 for last.
     *
     * recur().on(5, 15, 25).second();
     *
     * @api public
     */
    second() {
      add('s', 0, 59);
      return this;
    },

    /**
     * Minutes time period, denotes minutes within each hour.
     * Minimum value is 0, maximum value is 59. Specify 59 for last.
     *
     * recur().on(5, 15, 25).minute();
     *
     * @api public
     */
    minute() {
      add('m', 0, 59);
      return this;
    },

    /**
     * Hours time period, denotes hours within each day.
     * Minimum value is 0, maximum value is 23. Specify 23 for last.
     *
     * recur().on(5, 15, 25).hour();
     *
     * @api public
     */
    hour() {
      add('h', 0, 23);
      return this;
    },

    /**
     * Days of month time period, denotes number of days within a month.
     * Minimum value is 1, maximum value is 31.  Specify 0 for last.
     *
     * recur().every(2).dayOfMonth();
     *
     * @api public
     */
    dayOfMonth() {
      add('D', 1, applyMax ? 0 : 31);
      return this;
    },

    /**
     * Days of week time period, denotes the days within a week.
     * Minimum value is 1, maximum value is 7.  Specify 0 for last.
     * 1 - Sunday
     * 2 - Monday
     * 3 - Tuesday
     * 4 - Wednesday
     * 5 - Thursday
     * 6 - Friday
     * 7 - Saturday
     *
     * recur().on(1).dayOfWeek();
     *
     * @api public
     */
    dayOfWeek() {
      add('d', 1, 7);
      return this;
    },

    /**
     * Short hand for on(1,7).dayOfWeek()
     *
     * @api public
     */
    onWeekend() {
      values = [1, 7];
      return this.dayOfWeek();
    },

    /**
     * Short hand for on(2,3,4,5,6).dayOfWeek()
     *
     * @api public
     */
    onWeekday() {
      values = [2, 3, 4, 5, 6];
      return this.dayOfWeek();
    },

    /**
     * Days of week count time period, denotes the number of times a
     * particular day has occurred within a month.  Used to specify
     * things like second Tuesday, or third Friday in a month.
     * Minimum value is 1, maximum value is 5.  Specify 0 for last.
     * 1 - First occurrence
     * 2 - Second occurrence
     * 3 - Third occurrence
     * 4 - Fourth occurrence
     * 5 - Fifth occurrence
     * 0 - Last occurrence
     *
     * recur().on(1).dayOfWeek().on(1).dayOfWeekCount();
     *
     * @api public
     */
    dayOfWeekCount() {
      add('dc', 1, applyMax ? 0 : 5);
      return this;
    },

    /**
     * Days of year time period, denotes number of days within a year.
     * Minimum value is 1, maximum value is 366.  Specify 0 for last.
     *
     * recur().every(2).dayOfYear();
     *
     * @api public
     */
    dayOfYear() {
      add('dy', 1, applyMax ? 0 : 366);
      return this;
    },

    /**
     * Weeks of month time period, denotes number of weeks within a
     * month. The first week is the week that includes the 1st of the
     * month. Subsequent weeks start on Sunday.
     * Minimum value is 1, maximum value is 5.  Specify 0 for last.
     * February 2nd,  2012 - Week 1
     * February 5th,  2012 - Week 2
     * February 12th, 2012 - Week 3
     * February 19th, 2012 - Week 4
     * February 26th, 2012 - Week 5 (or 0)
     *
     * recur().on(2).weekOfMonth();
     *
     * @api public
     */
    weekOfMonth() {
      add('wm', 1, applyMax ? 0 : 5);
      return this;
    },

    /**
     * Weeks of year time period, denotes the ISO 8601 week date. For
     * more information see: http://en.wikipedia.org/wiki/ISO_week_date.
     * Minimum value is 1, maximum value is 53.  Specify 0 for last.
     *
     * recur().every(2).weekOfYear();
     *
     * @api public
     */
    weekOfYear() {
      add('wy', 1, applyMax ? 0 : 53);
      return this;
    },

    /**
     * Month time period, denotes the months within a year.
     * Minimum value is 1, maximum value is 12.  Specify 0 for last.
     * 1 - January
     * 2 - February
     * 3 - March
     * 4 - April
     * 5 - May
     * 6 - June
     * 7 - July
     * 8 - August
     * 9 - September
     * 10 - October
     * 11 - November
     * 12 - December
     *
     * recur().on(1).dayOfWeek();
     *
     * @api public
     */
    month() {
      add('M', 1, 12);
      return this;
    },

    /**
     * Year time period, denotes the four digit year.
     * Minimum value is 1970, maximum value is Jan 1, 2100 (arbitrary)
     *
     * recur().on(2011, 2012, 2013).year();
     *
     * @api public
     */
    year() {
      add('Y', 1970, 2450);
      return this;
    },

    /**
     * Full date period, denotes a full date and time.
     * Minimum value is Jan 1, 1970, maximum value is Jan 1, 2100 (arbitrary)
     *
     * recur().on(new Date(2013, 3, 2, 10, 30, 0)).fullDate();
     *
     * @api public
     */
    fullDate() {
      for (let i = 0, { length } = values; i < length; i++) {
        values[i] = values[i].getTime();
      }

      add('fd');
      return this;
    },

    /**
     * Custom modifier.
     *
     * recur().on(2011, 2012, 2013).custom('partOfDay');
     *
     * @api public
     */
    customModifier(id, vals) {
      const custom = later.modifier[id];
      if (!custom)
        throw new Error('Custom modifier ' + id + ' not recognized!');

      modifier = id;
      values = Array.isArray(vals) ? vals : [vals];
      return this;
    },

    /**
     * Custom time period.
     *
     * recur().on(2011, 2012, 2013).customPeriod('partOfDay');
     *
     * @api public
     */
    customPeriod(id) {
      const custom = later[id];
      if (!custom)
        throw new Error('Custom time period ' + id + ' not recognized!');

      add(id, custom.extent(new Date())[0], custom.extent(new Date())[1]);
      return this;
    },

    /**
     * Modifies a recurring interval (specified using every) to start
     * at a given offset.  To create a schedule for every 5 minutes
     * starting on the 6th minute - making minutes 6, 11, 16, etc valid:
     *
     * recur().every(5).minute().startingOn(6);
     *
     * @param {Int} start: The desired starting offset
     * @api public
     */
    startingOn(start) {
      return this.between(start, last.m);
    },

    /**
     * Modifies a recurring interval (specified using every) to start
     * and stop at specified times.  To create a schedule for every
     * 5 minutes starting on the 6th minute and ending on the 11th
     * minute - making minutes 6 and 11 valid:
     *
     * recur().every(5).minute().between(6, 11);
     *
     * @param {Int} start: The desired starting offset
     * @param {Int} end: The last valid value
     * @api public
     */
    between(start, end) {
      // remove the values added as part of specifying the last
      // time period and replace them with the new restricted values
      cur[last.n] = cur[last.n].splice(0, last.c);
      every = last.x;
      add(last.n, start, end);
      return this;
    },

    /**
     * Creates a composite schedule.  With a composite schedule, a valid
     * occurrence of any of the component schedules is considered a valid
     * value for the composite schedule (e.g. they are OR'ed together).
     * To create a schedule for every 5 minutes on Mondays and every 10
     * minutes on Tuesdays:
     *
     * recur().every(5).minutes().on(1).dayOfWeek().and().every(10)
     *    .minutes().on(2).dayOfWeek();
     *
     * @api public
     */
    and() {
      cur = curArray[curArray.push({}) - 1];
      return this;
    },

    /**
     * Creates exceptions to a schedule. Any valid occurrence of the
     * exception schedule (which may also be composite schedules) is
     * considered a invalid schedule occurrence. Everything that follows
     * except will be treated as an exception schedule.  To create a
     * schedule for 8:00 am every Tuesday except for patch Tuesday
     * (second Tuesday each month):
     *
     * recur().at('08:00:00').on(2).dayOfWeek().except()
     *    .dayOfWeekCount(1);
     *
     * @api public
     */
    except() {
      curArray = exceptions;
      cur = null;
      return this;
    }
  };
};

/**
 * Parses an English string expression and produces a schedule that is
 * compatible with Later.js.
 *
 * Examples:
 *
 * every 5 minutes between the 1st and 30th minute
 * at 10:00 am on tues of may in 2012
 * on the 15-20th day of march-dec
 * every 20 seconds every 5 minutes every 4 hours between the 10th and 20th hour
 */
later.parse.text = function (string) {
  const { recur } = later.parse;
  let pos = 0;
  let input = '';
  let error;

  // Regex expressions for all of the valid tokens
  const TOKENTYPES = {
    eof: /^$/,
    rank: /^((\d+)(st|nd|rd|th)?)\b/,
    time: /^(((0?[1-9]|1[0-2]):[0-5]\d(\s)?(am|pm))|((0?\d|1\d|2[0-3]):[0-5]\d))\b/,
    dayName: /^((sun|mon|tue(s)?|wed(nes)?|thu(r(s)?)?|fri|sat(ur)?)(day)?)\b/,
    monthName: /^(jan(uary)?|feb(ruary)?|ma((r(ch)?)?|y)|apr(il)?|ju(ly|ne)|aug(ust)?|oct(ober)?|(sept|nov|dec)(ember)?)\b/,
    yearIndex: /^(\d{4})\b/,
    every: /^every\b/,
    after: /^after\b/,
    before: /^before\b/,
    second: /^(s|sec(ond)?(s)?)\b/,
    minute: /^(m|min(ute)?(s)?)\b/,
    hour: /^(h|hour(s)?)\b/,
    day: /^(day(s)?( of the month)?)\b/,
    dayInstance: /^day instance\b/,
    dayOfWeek: /^day(s)? of the week\b/,
    dayOfYear: /^day(s)? of the year\b/,
    weekOfYear: /^week(s)?( of the year)?\b/,
    weekOfMonth: /^week(s)? of the month\b/,
    weekday: /^weekday\b/,
    weekend: /^weekend\b/,
    month: /^month(s)?\b/,
    year: /^year(s)?\b/,
    between: /^between (the)?\b/,
    start: /^(start(ing)? (at|on( the)?)?)\b/,
    at: /^(at|@)\b/,
    and: /^(,|and\b)/,
    except: /^(except\b)/,
    also: /(also)\b/,
    first: /^(first)\b/,
    last: /^last\b/,
    in: /^in\b/,
    of: /^of\b/,
    onthe: /^on the\b/,
    on: /^on\b/,
    through: /(-|^(to|through)\b)/
  };

  // Array to convert string names to valid numerical values
  const NAMES = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
    sun: 1,
    mon: 2,
    tue: 3,
    wed: 4,
    thu: 5,
    fri: 6,
    sat: 7,
    '1st': 1,
    fir: 1,
    '2nd': 2,
    sec: 2,
    '3rd': 3,
    thi: 3,
    '4th': 4,
    for: 4
  };

  /**
   * Bundles up the results of the peek operation into a token.
   *
   * @param {Int} start: The start position of the token
   * @param {Int} end: The end position of the token
   * @param {String} text: The actual text that was parsed
   * @param {TokenType} type: The TokenType of the token
   */
  function t(start, end, text, type) {
    return { startPos: start, endPos: end, text, type };
  }

  /**
   * Peeks forward to see if the next token is the expected token and
   * returns the token if found.  Pos is not moved during a Peek operation.
   *
   * @param {TokenType} exepected: The types of token to scan for
   */
  function peek(expected) {
    const scanTokens = Array.isArray(expected) ? expected : [expected];
    const whiteSpace = /\s+/;
    let token;
    let curInput;
    let m;
    let scanToken;
    let start;
    let length_;

    scanTokens.push(whiteSpace);

    // loop past any skipped tokens and only look for expected tokens
    start = pos;
    while (!token || token.type === whiteSpace) {
      length_ = -1;
      curInput = input.slice(Math.max(0, start));
      token = t(start, start, input.split(whiteSpace)[0]);

      let i;
      const { length } = scanTokens;
      for (i = 0; i < length; i++) {
        scanToken = scanTokens[i];
        m = scanToken.exec(curInput);
        if (m && m.index === 0 && m[0].length > length_) {
          length_ = m[0].length;
          token = t(
            start,
            start + length_,
            curInput.slice(0, Math.max(0, length_)),
            scanToken
          );
        }
      }

      // update the start position if this token should be skipped
      if (token.type === whiteSpace) {
        start = token.endPos;
      }
    }

    return token;
  }

  /**
   * Moves pos to the end of the expectedToken if it is found.
   *
   * @param {TokenType} exepectedToken: The types of token to scan for
   */
  function scan(expectedToken) {
    const token = peek(expectedToken);
    pos = token.endPos;
    return token;
  }

  /**
   * Parses the next 'y-z' expression and returns the resulting valid
   * value array.
   *
   * @param {TokenType} tokenType: The type of range values allowed
   */
  function parseThroughExpr(tokenType) {
    const start = Number(parseTokenValue(tokenType));
    const end = checkAndParse(TOKENTYPES.through)
      ? Number(parseTokenValue(tokenType))
      : start;
    const nums = [];

    for (let i = start; i <= end; i++) {
      nums.push(i);
    }

    return nums;
  }

  /**
   * Parses the next 'x,y-z' expression and returns the resulting valid
   * value array.
   *
   * @param {TokenType} tokenType: The type of range values allowed
   */
  function parseRanges(tokenType) {
    let nums = parseThroughExpr(tokenType);
    while (checkAndParse(TOKENTYPES.and)) {
      nums = nums.concat(parseThroughExpr(tokenType));
    }

    return nums;
  }

  /**
   * Parses the next 'every (weekend|weekday|x) (starting on|between)' expression.
   *
   * @param {Recur} r: The recurrence to add the expression to
   */
  function parseEvery(r) {
    let number;
    let period;
    let start;
    let end;

    if (checkAndParse(TOKENTYPES.weekend)) {
      r.on(NAMES.sun, NAMES.sat).dayOfWeek();
    } else if (checkAndParse(TOKENTYPES.weekday)) {
      r.on(NAMES.mon, NAMES.tue, NAMES.wed, NAMES.thu, NAMES.fri).dayOfWeek();
    } else {
      number = parseTokenValue(TOKENTYPES.rank);
      r.every((value) => number(value));
      period = parseTimePeriod(r);

      if (checkAndParse(TOKENTYPES.start)) {
        number = parseTokenValue(TOKENTYPES.rank);
        r.startingOn(number);
        parseToken(period.type);
      } else if (checkAndParse(TOKENTYPES.between)) {
        start = parseTokenValue(TOKENTYPES.rank);
        if (checkAndParse(TOKENTYPES.and)) {
          end = parseTokenValue(TOKENTYPES.rank);
          r.between(start, end);
        }
      }
    }
  }

  /**
   * Parses the next 'on the (first|last|x,y-z)' expression.
   *
   * @param {Recur} r: The recurrence to add the expression to
   */
  function parseOnThe(r) {
    if (checkAndParse(TOKENTYPES.first)) {
      r.first();
    } else if (checkAndParse(TOKENTYPES.last)) {
      r.last();
    } else {
      r.on(parseRanges(TOKENTYPES.rank));
    }

    parseTimePeriod(r);
  }

  /**
   * Parses the schedule expression and returns the resulting schedules,
   * and exceptions.  Error will return the position in the string where
   * an error occurred, will be null if no errors were found in the
   * expression.
   *
   * @param {String} str: The schedule expression to parse
   */
  function parseScheduleExpr(string_) {
    pos = 0;
    input = string_;
    error = -1;

    const r = recur();
    while (pos < input.length && error < 0) {
      const token = parseToken([
        TOKENTYPES.every,
        TOKENTYPES.after,
        TOKENTYPES.before,
        TOKENTYPES.onthe,
        TOKENTYPES.on,
        TOKENTYPES.of,
        TOKENTYPES.in,
        TOKENTYPES.at,
        TOKENTYPES.and,
        TOKENTYPES.except,
        TOKENTYPES.also
      ]);

      switch (token.type) {
        case TOKENTYPES.every:
          parseEvery(r);
          break;
        case TOKENTYPES.after:
          if (peek(TOKENTYPES.time).type === undefined) {
            r.after(parseTokenValue(TOKENTYPES.rank));
            parseTimePeriod(r);
          } else {
            r.after(parseTokenValue(TOKENTYPES.time));
            r.time();
          }

          break;
        case TOKENTYPES.before:
          if (peek(TOKENTYPES.time).type === undefined) {
            r.before(parseTokenValue(TOKENTYPES.rank));
            parseTimePeriod(r);
          } else {
            r.before(parseTokenValue(TOKENTYPES.time));
            r.time();
          }

          break;
        case TOKENTYPES.onthe:
          parseOnThe(r);
          break;
        case TOKENTYPES.on:
          r.on(parseRanges(TOKENTYPES.dayName)).dayOfWeek();
          break;
        case TOKENTYPES.of:
          r.on(parseRanges(TOKENTYPES.monthName)).month();
          break;
        case TOKENTYPES.in:
          r.on(parseRanges(TOKENTYPES.yearIndex)).year();
          break;
        case TOKENTYPES.at:
          r.on(parseTokenValue(TOKENTYPES.time)).time();
          while (checkAndParse(TOKENTYPES.and)) {
            r.on(parseTokenValue(TOKENTYPES.time)).time();
          }

          break;
        case TOKENTYPES.and:
          break;
        case TOKENTYPES.also:
          r.and();
          break;
        case TOKENTYPES.except:
          r.except();
          break;
        default:
          error = pos;
      }
    }

    return { schedules: r.schedules, exceptions: r.exceptions, error };
  }

  /**
   * Parses the next token representing a time period and adds it to
   * the provided recur object.
   *
   * @param {Recur} r: The recurrence to add the time period to
   */
  function parseTimePeriod(r) {
    const timePeriod = parseToken([
      TOKENTYPES.second,
      TOKENTYPES.minute,
      TOKENTYPES.hour,
      TOKENTYPES.dayOfYear,
      TOKENTYPES.dayOfWeek,
      TOKENTYPES.dayInstance,
      TOKENTYPES.day,
      TOKENTYPES.month,
      TOKENTYPES.year,
      TOKENTYPES.weekOfMonth,
      TOKENTYPES.weekOfYear
    ]);

    switch (timePeriod.type) {
      case TOKENTYPES.second:
        r.second();
        break;
      case TOKENTYPES.minute:
        r.minute();
        break;
      case TOKENTYPES.hour:
        r.hour();
        break;
      case TOKENTYPES.dayOfYear:
        r.dayOfYear();
        break;
      case TOKENTYPES.dayOfWeek:
        r.dayOfWeek();
        break;
      case TOKENTYPES.dayInstance:
        r.dayOfWeekCount();
        break;
      case TOKENTYPES.day:
        r.dayOfMonth();
        break;
      case TOKENTYPES.weekOfMonth:
        r.weekOfMonth();
        break;
      case TOKENTYPES.weekOfYear:
        r.weekOfYear();
        break;
      case TOKENTYPES.month:
        r.month();
        break;
      case TOKENTYPES.year:
        r.year();
        break;
      default:
        error = pos;
    }

    return timePeriod;
  }

  /**
   * Checks the next token to see if it is of tokenType. Returns true if
   * it is and discards the token.  Returns false otherwise.
   *
   * @param {TokenType} tokenType: The type or types of token to parse
   */
  function checkAndParse(tokenType) {
    const found = peek(tokenType).type === tokenType;
    if (found) {
      scan(tokenType);
    }

    return found;
  }

  /**
   * Parses and returns the next token.
   *
   * @param {TokenType} tokenType: The type or types of token to parse
   */
  function parseToken(tokenType) {
    const t = scan(tokenType);
    if (t.type) {
      t.text = convertString(t.text, tokenType);
    } else {
      error = pos;
    }

    return t;
  }

  /**
   * Returns the text value of the token that was parsed.
   *
   * @param {TokenType} tokenType: The type of token to parse
   */
  function parseTokenValue(tokenType) {
    return parseToken(tokenType).text;
  }

  /**
   * Converts a string value to a numerical value based on the type of
   * token that was parsed.
   *
   * @param {String} str: The schedule string to parse
   * @param {TokenType} tokenType: The type of token to convert
   */
  function convertString(string_, tokenType) {
    let output = string_;

    switch (tokenType) {
      case TOKENTYPES.time:
        // <https://github.com/bunkat/later/pull/188>
        const parts = string_.split(/(:|am|pm)/);
        let hour = Number.parseInt(parts[0], 10);
        const min = parts[2].trim();
        if (parts[3] === 'pm' && hour < 12) {
          hour += 12;
        } else if (parts[3] === 'am' && hour === 12) {
          hour -= 12;
        }

        hour = String(hour);
        output = (hour.length === 1 ? '0' : '') + hour + ':' + min;
        break;

      case TOKENTYPES.rank:
        output = Number.parseInt(/^\d+/.exec(string_)[0], 10);
        break;

      case TOKENTYPES.monthName:
      case TOKENTYPES.dayName:
        output = NAMES[string_.slice(0, 3)];
        break;
      default:
    }

    return output;
  }

  return parseScheduleExpr(string.toLowerCase());
};

module.exports = later;
