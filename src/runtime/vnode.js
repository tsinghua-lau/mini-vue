import { isArray, isNumber, isString } from '../untils';
/**
 * ShapeFlags是一组标记，能快速识别Vnode的类型和它children的类型
 */
export const ShapeFlags = {
  ELEMENT: 1,
  TEXT: 1 << 1,
  FRAGMENT: 1 << 2,
  COMPONENT: 1 << 3,
  TEXT_CHILDREN: 1 << 4,
  ARRAY_CHILDREN: 1 << 5,
  CHILDREN: (1 << 4) | (1 << 5),
};

export const Text = Symbol('Text');
export const Fragment = Symbol('Fragment');
/**
 *  生成一个Vnode
 * @param {String | Object | Text | Fragment} type
 * @param {Object | null} props
 * @param {String|Array| null} children
 */
export function h(type, props, children) {
  let shapeFlag = 0;
  if (isString(type)) {
    shapeFlag = ShapeFlags.ELEMENT;
  } else if (type === Text) {
    shapeFlag = ShapeFlags.Text;
  } else if (type === Fragment) {
    shapeFlag = ShapeFlags.FRAGMENT;
  } else {
    shapeFlag = ShapeFlags.COMPONENT;
  }

  if (isString(children) || isNumber(children)) {
    shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    children = children.toString();
  } else if (isArray(children)) {
    shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }
  return {
    type,
    props,
    children,
    shapeFlag,
  };
}
