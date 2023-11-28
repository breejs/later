const pkg = require('../package.json');

const later = {
  version: pkg.version
};

later.array = {};
later.array.sort = function (array, zeroIsLast) {
  array.sort(function (a, b) {
    return Number(a) - Number(b);
  });
  if (zeroIsLast && array[0] === 0) {
    array.push(array.shift());
  }
};

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

later.day = later.D = {
  name: 'day',
  range: 86400,
  val(d) {
    return d.D || (d.D = later.date.getDate.call(d));
  },
  isValid(d, value) {
    return later.D.val(d) === (value || later.D.extent(d)[1]);
  },
  extent(d) {
    if (d.DExtent) return d.DExtent;
    const month = later.M.val(d);
    let max = later.DAYS_IN_MONTH[month - 1];
    if (month === 2 && later.dy.extent(d)[1] === 366) {
      max += 1;
    }

    return (d.DExtent = [1, max]);
  },
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
  end(d) {
    return (
      d.DEnd ||
      (d.DEnd = later.date.prev(later.Y.val(d), later.M.val(d), later.D.val(d)))
    );
  },
  next(d, value) {
    value = value > later.D.extent(d)[1] ? 1 : value;
    const month = later.date.nextRollover(d, value, later.D, later.M);
    const DMax = later.D.extent(month)[1];
    value = value > DMax ? 1 : value || DMax;
    return later.date.next(later.Y.val(month), later.M.val(month), value);
  },
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
later.dayOfWeekCount = later.dc = {
  name: 'day of week count',
  range: 604800,
  val(d) {
    return d.dc || (d.dc = Math.floor((later.D.val(d) - 1) / 7) + 1);
  },
  isValid(d, value) {
    return (
      later.dc.val(d) === value ||
      (value === 0 && later.D.val(d) > later.D.extent(d)[1] - 7)
    );
  },
  extent(d) {
    return (
      d.dcExtent || (d.dcExtent = [1, Math.ceil(later.D.extent(d)[1] / 7)])
    );
  },
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
later.dayOfWeek = later.dw = later.d = {
  name: 'day of week',
  range: 86400,
  val(d) {
    return d.dw || (d.dw = later.date.getDay.call(d) + 1);
  },
  isValid(d, value) {
    return later.dw.val(d) === (value || 7);
  },
  extent() {
    return [1, 7];
  },
  start(d) {
    return later.D.start(d);
  },
  end(d) {
    return later.D.end(d);
  },
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
later.dayOfYear = later.dy = {
  name: 'day of year',
  range: 86400,
  val(d) {
    return (
      d.dy ||
      (d.dy = Math.ceil(
        1 +
          (later.D.start(d).getTime() - later.Y.start(d).getTime()) / later.DAY
      ))
    );
  },
  isValid(d, value) {
    return later.dy.val(d) === (value || later.dy.extent(d)[1]);
  },
  extent(d) {
    const year = later.Y.val(d);
    return d.dyExtent || (d.dyExtent = [1, year % 4 ? 365 : 366]);
  },
  start(d) {
    return later.D.start(d);
  },
  end(d) {
    return later.D.end(d);
  },
  next(d, value) {
    value = value > later.dy.extent(d)[1] ? 1 : value;
    const year = later.date.nextRollover(d, value, later.dy, later.Y);
    const dyMax = later.dy.extent(year)[1];
    value = value > dyMax ? 1 : value || dyMax;
    return later.date.next(later.Y.val(year), later.M.val(year), value);
  },
  prev(d, value) {
    const year = later.date.prevRollover(d, value, later.dy, later.Y);
    const dyMax = later.dy.extent(year)[1];
    value = value > dyMax ? dyMax : value || dyMax;
    return later.date.prev(later.Y.val(year), later.M.val(year), value);
  }
};
later.hour = later.h = {
  name: 'hour',
  range: 3600,
  val(d) {
    return d.h || (d.h = later.date.getHour.call(d));
  },
  isValid(d, value) {
    return later.h.val(d) === value;
  },
  extent() {
    return [0, 23];
  },
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
  next(d, value) {
    value = value > 23 ? 0 : value;
    let next = later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (value <= later.h.val(d) ? 1 : 0),
      value
    );
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
later.minute = later.m = {
  name: 'minute',
  range: 60,
  val(d) {
    return d.m || (d.m = later.date.getMin.call(d));
  },
  isValid(d, value) {
    return later.m.val(d) === value;
  },
  extent(d) {
    return [0, 59];
  },
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
  next(d, value) {
    const m = later.m.val(d);
    const s = later.s.val(d);
    const inc = value > 59 ? 60 - m : value <= m ? 60 - m + value : value - m;
    let next = new Date(d.getTime() + inc * later.MIN - s * later.SEC);
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 120) * later.MIN - s * later.SEC);
    }

    return next;
  },
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
later.month = later.M = {
  name: 'month',
  range: 2629740,
  val(d) {
    return d.M || (d.M = later.date.getMonth.call(d) + 1);
  },
  isValid(d, value) {
    return later.M.val(d) === (value || 12);
  },
  extent() {
    return [1, 12];
  },
  start(d) {
    return (
      d.MStart || (d.MStart = later.date.next(later.Y.val(d), later.M.val(d)))
    );
  },
  end(d) {
    return d.MEnd || (d.MEnd = later.date.prev(later.Y.val(d), later.M.val(d)));
  },
  next(d, value) {
    value = value > 12 ? 1 : value || 12;
    return later.date.next(
      later.Y.val(d) + (value > later.M.val(d) ? 0 : 1),
      value
    );
  },
  prev(d, value) {
    value = value > 12 ? 12 : value || 12;
    return later.date.prev(
      later.Y.val(d) - (value >= later.M.val(d) ? 1 : 0),
      value
    );
  }
};
later.second = later.s = {
  name: 'second',
  range: 1,
  val(d) {
    return d.s || (d.s = later.date.getSec.call(d));
  },
  isValid(d, value) {
    return later.s.val(d) === value;
  },
  extent() {
    return [0, 59];
  },
  start(d) {
    return d;
  },
  end(d) {
    return d;
  },
  next(d, value) {
    const s = later.s.val(d);
    const inc = value > 59 ? 60 - s : value <= s ? 60 - s + value : value - s;
    let next = new Date(d.getTime() + inc * later.SEC);
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 7200) * later.SEC);
    }

    return next;
  },
  prev(d, value, cache) {
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
later.time = later.t = {
  name: 'time',
  range: 1,
  val(d) {
    return (
      d.t ||
      (d.t = later.h.val(d) * 3600 + later.m.val(d) * 60 + later.s.val(d))
    );
  },
  isValid(d, value) {
    return later.t.val(d) === value;
  },
  extent() {
    return [0, 86399];
  },
  start(d) {
    return d;
  },
  end(d) {
    return d;
  },
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
later.weekOfMonth = later.wm = {
  name: 'week of month',
  range: 604800,
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
  isValid(d, value) {
    return later.wm.val(d) === (value || later.wm.extent(d)[1]);
  },
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
  next(d, value) {
    value = value > later.wm.extent(d)[1] ? 1 : value;
    const month = later.date.nextRollover(d, value, later.wm, later.M);
    const wmMax = later.wm.extent(month)[1];
    value = value > wmMax ? 1 : value || wmMax;
    return later.date.next(
      later.Y.val(month),
      later.M.val(month),
      Math.max(1, (value - 1) * 7 - (later.dw.val(month) - 2))
    );
  },
  prev(d, value) {
    const month = later.date.prevRollover(d, value, later.wm, later.M);
    const wmMax = later.wm.extent(month)[1];
    value = value > wmMax ? wmMax : value || wmMax;
    return later.wm.end(
      later.date.next(
        later.Y.val(month),
        later.M.val(month),
        Math.max(1, (value - 1) * 7 - (later.dw.val(month) - 2))
      )
    );
  }
};
later.weekOfYear = later.wy = {
  name: 'week of year (ISO)',
  range: 604800,
  val(d) {
    if (d.wy) return d.wy;
    const wThur = later.dw.next(later.wy.start(d), 5);
    const YThur = later.dw.next(later.Y.prev(wThur, later.Y.val(wThur) - 1), 5);
    return (d.wy =
      1 + Math.ceil((wThur.getTime() - YThur.getTime()) / later.WEEK));
  },
  isValid(d, value) {
    return later.wy.val(d) === (value || later.wy.extent(d)[1]);
  },
  extent(d) {
    if (d.wyExtent) return d.wyExtent;
    const year = later.dw.next(later.wy.start(d), 5);
    const dwFirst = later.dw.val(later.Y.start(year));
    const dwLast = later.dw.val(later.Y.end(year));
    return (d.wyExtent = [1, dwFirst === 5 || dwLast === 5 ? 53 : 52]);
  },
  start(d) {
    return (
      d.wyStart ||
      (d.wyStart = later.date.next(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d) - (later.dw.val(d) > 1 ? later.dw.val(d) - 2 : 6)
      ))
    );
  },
  end(d) {
    return (
      d.wyEnd ||
      (d.wyEnd = later.date.prev(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d) + (later.dw.val(d) > 1 ? 8 - later.dw.val(d) : 0)
      ))
    );
  },
  next(d, value) {
    value = value > later.wy.extent(d)[1] ? 1 : value;
    const wyThur = later.dw.next(later.wy.start(d), 5);
    let year = later.date.nextRollover(wyThur, value, later.wy, later.Y);
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
  prev(d, value) {
    const wyThur = later.dw.next(later.wy.start(d), 5);
    let year = later.date.prevRollover(wyThur, value, later.wy, later.Y);
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
later.year = later.Y = {
  name: 'year',
  range: 31556900,
  val(d) {
    return d.Y || (d.Y = later.date.getYear.call(d));
  },
  isValid(d, value) {
    return later.Y.val(d) === value;
  },
  extent() {
    return [1970, 2099];
  },
  start(d) {
    return d.YStart || (d.YStart = later.date.next(later.Y.val(d)));
  },
  end(d) {
    return d.YEnd || (d.YEnd = later.date.prev(later.Y.val(d)));
  },
  next(d, value) {
    return value > later.Y.val(d) && value <= later.Y.extent()[1]
      ? later.date.next(value)
      : later.NEVER;
  },
  prev(d, value) {
    return value < later.Y.val(d) && value >= later.Y.extent()[0]
      ? later.date.prev(value)
      : later.NEVER;
  }
};
later.fullDate = later.fd = {
  name: 'full date',
  range: 1,
  val(d) {
    return d.fd || (d.fd = d.getTime());
  },
  isValid(d, value) {
    return later.fd.val(d) === value;
  },
  extent() {
    return [0, 3250368e7];
  },
  start(d) {
    return d;
  },
  end(d) {
    return d;
  },
  next(d, value) {
    return later.fd.val(d) < value ? new Date(value) : later.NEVER;
  },
  prev(d, value) {
    return later.fd.val(d) > value ? new Date(value) : later.NEVER;
  }
};
later.modifier = {};
later.modifier.after = later.modifier.a = function (constraint, values) {
  const value = values[0];
  return {
    name: 'after ' + constraint.name,
    range: (constraint.extent(new Date())[1] - value) * constraint.range,
    val: constraint.val,
    isValid(d, value_) {
      return this.val(d) >= value;
    },
    extent: constraint.extent,
    start: constraint.start,
    end: constraint.end,
    next(startDate, value_) {
      if (value_ != value) value_ = constraint.extent(startDate)[0];
      return constraint.next(startDate, value_);
    },
    prev(startDate, value_) {
      value_ = value_ === value ? constraint.extent(startDate)[1] : value - 1;
      return constraint.prev(startDate, value_);
    }
  };
};

later.modifier.before = later.modifier.b = function (constraint, values) {
  const value = values[values.length - 1];
  return {
    name: 'before ' + constraint.name,
    range: constraint.range * (value - 1),
    val: constraint.val,
    isValid(d, value_) {
      return this.val(d) < value;
    },
    extent: constraint.extent,
    start: constraint.start,
    end: constraint.end,
    next(startDate, value_) {
      value_ = value_ === value ? constraint.extent(startDate)[0] : value;
      return constraint.next(startDate, value_);
    },
    prev(startDate, value_) {
      value_ = value_ === value ? value - 1 : constraint.extent(startDate)[1];
      return constraint.prev(startDate, value_);
    }
  };
};

later.compile = function (schedDef) {
  const constraints = [];
  let constraintsLength = 0;
  let tickConstraint;
  for (const key in schedDef) {
    const nameParts = key.split('_');
    const name = nameParts[0];
    const mod = nameParts[1];
    const vals = schedDef[key];
    const constraint = mod
      ? later.modifier[mod](later[name], vals)
      : later[name];
    constraints.push({
      constraint,
      vals
    });
    constraintsLength++;
  }

  constraints.sort(function (a, b) {
    const ra = a.constraint.range;
    const rb = b.constraint.range;
    return rb < ra ? -1 : rb > ra ? 1 : 0;
  });
  tickConstraint = constraints[constraintsLength - 1].constraint;
  function compareFn(dir) {
    return dir === 'next'
      ? function (a, b) {
          if (!a || !b) return true;
          return a.getTime() > b.getTime();
        }
      : function (a, b) {
          if (!a || !b) return true;
          return b.getTime() > a.getTime();
        };
  }

  return {
    start(dir, startDate) {
      let next = startDate;
      const nextValue = later.array[dir];
      let maxAttempts = 1e3;
      let done;
      while (maxAttempts-- && !done && next) {
        done = true;
        for (let i = 0; i < constraintsLength; i++) {
          const { constraint } = constraints[i];
          const curValue = constraint.val(next);
          const extent = constraint.extent(next);
          const newValue = nextValue(curValue, constraints[i].vals, extent);
          if (!constraint.isValid(next, newValue)) {
            next = constraint[dir](next, newValue);
            done = false;
            break;
          }
        }
      }

      if (next !== later.NEVER) {
        next =
          dir === 'next'
            ? tickConstraint.start(next)
            : tickConstraint.end(next);
      }

      return next;
    },
    end(dir, startDate) {
      let result;
      const nextValue = later.array[dir + 'Invalid'];
      const compare = compareFn(dir);
      for (let i = constraintsLength - 1; i >= 0; i--) {
        const { constraint } = constraints[i];
        const curValue = constraint.val(startDate);
        const extent = constraint.extent(startDate);
        const newValue = nextValue(curValue, constraints[i].vals, extent);
        var next;
        if (newValue !== undefined) {
          next = constraint[dir](startDate, newValue);
          if (next && (!result || compare(result, next))) {
            result = next;
          }
        }
      }

      return result;
    },
    tick(dir, date) {
      return new Date(
        dir === 'next'
          ? tickConstraint.end(date).getTime() + later.SEC
          : tickConstraint.start(date).getTime() - later.SEC
      );
    },
    tickStart(date) {
      return tickConstraint.start(date);
    }
  };
};

later.schedule = function (sched) {
  if (!sched) throw new Error('Missing schedule definition.');
  if (!sched.schedules)
    throw new Error('Definition must include at least one schedule.');
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

  function getInstances(dir, count, startDate, endDate, isRange) {
    const compare = compareFn(dir);
    let loopCount = count;
    let maxAttempts = 1e3;
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
    setNextStarts(dir, schedules, schedStarts, startDate);
    setRangeStarts(dir, exceptions, exceptStarts, startDate);
    while (
      maxAttempts-- &&
      loopCount &&
      (next = findNext(schedStarts, compare))
    ) {
      if (endDate && compare(next, endDate)) {
        break;
      }

      if (exceptionsLength) {
        updateRangeStarts(dir, exceptions, exceptStarts, next);
        if ((end = calcRangeOverlap(dir, exceptStarts, next))) {
          updateNextStarts(dir, schedules, schedStarts, end);
          continue;
        }
      }

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
        if (lastResult && r[rStart].getTime() === lastResult[rEnd].getTime()) {
          lastResult[rEnd] = r[rEnd];
          loopCount++;
        } else {
          lastResult = r;
          results.push(lastResult);
        }

        if (!end) break;
        updateNextStarts(dir, schedules, schedStarts, end);
      } else {
        results.push(
          isForward
            ? new Date(Math.max(startDate, next))
            : getStart(schedules, schedStarts, next, endDate)
        );
        tickStarts(dir, schedules, schedStarts, next);
      }

      loopCount--;
    }

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
    if (d instanceof Date && !isNaN(d.valueOf())) {
      return new Date(d);
    }

    return undefined;
  }

  function setNextStarts(dir, schedArray, startsArray, startDate) {
    for (let i = 0, { length } = schedArray; i < length; i++) {
      startsArray[i] = schedArray[i].start(dir, startDate);
    }
  }

  function updateNextStarts(dir, schedArray, startsArray, startDate) {
    const compare = compareFn(dir);
    for (let i = 0, { length } = schedArray; i < length; i++) {
      if (startsArray[i] && !compare(startsArray[i], startDate)) {
        startsArray[i] = schedArray[i].start(dir, startDate);
      }
    }
  }

  function setRangeStarts(dir, schedArray, rangesArray, startDate) {
    const compare = compareFn(dir);
    for (let i = 0, { length } = schedArray; i < length; i++) {
      const nextStart = schedArray[i].start(dir, startDate);
      if (!nextStart) {
        rangesArray[i] = later.NEVER;
      } else {
        rangesArray[i] = [nextStart, schedArray[i].end(dir, nextStart)];
      }
    }
  }

  function updateRangeStarts(dir, schedArray, rangesArray, startDate) {
    const compare = compareFn(dir);
    for (let i = 0, { length } = schedArray; i < length; i++) {
      if (rangesArray[i] && !compare(rangesArray[i][0], startDate)) {
        const nextStart = schedArray[i].start(dir, startDate);
        if (!nextStart) {
          rangesArray[i] = later.NEVER;
        } else {
          rangesArray[i] = [nextStart, schedArray[i].end(dir, nextStart)];
        }
      }
    }
  }

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
        if (!result || compare(range[1], result)) {
          result = range[1];
        }
      }
    }

    return result;
  }

  function calcMaxEndDate(exceptsArray, compare) {
    let result;
    for (let i = 0, { length } = exceptsArray; i < length; i++) {
      if (exceptsArray[i] && (!result || compare(result, exceptsArray[i][0]))) {
        result = exceptsArray[i][0];
      }
    }

    return result;
  }

  function calcEnd(dir, schedArray, startsArray, startDate, maxEndDate) {
    const compare = compareFn(dir);
    let result;
    for (let i = 0, { length } = schedArray; i < length; i++) {
      const start = startsArray[i];
      if (start && start.getTime() === startDate.getTime()) {
        const end = schedArray[i].end(dir, start);
        if (maxEndDate && (!end || compare(end, maxEndDate))) {
          return maxEndDate;
        }

        if (!result || compare(end, result)) {
          result = end;
        }
      }
    }

    return result;
  }

  function compareFn(dir) {
    return dir === 'next'
      ? function (a, b) {
          if (!a || !b) return true;
          return a.getTime() > b.getTime();
        }
      : function (a, b) {
          if (!a || !b) return true;
          return b.getTime() > a.getTime();
        };
  }

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
    isValid(d) {
      return getInstances('next', 1, d, d) !== later.NEVER;
    },
    next(count, startDate, endDate) {
      return getInstances('next', count || 1, startDate, endDate);
    },
    prev(count, startDate, endDate) {
      return getInstances('prev', count || 1, startDate, endDate);
    },
    nextRange(count, startDate, endDate) {
      return getInstances('next', count || 1, startDate, endDate, true);
    },
    prevRange(count, startDate, endDate) {
      return getInstances('prev', count || 1, startDate, endDate, true);
    }
  };
};

