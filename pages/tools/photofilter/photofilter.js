Page({
  data: {
    // 上传的图片路径
    imagePath: '',
    // 选中的滤镜
    selectedFilter: 'none',
    // 滤镜强度
    filterIntensity: 50,
    // 滤镜样式
    filterStyle: ''
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          imagePath: res.tempFilePaths[0],
          selectedFilter: 'none',
          filterIntensity: 50,
          filterStyle: ''
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 选择滤镜
  selectFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      selectedFilter: filter,
      filterIntensity: 50
    });
    this.updateFilterStyle();
  },

  // 调整滤镜强度
  onIntensityChange(e) {
    const intensity = e.detail.value;
    this.setData({
      filterIntensity: intensity
    });
    this.updateFilterStyle();
  },

  // 更新滤镜样式
  updateFilterStyle() {
    const { selectedFilter, filterIntensity } = this.data;
    let filterStyle = '';
    
    // 计算强度值（0-1）
    const intensity = filterIntensity / 100;
    
    switch (selectedFilter) {
      case 'portrait':
        // 人像滤镜：增加亮度和对比度，柔化效果
        filterStyle = `brightness(${1 + intensity * 0.2}) contrast(${1 + intensity * 0.1}) saturate(${1 + intensity * 0.1}) blur(${intensity * 0.5}px)`;
        break;
      case 'fuji':
        // 富士NC滤镜：暖色调，增加饱和度
        filterStyle = `sepia(${intensity * 0.3}) saturate(${1 + intensity * 0.3}) hue-rotate(${intensity * 10}deg) contrast(${1 + intensity * 0.15})`;
        break;
      case 'links':
        // LINKS滤镜：高对比度，冷色调
        filterStyle = `contrast(${1 + intensity * 0.3}) saturate(${1 + intensity * 0.2}) hue-rotate(${-intensity * 15}deg) brightness(${1 + intensity * 0.1})`;
        break;
      default:
        filterStyle = '';
    }
    
    this.setData({
      filterStyle: filterStyle
    });
  },

  // 重置滤镜
  resetFilter() {
    this.setData({
      selectedFilter: 'none',
      filterIntensity: 50,
      filterStyle: ''
    });
  },

  // 保存图片到本地
  saveImage() {
    const { imagePath, filterStyle } = this.data;
    
    if (!imagePath) {
      wx.showToast({
        title: '请先上传图片',
        icon: 'none'
      });
      return;
    }
    
    // 直接保存原始图片（简化处理，实际项目中可以根据需要处理滤镜效果）
    wx.saveImageToPhotosAlbum({
      filePath: imagePath,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        // 检查是否是权限问题
        if (err.errMsg.indexOf('auth denied') > -1) {
          wx.showModal({
            title: '需要权限',
            content: '保存图片需要相册权限，请在设置中开启',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }
      }
    });
  }
});