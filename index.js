var globals = ["document", "window", "later"],
    globalValues = {};

globals.forEach(function(g) {
  if (g in global) globalValues[g] = global[g];
});

// <https://github.com/bunkat/later/pull/208>
if (process && process.env['LATER_COV']) {
  require("./later.cov");
} else {
  require("./later");
}

module.exports = later;

globals.forEach(function(g) {
  if (g in globalValues) global[g] = globalValues[g];
  else delete global[g];
});
