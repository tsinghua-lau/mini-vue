import { reactive } from './reactive/reactive';
import { effect } from './reactive/effect';
import { ref } from './reactive/ref';
import { computed } from './reactive/computed';
import { render, h, Text, Fragment } from './runtime';
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

// const observed = (window.observed = reactive({
//   count1: 0,
//   count2: 0,
// }));
// effect(() => {
//   effect(() => {
//     console.log('count2 is ==>', observed.count2);
//   });
//   console.log('count1 is ==>', observed.count1);
// });

//ref
// const foo = (window.foo = ref(1));
// effect(()=>{
//   console.log('foo==>',foo.value);
// })

// computed
// const num  = (window.num = ref(0));
// const c = (window.c = computed(()=>{
//   console.log('caclulate c.value');
//   return num.value*2;
// }));

// const num  = (window.num = ref(0));
// const c = (window.c = computed({
//   get(){
//     console.log('get');
//     return num.value*2;
//   },
//  set(newVal){
//   console.log('set');
//   num.value = newVal;
//  }
// }));


//Vnode&mount
// const vnode = h(
//   'div',
//   {
//     class: 'a b',
//     style: {
//       border: '1px solid',
//       fontSize: '14px',
//       width: '500px',
//     },
//     onClick: () => console.log('click'),
//     id: 'foo',
//     checked: '',
//     custom: false,
//   },
//   [
//     h('ul', null, [
//       h('li', { style: { color: 'red' } }, 1),
//       h('li', null, 2),
//       h('li', { style: { color: 'blue' } }, 3),
//       h(Fragment, null, [h('li', null, '4'), h('li')]),
//       h('li', null, [h(Text, null, 'hello world')]),
//     ]),
//   ]
// );

// setTimeout(() => {
//   render(vnode, document.body);
// }, 1000);


//patch
setTimeout(() => {
render(
  h('ul',null,[
  h('li',null,'first'),
  h(Fragment,null,[]),
  h('li',null,'last'),
  ]),
  document.body
);
}, 500);

setTimeout(() => {
  render(
    h('ul',null,[
      h('li',null,'first---更新'),
      h(Fragment,null,[
        h('li',null,'middle---新增')
      ]),
      h('li',null,'last---更新')
    ]),
    document.body
  ) 
}, 3000);


