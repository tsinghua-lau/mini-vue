// import { isBoolean } from '../untils';
import { ShapeFlags } from './vnode';
import { patchProps } from './patchProps';

export function render(vnode, container) {
  const prevVnode = container._vnode;
  if (!vnode) {
    //n2不存在
    if (prevVnode) {
      unmount(prevVnode);
    }
  } else {
    patch(prevVnode, vnode, container);
  }

  // mount(vnode,container);
  container._vnode = vnode;
}

function unmount(vnode) {
  const { shapeFlag, el } = vnode;
  if (shapeFlag & ShapeFlags.COMPONENT) {
    unmountComponent(vnode);
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    unmountFragment(vnode);
  } else {
    el.parentNode.removeChild(el);
  }
}

function unmountComponent(vnode) {}

function processComponent(n1, n2, container, anchor) {}

/**
 * 删除Fragment节点（el和anchor）
 * @param {*} vnode
 */
function unmountFragment(vnode) {
  let { el: cur, anchor: end } = vnode;
  const { parentNode } = cur;

  while (cur !== end) {
    let next = cur.nextSibling;
    parentNode.removeChild(cur);
    cur = next;
  }

  parentNode.removeChild(end);
}

function patch(n1, n2, container, anchor) {
  if (n1 && !isSameVNode(n1, n2)) {
    anchor = (n1.anchor || n1.el).nextSibling;
    unmount(n1);
    n1 = null;
  }

  const { shapeFlag } = n2;
  if (shapeFlag & ShapeFlags.COMPONENT) {
    processComponent(n1, n2, container, anchor);
  } else if (shapeFlag & ShapeFlags.TEXT) {
    processText(n1, n2, container, anchor);
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    processFragment(n1, n2, container, anchor);
  } else {
    processElement(n1, n2, container, anchor);
  }
}

function isSameVNode(n1, n2) {
  return n1.type === n2.type;
}

function processText(n1, n2, container, anchor) {
  if (n1) {
    n2.el = n1.el;
    n1.el.textContent = n2.children;
  } else {
    mountTextNode(n2, container, anchor);
  }
}

function processFragment(n1, n2, container, anchor) {
  //anchor 创建空节点,解决append el位置错乱问题
  // const fragmentStartAnchor = document.createTextNode('');
  // const fragmentEndAnchor = document.createTextNode('');
  const fragmentStartAnchor = (n2.el = n1
    ? n1.el
    : document.createTextNode(''));
  const fragmentEndAnchor = (n2.el = n1 ? n1.el : document.createTextNode(''));
  n2.anchor = n1 ? n1.anchor : fragmentEndAnchor;
  if (n1) {
    patchChildren(n1, n2, container, fragmentEndAnchor);
  } else {
    // container.appendChild(fragmentStartAnchor)
    // container.appendChild(fragmentEndAnchor)
    container.insertBefore(fragmentStartAnchor, anchor);
    container.insertBefore(fragmentEndAnchor, anchor);
    mountChildren(n2.children, container, fragmentEndAnchor);
  }
}

function processElement(n1, n2, container, anchor) {
  if (n1) {
    patchElement(n1, n2);
  } else {
    mountElement(n2, container, anchor);
  }
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
function mountTextNode(vnode, container, anchor) {
  const textNode = document.createTextNode(vnode.children);
  // container.appendChild(textNode);
  container.insertBefore(textNode, anchor);
  vnode.el = textNode;
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
function mountElement(vnode, container, anchor) {
  const { type, props, shapeFlag, children } = vnode;
  console.log(type, 111);
  if (typeof type == 'symbol') {
    return;
  }
  const el = document.createElement(type);
  // mountProps(props, el);
  patchProps(el, null, props);
  // mountChildren(vnode, el);

  // const { shapeFlag, children } = vnode;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    mountTextNode(vnode, el);
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el);
  }
  // container.appendChild(el);
  container.insertBefore(el, anchor);
  vnode.el = el;
}

function mountChildren(children, container, anchor) {
  children.forEach((child) => {
    // mount(child, container);
    patch(null, child, container, anchor);
  });
}

// function mountProps(props, el) {
//   for (const key in props) {
//     let value = props[key];
//     switch (key) {
//       case 'class':
//         el.className = value;
//         break;
//       case 'style':
//         for (const styleName in value) {
//           el.style[styleName] = value[styleName];
//         }
//         break;

