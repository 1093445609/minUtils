// calculator.js
Page({
  data: {
    mode: 'standard',
    expression: '',
    result: '0',
    waitingForNewNumber: false,
    lastOperator: null,
    lastOperand: null
  },

  onLoad() {
    this.setData({
      result: '0'
    });
  },

  // 切换模式
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      mode: mode,
      expression: '',
      result: '0',
      waitingForNewNumber: false,
      lastOperator: null,
      lastOperand: null
    });
  },

  // 输入数字
  inputNumber(e) {
    const num = e.currentTarget.dataset.num;
    let { result, waitingForNewNumber } = this.data;

    if (waitingForNewNumber || result === '0' || result === '错误') {
      result = num;
      waitingForNewNumber = false;
    } else {
      result += num;
    }

    this.setData({
      result: result,
      waitingForNewNumber: false
    });
  },

  // 输入小数点
  inputDecimal() {
    let { result, waitingForNewNumber } = this.data;

    if (waitingForNewNumber || result === '错误') {
      result = '0.';
      waitingForNewNumber = false;
    } else if (!result.includes('.')) {
      result += '.';
    }

    this.setData({
      result: result,
      waitingForNewNumber: false
    });
  },

  // 输入运算符
  inputOperator(e) {
    const op = e.currentTarget.dataset.op;
    const { expression, result, waitingForNewNumber, lastOperator, lastOperand } = this.data;

    if (result === '错误') return;

    const currentOperand = parseFloat(result);
    
    if (isNaN(currentOperand)) return;

    let newExpression = expression;
    
    if (waitingForNewNumber && lastOperator && lastOperand !== null) {
      // 替换最后一个运算符
      newExpression = newExpression.slice(0, -1) + op;
      this.setData({
        expression: newExpression,
        waitingForNewNumber: false,
        lastOperator: op
      });
      return;
    }
    
    if (expression && lastOperator) {
      // 如果已有表达式和运算符，先计算当前表达式
      try {
        const computedResult = this.computeExpression(expression);
        if (computedResult === '错误') {
          this.setData({ result: '错误', waitingForNewNumber: true });
          return;
        }
        newExpression = computedResult.toString() + op;
      } catch (error) {
        this.setData({ result: '错误', waitingForNewNumber: true });
        return;
      }
    } else if (expression) {
      newExpression += op;
    } else {
      newExpression = result + op;
    }

    this.setData({
      expression: newExpression,
      waitingForNewNumber: true,
      lastOperator: op,
      lastOperand: currentOperand
    });
  },

  // 输入函数
  inputFunction(e) {
    const func = e.currentTarget.dataset.func;
    const { result, waitingForNewNumber } = this.data;

    if (result === '错误') return;

    const currentValue = parseFloat(result);
    if (isNaN(currentValue)) return;

    let newResult = '';
    
    switch (func) {
      case 'sin':
        newResult = Math.sin(currentValue * Math.PI / 180).toString();
        break;
      case 'cos':
        newResult = Math.cos(currentValue * Math.PI / 180).toString();
        break;
      case 'tan':
        newResult = Math.tan(currentValue * Math.PI / 180).toString();
        break;
      case 'log':
        newResult = Math.log10(currentValue).toString();
        break;
      case 'sqrt':
        newResult = Math.sqrt(currentValue).toString();
        break;
      case 'pow2':
        newResult = Math.pow(currentValue, 2).toString();
        break;
      case 'pow3':
        newResult = Math.pow(currentValue, 3).toString();
        break;
      case 'pow':
        // 幂运算需要两个操作数，所以只更新表达式
        this.setData({
          expression: result + '^',
          waitingForNewNumber: true,
          lastOperator: '^',
          lastOperand: currentValue
        });
        return;
      default:
        return;
    }

    // 检查计算结果是否有效
    if (newResult === 'NaN' || !isFinite(newResult)) {
      newResult = '错误';
    }

    this.setData({
      result: newResult,
      expression: expression,
      waitingForNewNumber: true
    });
  },

  // 计算表达式
  computeExpression(expr) {
    try {
      // 替换显示符号为JavaScript运算符
      let jsExpression = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');
      
      // 使用更安全的方式计算表达式
      const result = Function('return ' + jsExpression)();
      
      if (!isFinite(result)) {
        return '错误';
      }
      
      // 处理浮点数精度问题
      return Math.round(result * 1e10) / 1e10;
    } catch (error) {
      return '错误';
    }
  },

  // 计算
  calculate() {
    let { expression, result, waitingForNewNumber, lastOperator, lastOperand } = this.data;

    if (result === '错误') return;

    // 构建完整表达式
    let fullExpression = expression;
    
    if (fullExpression) {
      const lastChar = fullExpression[fullExpression.length - 1];
      if ('+-*/%^'.includes(lastChar)) {
        // 如果表达式以运算符结尾，使用当前结果作为最后一个操作数
        if (waitingForNewNumber && lastOperand !== null) {
          fullExpression += lastOperand.toString();
        } else {
          fullExpression += result;
        }
      }
    } else {
      fullExpression = result;
    }

    // 替换运算符
    fullExpression = fullExpression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**');

    try {
      // 计算结果
      const calculateResult = this.computeExpression(fullExpression);
      
      if (calculateResult === '错误') {
        this.setData({
          result: '错误',
          waitingForNewNumber: true
        });
        return;
      }
      
      this.setData({
        expression: fullExpression,
        result: calculateResult.toString(),
        waitingForNewNumber: true,
        lastOperator: null,
        lastOperand: null
      });
    } catch (error) {
      this.setData({
        result: '错误',
        waitingForNewNumber: true
      });
    }
  },

  // 清除
  clear() {
    this.setData({
      expression: '',
      result: '0',
      waitingForNewNumber: false,
      lastOperator: null,
      lastOperand: null
    });
  },

  // 退格
  backspace() {
    let { result, waitingForNewNumber } = this.data;

    if (waitingForNewNumber || result === '错误') {
      return;
    }

    if (result.length > 1) {
      result = result.slice(0, -1);
    } else {
      result = '0';
    }

    this.setData({
      result: result
    });
  }
});
