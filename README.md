# Jscure
Jscure is a javascript obfuscator based on esprima standard supportig ES6 obfuscation.

We analyze the different techniques which are used to thwart reverse engineers and to protect against malicious code injection and attacks. Obfuscation, in software technology, is the deliberate act of creating an obfuscated code that is difficult for humans to understand. Code obfuscation is a protective mechanism which is used to reduce the attack activities on a software system. It is a behavior preserving program transformation which aims to make a program unintelligible to automated program comprehension tools. Though obfuscation transformations can protect code, they have limitations in the form of larger code footprints and reduced performance. Code obfuscation is convenient in situations where depending on cryptographic techniques is not enough; this is normal in remote execution situations where the software is executed on an unforeseen exposed hostile environment, such as the new computing platforms: cloud-computing paradigm and smartphones.

# Technologies
- Javascript
- Node.js

# Status
Under development.

# Results
### Snippet 1
Original code
```javascript
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
```
Obfuscated code
```text()
for(let __p4A3xQKI=11,__kSbHx1HZgzEfsW=20;(__p4A3xQKI||__kSbHx1HZgzEfsW)&&(false||undefined);){let __1wv3ve=[false,true,false];51903+40950+(30844+37602)-(33328+14229+(61006+10438))+(44184-38235>19620+64404)*(51190+59729-(61535+17668))+(59656+42787-(1330+55386)+(45425-47664+(64892-16418))-(44910-52259+(9410+50427)-(33974+58495+(24252+40730))));}let __QVrgBpbgOC0d8q=null||NaN||false;let ___nKm5T3tmjYg=true;let __hk4j0MeX2fh=NaN||undefined&&false&&null;let __R7OfKKQtR29Rh=false&&null;let __GZKz7UlVPDHVI=true;let __BvwrBa55hz5=true;let __ruMjegB=undefined&&NaN&&''&&NaN;while((__hk4j0MeX2fh<=__BvwrBa55hz5||__BvwrBa55hz5<=__R7OfKKQtR29Rh&&__R7OfKKQtR29Rh<=___nKm5T3tmjYg<___nKm5T3tmjYg>=__ruMjegB<__ruMjegB&&__QVrgBpbgOC0d8q<__QVrgBpbgOC0d8q||__GZKz7UlVPDHVI)&&(''||0||0&&undefined)){let __JgLB49eAC4dvs=[95,38,50,27];(3199+26785<63197+48841)*(24801-12521>50102-30793);}let _NFyfECbmoVwcJ=[parseFloat('3'),parseFloat('2'),parseFloat('1'),parseFloat('4'),parseFloat('5'),parseFloat('6'),parseFloat('7'),parseFloat('8'),parseFloat('9'),parseFloat('10')];function _0xf2fc76149501ab(_NFyfECbmoVwcJ){let _oS7TKkUEAOpq=_NFyfECbmoVwcJ.length;for(let _y3IJZ587GW=parseFloat('0');(_y3IJZ587GW)<_NFyfECbmoVwcJ.length;_y3IJZ587GW++){for(let _m1Qt4UEmh__fZ=parseFloat('0');(_m1Qt4UEmh__fZ)<_NFyfECbmoVwcJ.length-_y3IJZ587GW-parseFloat('1');_m1Qt4UEmh__fZ++){if(_NFyfECbmoVwcJ[_m1Qt4UEmh__fZ]>_NFyfECbmoVwcJ[(_m1Qt4UEmh__fZ)+parseFloat('1')]){let _Igmf6=_NFyfECbmoVwcJ[_m1Qt4UEmh__fZ];_NFyfECbmoVwcJ[_m1Qt4UEmh__fZ]=_NFyfECbmoVwcJ[(_m1Qt4UEmh__fZ)+parseFloat('1')];_NFyfECbmoVwcJ[(_m1Qt4UEmh__fZ)+parseFloat('1')]=_Igmf6;}else{continue;}}}}_0xf2fc76149501ab(_NFyfECbmoVwcJ);console.log(_NFyfECbmoVwcJ);while((__hk4j0MeX2fh<=__BvwrBa55hz5||__BvwrBa55hz5<=__R7OfKKQtR29Rh&&__R7OfKKQtR29Rh<=___nKm5T3tmjYg<___nKm5T3tmjYg>=__ruMjegB<__ruMjegB&&__QVrgBpbgOC0d8q<__QVrgBpbgOC0d8q||__GZKz7UlVPDHVI)&&(''||0||0&&undefined)){let __JgLB49eAC4dvs=[95,38,50,27];(3199+26785<63197+48841)*(24801-12521>50102-30793);}for(let __p4A3xQKI=11,__kSbHx1HZgzEfsW=20;(__p4A3xQKI||__kSbHx1HZgzEfsW)&&(false||undefined);){let __1wv3ve=[false,true,false];51903+40950+(30844+37602)-(33328+14229+(61006+10438))+(44184-38235>19620+64404)*(51190+59729-(61535+17668))+(59656+42787-(1330+55386)+(45425-47664+(64892-16418))-(44910-52259+(9410+50427)-(33974+58495+(24252+40730))));}
```

