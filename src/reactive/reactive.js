import { hasChanged, isArray, isObject } from '../untils';
import { track, trigger } from './effect';

const proxyMap = new WeakMap();

export function reactive(target) {
  //不是对象
  if (!isObject(target)) {
    return target;
  }

  //是否被代理过
  if (isReactive(target)) {
    return target;
  }

  if (proxyMap.has(target)) {
    return proxyMap.get(target);
  }

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if (key === '_isReactive') {
        return true;
      }
      const res = Reflect.get(target, key, receiver);

      //收集依赖
      track(target, key);
      // return res;
      //Vue2中初始化data时会递归遍历代理所有深层次对象
      //Vue3处理深层次代理依赖
      return isObject(res) ? reactive(res) : res;
    },
    set(target, key, value, receiver) {
      let oldLength = target.length;

      //拿到旧值，比较是否发生改变count
      const oldValue = target[key];
      const res = Reflect.set(target, key, value, receiver);
      if (hasChanged(oldValue, value)) {
        //发生改变
        trigger(target, key);
        //处理代理数组
        if (isArray(target) && hasChanged(oldLength, target.length)) {
          trigger(target, 'length'); //传参target key
        }
      }
      return res;
    },
  });
  proxyMap.set(target, proxy);
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
