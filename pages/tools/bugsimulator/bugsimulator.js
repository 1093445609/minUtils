Page({
  data: {
    // 选择的虫子
    selectedBug: 'spider',
    // 是否正在模拟
    isSimulating: false,
    // 蜘蛛位置
    spiderPosition: 0,
    // 毛毛虫位置
    caterpillarPosition: 0,
    // 屏幕高度
    screenHeight: 0
  },

  onLoad() {
    // 获取屏幕高度
    const res = wx.getSystemInfoSync();
    this.setData({
      screenHeight: res.windowHeight * 2 // 转换为rpx
    });
  },

  // 选择虫子
  selectBug(e) {
    const bug = e.currentTarget.dataset.bug;
    this.setData({
      selectedBug: bug,
      isSimulating: false,
      spiderPosition: 0,
      caterpillarPosition: 0
    });
  },

  // 开始模拟
  startSimulation() {
    const { selectedBug } = this.data;
    
    this.setData({
      isSimulating: true
    });

    if (selectedBug === 'spider') {
      // 蜘蛛模拟
      this.simulateSpider();
    } else if (selectedBug === 'caterpillar') {
      // 毛毛虫模拟
      this.simulateCaterpillar();
    }
  },

  // 模拟蜘蛛
  simulateSpider() {
    let position = 0;
    const maxPosition = this.data.screenHeight - 400 - 100; // 减去模拟区域的上边距和蜘蛛的高度
    
    const spiderInterval = setInterval(() => {
      position += 10;
      if (position >= maxPosition) {
        clearInterval(spiderInterval);
        // 蜘蛛到达底部后，再向上爬一点
        setTimeout(() => {
          this.setData({
            spiderPosition: maxPosition - 50
          });
        }, 1000);
      } else {
        this.setData({
          spiderPosition: position
        });
      }
    }, 50);
  },

  // 模拟毛毛虫
  simulateCaterpillar() {
    let position = 0;
    const maxPosition = this.data.screenHeight - 400 - 100; // 减去模拟区域的宽度和毛毛虫的宽度
    
    const caterpillarInterval = setInterval(() => {
      position += 5;
      if (position >= maxPosition) {
        clearInterval(caterpillarInterval);
        // 毛毛虫到达终点后，再返回起点
        setTimeout(() => {
          this.setData({
            caterpillarPosition: 0
          });
        }, 1000);
      } else {
        this.setData({
          caterpillarPosition: position
        });
      }
    }, 100);
  }
});