### Snippet 2
Original code
```javascript
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
```

Obfuscated code
```javascript
function __g_QiaAQG3a9i(){let __bC1o5wGO=[77,83];3141+52749-(20452+43773);}let __isZPOaY1t8Bu=true;let __ep4MtlN6zj=true;while(__isZPOaY1t8Bu===__ep4MtlN6zj&&(null||0&&false&&NaN)){let __xEqMogwSqKwj=[57,61,59,51,59];41912-5629-(5659-47339);}function __8arh_GVw(){let __LRfbSq0=['__eTfnsmnvM8','__rqlXWPN','__xzSneXZknTJo'];37195-23362>14492-32521;}let __xlpw4wUFCb3xCE=0||'';let __mCKPqPwEEkCcF=true;let __yiJCC_sIhsG90=true;let __UkWx88Gu8tcLyC=true;while(__mCKPqPwEEkCcF&&__xlpw4wUFCb3xCE!==__xlpw4wUFCb3xCE<=__UkWx88Gu8tcLyC!==__UkWx88Gu8tcLyC>=__yiJCC_sIhsG90&&(0||null&&false&&'')){let __1wIOxfwqAT2t=[68,71];(18924-6631<44714+49597)-(51052+29582+(20645+1118))-(8099-22448+(3740-58286)<(49659+37493<30294+19277));}let __XozryY3gnxpa2l=false&&NaN;let __QwxzPBu5sDrZ9=false||0;let __tNIHAUDYNe1fE3=true;let __vvD2MEXkKvj=null||null||undefined;let __eoYR0t42rmpIk=undefined||''||0;let __ZELDAr2gQC8N=0||0||undefined;while(__XozryY3gnxpa2l===__QwxzPBu5sDrZ9<__QwxzPBu5sDrZ9===__ZELDAr2gQC8N>=__ZELDAr2gQC8N<=__vvD2MEXkKvj>__vvD2MEXkKvj<=__tNIHAUDYNe1fE3>__tNIHAUDYNe1fE3>=__eoYR0t42rmpIk&&(NaN&&0||'')){let __BzemQfK=['__Z0WLLJQzYo','__2wC7B8sLruvnwc','__hiMKJbwxdHQjwa'];42592-43323;}for(let __8V5psM9MTuN32y=6,__PZRXI=12;(__8V5psM9MTuN32y||__PZRXI)&&(0&&undefined);){let __KyPw4KdUDrXYeg=['__BkEZzjZka6','__Jl6oLm9fF9','__78CH7y','__IZF_gWdo','__opuSAp'];56210+20228-(35386+87);}function __YJf5qMy9R(){let __MEaxoai=['__uZ7_hi','__RsdiC','__I22dFzgH4T','__Qxn8kh1','__ryDNcsozz'];16085-22905+(37555-33097)-(34214+36726+(49582-14169));}function __W9m_un(){let __mkg4TlV=['__uCGusFGn','__ch38t2Uxfn_y_I','__vbobWEB2IYX'];(49148-5672<7659-7867)-(50522-32920<7792+30173)+((33646-9683>19107+55817)+(5820+18766<59474-7443));}function _0xeddf3c40cd(_TMwZp,_SA1Rx){let _WZWuf=[];while(_TMwZp.length&&_SA1Rx.length){if(_TMwZp[0]<_SA1Rx[0]){_WZWuf.push(_TMwZp.shift());}else{_WZWuf.push(_SA1Rx.shift());}}return[..._WZWuf,..._TMwZp,..._SA1Rx];}function _0x30347f4d5(_4sqUW){const _AfYUQlwkR=_4sqUW.length/parseFloat('2');if(_4sqUW.length<parseFloat('2')){return _4sqUW;}const _a09CPYoA=_4sqUW.splice(0,_AfYUQlwkR);return _0xeddf3c40cd(_0x30347f4d5(_a09CPYoA),_0x30347f4d5(_4sqUW));}let _HBVLTi=[parseFloat('39'),parseFloat('28'),parseFloat('44'),parseFloat('4'),parseFloat('10'),parseFloat('83'),parseFloat('11')];console.log(_0x30347f4d5(_HBVLTi));function __W9m_un(){let __mkg4TlV=['__uCGusFGn','__ch38t2Uxfn_y_I','__vbobWEB2IYX'];(49148-5672<7659-7867)-(50522-32920<7792+30173)+((33646-9683>19107+55817)+(5820+18766<59474-7443));}function __YJf5qMy9R(){let __MEaxoai=['__uZ7_hi','__RsdiC','__I22dFzgH4T','__Qxn8kh1','__ryDNcsozz'];16085-22905+(37555-33097)-(34214+36726+(49582-14169));}for(let __8V5psM9MTuN32y=6,__PZRXI=12;(__8V5psM9MTuN32y||__PZRXI)&&(0&&undefined);){let __KyPw4KdUDrXYeg=['__BkEZzjZka6','__Jl6oLm9fF9','__78CH7y','__IZF_gWdo','__opuSAp'];56210+20228-(35386+87);}while(__XozryY3gnxpa2l===__QwxzPBu5sDrZ9<__QwxzPBu5sDrZ9===__ZELDAr2gQC8N>=__ZELDAr2gQC8N<=__vvD2MEXkKvj>__vvD2MEXkKvj<=__tNIHAUDYNe1fE3>__tNIHAUDYNe1fE3>=__eoYR0t42rmpIk&&(NaN&&0||'')){let __BzemQfK=['__Z0WLLJQzYo','__2wC7B8sLruvnwc','__hiMKJbwxdHQjwa'];42592-43323;}while(__mCKPqPwEEkCcF&&__xlpw4wUFCb3xCE!==__xlpw4wUFCb3xCE<=__UkWx88Gu8tcLyC!==__UkWx88Gu8tcLyC>=__yiJCC_sIhsG90&&(0||null&&false&&'')){let __1wIOxfwqAT2t=[68,71];(18924-6631<44714+49597)-(51052+29582+(20645+1118))-(8099-22448+(3740-58286)<(49659+37493<30294+19277));}function __8arh_GVw(){let __LRfbSq0=['__eTfnsmnvM8','__rqlXWPN','__xzSneXZknTJo'];37195-23362>14492-32521;}while(__isZPOaY1t8Bu===__ep4MtlN6zj&&(null||0&&false&&NaN)){let __xEqMogwSqKwj=[57,61,59,51,59];41912-5629-(5659-47339);}function __g_QiaAQG3a9i(){let __bC1o5wGO=[77,83];3141+52749-(20452+43773);}
```