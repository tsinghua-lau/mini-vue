import { reactive } from './reactive/reactive';
import { effect } from './reactive/effect';
const observed = (window.observed = reactive({
  count: 0,
}));
effect(() => {
  console.log('observed.count is ==>', observed.count);
});

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
