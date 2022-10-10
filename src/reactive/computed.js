import { isFunction } from '../untils';
import { effect, track, trigger } from './effect';
export function computed(getterOrOption) {
  let getter, setter;
  if (isFunction(getterOrOption)) {
    getter = getterOrOption;
    setter = () => {
      console.error('computed is readonly');
    };
  } else {
    getter = getterOrOption.get;
    setter = getterOrOption.set;
  }
  return new ComputedImpl(getter, setter);
}

class ComputedImpl {
  constructor(getter, setter) {
    this._setter = setter;
    //value缓存值
    this._value = undefined;
    //依赖更新变为true
    this._dirty = true;
    //默认不立即执行，直接执行scheduler
    this.effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        //调度程序
        if (!this._dirty) {
          this._dirty = true;
          trigger(this, 'value');
        }
      },
    });
  }
  get value() {
    if (this._dirty) {
      this._value = this.effect(); //最新值
      //依赖发生改变
      this._dirty = false;
      track(this, 'value');
    }
    return this._value;
  }
  set value(newValue) {
    this._setter(newValue);
  }
}
