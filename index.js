import esprima from 'esprima';

let sourceProgram = `
    let a = 10;
    console.log(a);
`;

let tokens = esprima.tokenize(sourceProgram);
console.log(tokens);

let AST = esprima.parseScript(sourceProgram);
console.log(JSON.stringify(AST, null, ' '));