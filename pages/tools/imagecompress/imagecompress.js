Page({
  data: {
    // 原始图片
    originalImage: '',
    // 压缩后图片
    compressedImage: '',
    // 原始图片大小
    originalSize: 0,
    // 压缩后图片大小
    compressedSize: 0,
    // 压缩率
    compressionRate: 0,
    // 压缩质量
    quality: 80,
    // 图片尺寸选项
    sizeOptions: ['原始尺寸', '75%', '50%', '25%'],
    // 当前选择的尺寸索引
    sizeIndex: 0
  },

  // 选择图片
  selectImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          originalImage: tempFilePaths[0],
          compressedImage: '',
          compressedSize: 0,
          compressionRate: 0
        });
        
        // 获取原始图片大小
        wx.getFileInfo({
          filePath: tempFilePaths[0],
          success: (info) => {
            this.setData({
              originalSize: (info.size / 1024).toFixed(2)
            });
          }
        });
      }
    });
  },

  // 压缩质量变化
  onQualityChange(e) {
    this.setData({
      quality: e.detail.value
    });
  },

  // 尺寸变化
  onSizeChange(e) {
    this.setData({
      sizeIndex: e.detail.value
    });
  },

  // 压缩图片
  compressImage() {
    const { originalImage, quality, sizeIndex } = this.data;
    if (!originalImage) return;

    // 计算压缩后的尺寸
    let width, height;
    const sizeOption = sizeIndex;
    
    // 获取原始图片信息
    wx.getImageInfo({
      src: originalImage,
      success: (info) => {
        switch (sizeOption) {
          case '0': // 原始尺寸
            width = info.width;
            height = info.height;
            break;
          case '1': // 75%
            width = info.width * 0.75;
            height = info.height * 0.75;
            break;
          case '2': // 50%
            width = info.width * 0.5;
            height = info.height * 0.5;
            break;
          case '3': // 25%
            width = info.width * 0.25;
            height = info.height * 0.25;
            break;
        }

        // 压缩图片
        wx.compressImage({
          src: originalImage,
          quality: parseInt(quality),
          success: (res) => {
            this.setData({
              compressedImage: res.tempFilePath
            });

            // 获取压缩后图片大小
            wx.getFileInfo({
              filePath: res.tempFilePath,
              success: (compressedInfo) => {
                const compressedSize = (compressedInfo.size / 1024).toFixed(2);
                const compressionRate = ((1 - compressedInfo.size / info.size) * 100).toFixed(2);
                this.setData({
                  compressedSize: compressedSize,
                  compressionRate: compressionRate
                });
              }
            });
          },
          fail: (error) => {
            console.error('压缩图片失败:', error);
            wx.showToast({
              title: '压缩失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  // 保存图片
  saveImage() {
    const { compressedImage } = this.data;
    if (!compressedImage) return;

    wx.saveImageToPhotosAlbum({
      filePath: compressedImage,
      success: (res) => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: (error) => {
        console.error('保存图片失败:', error);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  }
});