import esprima from "esprima";
import escodegen from "escodegen";
import fs from "fs";
import esmangle from "esmangle";
import UglifyJS from "uglify-js";
import { assert } from "console";

let sourceProgram = fs.readFileSync("./sourceProgram.js").toString();
const minRandomLength = 6;
const maxRandomLength = 20;
let ast = esprima.parseScript(sourceProgram);

let cache = {};

function obfuscate() {
  traverse(ast);
  deadCodeTransformer();
}

obfuscate();

function replaceStringLiteral(node, func) {
  func(node);
  for (const key in node) {
    if (node.hasOwnProperty(key)) {
      const child = node[key];
      if (typeof child === "object" && child !== null) {
        if (Array.isArray(child)) {
          child.forEach((node) => replaceStringLiteral(node, func));
        } else {
          replaceStringLiteral(child, func);
        }
      }
    }
  }
}

// replaceStringLiteral(ast, (node) => {
//   if (node.type === 'Literal' && typeof node.value === 'string') {
//     const unicodeStr = stringToUnicode(node.value);
//     console.log(unicodeStr);
//     node.value = unicodeStr;
//   }
// });

function stringToUnicode(str) {
  let unicodeStr = "";
  for (let i = 0; i < str.length; i++) {
    const hex = str.charCodeAt(i).toString(16).padStart(4, "0");
    unicodeStr += "\\u" + hex;
  }
  return unicodeStr;
}

function traverse(ast) {
  ast.body.forEach((node) => {
    switch (node.type) {
      case "VariableDeclaration":
        handleVariableDeclaration(node);
        break;

      case "ExpressionStatement":
        if (node.expression.type === "AssignmentExpression") {
          if (node.expression.left?.type === "Identifier") {
            let oldIdentifier = node.expression.left.name;
            if (cache[oldIdentifier]) {
              node.expression.left.name = cache[oldIdentifier];
            }
          }
          if (node.expression.right?.type === "Identifier") {
            let oldIdentifier = node.expression.right.name;
            if (cache[oldIdentifier]) {
              node.expression.right.name = cache[oldIdentifier];
            }
          }
          if (
            node.expression.right?.type === "BinaryExpression" ||
            node.expression.right?.type === "LogicalExpression" ||
            node.expression.right?.type === "MemberExpression"
          ) {
            handleExpression(node.expression.right);
          }
          if (
            node.expression.left?.type === "MemberExpression" ||
            node.expression.left?.type === "BinaryExpression" ||
            node.expression.left?.type === "LogicalExpression"
          ) {
            handleExpression(node.expression.left);
          }
        } else if (node.expression.type === "CallExpression") {
          handleCallExpression(node.expression);
        }
        break;

      case "FunctionDeclaration":
        if (node.id.type === "Identifier") {
          let oldIdentifier = node.id.name;
          let randomHexLength =
            Math.floor(Math.random() * maxRandomLength) + minRandomLength;
          let newIdentifier = generateRandomHex(randomHexLength);
          cache[oldIdentifier] = newIdentifier;
          node.id.name = newIdentifier;
        }
        if (node.params.length > 0) {
          node.params.forEach((param) => {
            if (param.type === "Identifier") {
              let oldIdentifier = param.name;
              if (cache[oldIdentifier]) {
                param.name = cache[oldIdentifier];
              } else {
                let newIdentifier = generateRandomString();
                cache[oldIdentifier] = newIdentifier;
                param.name = newIdentifier;
              }
            }
          });
        }
        if (node.body.type === "BlockStatement") {
          traverse(node.body);
        }
        break;

      case "IfStatement":
        if (node.test.type === "BinaryExpression") {
          handleExpression(node.test);
        }
        if (node.test.type === "LogicalExpression") {
          handleExpression(node.test);
        }
        if (node.consequent.type === "BlockStatement") {
          traverse(node.consequent);
        }
        if (node.alternate?.type === "BlockStatement") {
          traverse(node.alternate);
        }
        break;

      case "ForStatement":
        if (node.init.type === "VariableDeclaration") {
          handleVariableDeclaration(node.init);
        }
        if (node.test.type === "BinaryExpression") {
          handleExpression(node.test);
        }
        if (node.update.type === "UpdateExpression") {
          handleUpdateExpression(node.update);
        }
        if (node.body.type === "BlockStatement") {
          traverse(node.body);
        }
        break;

      case "WhileStatement":
        if (node.test.type === "LogicalExpression" ||
        node.test.type === "BinaryExpression" ||
        node.test.type === "MemberExpression") {
          handleExpression(node.test);
        }
        if (node.body.type === "BlockStatement") {
          traverse(node.body);
        }
        break;

      case "ReturnStatement":
        if (node.argument.type === "Identifier") {
              let oldIdentifier = node.argument.name;
              if (cache[oldIdentifier]) {
                node.argument.name = cache[oldIdentifier];
              }
              else {
                let newIdentifier = generateRandomString();
                cache[oldIdentifier] = newIdentifier;
                node.argument.name = newIdentifier;
              }
        }
        if (node.argument.type === "CallExpression") {
          handleCallExpression(node.argument);
        }
        if (node.argument.type === "ArrayExpression") {
          handleExpression(node.argument);;
        }
        break;

      case "ClassDeclaration":
        if (node.id.type === "Identifier") {
          let oldIdentifier = node.id.name;
          let randomHexLength =
            Math.floor(Math.random() * maxRandomLength) + minRandomLength;
          let newIdentifier = generateRandomHex(randomHexLength);
          cache[oldIdentifier] = newIdentifier;
          node.id.name = newIdentifier;
        }
        break;
    }
  });
}

