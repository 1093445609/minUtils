Page({
  data: {
    // 弹幕文本
    text: 'Hello World',
    // 字体大小
    fontSize: 80,
    // 文本颜色
    textColor: '#ffffff',
    // 背景颜色
    backgroundColor: '#000000',
    // 显示模式
    mode: 'scroll',
    // 文本颜色选项
    textColors: ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8000'],
    // 背景颜色选项
    backgroundColors: ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8000']
  },

  // 文本输入
  onTextInput(e) {
    this.setData({
      text: e.detail.value
    });
  },

  // 字体大小变化
  onFontSizeChange(e) {
    this.setData({
      fontSize: e.detail.value
    });
  },

  // 文本颜色变化
  onTextColorChange(e) {
    this.setData({
      textColor: e.currentTarget.dataset.color
    });
  },

  // 背景颜色变化
  onBackgroundColorChange(e) {
    this.setData({
      backgroundColor: e.currentTarget.dataset.color
    });
  },

  // 显示模式变化
  onModeChange(e) {
    this.setData({
      mode: e.currentTarget.dataset.mode
    });
  }
});