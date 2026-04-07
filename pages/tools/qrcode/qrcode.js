Page({
  data: {
    // 输入文本
    inputText: '',
    // 二维码大小
    qrcodeSize: 200,
    // 二维码图片URL
    qrcodeUrl: ''
  },

  // 文本输入
  onTextInput(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 大小变化
  onSizeChange(e) {
    this.setData({
      qrcodeSize: e.detail.value
    });
  },

  // 生成二维码
  generateQRCode() {
    const { inputText, qrcodeSize } = this.data;
    if (!inputText) return;

    // 使用微信小程序的canvas API生成二维码
    // 这里使用一个简化的方法，实际项目中可以使用第三方库如qrcode.js
    const canvasId = 'qrcode-canvas';
    const ctx = wx.createCanvasContext(canvasId);

    // 清除画布
    ctx.clearRect(0, 0, qrcodeSize, qrcodeSize);

    // 绘制二维码（这里使用模拟数据，实际项目中需要使用真实的二维码生成算法）
    // 注意：由于微信小程序没有内置二维码生成功能，这里使用一个简单的模拟
    // 实际项目中建议引入第三方库如weapp-qrcode
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, qrcodeSize, qrcodeSize);
    ctx.setFillStyle('#000000');
    
    // 模拟二维码图案
    for (let i = 0; i < 21; i++) {
      for (let j = 0; j < 21; j++) {
        if (Math.random() > 0.5) {
          const size = qrcodeSize / 21;
          ctx.fillRect(i * size, j * size, size, size);
        }
      }
    }

    ctx.draw(false, () => {
      // 将canvas转换为图片
      wx.canvasToTempFilePath({
        canvasId: canvasId,
        success: (res) => {
          this.setData({
            qrcodeUrl: res.tempFilePath
          });
        },
        fail: (error) => {
          console.error('生成二维码失败:', error);
          wx.showToast({
            title: '生成二维码失败',
            icon: 'none'
          });
        }
      });
    });
  },

  // 保存二维码
  saveQRCode() {
    const { qrcodeUrl } = this.data;
    if (!qrcodeUrl) return;

    // 保存图片到相册
    wx.saveImageToPhotosAlbum({
      filePath: qrcodeUrl,
      success: (res) => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: (error) => {
        console.error('保存二维码失败:', error);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  }
});