later.setTimeout = function (fn, sched, timezone) {
  const s = later.schedule(sched);
  let t;
  if (fn) {
    scheduleTimeout();
  }

  function scheduleTimeout() {
    const date = new Date();
    const now = date.getTime();

    const next = (() => {
      if (!timezone || ['local', 'system'].includes(timezone)) {
        return s.next(2, now);
      }

      const localOffsetMillis = date.getTimezoneOffset() * 6e4;
      const offsetMillis = getOffset(date, timezone);

      // Specified timezone has the same offset as local timezone.
      // ie. America/New_York = America/Nassau = GMT-4
      if (offsetMillis === localOffsetMillis) {
        return s.next(2, now);
      }

      // Offsets differ, adjust current time to match what
      // it should've been for the specified timezone.
      const adjustedNow = new Date(now + localOffsetMillis - offsetMillis);

      return (s.next(2, adjustedNow) || /* istanbul ignore next */ []).map(
        (sched) => {
          // adjust scheduled times to match their intended timezone
          // ie. scheduled = 2021-08-22T11:30:00.000-04:00 => America/New_York
          //     intended  = 2021-08-22T11:30:00.000-05:00 => America/Mexico_City
          return new Date(sched.getTime() + offsetMillis - localOffsetMillis);
        }
      );
    })();

    if (!next[0]) {
      t = undefined;
      return;
    }

    let diff = next[0].getTime() - now;
    if (diff < 1e3) {
      diff = next[1] ? next[1].getTime() - now : 1e3;
    }

    t =
      diff < 2147483647
        ? setTimeout(fn, diff)
        : setTimeout(scheduleTimeout, 2147483647);
  } // scheduleTimeout()

  return {
    isDone() {
      return !t;
    },
    clear() {
      clearTimeout(t);
    }
  };
}; // setTimeout()

