import { isObject } from '../untils';
import { track, trigger } from './effect';

export function reactive(target) {
  //不是对象
  if (!isObject(target)) {
    return target;
  }

  //是否被代理过
  if (isReactive(target)) {
    return target;
  }

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if (key === '_isReactive') {
        return true;
      }
      const res = Reflect.get(target, key, receiver);
      track(target, key);
      return res;
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return res;
    },
  });

  return proxy;
}

//Reflect:https://www.jb51.net/article/257679.htm

//不管执行几次代理，只代理一次
//是否被代理过
export function isReactive(target) {
  //_isReactive私有属性判断是否是响应式对象;
  //返回布尔类型
  return !!(target && target._isReactive);
}
