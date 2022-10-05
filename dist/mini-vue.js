/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/reactive/effect.js":
/*!********************************!*\
  !*** ./src/reactive/effect.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "effect": () => (/* binding */ effect),
/* harmony export */   "track": () => (/* binding */ track),
/* harmony export */   "trigger": () => (/* binding */ trigger)
/* harmony export */ });
const effectStack = [];//处理effect嵌套effect
let activeEffect; //记录当前正在执行的副作用函数
function effect(fn) {
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
  effectFn();
  return effectFn;
}

const targetMap = new WeakMap(); //模块类全局变量

function track(target, key) {
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
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const deps = depsMap.get(key);

  if (!deps) {
    return;
  }
  deps.forEach((effectFn) => {
    effectFn();
  });
}


/***/ }),

/***/ "./src/reactive/reactive.js":
/*!**********************************!*\
  !*** ./src/reactive/reactive.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "reactive": () => (/* binding */ reactive),
/* harmony export */   "isReactive": () => (/* binding */ isReactive)
/* harmony export */ });
/* harmony import */ var _untils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../untils */ "./src/untils/index.js");
/* harmony import */ var _effect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./effect */ "./src/reactive/effect.js");



const proxyMap = new WeakMap();

function reactive(target) {
  //不是对象
  if (!(0,_untils__WEBPACK_IMPORTED_MODULE_0__.isObject)(target)) {
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
      (0,_effect__WEBPACK_IMPORTED_MODULE_1__.track)(target, key);
      // return res;
      //Vue2中初始化data时会递归遍历代理所有深层次对象
      //Vue3处理深层次代理依赖
      return (0,_untils__WEBPACK_IMPORTED_MODULE_0__.isObject)(res) ? reactive(res) : res;
    },
    set(target, key, value, receiver) {
      let oldLength = target.length;

      //拿到旧值，比较是否发生改变count
      const oldValue = target[key];
      const res = Reflect.set(target, key, value, receiver);
      if ((0,_untils__WEBPACK_IMPORTED_MODULE_0__.hasChanged)(oldValue, value)) {
        //发生改变
        (0,_effect__WEBPACK_IMPORTED_MODULE_1__.trigger)(target, key);
        //处理代理数组
        if ((0,_untils__WEBPACK_IMPORTED_MODULE_0__.isArray)(target) && (0,_untils__WEBPACK_IMPORTED_MODULE_0__.hasChanged)(oldLength, target.length)) {
          (0,_effect__WEBPACK_IMPORTED_MODULE_1__.trigger)(target, 'length'); //传参target key
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
function isReactive(target) {
  //_isReactive私有属性判断是否是响应式对象;
  //返回布尔类型
  return !!(target && target._isReactive);
}


/***/ }),

/***/ "./src/untils/index.js":
/*!*****************************!*\
  !*** ./src/untils/index.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isObject": () => (/* binding */ isObject),
/* harmony export */   "hasChanged": () => (/* binding */ hasChanged),
/* harmony export */   "isArray": () => (/* binding */ isArray)
/* harmony export */ });
function isObject(target) {
  return typeof target === 'object' && target !== null;
}

function hasChanged(oldValue, value) {
  //旧值和新值不能相等，且同时不能为NaN
  //Number.isNaN http://t.csdn.cn/PnJX6
  // console.log(oldValue!==value && (Number.isNaN(oldValue) && Number.isNaN(value)));
  return oldValue !== value && !(Number.isNaN(oldValue) && Number.isNaN(value));
}

function isArray(target){
    return Array.isArray(target);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _reactive_reactive__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reactive/reactive */ "./src/reactive/reactive.js");
/* harmony import */ var _reactive_effect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./reactive/effect */ "./src/reactive/effect.js");


// const observed = (window.observed = reactive({
//   count: 0,
// }));
// effect(() => {
//   console.log('observed.count is ==>', observed.count);
// });

// const observed = (window.observed = reactive([1,2,3]));
// effect(()=>{
//     console.log('index 4 is ==>',observed[4]);
// })
// effect(()=>{
//     console.log('length is ==>',observed.length);
// })

const observed = (window.observed = (0,_reactive_reactive__WEBPACK_IMPORTED_MODULE_0__.reactive)({
  count1: 0,
  count2: 0,
}));
(0,_reactive_effect__WEBPACK_IMPORTED_MODULE_1__.effect)(() => {
  (0,_reactive_effect__WEBPACK_IMPORTED_MODULE_1__.effect)(() => {
    console.log('count2 is ==>', observed.count2);
  });
  console.log('count1 is ==>', observed.count1);
});

// import { compile } from './compiler/compile';
// import {
//   createApp,
//   render,
//   h,
//   Text,
//   Fragment,
//   renderList,
//   resolveComponent,
//   withModel,
//   nextTick,
// } from './runtime';
// import { reactive, ref, computed, effect } from './reactivity';

// export const MiniVue = (window.MiniVue = {
//   createApp,
//   render,
//   h,
//   Text,
//   Fragment,
//   renderList,
//   resolveComponent,
//   withModel,
//   nextTick,
//   reactive,
//   ref,
//   computed,
//   effect,
//   compile,
// });

})();

/******/ })()
;