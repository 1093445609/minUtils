Page({
  data: {
    // 收藏的工具列表
    favorites: []
  },

  onLoad() {
    // 加载收藏的工具
    this.loadFavorites();
  },

  // 加载收藏的工具
  loadFavorites() {
    const favorites = wx.getStorageSync('favorites') || [];
    this.setData({
      favorites: favorites
    });
  },

  // 处理收藏常用工具点击
  handleFavorites() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 处理清空缓存点击
  handleClearCache() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空缓存吗？',
      success: (res) => {
        if (res.confirm) {
          // 清空缓存
          wx.clearStorageSync();
          wx.showToast({
            title: '缓存已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  // 处理使用说明点击
  handleInstructions() {
    wx.showModal({
      title: '使用说明',
      content: '1. 在首页选择需要的工具\n2. 进入工具页面后按照提示操作\n3. 部分工具需要授权使用设备功能\n4. 所有工具均为前端实现，无需网络连接',
      showCancel: false
    });
  },

  // 处理关于页面点击
  handleAbout() {
    wx.showModal({
      title: '关于',
      content: '极简工具箱合集\n版本：1.0.0\n\n一款轻量、无广告、纯净的个人工具箱\n\n© 2026 极简工具箱',
      showCancel: false
    });
  }
});