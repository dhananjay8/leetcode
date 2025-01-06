/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isIsomorphic = function (s, t) {
  if (s.length !== t.length) return false;
  const sMapt = new Map();
  const tMaps = new Map();
  for (let i = 0; i < s.length; i++) {
    const charFromS = s[i];
    const charFromT = t[i];
    if (sMapt.has(charFromS) && sMapt.get(charFromS) !== charFromT) {
      return false;
    }
    if (tMaps.has(charFromT) && tMaps.get(charFromT) !== charFromS) {
      return false;
    }

    sMapt.set(charFromS, charFromT);
    tMaps.set(charFromT, charFromS);
  }
  return true;
};