later.setInterval = function (fn, sched, timezone) {
  if (!fn) {
    return;
  }

  let t = later.setTimeout(scheduleTimeout, sched, timezone);
  let done = t.isDone();
  function scheduleTimeout() {
    /* istanbul ignore else */
    if (!done) {
      fn();
      t = later.setTimeout(scheduleTimeout, sched, timezone);
    }
  }

  return {
    isDone() {
      return t.isDone();
    },
    clear() {
      done = true;
      t.clear();
    }
  };
}; // setInterval()

later.date = {};
later.date.timezone = function (useLocalTime) {
  later.date.build = useLocalTime
    ? function (Y, M, D, h, m, s) {
        return new Date(Y, M, D, h, m, s);
      }
    : function (Y, M, D, h, m, s) {
        return new Date(Date.UTC(Y, M, D, h, m, s));
      };

  const get = useLocalTime ? 'get' : 'getUTC';
  const d = Date.prototype;
  later.date.getYear = d[get + 'FullYear'];
  later.date.getMonth = d[get + 'Month'];
  later.date.getDate = d[get + 'Date'];
  later.date.getDay = d[get + 'Day'];
  later.date.getHour = d[get + 'Hours'];
  later.date.getMin = d[get + 'Minutes'];
  later.date.getSec = d[get + 'Seconds'];
  later.date.isUTC = !useLocalTime;
};

