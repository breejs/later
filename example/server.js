const later = require('..'); // require('later') if installed via npm

// create the desired schedule
const sched = later.parse.text('every 5 mins on the 30th sec');

// calculate the next 5 occurrences using local time
later.date.localTime();
const results = later.schedule(sched).next(5);
