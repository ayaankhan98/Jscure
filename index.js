import chiffon from "chiffon";

let sourceProgram = `
    let a = 1;
    let b = 2;
    let c = a + b;
    console.log(c);
`;

const options = {};

let tokens = chiffon.tokenize(sourceProgram, options);
let AST = chiffon.parse(sourceProgram, options);
console.log(tokens);
console.log(JSON.stringify(AST, 2, ' '));