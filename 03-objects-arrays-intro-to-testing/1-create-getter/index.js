/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathArray = path.split('.');
  return (object = {}) => {
    let result = {...object};

    for (const property of pathArray) {
      if (result[property] === undefined) {
        return result[property];
      }
      result = result[property];
    }
    return result;
  }
}