later.date.UTC = function () {
  later.date.timezone(false);
};

later.date.localTime = function () {
  later.date.timezone(true);
};

later.date.UTC();
later.SEC = 1e3;
later.MIN = later.SEC * 60;
later.HOUR = later.MIN * 60;
later.DAY = later.HOUR * 24;
later.WEEK = later.DAY * 7;
later.DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
later.NEVER = 0;
later.date.next = function (Y, M, D, h, m, s) {
  return later.date.build(
    Y,
    M !== undefined ? M - 1 : 0,
    D !== undefined ? D : 1,
    h || 0,
    m || 0,
    s || 0
  );
};

later.date.nextRollover = function (d, value, constraint, period) {
  const cur = constraint.val(d);
  const max = constraint.extent(d)[1];
  return (value || max) <= cur || value > max
    ? new Date(period.end(d).getTime() + later.SEC)
    : period.start(d);
};

later.date.prev = function (Y, M, D, h, m, s) {
  const { length } = arguments;
  M = length < 2 ? 11 : M - 1;
  D = length < 3 ? later.D.extent(later.date.next(Y, M + 1))[1] : D;
  h = length < 4 ? 23 : h;
  m = length < 5 ? 59 : m;
  s = length < 6 ? 59 : s;
  return later.date.build(Y, M, D, h, m, s);
};

