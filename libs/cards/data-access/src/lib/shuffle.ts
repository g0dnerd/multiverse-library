// Fisher-Yates shuffle in O(n)
export function shuffle<T>(arr: T[]): T[] {
  let m = arr.length;
  while (m > 1) {
    const i = Math.floor(Math.random() * m--);
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr;
}
