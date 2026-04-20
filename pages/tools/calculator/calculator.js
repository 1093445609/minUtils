Page({
  data: {
    display: '0',       // 当前显示值
    expression: '',     // 表达式显示
    previousValue: null,// 前一个操作数
    operator: null,     // 当前运算符
    waitingForOperand: false, // 是否等待输入新操作数
    activeOperator: null,     // 高亮的运算符
    resetNext: false    // 下次输入是否重置显示
  },

  /**
   * 数字 / 运算符 / 功能按钮 点击入口
   */
  onTap(e) {
    const value = e.currentTarget.dataset.value;

    if (value >= '0' && value <= '9') {
      this.inputDigit(value);
    } else if (value === '.') {
      this.inputDot();
    } else if (value === '+' || value === '-' || value === '*' || value === '/') {
      this.handleOperator(value);
    } else if (value === 'AC') {
      this.clearAll();
    } else if (value === '+/-') {
      this.toggleSign();
    } else if (value === '%') {
      this.percent();
    }
  },

  /**
   * 等号计算
   */
  onEqual() {
    const { previousValue, operator, display } = this.data;

    if (operator === null || previousValue === null) return;

    const currentValue = parseFloat(display);
    const result = this.calculate(previousValue, operator, currentValue);

    this.setData({
      display: this.formatResult(result),
      expression: `${this.formatDisplay(previousValue)} ${this.getOperatorSymbol(operator)} ${this.formatDisplay(currentValue)} =`,
      previousValue: null,
      operator: null,
      waitingForOperand: true,
      activeOperator: null,
      resetNext: true
    });
  },

  /* ===== 核心计算逻辑 ===== */

  // 输入数字
  inputDigit(digit) {
    const { display, resetNext, waitingForOperand, previousValue, operator, expression } = this.data;

    if (resetNext || waitingForOperand) {
      // 构建新的表达式，包含前一个操作数、运算符和当前输入的数字
      let newExpression = expression;
      if (previousValue !== null && operator !== null) {
        newExpression = `${this.formatDisplay(previousValue)} ${this.getOperatorSymbol(operator)} ${digit}`;
      }
      
      this.setData({
        display: digit,
        expression: newExpression,
        resetNext: false,
        waitingForOperand: false
      });
    } else {
      const newDisplay = display === '0' ? digit : display + digit;
      if (newDisplay.replace(/[^0-9]/g, '').length > 15) return; // 长度限制
      
      // 如果已经有运算符，更新表达式的最后部分
      let newExpression = expression;
      if (previousValue !== null && operator !== null) {
        // 替换表达式中最后一个数字部分
        newExpression = `${this.formatDisplay(previousValue)} ${this.getOperatorSymbol(operator)} ${newDisplay}`;
      }
      
      this.setData({
        display: newDisplay,
        expression: newExpression
      });
    }
  },

  // 输入小数点
  inputDot() {
    const { display, resetNext, waitingForOperand } = this.data;

    if (resetNext || waitingForOperand) {
      this.setData({
        display: '0.',
        resetNext: false,
        waitingForOperand: false
      });
      return;
    }

    if (!display.includes('.')) {
      this.setData({ display: display + '.' });
    }
  },

  // 处理运算符
  handleOperator(nextOperator) {
    const { display, previousValue, operator, waitingForOperand } = this.data;
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      this.setData({
        previousValue: currentValue,
        operator: nextOperator,
        expression: `${this.formatDisplay(currentValue)} ${this.getOperatorSymbol(nextOperator)}`,
        waitingForOperand: true,
        activeOperator: nextOperator,
        resetNext: false
      });
    } else if (operator && !waitingForOperand) {
      const result = this.calculate(previousValue, operator, currentValue);
      const formatted = this.formatResult(result);
      this.setData({
        display: formatted,
        previousValue: result,
        operator: nextOperator,
        expression: `${this.formatDisplay(result)} ${this.getOperatorSymbol(nextOperator)}`,
        waitingForOperand: true,
        activeOperator: nextOperator,
        resetNext: false
      });
    } else {
      this.setData({
        operator: nextOperator,
        expression: `${this.formatDisplay(previousValue)} ${this.getOperatorSymbol(nextOperator)}`,
        activeOperator: nextOperator,
        resetNext: false
      });
    }
  },

  // 执行计算
  calculate(left, operator, right) {
    switch (operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return right === 0 ? NaN : left / right;
      default:  return right;
    }
  },

  // 清除
  clearAll() {
    this.setData({
      display: '0',
      expression: '',
      previousValue: null,
      operator: null,
      waitingForOperand: false,
      activeOperator: null,
      resetNext: false
    });
  },

  // 正负切换
  toggleSign() {
    const { display } = this.data;
    const value = parseFloat(display);
    if (value === 0) return;
    const result = -value;
    this.setData({ display: this.formatResult(result) });
  },

  // 百分比
  percent() {
    const { display } = this.data;
    const value = parseFloat(display);
    const result = value / 100;
    this.setData({ display: this.formatResult(result) });
  },

  /* ===== 格式化 ===== */

  // 格式化结果，去除末尾多余0，限制长度
  formatResult(num) {
    if (isNaN(num)) return '错误';
    if (!isFinite(num)) return '错误';

    // 使用 toPrecision 避免浮点精度问题
    let str = parseFloat(num.toPrecision(12)).toString();

    if (str.length > 12) {
      str = num.toExponential(5);
    }

    return str;
  },

  // 格式化显示值（用于表达式）
  formatDisplay(num) {
    const str = this.formatResult(num);
    if (str.includes('e')) return str;
    const parts = str.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  },

  // 运算符符号转换
  getOperatorSymbol(op) {
    const map = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    return map[op] || op;
  }
});