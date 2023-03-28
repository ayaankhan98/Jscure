
class NameTransformer {
    
};

/**
 * 
 * @param {Integer} hashLength - length of random hash value
 * @param {Integer} minVal - minimum value of random number 
 * @param {Integer} maxVal - maximum value of random number 
 * @returns {string} random hash value string
 */
let randomHashGenerator = (hashLength = 30, minVal = 0, maxVal = 100) => {
    let randomHashValue = "_0x";
    while(randomHashValue.length <= hashLength) {
        let x = parseInt(Math.random() * (maxVal - minVal) + minVal);
        randomHashValue = randomHashValue.concat(x.toString(16));
    }
    return randomHashValue;
};

let testRandomHashGenerator = () => {
    for(let i = 0; i < 20; i++) {
        console.log(randomHashGenerator(30));
    }
}

export default {
    randomHashGenerator, testRandomHashGenerator
};