function transformNumericLiterals(node) {
  if (node.type === "Literal" && typeof node.value === "number") {
    const isHex = /^0x/i.test(node.raw);
    const isOctal = /^0o/i.test(node.raw);
    const isBinary = /^0b/i.test(node.raw);
    const value =
      isHex || isOctal || isBinary ? node.value : node.value.toString();
    const replacement =
      isHex || isOctal || isBinary
        ? `parseInt('${node.raw}', 0)`
        : `parseFloat('${node.raw}')`;
    node.type = "CallExpression";
    node.callee = {
      type: "Identifier",
      name: replacement.split("(")[0],
    };
    node.arguments = [
      {
        type: "Literal",
        value: value,
        raw: value.toString(),
      },
    ];
  }
}

function handleCallExpression(node) {
  if (node.callee?.type === "Identifier") {
    let oldIdentifier = node.callee.name;
    if (cache[oldIdentifier]) {
      node.callee.name = cache[oldIdentifier];
    }
  }
  if (node.callee?.type === "MemberExpression") {
    handleExpression(node.callee)
  }
  if (node.arguments.length > 0) {
    node.arguments.forEach((arg) => {
      if (arg.type === "Identifier") {
        let oldIdentifier = arg.name;
        if (cache[oldIdentifier]) {
          arg.name = cache[oldIdentifier];
        }
      }
      if (
        arg.type === "BinaryExpression" ||
        arg.type === "LogicalExpression" ||
        arg.type === "MemberExpression"
      ) {
        handleExpression(arg);
      }
      if (arg.type === "CallExpression") {
        handleCallExpression(arg);
      }
    });
  }
}

function handleVariableDeclaration(node) {
  node.declarations.forEach((declaration) => {
    if (declaration.id.type === "Identifier") {
      let oldIdentifier = declaration.id.name;
      let newIdentifier = generateRandomString();
      cache[oldIdentifier] = newIdentifier;
      declaration.id.name = newIdentifier;
    }
    if (
      declaration.init?.type === "BinaryExpression" ||
      declaration.init?.type === "LogicalExpression" ||
      declaration.init?.type === "MemberExpression"
    ) {
      handleExpression(declaration.init);
    }
    if (declaration.init?.type === "CallExpression") {
      handleCallExpression(declaration.init);
    }
    if (declaration.init?.type === "Literal") {
      transformNumericLiterals(declaration.init);
    }
    if (declaration.init?.type === "ArrayExpression") {
      declaration.init.elements.forEach((element) => {
        if (element.type === "Literal") {
          transformNumericLiterals(element);
        }
        if (element.type === "SpreadElement") {
          handleExpression(element.argument);
        }
      });
    }
  });
}

