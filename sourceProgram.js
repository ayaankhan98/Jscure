//function greet() {
  //console.log("Hello world");
//}

//greet();

//let sayHello = "Hello";
//console.log(sayHello);

 //for(let i = 0, j = 0; i < 10; i++) {
     //console.log(i);
 //}

 //let a = parseInt(10);
 //a += 10.22;
 //let c = a && 10;
 //console.log(a);
 //const PI = 3.14;
 //var x = 10;
 //let k, z;
 //let y = 20, m = -23;
 //m = 24;
 //x = 23;
 //sayHello = '23232';

 //let b = (a)*(1) + (a);

function merge_Arrays(left_sub_array, right_sub_array) {
         let array = []
         while (left_sub_array.length && right_sub_array.length) {
            if (left_sub_array[0] < right_sub_array[0]) {
               array.push(left_sub_array.shift())
            } else {
               array.push(right_sub_array.shift())
            }
         }
         return [ ...array, ...left_sub_array, ...right_sub_array ]
      }
      function merge_sort(unsorted_Array) {
         const middle_index = unsorted_Array.length / 2
         if(unsorted_Array.length < 2) {
            return unsorted_Array
         }
         const left_sub_array = unsorted_Array.splice(0, middle_index)
         return merge_Arrays(merge_sort(left_sub_array),merge_sort(unsorted_Array))
      }
     let  unsorted_Array = [39, 28, 44, 4, 10, 83, 11];

console.log(merge_sort(unsorted_Array));


//let arr = [3, 2, 1, 4, 5, 6, 7, 8, 9, 10];
//function bubbleSort(arr) {
    //let n = arr.length;
    //for (let i = 0; i < arr.length; i++) {
        //for (let j = 0; j < arr.length - i - 1; j++) {
            //if (arr[j] > arr[j + 1]) {
                //let temp = arr[j];
                //arr[j] = arr[j + 1];
                //arr[j + 1] = temp;
            //}
            //else {
                //continue;
            //}
        //}
    //}
//}

//bubbleSort(arr);
//console.log(arr);


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
