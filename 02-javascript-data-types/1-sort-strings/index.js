/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const direction = {
    'asc': 1,
    'desc': -1
  };
  if (direction[param] !== direction.asc && direction[param] !== direction.desc) {
    param = 'asc'
  }
  const resultArray = [...arr];
  return resultArray.sort(function (a, b) {
    return direction[param] * a.localeCompare(b, ['ru-Ru-u-kf-upper', 'en-US-u-kf-upper']);
  });
}


