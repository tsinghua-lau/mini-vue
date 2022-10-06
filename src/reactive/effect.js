const effectStack = []; //处理effect嵌套effect
let activeEffect; //记录当前正在执行的副作用函数
export function effect(fn, options = {}) {
  const effectFn = () => {
    try {
      activeEffect = effectFn;
      effectStack.push(activeEffect);
      return fn();
    } finally {
      //执行完成后还原
      effectStack.pop();
      //activeEffect = undefined;
      activeEffect = effectStack[effectStack.length - 1];
    }
  };
  if (!options.lazy) {
    effectFn();
  }
  effectFn.scheduler = options.scheduler;
  return effectFn;
}

const targetMap = new WeakMap(); //模块类全局变量

export function track(target, key) {
  if (!activeEffect) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
}

//trck的逆运算
export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const deps = depsMap.get(key);

  if (!deps) {
    return;
  }
  deps.forEach((effectFn) => {
    if (effectFn.scheduler) {
      effectFn.scheduler(effectFn)
    } else {
      effectFn();
    }
  });
}