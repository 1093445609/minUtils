Page({
  data: {
    // 分贝值
    decibelValue: 0,
    // 分贝等级
    decibelLevel: '安静环境',
    // 波形数据
    waveformData: [],
    // 波形颜色
    waveColor: '#007AFF',
    // 是否正在测试
    isTesting: false,
    // 测试定时器
    testTimer: null
  },

  onLoad() {
    // 初始化波形数据
    this.initWaveformData();
  },

  // 初始化波形数据
  initWaveformData() {
    const waveformData = [];
    for (let i = 0; i < 20; i++) {
      waveformData.push(20);
    }
    this.setData({
      waveformData: waveformData
    });
  },

  // 开始/停止测试
  toggleTest() {
    const { isTesting, testTimer } = this.data;
    if (isTesting) {
      // 停止测试
      clearInterval(testTimer);
      this.setData({
        isTesting: false,
        decibelValue: 0,
        decibelLevel: '安静环境',
        waveColor: '#007AFF'
      });
      this.initWaveformData();
    } else {
      // 开始测试
      this.setData({
        isTesting: true
      });
      this.startTest();
    }
  },

  // 开始测试
  startTest() {
    const testTimer = setInterval(() => {
      // 生成随机分贝值（模拟）
      const min = 30;
      const max = 100;
      const decibelValue = Math.floor(Math.random() * (max - min + 1)) + min;
      
      // 确定分贝等级
      let decibelLevel = '';
      let waveColor = '';
      if (decibelValue < 30) {
        decibelLevel = '安静环境';
        waveColor = '#4CAF50';
      } else if (decibelValue < 60) {
        decibelLevel = '正常对话';
        waveColor = '#8BC34A';
      } else if (decibelValue < 90) {
        decibelLevel = '嘈杂环境';
        waveColor = '#FFEB3B';
      } else if (decibelValue < 120) {
        decibelLevel = '高分贝';
        waveColor = '#FF9800';
      } else {
        decibelLevel = '危险';
        waveColor = '#F44336';
      }

      // 生成波形数据
      const waveformData = [];
      for (let i = 0; i < 20; i++) {
        // 基于分贝值生成波形高度
        const baseHeight = (decibelValue / 120) * 120;
        const randomVariation = Math.random() * 30 - 15;
        const height = Math.max(20, Math.min(150, baseHeight + randomVariation));
        waveformData.push(height);
      }

      this.setData({
        decibelValue: decibelValue,
        decibelLevel: decibelLevel,
        waveformData: waveformData,
        waveColor: waveColor
      });
    }, 500);

    this.setData({
      testTimer: testTimer
    });
  },

  onUnload() {
    // 清理定时器
    const { testTimer } = this.data;
    if (testTimer) {
      clearInterval(testTimer);
    }
  }
});