//       default:
//         if (/^on[^a-z]/.test(key)) {
//           //正则匹配事件，第三个字母不可以为小写
//           const eventName = key.slice(2).toLowerCase();
//           el.addEventListener(eventName, value);
//         } else if (domPropsRE.test(key)) {
//           if (value === '' && isBoolean(el[key])) {
//             value = true;
//           }
//           el[key] = value;
//         } else {
//           if (value == null || value === false) {
//             el.removeAttribute(key);
//           } else {
//             el.setAttribute(key, value);
//           }
//           el.setAttribute(key, value);
//         }
//         break;
//     }
//   }
// }

function patchElement(n1, n2) {
  //继承n1
  n2.el = n1.el;
  patchProps(n2.el, n1.props, n2.props);
  patchChildren(n1, n2, n2.el);
}

function unmounChildren(children) {
  children.forEach((child) => {
    unmount(child);
  });
}

function patchChildren(n1, n2, container, anchor) {
  const { shapeFlag: prevShapeFlag, children: c1 } = n1;
  const { shapeFlag, children: c2 } = n2;

  //九种情况的判断--对应图解图片文件
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unmountChildren(c1);
    }
    if (c2 !== c1) {
      container.textContent = c2;
    }
  } else {
    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (c1[0] && c1[0].key != null && c2[0] && c2[0].key != null) {
          patchKeyedChildren(c1, c2, container, anchor);
        } else {
          patchUnkeyedChildren(c1, c2, container, anchor);
        }
      } else {
        unmountChildren(c1);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        container.textContent = '';
      }
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(c2, container, anchor);
      }
    }
  }
}

function patchUnkeyedChildren(c1, c2, container, anchor) {
  const oldLength = c1.length;
  const newLength = c2.length;
  const commonLength = Math.min(oldLength, newLength);
  for (let i = 0; i < commonLength; i++) {
    patch(c1[i], c2[i], container, anchor);
  }
  if (newLength > oldLength) {
    mountChildren(c2.slice(commonLength), container, anchor);
  } else if (newLength < oldLength) {
    unmountChildren(c1.slice(commonLength));
  }
}

/**
 * 通过key来对比节点更新 --react方法
 * @param {*} c1
 * @param {*} c2
 * @param {*} container
 * @param {*} anchor
 */
function patchKeyedChildren2(c1, c2, container, anchor) {
  const map = new map();
  c1.forEach((prev, j) => {
    map.set(prev.key, { prev, j });
  });
  let maxNewIndexSoFar = 0;
  for (let i = 0; i < c2.length; i++) {
    const next = c2[i];
    const curAnchor = i === 0 ? c1[0].e : c2[i - 1].el.nextSibling;

    if (map.has(next.key)) {
      //找到了
      const { prev, j } = map.get(next.key);
      patch(prev, next, container, anchor);
      if (j < maxNewIndexSoFar) {
        //move
        //  const curAnchor = i === 0 ? c1[0].e : c2[i - 1].el.nextSibling;
        // 若干el为新节点执行插入操作，如果已经存在的节点，执行移动操作
        container.insertBefore(next.el, curAnchor);
      } else {
        maxNewIndexSoFar = j;
      }
      map.delete(next.key);
    } else {
      patch(null, next, curAnchor);
    }
    map.forEach(({ prev }) => {
      unmount(prev);
    });

    // let find = false;
    // for (let j = 0; j < c1.length; j++) {
    //   const prev = c1[i];
    //   if (next.key === prev.key) {
    //     find = true;
    //     patch(prev, next, container, anchor);
    //     if (j < maxNewIndexSoFar) {
    //       //move
    //       //  const curAnchor = i === 0 ? c1[0].e : c2[i - 1].el.nextSibling;
    //       const curAnchor = c2[i - 1].el.nextSibling;
    //       // 若干el为新节点执行插入操作，如果已经存在的节点，执行移动操作
    //       container.insertBefore(next.el, curAnchor);
    //     } else {
    //       maxNewIndexSoFar = j;
    //     }
    //     // const curAnchor = c1[0].el;
    //     // const curAnchor = c2[i - 1].el.nextSibling;

    //     break;
    //   }
    // }
    // if (!find) {
    //   const curAnchor = i === 0 ? c1[0].e : c2[i - 1].el.nextSibling;
    //   patch(null, next, curAnchor);
    // }
  }

  // for (let i = 0; i < c1.length; i++) {
  //   const prev = c1[i];
  //   const item = c2.find((next)=>next.key===prev.key)
  //   if(!item){
  //     //如果没找到
  //     unmount(prev);
  //   }
  // }
}

