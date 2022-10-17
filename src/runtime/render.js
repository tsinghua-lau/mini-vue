// import { isBoolean } from '../untils';
import { ShapeFlags } from './vnode';
import { patchProps } from './patchProps';


export function render(vnode,container){
    const prevVnode = container._vnode;
    if(!vnode){
        //n2不存在
        if(prevVnode){
            unmount(prevVnode);
        }
    }else{
        patch(prevVnode,vnode,container);
    }

    // mount(vnode,container);
    container._vnode = vnode;
}

function unmount(vnode){
    const {shapeFlag,el} = vnode;
    if(shapeFlag & ShapeFlags.COMPONENT){
        unmountComponent(vnode);
    }else if(shapeFlag & ShapeFlags.FRAGMENT){
        unmountFragment(vnode);
    }else{
        el.parentNode.removeChild(el);
    }
}

function unmountComponent(vnode){
    

}

function processComponent(n1,n2,container,anchor){

}

/**
 * 删除Fragment节点（el和anchor）
 * @param {*} vnode 
 */
function unmountFragment(vnode){
    let {el:cur,anchor:end} = vnode;
    const {parentNode} = cur;

    while(cur !== end){
        let next = cur.nextSibling;
        parentNode.removeChild(cur);
        cur = next;
    }

    parentNode.removeChild(end);
}

function patch(n1,n2,container,anchor){
    if(n1 && !isSameVNode(n1,n2)){
        anchor =(n1.anchor||n1.el).nextSibling;
        unmount(n1);
        n1 = null;
    }

    const {shapeFlag} = n2;
    if(shapeFlag & ShapeFlags.COMPONENT){
        processComponent(n1,n2,container,anchor);
    }else if(shapeFlag & ShapeFlags.TEXT){
        processText(n1,n2,container,anchor);
    }else if(shapeFlag & ShapeFlags.FRAGMENT){
        processFragment(n1,n2,container,anchor)
    }else{
        processElement(n1,n2,container,anchor)
    }
}

function isSameVNode(n1,n2){
    return n1.type === n2.type;
}

function processText(n1,n2,container,anchor){
    if(n1){
        n2.el =  n1.el;
        n1.el.textContent = n2.children;
    }else{
        mountTextNode(n2,container,anchor)
    }
}

function processFragment(n1,n2,container,anchor){
    //anchor 创建空节点,解决append el位置错乱问题
    // const fragmentStartAnchor = document.createTextNode('');
    // const fragmentEndAnchor = document.createTextNode('');
    const fragmentStartAnchor = n2.el = n1?n1.el:document.createTextNode('');
    const fragmentEndAnchor = n2.el = n1?n1.el:document.createTextNode('');
    n2.anchor = n1?n1.anchor:fragmentEndAnchor;
    if(n1){
        patchChildren(n1,n2,container,fragmentEndAnchor)
    }else{
        // container.appendChild(fragmentStartAnchor)
        // container.appendChild(fragmentEndAnchor)
        container.insertBefore(fragmentStartAnchor,anchor);
        container.insertBefore(fragmentEndAnchor,anchor);
        mountChildren(n2.children,container,fragmentEndAnchor);
    }
}

function processElement(n1,n2,container,anchor){
    if(n1){
        patchElement(n1,n2);
    }else{
        mountElement(n2,container,anchor);
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
 function mountTextNode(vnode, container,anchor) {
    const textNode = document.createTextNode(vnode.children);
    // container.appendChild(textNode);
    container.insertBefore(textNode,anchor)
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
function mountElement(vnode, container,anchor) {
    const { type, props, shapeFlag,children } = vnode;
    const el = document.createElement(type);
    // mountProps(props, el);
    patchProps(el,null,props);
    // mountChildren(vnode, el);
    
    // const { shapeFlag, children } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      mountTextNode(vnode, el);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
     mountChildren(children,el)
    }
    // container.appendChild(el);
    container.insertBefore(el,anchor)
    vnode.el = el;
  }

  function mountChildren(children, container,anchor) {
    children.forEach((child) => {
        // mount(child, container);
        patch(null,child,container,anchor);
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

function patchElement(n1,n2){
    //继承n1
    n2.el = n1.el;
    patchProps(n2.el, n1.props, n2.props);
    patchChildren(n1,n2,n2.el)
}



function unmounChildren(children){
    children.forEach((child)=>{
        unmount(child);
    })
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
function patchChildren2(n1,n2,container){
    const {shapeFlag:prevShapeFlag, children:c1} = n1;
    const {shapeFlag,children:c2} = n2;
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){

       if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
        unmounChildren(c1);
       }
       if(c1!==c2){
        //更新
        container.textContent = c2;
       }
        
    }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){

        if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN){
            container.textContent = '';
            mountChildren(c2,container,anchor);
        }else if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
            patchArrayChildren(c1,c2,container,anchor);
        }else{
            mountChildren(c2,container,anchor);
         }
    }else{

        if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN){
            container.textContent = '';

        }else if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
            unmounChildren(c1);
    
        }else{
    
        }

    }
}

function patchArrayChildren(c1,c2,container,anchor){
    const oldLength = c1.length;
    const newLength = c2.length;

    const commonLength = Math.min(oldLength,newLength);
    for (let i = 0; i < commonLength; i++) {
        patch(c1[i],c2[i],container,anchor);
    }

    if(oldLength>newLength){
        unmounChildren(c1.slice(commonLength));

    }else if(oldLength>newLength){
        mountChildren(c2.slice(commonLength),container,anchor);
        
    }


}