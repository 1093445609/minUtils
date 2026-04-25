Page({
  data: {
    unit: 'cm',
    rulerMarks: [],
    isLandscape: false,
    pxPerCm: 0,
    pxPerInch: 0,
    rulerWidth: 0
  },

  onLoad() {
    this.initDeviceInfo();
    this.generateRulerMarks();
  },

  initDeviceInfo() {
    const systemInfo = wx.getSystemInfoSync();
    const pixelRatio = systemInfo.pixelRatio;
    
    const basePxPerInch = 96;
    const basePxPerCm = basePxPerInch / 2.54;
    
    const pxPerCm = basePxPerCm * pixelRatio;
    const pxPerInch = basePxPerInch * pixelRatio;
    
    this.setData({
      pxPerCm: pxPerCm,
      pxPerInch: pxPerInch
    });
  },

  generateRulerMarks() {
    const { unit, pxPerCm, pxPerInch } = this.data;
    const marks = [];
    
    const isCm = unit === 'cm';
    const pixelsPerUnit = isCm ? pxPerCm : pxPerInch;
    const totalUnits = isCm ? 20 : 8;
    const rulerWidth = totalUnits * pixelsPerUnit;
    
    this.setData({ rulerWidth: rulerWidth });

    if (isCm) {
      const majorInterval = 1;
      const halfInterval = 0.5;
      const minorInterval = 0.1;
      const canvasHeight = 200;
      
      for (let i = 0; i <= totalUnits / minorInterval; i++) {
        const value = i * minorInterval;
        const position = value * pixelsPerUnit;
        let height = 0;
        let text = '';
        let fontSize = 0;

        if (value % majorInterval === 0) {
          height = canvasHeight * 0.5;
          text = Math.floor(value).toString();
          fontSize = 28;
        } else if (value % halfInterval === 0) {
          height = canvasHeight * 0.35;
          fontSize = 20;
        } else {
          height = canvasHeight * 0.2;
          fontSize = 16;
        }

        marks.push({
          position: position,
          height: height,
          text: text,
          fontSize: fontSize
        });
      }
    } else {
      const majorInterval = 1;
      const halfInterval = 0.5;
      const quarterInterval = 0.25;
      const eighthInterval = 0.125;
      const sixteenthInterval = 1/16;
      const canvasHeight = 200;
      
      for (let i = 0; i <= totalUnits / sixteenthInterval; i++) {
        const value = i * sixteenthInterval;
        const position = value * pixelsPerUnit;
        let height = 0;
        let text = '';
        let fontSize = 0;

        if (value % majorInterval === 0) {
          height = canvasHeight * 0.5;
          text = Math.floor(value).toString();
          fontSize = 28;
        } else if (value % halfInterval === 0) {
          height = canvasHeight * 0.4;
          fontSize = 20;
        } else if (value % quarterInterval === 0) {
          height = canvasHeight * 0.32;
          fontSize = 16;
        } else if (value % eighthInterval === 0) {
          height = canvasHeight * 0.25;
          fontSize = 14;
        } else {
          height = canvasHeight * 0.17;
          fontSize = 12;
        }

        marks.push({
          position: position,
          height: height,
          text: text,
          fontSize: fontSize
        });
      }
    }

    this.setData({
      rulerMarks: marks
    });
  },

  switchUnit(e) {
    const unit = e.currentTarget.dataset.unit;
    this.setData({
      unit: unit
    });
    this.generateRulerMarks();
  },

  toggleLandscape() {
    const { isLandscape } = this.data;
    this.setData({
      isLandscape: !isLandscape
    });
    
    if (!isLandscape) {
      wx.setScreenOrientation({
        orientation: 'landscape'
      });
    } else {
      wx.setScreenOrientation({
        orientation: 'portrait'
      });
    }
    
    setTimeout(() => {
      this.initDeviceInfo();
      this.generateRulerMarks();
    }, 100);
  }
});