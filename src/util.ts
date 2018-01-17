export function formatMillis(ms : number) : string {
  var date = new Date(null);
  date.setMilliseconds(ms);
  return date.toISOString().substr(15, 4);
}
