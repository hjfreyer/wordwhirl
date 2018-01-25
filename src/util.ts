export function formatMillis(ms : number) : string {
  var date = new Date(2015, 0, 13);  // Unused date which is still necessary.
  date.setMilliseconds(ms);
  return date.toISOString().substr(15, 4);
}

export type StatusOr<T> = {ok: true, value: T} | {ok: false, error: string };

export function Ok<T>(value : T) : StatusOr<T> {
  return {ok: true, value: value};
}

export function Error<T>(msg : string) : StatusOr<T>{
  return {ok:false, error: msg};
}

export function GetOrThrow<T>(s : StatusOr<T>) : T {
  if (!s.ok) {
    throw s.error;
  }
  return s.value;
}
