function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
}

/**
 * Resurcive merged object
 * @param target
 * @param sources
 * @constructor
 */
export function DeepMerge(target:any, ...sources:any): any {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        DeepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return DeepMerge(target, ...sources);
}

export default DeepMerge
