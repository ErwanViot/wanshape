/** Toggle a value in an array: remove if present, add if absent. Returns a new array. */
export function toggleArrayElement<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}