function handleUpdateExpression(node) {
  if (node.argument.type === "Identifier") {
    let oldIdentifier = node.argument.name;
    if (cache[oldIdentifier]) {
      node.argument.name = cache[oldIdentifier];
    }
  }
}

function handleExpression(node) {
  if (node.type === "Identifier") {
    let oldIdentifier = node.name;
    if (cache[oldIdentifier]) {
      node.name = cache[oldIdentifier];
    }
  }
  if (node.left?.type === "Identifier") {
    let oldIdentifier = node.left.name;
    if (cache[oldIdentifier]) {
      node.left.name = "(" + cache[oldIdentifier] + ")";
    }
  }
  if (node.left?.type === "Literal") {
    transformNumericLiterals(node.left);
  }
  if (node.right?.type === "Literal") {
    transformNumericLiterals(node.right);
  }
  if (node.right?.type === "Identifier") {
    let oldIdentifier = node.right.name;
    if (cache[oldIdentifier]) {
      node.right.name = cache[oldIdentifier];
    }
  }
  if (node.object?.type === "Identifier") {
    let oldIdentifier = node.object.name;
    if (cache[oldIdentifier]) {
      node.object.name = cache[oldIdentifier];
    }
  }
  if (node.property?.type === "Identifier") {
    let oldIdentifier = node.property.name;
    if (cache[oldIdentifier]) {
      node.property.name = cache[oldIdentifier];
    }
  }
  if (
    node.left?.type === "BinaryExpression" ||
    node.left?.type === "LogicalExpression" ||
    node.left?.type === "MemberExpression"
  ) {
    handleExpression(node.left);
  }
  if (
    node.right?.type === "BinaryExpression" ||
    node.right?.type === "LogicalExpression" ||
    node.right?.type === "MemberExpression"
  ) {
    handleExpression(node.right);
  }
  if (
    node.property?.type === "BinaryExpression" ||
    node.property?.type === "LogicalExpression" ||
    node.property?.type === "MemberExpression"
  ) {
    handleExpression(node.property);
  }
  if (
    node.object?.type === "BinaryExpression" ||
    node.object?.type === "LogicalExpression" ||
    node.object?.type === "MemberExpression"
  ) {
    handleExpression(node.object);
  }
  if (node.type === "ArrayExpression") {
    node.elements.forEach(element => {
      if (element.type === "SpreadElement") {
        handleExpression(element.argument);
      }
    });
  }
}