function patchKeyedChildren(c1, c2, container, anchor) {
  let i = 0;
  let e1 = c1.length - 1;
  let e2 = c2.length - 1;
  //1.从左到右依次比对
  while (i <= e1 && i <= e2 && c1[i].key === c2[i].key) {
    patch(c1[i], c2[i], container, anchor && c1[i].key == c2[i].key);
    i++;
  }

  //2.从右到左依次对比
  while (i <= e1 && i <= e2 && c1[e1].key === c2[e2].key) {
    patch(c1[e1], c2[e2], container, anchor);
    e1--;
    e2--;
  }

  //3.  经过1、2直接将旧节点比对完，则将剩下的新节点直接mount,此时i>e1
  if (i > e1) {
    for (let j = i; j <= e2; j++) {
      const nextPos = e2 + 1;
      const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor;
      patch(null, c2[j], container, curAnchor);
    }
  } else if (i > e2) {
    //3.经过1、2直接将新节点比对完，则剩下的旧节点直接unmount
    for (let j = i; j <= e1; j++) {
      unmount(c1[j]);
    }
  } else {
    //TODO
    //4. 若不满足 3，采用传统diff算法，单不真的添加和移动，只做标记和删除
    const map = new map();
    c1.forEach((prev, j) => {
      map.set(prev.key, { prev, j });
    });
    let maxNewIndexSoFar = 0;
    let move = false;
    const source = new Array(e2-i+1).fill(-1);
    const toMounted = [];
    for (let k = 0; k < c2.length; k++) {
      const next = c2[k+i];
      // const curAnchor = k === 0 ? c1[0].e : c2[k - 1].el.nextSibling;
  
      if (map.has(next.key)) {
        //找到了
        const { prev, j } = map.get(next.key);
        patch(prev, next, container, anchor);
        if (j < maxNewIndexSoFar) {
          move = true;
        } else {
          maxNewIndexSoFar = j;
        }
        source[k] = j;//存下标
        map.delete(next.key);
      } else {
        //TODO
        toMounted.push(k+i)
      }
    }
      map.forEach(({ prev }) => {
        unmount(prev);
      });

      if(move){
        // 5. 需要移动，客采用新的最长上升子序列算法
        const seq = getSequence(source);
        let j = seq.length - 1;
        for(let k = source.length-1; k>=0;k--){
          if(seq[j]===k){
            // 存在的话 不用移动
            j--; 
          }else{
            const pos = k+i;
            const nextPos = pos+1;
            const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor;
            patch(null.c2[pos],container,curAnchor);
            if(source[k] === -1 ){
              //mount
              patch(null.c2[pos],container,curAnchor)
            }else{
              //移动
              container.insertBefore(c2[pos].el,curAnchor)
            }
          


          // if(source[k]===-1){
          //   //mount是新节点
          //   const pos = k+i;
          //   const nextPos = pos+1;
          //   const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor;
          //   patch(null.c2[pos],container,curAnchor)
          // }else if(seq[j]===k){
          //   // 存在的话 不用移动
          //   j--; 
          // }else{
          //   // 不在的话 移动
          //   const pos = k+i;
          //   const nextPos = pos+1;
          //   const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor;
          //   container.insertBefore(c2[pos].el,curAnchor)
          // }
          
        }
      }
    }else if(toMounted.length){
      for(let k = toMounted.length-1;k>=0;k--){
        const pos = toMounted[key];
            const nextPos = pos+1;
            const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor;
            patch(null.c2[pos],container,curAnchor);
      }
    }
  }
}

function getSequence(){
  // TODO
}

function patchChildren2(n1, n2, container) {
  const { shapeFlag: prevShapeFlag, children: c1 } = n1;
  const { shapeFlag, children: c2 } = n2;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unmounChildren(c1);
    }
    if (c1 !== c2) {
      //更新
      container.textContent = c2;
    }
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = '';
      mountChildren(c2, container, anchor);
    } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      //只要第一个元素有key那么就当作都有key
      if (c1[0] && c1[0].key !== null && c2[0].key !== null) {
        patchUnkeyedChildren(c1, c2, container, anchor);
      } else {
        patchUnkeyedChildren(c1, c2, container, anchor);
      }

      // patchArrayChildren(c1,c2,container,anchor);
    } else {
      mountChildren(c2, container, anchor);
    }
  } else {
    if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = '';
    } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unmounChildren(c1);
    } else {
    }
  }
}

function patchArrayChildren(c1, c2, container, anchor) {
  const oldLength = c1.length;
  const newLength = c2.length;

  const commonLength = Math.min(oldLength, newLength);
  for (let i = 0; i < commonLength; i++) {
    patch(c1[i], c2[i], container, anchor);
  }

  if (oldLength > newLength) {
    unmounChildren(c1.slice(commonLength));
  } else if (oldLength > newLength) {
    mountChildren(c2.slice(commonLength), container, anchor);
  }
}
