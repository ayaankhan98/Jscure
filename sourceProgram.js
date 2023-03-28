// let sayHello = "Hello";
// console.log(sayHello);

// for(let i = 0, j = 0; i < 10; i++) {
//     console.log(i);
// }

// let a = parseInt(10);
// a += 10.22;
// let c = a && 10;
// console.log(a);
// const PI = 3.14;
// var x = 10;
// let k, z;
// let y = 20, m = -23;
// m = 24;
// x = 23;
// sayHello = '23232';

// let b = (a)*(1) + (a);

let arr = [3, 2, 1, 4, 5, 6, 7, 8, 9, 10];
function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
            else {
                continue;
            }
        }
    }
}

bubbleSort(arr);
console.log(arr);

// let func = () => {

// }

// func();

// c = (a + b) * 2;
// if (a && b 
//     | c) {

// }

// class Entity {
//     constructor(name) {
//         this.name = name;
//     }

//     getName() {

//     }
// }