Page({
  data: {
    // 单位
    unit: 'cm',
    // 尺子刻度
    rulerMarks: [],
    // 是否横屏
    isLandscape: false
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
    const pixelsPerUnit = unit === 'cm' ? 50 : 127; // 每单位像素数

    if (unit === 'cm') {
      // 厘米刻度：1cm为主刻度，0.5cm为半刻度，0.1cm为小刻度
      const majorInterval = 1;
      const halfInterval = 0.5;
      const minorInterval = 0.1;
      
      for (let i = 0; i <= totalLength / minorInterval; i++) {
        const value = i * minorInterval;
        const position = value * pixelsPerUnit;
        let height = 0;
        let text = '';

        // 主刻度（1cm）
        if (value % majorInterval === 0) {
          height = 100;
          text = Math.floor(value).toString();
        }
        // 半刻度（0.5cm）
        else if (value % halfInterval === 0) {
          height = 70;
        }
        // 小刻度（0.1cm）
        else {
          height = 40;
        }

        marks.push({
          position: position,
          height: height,
          text: text
        });
      }
    } else {
      // 英寸刻度：1英寸为主刻度，1/2、1/4、1/8英寸为次刻度，1/16英寸为小刻度
      const majorInterval = 1;
      const halfInterval = 1/2;
      const quarterInterval = 1/4;
      const eighthInterval = 1/8;
      const sixteenthInterval = 1/16;
      
      for (let i = 0; i <= totalLength / sixteenthInterval; i++) {
        const value = i * sixteenthInterval;
        const position = value * pixelsPerUnit;
        let height = 0;
        let text = '';

        // 主刻度（1英寸）
        if (value % majorInterval === 0) {
          height = 100;
          text = Math.floor(value).toString();
        }
        // 半刻度（1/2英寸）
        else if (value % halfInterval === 0) {
          height = 80;
        }
        // 1/4英寸刻度
        else if (value % quarterInterval === 0) {
          height = 65;
        }
        // 1/8英寸刻度
        else if (value % eighthInterval === 0) {
          height = 50;
        }
        // 1/16英寸刻度
        else {
          height = 35;
        }

        marks.push({
          position: position,
          height: height,
          text: text
        });
      }
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
  },

  // 切换横屏模式
  toggleLandscape() {
    const { isLandscape } = this.data;
    this.setData({
      isLandscape: !isLandscape
    });
    
    if (!isLandscape) {
      // 请求横屏
      wx.setScreenOrientation({
        orientation: 'landscape'
      });
    } else {
      // 恢复竖屏
      wx.setScreenOrientation({
        orientation: 'portrait'
      });
    }
  }
});