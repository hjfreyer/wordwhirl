export function formatMillis(ms) {
  var date = new Date(null);
  date.setMilliseconds(ms);
  return date.toISOString().substr(15, 4);
}
