Page({
  data: {
    // 时间戳
    timestamp: '',
    // 日期
    date: '',
    // 时间
    time: '',
    // 日期转换结果
    dateResult: '',
    // 时间戳转换结果
    timestampResult: '',
    // 当前日期时间
    currentDateTime: '',
    // 当前时间戳
    currentTimestamp: ''
  },

  onLoad() {
    // 初始化当前时间
    this.updateCurrentTime();
    // 初始化日期和时间
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    this.setData({
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}:${seconds}`
    });
  },

  // 更新当前时间
  updateCurrentTime() {
    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);
    const dateTime = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    this.setData({
      currentDateTime: dateTime,
      currentTimestamp: timestamp.toString()
    });
  },

  // 时间戳输入
  onTimestampInput(e) {
    this.setData({
      timestamp: e.detail.value
    });
  },

  // 日期变化
  onDateChange(e) {
    this.setData({
      date: e.detail.value
    });
  },

  // 时间变化
  onTimeChange(e) {
    this.setData({
      time: e.detail.value
    });
  },

  // 时间戳转日期
  convertToDate() {
    const { timestamp } = this.data;
    if (!timestamp) {
      wx.showToast({
        title: '请输入时间戳',
        icon: 'none'
      });
      return;
    }

    const timestampNum = parseInt(timestamp);
    if (isNaN(timestampNum)) {
      wx.showToast({
        title: '请输入有效的时间戳',
        icon: 'none'
      });
      return;
    }

    const date = new Date(timestampNum * 1000);
    const dateTime = date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    this.setData({
      dateResult: dateTime
    });
  },

  // 日期转时间戳
  convertToTimestamp() {
    const { date, time } = this.data;
    if (!date || !time) {
      wx.showToast({
        title: '请选择日期和时间',
        icon: 'none'
      });
      return;
    }

    const dateTimeStr = `${date} ${time}`;
    const timestamp = Math.floor(new Date(dateTimeStr).getTime() / 1000);

    this.setData({
      timestampResult: timestamp.toString()
    });
  }
});