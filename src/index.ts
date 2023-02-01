interface Token {
  type: string;
  lexeme: string;
}

enum ExpressBasicType {
  ALPHABET = "ALPHABET",
  LEFT_PARENTHESES = "LEFT_PARENTHESES",
  RIGHT_PARENTHESES = "RIGHT_PARENTHESES",
  SUBTRACT = "SUBTRACT",
}

interface TOKEN_MAPS {
  [key: string]: {
    type: ExpressBasicType;
    pattern: RegExp;
  };
}

const TOKEN_MAPS: TOKEN_MAPS = {
  ALPHABET: {
    type: ExpressBasicType.ALPHABET,
    pattern: /#{[A-Za-z0-9]*}|[0-9]+/,
  },
  LEFT_PARENTHESES: {
    type: ExpressBasicType.LEFT_PARENTHESES,
    pattern: /\(/,
  },
  RIGHT_PARENTHESES: {
    type: ExpressBasicType.RIGHT_PARENTHESES,
    pattern: /\)/,
  },
  SUBTRACT: {
    type: ExpressBasicType.SUBTRACT,
    pattern: /[\+\-\*\/]/,
  },
};

const SUBTRACT_PRIORITY = {
  ADD_SUB: {
    pattern: /[\+\-]/,
  },
  MUL_DIV: {
    pattern: /[\*\/]/,
  },
  SUBTRACT: {
    pattern: /[\+\-\*\/]/,
  },
};

function scaner(input: string) {
  const tokens: Token[] = [];
  const TOKEN_MAPS_VALUES = Object.values(TOKEN_MAPS);
  // 去除空格
  let cutExpress = input.replace(/\s+/g, "");

  while (cutExpress) {
    let startMatch: any = null;

    TOKEN_MAPS_VALUES.forEach((tokenMap) => {
      const found = cutExpress.match(tokenMap.pattern);
      //
      if (found?.index === 0) {
        startMatch = {
          type: tokenMap.type,
          lexeme: found[0],
        };
        //  cutExpress.
      }
    });

    // 没有匹配到
    if (!startMatch) {
      throw Error("字符编写有误");
    }

    tokens.push(startMatch);
    cutExpress = cutExpress.slice(startMatch.lexeme.length);
  }

  return tokens;
}

/**
 * @description:
 * @param {Token} a
 * @param {Token} b
 * @return {*} 1 a优先级高于b
 * @return {*} -1 a优先级低于b
 * @return {*} 0 a优先级等于b
 */
function subtractPriority(a: Token, b: Token): number {
  if (
    a.lexeme.match(SUBTRACT_PRIORITY.MUL_DIV.pattern) &&
    b.lexeme.match(SUBTRACT_PRIORITY.ADD_SUB.pattern)
  )
    return 1;

  if (
    a.lexeme.match(SUBTRACT_PRIORITY.ADD_SUB.pattern) &&
    b.lexeme.match(SUBTRACT_PRIORITY.MUL_DIV.pattern)
  )
    return -1;

  return 0;
}

// 中缀表达式转化为逆波兰表达式
function translateExpress2RPN(tokens: Token[]) {
  const stack: Token[] = [];
  const RPNExpress: Token[] = [];
  tokens.forEach((token) => {
    // 若为‘（’，入栈
    if (token.type === ExpressBasicType.LEFT_PARENTHESES) {
      stack.push(token);
      return;
    }
    // 若为‘）’，则依次将栈中的运算符加入后缀表达式，直到出现‘（’，并从栈中删除‘（’
    if (token.type === ExpressBasicType.RIGHT_PARENTHESES) {
      let stackTop = stack.pop();
      while (stackTop?.type !== ExpressBasicType.LEFT_PARENTHESES) {
        if (!stackTop) break;
        RPNExpress.push(stackTop);
        stackTop = stack.pop();
      }
      return;
    }
    // 若为‘+’，‘-’，‘*’，‘/’
    // 栈空，入栈
    // 栈顶元素为‘（’,入栈
    // 高于栈顶元素优先级，入栈
    // 否则，依次弹出栈顶运算符，直到一个优先级比它低的运算符或‘（’为止
    if (token.type === ExpressBasicType.SUBTRACT) {
      let stackTop = stack[stack.length - 1];
      // 栈空
      if (
        stack.length === 0 ||
        stackTop.type === ExpressBasicType.LEFT_PARENTHESES ||
        subtractPriority(token, stackTop) === 1
      ) {
        stack.push(token);
      } else {
        while (
          stackTop &&
          stackTop.type !== ExpressBasicType.LEFT_PARENTHESES &&
          !(subtractPriority(token, stackTop) === 1)
        ) {
          // @ts-ignore
          RPNExpress.push(stack.pop());
          // @ts-ignore
          stackTop = stack[stack.length - 1];
        }

        stack.push(token);
      }
      return;
    }
    // 如果是操作数直接加入表达式

    if (token.type === ExpressBasicType.ALPHABET) {
      RPNExpress.push(token);
      return;
    }
  });

  // 遍历完成，若栈非空，依次弹出栈中所有元素

  while (stack.length > 0) {
    // @ts-ignore
    RPNExpress.push(stack.pop());
  }

  return RPNExpress;
}

function evaluateRPN(express: string[]) {
  const resultStack: any = [];

  express.forEach((str) => {
    switch (str) {
      case "+":
        {
          const second = resultStack.pop();
          const first = resultStack.pop();
          // @ts-ignore
          const result = first * 1 + second * 1;
          resultStack.push(result);
        }
        break;
      case "-":
        {
          const second = resultStack.pop();
          const first = resultStack.pop();
          // @ts-ignore
          const result = first * 1 - second * 1;
          resultStack.push(result);
        }
        break;
      case "*":
        {
          const second = resultStack.pop();
          const first = resultStack.pop();
          // @ts-ignore
          const result = first * second;
          resultStack.push(result);
        }
        break;
      case "/":
        {
          const second = resultStack.pop();
          const first = resultStack.pop();
          // @ts-ignore
          const result = (first * 1) / second;
          resultStack.push(result);
        }
        break;

      default:
        resultStack.push(str);
        break;
    }
  });

  return resultStack;
}

let testString = "50-12*8/(2-3)/3+(1/1+2*1)*2*3-1";
// let testString = "50-12*8/(2-3)"; // 50 12 8 * 2 3 - / -
// let testString = "50-12*8"; // 50 12 8 * -
// let testString = "1*2*3";

const token = scaner(testString);
console.log("token", token);

const RPN = translateExpress2RPN(token);
console.log("RPN", RPN);

const express = RPN.map((i) => i.lexeme);

const resultStack = evaluateRPN(express);
console.log("resultStack", resultStack);
