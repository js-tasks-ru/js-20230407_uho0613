/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (obj === undefined) {
    return obj;
  }
  return Object.fromEntries(Object.entries(obj).map((item) => {
    const tmpItem = item[0];
    item[0] = item[1];
    item[1] = tmpItem;
    return item;
  }));

}
