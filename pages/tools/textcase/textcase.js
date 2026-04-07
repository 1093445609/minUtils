Page({
  data: {
    // 输入文本
    inputText: '',
    // 输出文本
    outputText: ''
  },

  // 文本输入
  onTextInput(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 转为大写
  convertToUpper() {
    const { inputText } = this.data;
    const outputText = inputText.toUpperCase();
    this.setData({
      outputText: outputText
    });
  },

  // 转为小写
  convertToLower() {
    const { inputText } = this.data;
    const outputText = inputText.toLowerCase();
    this.setData({
      outputText: outputText
    });
  },

  // 首字母大写
  convertToTitle() {
    const { inputText } = this.data;
    const outputText = inputText.replace(/\b\w/g, (char) => char.toUpperCase());
    this.setData({
      outputText: outputText
    });
  }
});