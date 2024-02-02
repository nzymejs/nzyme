import type { Maybe } from '@nzyme/types';

type Callback<TResult> = (err: Maybe<unknown>, result: TResult) => void;

// export function promisify<TArgs extends any[], TResult>(
//     func: (...args: TArgs, callback: Callback<TResult>) => void
// ) {
//     return function (...args: TArgs) {
//         // return a wrapper-function (*)
//         return new Promise((resolve, reject) => {
//             function callback(err, result) {
//                 // our custom callback for f (**)
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(result);
//                 }
//             }

//             args.push(callback); // append our custom callback to the end of f arguments

//             f.call(this, ...args); // call the original function
//         });
//     };
// }
