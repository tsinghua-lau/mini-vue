import { isBoolean } from '../untils';
import { ShapeFlags } from './vnode';

export function render(vnode, container) {
  mount(vnode, document.body);
}

function mount(vnode, container) {
  const { shapeFlag } = vnode;
  // if(vnode.children=='hello world'){
  //     debugger
  // }
  if (shapeFlag & ShapeFlags.ELEMENT) {
    mountElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.TEXT) {
    mountTextNode(vnode, container);
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    mountFragment(vnode, container);
  } else {
    mountTextNode(vnode, container);

    // mountComponent(vnode, container);
  }
}
/**
 * element普通元素，使用document.createElement创建。type:类型，props属性，children子元素(字符串或数组)
 * 例如：
 * {
 *  type:'div',
 *  props:{class:'my-div'},
 *  child:'hello'
 * }
 * @param {*} vnode
 * @param {*} container
 */
function mountElement(vnode, container) {
  const { type, props } = vnode;
  const el = document.createElement(type);
  mountProps(props, el);
  mountChildren(vnode, el);
  container.appendChild(el);
}
/**
 * Text文本节点，使用document.createTextNode创建。type:Symbol props:null children:字符串
 * 例如：
 * {
 *  type:Symbol,
 *  props:null,
 *  children:String,
 * }
 * @param {*} vnode
 * @param {*} container
 */
function mountTextNode(vnode, container) {
  const textNode = document.createTextNode(vnode.children);
  container.appendChild(textNode);
}

/**
 * Fragment为不会真实渲染的节点 相当于template type:Symbol props:null children:数组 最后挂载到父节点上
 * 例如：
 * {
 *  type:Symbol,
 *  props:null,
 *  children:String,
 * }
 * @param {*} vnode
 * @param {*} container
 */
function mountFragment(vnode, container) {
  mountChildren(vnode, container);
}

/**
 * Component组件渲染，是以上三种vnode集合 type:定义组件对象 props:组件外部传入组件内的props child:组件的solt
 * 例如:
 * {
 *  type:{
 *  template:`{{msg}} {{name}}`,
 *  props:['name'],
 *  setup(){
 *    return {
 *      msg:'hello'
 *   }
 *  }
 *  },
 *  props:{name:'world'}
 * }
 * @param {*} vnode 
 * @param {*} container 
 */
function mountComponent(vnode, container) {}

function mountChildren(vnode, container) {
  const { shapeFlag, children } = vnode;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    mountTextNode(vnode, container);
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    children.forEach((child) => {
      mount(child, container);
    });
  }
}

const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/;
function mountProps(props, el) {
  for (const key in props) {
    let value = props[key];
    switch (key) {
      case 'class':
        el.className = value;
        break;
      case 'style':
        for (const styleName in value) {
          el.style[styleName] = value[styleName];
        }
        break;

      default:
        if (/^on[^a-z]/.test(key)) {
          //正则匹配事件，第三个字母不可以为小写
          const eventName = key.slice(2).toLowerCase();
          el.addEventListener(eventName, value);
        } else if (domPropsRE.test(key)) {
          if (value === '' && isBoolean(el[key])) {
            value = true;
          }
          el[key] = value;
        } else {
          if (value == null || value === false) {
            el.removeAttribute(key);
          } else {
            el.setAttribute(key, value);
          }
          el.setAttribute(key, value);
        }
        break;
    }
  }
}
