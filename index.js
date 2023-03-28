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

traverse(ast);

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
  if (node.left?.type === "Identifier") {
    let oldIdentifier = node.left.name;
    if (cache[oldIdentifier]) {
      node.left.name = '(' + cache[oldIdentifier] + ')';
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

function generateTestCondition() {
  let testExpressions = ["LogicalExpression", "BinaryExpression"];
  let operators = [
    "instanceof",
    "in",
    "+",
    "-",
    "*",
    "/",
    "%",
    "**",
    "|",
    "^",
    "&",
    "==",
    "!=",
    "===",
    "!==",
    "<",
    ">",
    "<=",
    "<<",
    ">>",
    ">>>",
    "||",
    "&&",
  ];
  let testExpression =
    testExpressions[Math.floor(Math.random() * testExpressions.length)];
  let testCondition = {
    type: testExpression,
  };
  if (testExpression != "MemberExpression") {
    let operator = operators[Math.floor(Math.random() * operators.length)];
    testCondition.operator = operator;
    let leftVal = generateRandomHexNumber(5);
    let rightVal = generateRandomHexNumber(5);
    testCondition.left = {
      type: "Literal",
      value: leftVal,
      raw: leftVal.toString(),
    };
    testCondition.right = {
      type: "Literal",
      value: rightVal,
      raw: rightVal.toString(),
    };
  } else {
  }
  return testCondition;
}

function generateBlockStatement() {
  let blockStatement = [];
  let numberOfStatements = Math.floor(Math.random() * 5);
  for (let i = 0; i < numberOfStatements; i++) {
    let statement = generateStatement();
    blockStatement.push(statement);
  }
  return blockStatement;
}

function generateStatement() {
  let statements = [
    "ExpressionStatement",
    "BlockStatement",
    "IfStatement",
    "WhileStatement",
    "ForStatement",
    "ForInStatement",
    "ForOfStatement",
    "DoWhileStatement",
    "SwitchStatement",
    "TryStatement"
  ]
  let statement = statements[Math.floor(Math.random() * statements.length)];
  if (statement === "ExpressionStatement") {
    return generateExpressionStatement();
  }
  if (statement === "BlockStatement") {
    return generateBlockStatement();
  }
  if (statement === "IfStatement") {
    return generateIfStatement();
  }
  if (statement === "WhileStatement") {
    return generateWhileStatement();
  }
  if (statement === "ForStatement") {
    return generateForStatement();
  }
  if (statement === "ForInStatement") {
    return generateForInStatement();
  }
  if (statement === "ForOfStatement") {
    return generateForOfStatement();
  }
  if (statement === "DoWhileStatement") {
    return generateDoWhileStatement();
  }
  if (statement === "SwitchStatement") {
    return generateSwitchStatement();
  }
  if (statement === "TryStatement") {
    return generateTryStatement();
  }
}

function generateTryStatement() {
  let tryStatement = {
    type: "TryStatement",
    block: generateBlockStatement(),
    handler: generateCatchClause(),
  };
  return tryStatement;
}

function generateCatchClause() {
  let catchClause = {
    type: "CatchClause",
    param: generateIdentifier(),
    body: generateBlockStatement(),
  };
  return catchClause;
}

function generateIdentifier() {
  let identifier = {
    type: "Identifier",
    name: generateRandomString(),
  };
  return identifier;
}

function generateSwitchStatement() {
  let switchStatement = {
    type: "SwitchStatement",
    discriminant: generateIdentifier(),
    cases: generateSwitchCase(),
  };
  return switchStatement;
}

function generateSwitchCase() {
  let switchCase = [];
  let numberOfCases = Math.floor(Math.random() * 5);
  for (let i = 0; i < numberOfCases; i++) {
    let caseStatement = {
      type: "SwitchCase",
      test: generateIdentifier(),
      consequent: generateBlockStatement(),
    };
    switchCase.push(caseStatement);
  }
  return switchCase;
}

function generateDoWhileStatement() {
  let doWhileStatement = {
    type: "DoWhileStatement",
    test: generateTestCondition(),
    body: generateBlockStatement(),
  };
  return doWhileStatement;
}

function generateForOfStatement() {
  let forOfStatement = {
    type: "ForOfStatement",
    left: generateIdentifier(),
    right: generateIdentifier(),
    body: generateBlockStatement(),
  };
  return forOfStatement;
}

function generateForInStatement() {
  let forInStatement = {
    type: "ForInStatement",
    left: generateIdentifier(),
    right: generateIdentifier(),
    body: generateBlockStatement(),
  };
  return forInStatement;
}

function generateForStatement() {
  let forStatement = {
    type: "ForStatement",
    init: generateIdentifier(),
    test: generateTestCondition(),
    update: generateIdentifier(),
    body: generateBlockStatement(),
  };
  return forStatement;
}

function generateWhileStatement() {
  let whileStatement = {
    type: "WhileStatement",
    test: generateTestCondition(),
    body: generateBlockStatement(),
  };
  return whileStatement;
}

function generateIfStatement() {
  let ifStatement = {
    type: "IfStatement",
    test: generateTestCondition(),
    consequent: generateBlockStatement(),
    alternate: generateBlockStatement(),
  };
  return ifStatement;
}

function generateExpressionStatement() {
  let expressionStatement = {
    type: "ExpressionStatement",
    expression: generateExpression(),
  };
  return expressionStatement;
}

function generateExpression() {
  let expressions = [
    "AssignmentExpression",
    "BinaryExpression",
    "CallExpression",
    "ConditionalExpression",
    "LogicalExpression",
    "MemberExpression",
    "NewExpression",
    "SequenceExpression",
    "UnaryExpression",
    "UpdateExpression",
  ];
  let expression = expressions[Math.floor(Math.random() * expressions.length)];
  if (expression === "AssignmentExpression") {
    return generateAssignmentExpression();
  }
  if (expression === "BinaryExpression") {
    return generateBinaryExpression();
  }
  if (expression === "CallExpression") {
    return generateCallExpression();
  }
  if (expression === "ConditionalExpression") {
    return generateConditionalExpression();
  }
  if (expression === "LogicalExpression") {
    return generateLogicalExpression();
  }
  if (expression === "MemberExpression") {
    return generateMemberExpression();
  }
  if (expression === "NewExpression") {
    return generateNewExpression();
  }
  if (expression === "SequenceExpression") {
    return generateSequenceExpression();
  }
  if (expression === "UnaryExpression") {
    return generateUnaryExpression();
  }
  if (expression === "UpdateExpression") {
    return generateUpdateExpression();
  }
}

function generateAssignmentExpression() {
  let assignmentExpression = {
    type: "AssignmentExpression",
    operator: "=",
    left: generateRandomHexNumber(5),
    right: generateRandomHexNumber(5),
  };
  return assignmentExpression;
}

function generateBinaryExpression() {
  let binaryExpression = {
    type: "BinaryExpression",
    operator: "+",
    left: generateRandomHexNumber(5),
    right: generateRandomHexNumber(5),
  };
  return binaryExpression;
}

function generateCallExpression() {
  let callExpression = {
    type: "CallExpression",
    callee: generateRandomHexNumber(5),
    arguments: [],
  };
  return callExpression;
}

function generateConditionalExpression() {
  let conditionalExpression = {
    type: "ConditionalExpression",
    test: generateRandomHexNumber(5),
    consequent: generateRandomHexNumber(5),
    alternate: generateRandomHexNumber(5),
  };
  return conditionalExpression;
}

function generateLogicalExpression() {
  let logicalExpression = {
    type: "LogicalExpression",
    operator: "||",
    left: generateRandomHexNumber(5),
    right: generateRandomHexNumber(5),
  };
  return logicalExpression;
}

function generateMemberExpression() {
  let memberExpression = {
    type: "MemberExpression",
    object: generateRandomHexNumber(5),
    property: generateRandomHexNumber(5),
  };
  return memberExpression;
}

function generateNewExpression() {
  let newExpression = {
    type: "NewExpression",
    callee: generateRandomHexNumber(5),
    arguments: [],
  };
  return newExpression;
}

function generateSequenceExpression() {
  let sequenceExpression = {
    type: "SequenceExpression",
    expressions: [],
  };
  return sequenceExpression;
}

function generateUnaryExpression() {
  let unaryExpression = {
    type: "UnaryExpression",
    operator: "!",
    argument: generateRandomHexNumber(5),
  };
  return unaryExpression;
}

function generateUpdateExpression() {
  let updateExpression = {
    type: "UpdateExpression",
    operator: "++",
    argument: generateRandomHexNumber(5),
  };
  return updateExpression;
}

// function generateIfStatement() {
//   let ifStatement = {
//     type: "IfStatement",
//     test: generateTestCondition(),
//     consequent: {
//       type: "BlockStatement",
//       body: generateBlockStatement(),
//     },
//   };
//   return ifStatement;
// }

// console.log(JSON.stringify(generateIf(), null, 2));
// let newStatement = generateIfStatement();
// console.log(JSON.stringify(newStatement, null, 2));
// ast.body.push(newStatement);
let obfuscatedOutput = escodegen.generate(ast, {format: {compact: true}});
// obfuscatedOutput = UglifyJS.minify(obfuscatedOutput).code;
console.log(obfuscatedOutput);
eval(obfuscatedOutput);
eval(sourceProgram);
// assert(eval(obfuscatedOutput) === eval(sourceProgram));
// console.log(JSON.stringify(ast, null, 2));