Page({
  data: {
    // 单位
    unit: 'cm',
    // 尺子刻度
    rulerMarks: []
  },

  onLoad() {
    // 初始化尺子刻度
    this.generateRulerMarks();
  },

  // 生成尺子刻度
  generateRulerMarks() {
    const { unit } = this.data;
    const marks = [];
    const totalLength = unit === 'cm' ? 20 : 8; // 20厘米或8英寸
    const majorInterval = unit === 'cm' ? 1 : 1; // 主刻度间隔
    const minorInterval = unit === 'cm' ? 0.1 : 1/16; // 小刻度间隔
    const pixelsPerUnit = unit === 'cm' ? 50 : 127; // 每单位像素数

    // 生成刻度
    for (let i = 0; i <= totalLength / minorInterval; i++) {
      const value = i * minorInterval;
      const position = value * pixelsPerUnit;
      let height = 0;
      let text = '';

      // 主刻度（1cm或1英寸）
      if (value % majorInterval === 0) {
        height = 100;
        text = value.toString();
      }
      // 半刻度（0.5cm或0.5英寸）
      else if (value % (majorInterval / 2) === 0) {
        height = 70;
      }
      // 小刻度
      else {
        height = 40;
      }

      marks.push({
        position: position,
        height: height,
        text: text
      });
    }

    this.setData({
      rulerMarks: marks
    });
  },

  // 切换单位
  switchUnit(e) {
    const unit = e.currentTarget.dataset.unit;
    this.setData({
      unit: unit
    });
    // 重新生成刻度
    this.generateRulerMarks();
  }
});