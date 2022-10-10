export function isObject(target) {
  return typeof target === 'object' && target !== null;
}

export function hasChanged(oldValue, value) {
  //旧值和新值不能相等，且同时不能为NaN
  //Number.isNaN http://t.csdn.cn/PnJX6
  // console.log(oldValue!==value && (Number.isNaN(oldValue) && Number.isNaN(value)));
  return oldValue !== value && !(Number.isNaN(oldValue) && Number.isNaN(value));
}

export function isArray(target){
    return Array.isArray(target);
}

export function isString(target){
  return typeof target === 'string';
}

export function isNumber(target){
  return typeof target === 'number';
}

export function isBoolean(target){
  return typeof target === 'boolean';
}


export function isFunction(target){
  return typeof target === 'function'
}