later.date.prevRollover = function (d, value, constraint, period) {
  const cur = constraint.val(d);
  return value >= cur || !value
    ? period.start(period.prev(d, period.val(d) - 1))
    : period.start(d);
};

later.parse = {};
later.parse.cron = function (expr, hasSeconds) {
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
  const REPLACEMENTS = {
    '* * * * * *': '0/1 * * * * *',
    '@YEARLY': '0 0 1 1 *',
    '@ANNUALLY': '0 0 1 1 *',
    '@MONTHLY': '0 0 1 * *',
    '@WEEKLY': '0 0 * * 0',
    '@DAILY': '0 0 * * *',
    '@HOURLY': '0 * * * *'
  };
  const FIELDS = {
    s: [0, 0, 59],
    m: [1, 0, 59],
    h: [2, 0, 23],
    D: [3, 1, 31],
    M: [4, 1, 12],
    Y: [6, 1970, 2099],
    d: [5, 1, 7, 1]
  };
  function getValue(value, offset, max) {
    return isNaN(value)
      ? NAMES[value] || null
      : Math.min(Number(value) + (offset || 0), max || 9999);
  }

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

  function addHash(schedules, curSched, value, hash) {
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
      add(curSched, 'D', 1, 3);
      add(curSched, 'd', NAMES.MON, NAMES.FRI);
      add(except1, 'D', 2, 2);
      add(except1, 'd', NAMES.TUE, NAMES.FRI);
      add(except2, 'D', 3, 3);
      add(except2, 'd', NAMES.TUE, NAMES.FRI);
    } else {
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

  function addRange(item, curSched, name, min, max, offset) {
    const incSplit = item.split('/');
    const inc = Number(incSplit[1]);
    const range = incSplit[0];
    if (range !== '*' && range !== '0') {
      const rangeSplit = range.split('-');
      min = getValue(rangeSplit[0], offset, max);
      max = getValue(rangeSplit[1], offset, max) || max;
    }

    add(curSched, name, min, max, inc);
  }

  function parse(item, s, name, min, max, offset) {
    let value;
    let split;
    const { schedules } = s;
    const curSched = schedules[schedules.length - 1];
    if (item === 'L') {
      item = min - 1;
    }

    if ((value = getValue(item, offset, max)) !== null) {
      add(curSched, name, value, value);
    } else if (
      (value = getValue(item.replace('W', ''), offset, max)) !== null
    ) {
      addWeekday(s, curSched, value);
    } else if (
      (value = getValue(item.replace('L', ''), offset, max)) !== null
    ) {
      addHash(schedules, curSched, value, min - 1);
    } else if ((split = item.split('#')).length === 2) {
      value = getValue(split[0], offset, max);
      addHash(schedules, curSched, value, getValue(split[1]));
    } else {
      addRange(item, curSched, name, min, max, offset);
    }
  }

  function isHash(item) {
    return item.includes('#') || item.indexOf('L') > 0;
  }

  function itemSorter(a, b) {
    return isHash(a) && !isHash(b) ? 1 : a - b;
  }

  function parseExpr(expr) {
    const schedule = {
      schedules: [{}],
      exceptions: []
    };
    const components = expr.replace(/(\s)+/g, ' ').split(' ');
    let field;
    let f;
    let component;
    let items;
    for (field in FIELDS) {
      f = FIELDS[field];
      component = components[f[0]];
      if (component && component !== '*' && component !== '?') {
        items = component.split(',').sort(itemSorter);
        var i;
        const { length } = items;
        for (i = 0; i < length; i++) {
          parse(items[i], schedule, field, f[1], f[2], f[3]);
        }
      }
    }

    return schedule;
  }

  function prepareExpr(expr) {
    const prepared = expr.toUpperCase();
    return REPLACEMENTS[prepared] || prepared;
  }

  const e = prepareExpr(expr);
  return parseExpr(hasSeconds ? e : '0 ' + e);
};

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

      last = {
        n: name,
        x: every,
        c: curName.length,
        m: max
      };
    }

    values = applyMin ? [min] : applyMax ? [max] : values;
    const { length } = values;
    for (i = 0; i < length; i += 1) {
      const value = values[i];
      if (!curName.includes(value)) {
        curName.push(value);
      }
    }

    values = every = modifier = applyMin = applyMax = 0;
  }

  return {
    schedules,
    exceptions,
    on() {
      values = Array.isArray(arguments[0]) ? arguments[0] : arguments;
      return this;
    },
    every(x) {
      every = x || 1;
      return this;
    },
    after(x) {
      modifier = 'a';
      values = [x];
      return this;
    },
    before(x) {
      modifier = 'b';
      values = [x];
      return this;
    },
    first() {
      applyMin = 1;
      return this;
    },
    last() {
      applyMax = 1;
      return this;
    },
    time() {
      for (let i = 0, { length } = values; i < length; i++) {
        const split = values[i].split(':');
        if (split.length < 3) split.push(0);
        values[i] =
          Number(split[0]) * 3600 + Number(split[1]) * 60 + Number(split[2]);
      }

      add('t');
      return this;
    },
    second() {
      add('s', 0, 59);
      return this;
    },
    minute() {
      add('m', 0, 59);
      return this;
    },
    hour() {
      add('h', 0, 23);
      return this;
    },
    dayOfMonth() {
      add('D', 1, applyMax ? 0 : 31);
      return this;
    },
    dayOfWeek() {
      add('d', 1, 7);
      return this;
    },
    onWeekend() {
      values = [1, 7];
      return this.dayOfWeek();
    },
    onWeekday() {
      values = [2, 3, 4, 5, 6];
      return this.dayOfWeek();
    },
    dayOfWeekCount() {
      add('dc', 1, applyMax ? 0 : 5);
      return this;
    },
    dayOfYear() {
      add('dy', 1, applyMax ? 0 : 366);
      return this;
    },
    weekOfMonth() {
      add('wm', 1, applyMax ? 0 : 5);
      return this;
    },
    weekOfYear() {
      add('wy', 1, applyMax ? 0 : 53);
      return this;
    },
    month() {
      add('M', 1, 12);
      return this;
    },
    year() {
      add('Y', 1970, 2450);
      return this;
    },
    fullDate() {
      for (let i = 0, { length } = values; i < length; i++) {
        values[i] = values[i].getTime();
      }

      add('fd');
      return this;
    },
    customModifier(id, vals) {
      const custom = later.modifier[id];
      if (!custom)
        throw new Error('Custom modifier ' + id + ' not recognized!');
      modifier = id;
      values = Array.isArray(arguments[1]) ? arguments[1] : [arguments[1]];
      return this;
    },
    customPeriod(id) {
      const custom = later[id];
      if (!custom)
        throw new Error('Custom time period ' + id + ' not recognized!');
      add(id, custom.extent(new Date())[0], custom.extent(new Date())[1]);
      return this;
    },
    startingOn(start) {
      return this.between(start, last.m);
    },
    between(start, end) {
      cur[last.n] = cur[last.n].splice(0, last.c);
      every = last.x;
      add(last.n, start, end);
      return this;
    },
    and() {
      cur = curArray[curArray.push({}) - 1];
      return this;
    },
    except() {
      curArray = exceptions;
      cur = null;
      return this;
    }
  };
};

