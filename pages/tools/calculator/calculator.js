Page({
  data: {
    // 计算模式
    mode: 'standard',
    // 表达式
    expression: '',
    // 结果
    result: '0',
    // 等待输入新数字
    waitingForNewNumber: false
  },

  // 切换模式
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      mode: mode,
      expression: '',
      result: '0',
      waitingForNewNumber: false
    });
  },

  // 输入数字
  inputNumber(e) {
    const num = e.currentTarget.dataset.num;
    let { result, waitingForNewNumber } = this.data;

    if (waitingForNewNumber || result === '0') {
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

    if (waitingForNewNumber) {
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
    const { expression, result } = this.data;

    let newExpression = expression;
    if (expression) {
      // 替换最后一个运算符
      const lastChar = expression[expression.length - 1];
      if ('+-*/%'.includes(lastChar)) {
        newExpression = expression.slice(0, -1) + op;
      } else {
        newExpression += op;
      }
    } else {
      newExpression = result + op;
    }

    this.setData({
      expression: newExpression,
      waitingForNewNumber: true
    });
  },

  // 输入函数
  inputFunction(e) {
    const func = e.currentTarget.dataset.func;
    const { result } = this.data;

    let newResult = '';
    switch (func) {
      case 'sin':
        newResult = Math.sin(parseFloat(result) * Math.PI / 180).toString();
        break;
      case 'cos':
        newResult = Math.cos(parseFloat(result) * Math.PI / 180).toString();
        break;
      case 'tan':
        newResult = Math.tan(parseFloat(result) * Math.PI / 180).toString();
        break;
      case 'log':
        newResult = Math.log10(parseFloat(result)).toString();
        break;
      case 'sqrt':
        newResult = Math.sqrt(parseFloat(result)).toString();
        break;
      case 'pow2':
        newResult = Math.pow(parseFloat(result), 2).toString();
        break;
      case 'pow3':
        newResult = Math.pow(parseFloat(result), 3).toString();
        break;
      case 'pow':
        this.setData({
          expression: result + '^',
          waitingForNewNumber: true
        });
        return;
    }

    this.setData({
      result: newResult,
      waitingForNewNumber: true
    });
  },

  // 计算
  calculate() {
    let { expression, result } = this.data;

    // 构建完整表达式
    if (expression) {
      const lastChar = expression[expression.length - 1];
      if ('+-*/%^'.includes(lastChar)) {
        expression += result;
      }
    } else {
      expression = result;
    }

    // 替换特殊运算符
    expression = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/^/g, '**');

    try {
      // 计算结果
      const calculateResult = eval(expression);
      const finalResult = isFinite(calculateResult) ? calculateResult.toString() : '错误';

      this.setData({
        expression: expression,
        result: finalResult,
        waitingForNewNumber: true
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
      waitingForNewNumber: false
    });
  },

  // 退格
  backspace() {
    let { result, waitingForNewNumber } = this.data;

    if (waitingForNewNumber) {
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