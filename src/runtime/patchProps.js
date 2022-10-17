export function patchProps(el, oldProps, newProps) {
  if (oldProps === newProps) {
    return;
  }
  //es6默认参数方式传参只有undefined才生效
  oldProps = oldProps || {};
  newProps = newProps || {};
  for (const key in newProps) {
    if (key === 'key') {
      continue;
    }
    const prev = oldProps[key];
    const next = newProps[key];
    if (prev !== next) {
      patchDomProp(el, key, prev, next);
    }
  }
  //删除不存在的属性
  for (const key in oldProps) {
    if (key !== 'key' && !(key in newProps)) {
      patchDomProp(el, key, oldProps[key], null);
    }
  }
}

const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/;
function patchDomProp(el, key, prev, next) {
        //   prev{
        //     color:'red'
        //   }
        //   next{
        //     border:'1px solid'
        //   }
  switch (key) {
    case 'class':
      // 暂时认为class就是字符串
      // next可能为null，会变成'null'，因此要设成''
      el.className = next || '';
      break;
    case 'style':
      // style为对象
      if (next == null) {
        el.removeAttribute('style');
      } else {
        for (const styleName in next) {
          el.style[styleName] = next[styleName];
        }
        if (prev) {
          for (const styleName in prev) {
            if (next[styleName] == null) {
              el.style[styleName] = '';
            }
          }
        }
      }
      break;
    default:
      if (/^on[^a-z]/.test(key)) {
        //正则匹配事件，第三个字母不可以为小写
        if (prev !== next) {
          const eventName = key.slice(2).toLowerCase();
          if (prev) {
            el.removeEventListener(eventName, prev);
          }
          if (next) {
            el.addEventListener(eventName, next);
          }
        }
      } else if (domPropsRE.test(key)) {
        if (next === '' && typeof el[key] === 'boolean') {
          next = true;
        }
        el[key] = next;
      } else {
        // 例如自定义属性{custom: ''}，应该用setAttribute设置为<input custom />
        // 而{custom: null}，应用removeAttribute设置为<input />
        if (next == null || next === false) {
          // el.removeAttribute(key);
        } else {
         if(el) el.setAttribute(key, next);
        }
      }
      break;
  }
}