later.parse.text = function (string) {
  const { recur } = later.parse;
  let pos = 0;
  let input = '';
  let error;
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
  function t(start, end, text, type) {
    return {
      startPos: start,
      endPos: end,
      text,
      type
    };
  }

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
    start = pos;
    while (!token || token.type === whiteSpace) {
      length_ = -1;
      curInput = input.slice(Math.max(0, start));
      token = t(start, start, input.split(whiteSpace)[0]);
      var i;
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

      if (token.type === whiteSpace) {
        start = token.endPos;
      }
    }

    return token;
  }

  function scan(expectedToken) {
    const token = peek(expectedToken);
    pos = token.endPos;
    return token;
  }

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

  function parseRanges(tokenType) {
    let nums = parseThroughExpr(tokenType);
    while (checkAndParse(TOKENTYPES.and)) {
      nums = nums.concat(parseThroughExpr(tokenType));
    }

    return nums;
  }

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
      r.every(number);
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
          if (peek(TOKENTYPES.time).type !== undefined) {
            r.after(parseTokenValue(TOKENTYPES.time));
            r.time();
          } else {
            r.after(parseTokenValue(TOKENTYPES.rank));
            parseTimePeriod(r);
          }

          break;

        case TOKENTYPES.before:
          if (peek(TOKENTYPES.time).type !== undefined) {
            r.before(parseTokenValue(TOKENTYPES.time));
            r.time();
          } else {
            r.before(parseTokenValue(TOKENTYPES.rank));
            parseTimePeriod(r);
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

    return {
      schedules: r.schedules,
      exceptions: r.exceptions,
      error
    };
  }

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

  function checkAndParse(tokenType) {
    const found = peek(tokenType).type === tokenType;
    if (found) {
      scan(tokenType);
    }

    return found;
  }

  function parseToken(tokenType) {
    const t = scan(tokenType);
    if (t.type) {
      t.text = convertString(t.text, tokenType);
    } else {
      error = pos;
    }

    return t;
  }

  function parseTokenValue(tokenType) {
    return parseToken(tokenType).text;
  }

  function convertString(string_, tokenType) {
    let output = string_;
    switch (tokenType) {
      case TOKENTYPES.time:
        /*
        const parts = string_.split(/(:|am|pm)/);
        const hour =
          parts[3] === 'pm' && parts[0] < 12
            ? Number.parseInt(parts[0], 10) + 12
            : parts[0];
        const min = parts[2].trim();
        output = (hour.length === 1 ? '0' : '') + hour + ':' + min;
        */
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
    }

    return output;
  }

  return parseScheduleExpr(string.toLowerCase());
};

function getOffset(date, zone) {
  const d = date
    .toLocaleString('en-US', {
      hour12: false,
      timeZone: zone,
      timeZoneName: 'short'
    }) //=> ie. "8/22/2021, 24:30:00 EDT"
    .match(/(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/)
    .map((n) => (n.length === 1 ? '0' + n : n));

  const zdate = new Date(
    `${d[3]}-${d[1]}-${d[2]}T${d[4].replace('24', '00')}:${d[5]}:${d[6]}Z`
  );

  return date.getTime() - zdate.getTime();
} // getOffset()

module.exports = later;
