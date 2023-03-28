import esprima from 'esprima';
import  escodegen from 'escodegen';
import fs from 'fs';

function traverseJson(jsonObj) {
    if (jsonObj !== null && typeof jsonObj === "object") {
        for (const key in jsonObj) {
            if (jsonObj.hasOwnProperty(key)) {
                console.log(key);
                traverseJson(jsonObj[key]);
            }
        }
    } else {
        console.log(jsonObj);
    }
}

export default class Obfuscator {
    constructor(filepath) {
        this.filepath = filepath;
        this.getSourceProgram();
    }

    getSourceProgram() {
        this.sourceProgram = fs.readFileSync(this.filepath).toString();
        return this.sourceProgram;
    }

    getObfuscatedProgram() {
        return this.obsuscatedProgram;
    }

    tokenize() {
        this.tokens = esprima.tokenize(this.sourceProgram);
        return this.tokens;
    }

    deparse() {
        this.obsuscatedProgram = escodegen.generate(this.AST);
    }

    parse() {
        this.AST = esprima.parseScript(this.sourceProgram);
        return this.AST;
    }

    traverse(node, visitors) {
        function traverseArray(array) {
          array.forEach(childNode => {
            traverseNode(childNode);
          });
        }
      
        function traverseNode(node) {
          if (!node) {
            return;
          }
      
          if (visitors.enter) {
            visitors.enter(node);
          }
      
          let visitorKeys = visitors[node.type];
          if (visitorKeys) {
            visitorKeys.forEach(key => {
              let childNode = node[key];
              if (Array.isArray(childNode)) {
                traverseArray(childNode);
              } else {
                traverseNode(childNode);
              }
            });
          }
      
          if (visitors.exit) {
            visitors.exit(node);
          }
        }
      
        traverseNode(node);
      }
      

    obfuscateIdentifiers(code) {
        // Step 1: parse the code into an AST
        let ast = this.parse(code);
      
        // Step 2: traverse the AST and identify all variable and function declarations
        this.traverse(ast, {
          enter(node) {
            if (node.type === "VariableDeclaration") {
              // Step 3: for each identifier, generate a random string of characters
              node.declarations.forEach(declaration => {
                let newIdentifier = generateRandomString();
                // Step 4: replace all occurrences of the original identifier with the new identifier
                replaceIdentifiers(node, declaration.id.name, newIdentifier);
              });
            } else if (node.type === "FunctionDeclaration") {
              // Step 3: for each identifier, generate a random string of characters
              let newIdentifier = generateRandomString();
              // Step 4: replace all occurrences of the original identifier with the new identifier
              replaceIdentifiers(node, node.id.name, newIdentifier);
            }
          }
        });
        console.log("AST:", ast);
        // Step 6: generate JavaScript code from the modified AST
        let obfuscatedCode = this.deparse();
        return obfuscatedCode;
      }
      
    replaceIdentifiers(node, oldIdentifier, newIdentifier) {
        traverse(node, {
          enter(childNode) {
            if (childNode.type === "Identifier" && childNode.name === oldIdentifier) {
              childNode.name = newIdentifier;
            }
          }
        });
      }
      
    generateRandomString() {
        let length = Math.floor(Math.random() * 10) + 5;
        let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = "";
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
      }
      

    obfuscate() {
        this.tokenize();
        this.parse();
        this.AST["body"][0]["id"]["name"] = '0xafc';
        traverseJson(this.AST);
        console.log(JSON.stringify(this.AST, ' ', 4));


        this.deparse();
        return this.obsuscatedProgram;
    }
};