function generateRandomString() {
  let length = Math.floor(Math.random() * 10) + 5;
  let characters =
    "_0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "_";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateRandomHex(length) {
  var hex = "_0x";
  var possible = "0123456789abcdef";

  for (var i = 0; i < length; i++) {
    hex += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return hex;
}

function generateRandomHexNumber(length) {
  var hex = "0x";
  var possible = "0123456789abcdef";
  for (var i = 0; i < length; i++) {
    hex += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return hex;
}

function deadCodeVariableNameGenerator() {
  let length = Math.floor(Math.random() * 10) + 5;
  let characters =
    "_0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "__";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function generateFalseExpression() {
  const operators = ["&&", "||"];
  const operands = ["false", "null", "undefined", "0", "NaN", "''"];

  let expression = "";
  let numOperands = Math.floor(Math.random() * 3) + 2;

  for (let i = 0; i < numOperands - 1; i++) {
    expression += operands[Math.floor(Math.random() * operands.length)];
    expression +=
      " " + operators[Math.floor(Math.random() * operators.length)] + " ";
  }

  expression += operands[Math.floor(Math.random() * operands.length)];

  return expression;
}

function generateExpression(depth) {
  if (depth == 0) {
    // base case: return a random number
    return generateRandomHexNumber(4);
  } else {
    // recursive case: generate an expression
    let operator;
    if (depth == 1) {
      // at the bottom level, use only arithmetic operators
      operator = Math.random() < 0.5 ? "+" : "-";
    } else if (depth == 2) {
      // at the middle level, use arithmetic and comparison operators
      operator =
        Math.random() < 0.33
          ? "+"
          : Math.random() < 0.67
          ? "-"
          : Math.random() < 0.5
          ? "<"
          : ">";
    } else {
      // at the top level, use all operators
      operator =
        Math.random() < 0.2
          ? "+"
          : Math.random() < 0.4
          ? "-"
          : Math.random() < 0.6
          ? "*"
          : Math.random() < 0.8
          ? "/"
          : Math.random() < 0.5
          ? "<"
          : ">";
    }
    let left = generateExpression(depth - 1);
    let right = generateExpression(depth - 1);
    return `(${left} ${operator} ${right})`;
  }
}

function generateTestConditionVariables() {
  let numberOfVars = Math.floor(Math.random() * 6) + 2;
  let vars = [];
  for (let i = 0; i < numberOfVars; i++) {
    let value =
      Math.floor(Math.random() * 100) + 1 > 50
        ? true
        : generateFalseExpression();
    vars[i] = { name: deadCodeVariableNameGenerator(), value };
  }
  let code = "";
  for (let i = 0; i < numberOfVars; i++) {
    code += `let ${vars[i].name} = ${vars[i].value};`;
  }
  return { code, vars };
}

function generateTestCondition(varNames) {
  shuffleArray(varNames);
  let condition = "(";
  let operators = ["===", "!==", ">", "<", ">=", "<=", "&&", "||"];
  for (let i = 0; i < varNames.length - 1; i++) {
    if (i !== varNames.length - 2)
      condition += `${varNames[i].name} ${
        operators[Math.floor(Math.random() * operators.length)]
      } ${varNames[i + 1].name} ${
        operators[Math.floor(Math.random() * operators.length)]
      }`;
    else
      condition += `${varNames[i].name} ${
        operators[Math.floor(Math.random() * operators.length)]
      } ${varNames[i + 1].name}`;
  }
  condition += ")";
  condition += `&& (${generateFalseExpression()})`;
  return condition;
}

function generateBlockStatement() {
  let code = "";
  code += generateArrayExpression();
  code += generateExpression(Math.floor(Math.random() * 5) + 1);
  return code;
}

function generateNumberOfElseIfBlocks(varNames) {
  let code = "";
  let numberOfElseIfBlocks = Math.floor(Math.random() * 5) + 1;
  for (let i = 0; i < numberOfElseIfBlocks; i++) {
    code += ` else if ((${generateTestCondition(
      varNames
    )}) && ${generateFalseExpression()}) {
      ${generateBlockStatement()}
    }`;
  }
  return code;
}

function generateIfStatement() {
  let vars = generateTestConditionVariables();
  let code = vars.code;
  let names = vars.vars;
  let codePattern = [
    `${code}
    if ((${generateTestCondition(names)}) && ${generateFalseExpression()}) {
      ${generateBlockStatement().toString()}
    };
    `,

    `${code}
    if ((${generateTestCondition(names)}) && ${generateFalseExpression()}) {
      ${generateBlockStatement()}
      }` +
      `
      ${generateNumberOfElseIfBlocks(names)}
      ` +
      `else {
        ${generateBlockStatement()}
      }`,

    `${code}
    if ((${generateTestCondition(names)}) && ${generateFalseExpression()}) {
      ${generateBlockStatement()}
      }
      else {
        ${generateBlockStatement()}
      }`,
  ];
  code = codePattern[Math.floor(Math.random() * codePattern.length)];
  return code;
}

function generateForInitializerStatement(vars) {
  let code = "let ";
  for (let i = 0; i < vars.vars.length; i++) {
    if (i == vars.vars.length - 1)
      code += `${vars.vars[i].name} = ${Math.floor(Math.random() * 20) + 1}`;
    else
      code += `${vars.vars[i].name} = ${Math.floor(Math.random() * 20) + 1},`;
  }
  code += ";";
  code += generateTestCondition(vars.vars);
  code += ";";
  return code;
}

function generateLoopStatement() {
  let vars = generateTestConditionVariables();
  let codePattern = [
    `
      for (${generateForInitializerStatement(vars)}) {
        ${generateBlockStatement()}
      }
    `,
    `
      ${vars.code}
      while(${generateTestCondition(vars.vars)}) {
        ${generateBlockStatement()}
      }
    `,
  ];
  let code = codePattern[Math.floor(Math.random() * codePattern.length)];
  return code;
}

function generateArrayExpression() {
  let numberOfElements = Math.floor(Math.random() * 5) + 1;
  let code = "let ";
  code += deadCodeVariableNameGenerator();
  code += " = [";
  let arrayType = ["number", "string", "boolean"];
  let type = arrayType[Math.floor(Math.random() * arrayType.length)];
  for (let i = 0; i < numberOfElements; i++) {
    if (i == numberOfElements - 1) {
      if (type == "number") code += Math.floor(Math.random() * 100);
      else if (type == "string") code += `'${deadCodeVariableNameGenerator()}'`;
      else if (type == "boolean")
        code += Math.floor(Math.random() * 100) > 50 ? "true" : "false";
    } else {
      if (type == "number") code += Math.floor(Math.random() * 100) + ",";
      else if (type == "string")
        code += `'${deadCodeVariableNameGenerator()}',`;
      else if (type == "boolean")
        code += Math.floor(Math.random() * 100) > 50 ? "true," : "false,";
    }
  }
  code += "];";
  return code;
}

function generateArrayUnfoldIterator(arr) {}

function generateNormalFunction() {
  return `function ${deadCodeVariableNameGenerator()} () {${generateBlockStatement()}}`;
}

function generateArrowFunction() {}

function insertAt(array, index, ...elementsArray) {
  array.splice(index, 0, ...elementsArray);
}

function deadCodeTransformer() {
  let numberOfTransforms = Math.floor(Math.random() * 10) + 2;
  let transfroms = [
    "generateIfStatement",
    "generateLoopStatement",
    "generateNormalFunction",
  ];
  for (let i = 0; i < numberOfTransforms; i++) {
    let randomTransform =
      transfroms[Math.floor(Math.random() * transfroms.length)];
    let transformerCode = eval(randomTransform)();
    let transformerCodeAST = esprima.parseScript(transformerCode);
    let k = -1;
    for (let j = 0; j < ast.body.length - 1; j++) {
      if (k < transformerCodeAST.body.length - 1) {
        k++;
      } else {
        break;
      }
      insertAt(ast.body, j, transformerCodeAST.body[k]);
    }
    if (k < transformerCodeAST.body.length) {
      while (k < transformerCodeAST.body.length) {
        ast.body.push(transformerCodeAST.body[k++]);
      }
    }
  }
}

// console.log(JSON.stringify(esprima.parseScript(generateIfStatement()), null, 2));

// console.log(generateBlockStatement());

let obfuscatedOutput = escodegen.generate(ast, {format: {compact: true}});
// obfuscatedOutput = UglifyJS.minify(obfuscatedOutput).code;
console.log(obfuscatedOutput);
//eval(obfuscatedOutput);
//eval(sourceProgram);
// assert(eval(obfuscatedOutput) === eval(sourceProgram));
 //console.log(JSON.stringify(ast, null, 2));
