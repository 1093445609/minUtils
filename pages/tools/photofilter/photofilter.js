Page({
  data: {
    src: "",
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    isFullscreen: false,
    fullscreenCanvas: null,
    fullscreenCtx: null,

    // 预设
    presets: [
      { name: "冷白皮", exp: 10, con: 20, sat: 10, temp: -18, tint: 6, fade: 5, vig: 10 },
      { name: "青橙电影", exp: 8, con: 35, sat: 30, temp: 12, tint: -6, fade: 12, vig: 25 },
      { name: "NC清新", exp: 12, con: 22, sat: 18, temp: -8, tint: 4, fade: 6, vig: 12 },
      { name: "CC复古胶片", exp: 5, con: 28, sat: 12, temp: 8, tint: 2, fade: 22, vig: 30 },
      { name: "富士清淡", exp: 10, con: 15, sat: 8, temp: -6, tint: 4, fade: 8, vig: 10 },
      { name: "高清通透", exp: 15, con: 32, sat: 22, temp: 0, tint: 0, fade: 4, vig: 8 },
      { name: "蓝调暗调", exp: -5, con: 40, sat: 15, temp: -25, tint: 10, fade: 18, vig: 35 },
      { name: "日系奶油", exp: 18, con: 12, sat: 6, temp: 6, tint: 4, fade: 10, vig: 8 }
    ],
    presetNames: [],
    selected: 0,
    intensity: 70,

    // 专业参数
    exposure: 0,
    contrast: 0,
    saturation: 0,
    temp: 0,
    tint: 0,
    fade: 0,
    vignette: 0
  },

  onReady() {
    const p = this.data.presets.map(i => i.name)
    this.setData({ presetNames: p })
    const query = wx.createSelectorQuery()
    query.select("#cvs").fields({ node: true, size: true }).exec(res => {
      this.setData({ canvas: res[0].node, ctx: res[0].node.getContext("2d") })
    })
    // 获取全屏canvas
    query.select("#fullscreenCanvas").fields({ node: true, size: true }).exec(res => {
      if (res[0]) {
        this.setData({ 
          fullscreenCanvas: res[0].node, 
          fullscreenCtx: res[0].node.getContext("2d") 
        })
      }
    })
  },

  chooseImage() {
    wx.chooseMedia({ count: 1, mediaType: ["image"], success: res => {
      const src = res.tempFiles[0].tempFilePath
      this.setData({ src })
      this.renderImage(src)
    }})
  },

  renderImage(src) {
    const { canvas, ctx } = this.data
    const img = canvas.createImage()
    img.src = src
    img.onload = () => {
      const w = img.width, h = img.height
      // 保存原始图片的宽度和高度
      this.setData({ originalWidth: w, originalHeight: h })
      
      // 显示用的canvas尺寸（保持与之前相同的显示大小）
      const maxW = 360, maxH = 520
      let nw, nh
      if (w / h > maxW / maxH) {
        nw = maxW
        nh = maxW * h / w
      } else {
        nh = maxH
        nw = maxH * w / h
      }
      canvas.width = nw
      canvas.height = nh
      this.setData({ width: nw, height: nh })
      ctx.clearRect(0, 0, nw, nh)
      ctx.drawImage(img, 0, 0, nw, nh)
      this.applyAllFilters()
      // 更新全屏canvas
      this.updateFullscreenCanvas()
    }
  },

  // 进入全屏查看
  enterFullscreen() {
    if (!this.data.src) return
    
    // 请求横屏
    wx.setScreenOrientation({
      orientation: 'landscape'
    })
    
    this.setData({ isFullscreen: true })
    // 延迟更新全屏canvas，确保DOM已经渲染
    setTimeout(() => {
      this.updateFullscreenCanvas()
    }, 100)
  },

  // 退出全屏查看
  exitFullscreen() {
    // 恢复竖屏
    wx.setScreenOrientation({
      orientation: 'portrait'
    })
    
    this.setData({ isFullscreen: false })
  },

  // 更新全屏canvas
  updateFullscreenCanvas() {
    const { fullscreenCanvas, fullscreenCtx, src } = this.data
    if (!fullscreenCanvas || !fullscreenCtx || !src) return
    
    // 获取屏幕尺寸
    const { windowWidth, windowHeight } = wx.getSystemInfoSync()
    
    // 设置全屏canvas尺寸
    fullscreenCanvas.width = windowWidth
    fullscreenCanvas.height = windowHeight
    
    // 加载并绘制图片
    const img = fullscreenCanvas.createImage()
    img.src = src
    img.onload = () => {
      const w = img.width, h = img.height
      
      // 计算缩放比例，保持图片比例
      const scale = Math.min(windowWidth / w, windowHeight / h)
      const nw = w * scale
      const nh = h * scale
      const x = (windowWidth - nw) / 2
      const y = (windowHeight - nh) / 2
      
      // 清空并绘制图片
      fullscreenCtx.clearRect(0, 0, windowWidth, windowHeight)
      fullscreenCtx.drawImage(img, x, y, nw, nh)
      
      // 应用滤镜
      this.applyFiltersToCanvas(fullscreenCanvas, fullscreenCtx, windowWidth, windowHeight)
    }
  },

  // 应用滤镜到指定的canvas
  applyFiltersToCanvas(canvas, ctx, width, height) {
    const { exposure, contrast, saturation, temp, tint, fade, vignette, intensity } = this.data
    if (!ctx) return
    
    const k = intensity / 100
    const imgData = ctx.getImageData(0, 0, width, height)
    const d = imgData.data
    const cx = width / 2, cy = height / 2
    const maxR = Math.sqrt(cx * cx + cy * cy)

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i + 1], b = d[i + 2]

      // 曝光
      r += exposure * 2.5 * k
      g += exposure * 2.5 * k
      b += exposure * 2.5 * k

      // 色温 + 色调
      r += temp * 1.2 * k
      g += 0
      b -= temp * 1.2 * k
      r -= tint * 0.8 * k
      g += 0
      b += tint * 1.4 * k

      // 饱和度
      const avg = (r + g + b) / 3
      r = avg + (r - avg) * (1 + saturation * 0.015 * k)
      g = avg + (g - avg) * (1 + saturation * 0.015 * k)
      b = avg + (b - avg) * (1 + saturation * 0.015 * k)

      // 对比度
      r = 128 + (r - 128) * (1 + contrast * 0.015 * k)
      g = 128 + (g - 128) * (1 + contrast * 0.015 * k)
      b = 128 + (b - 128) * (1 + contrast * 0.015 * k)

      // 褪色
      r = r * (1 - fade * 0.006 * k) + 140 * (fade * 0.006 * k)
      g = g * (1 - fade * 0.006 * k) + 130 * (fade * 0.006 * k)
      b = b * (1 - fade * 0.006 * k) + 120 * (fade * 0.006 * k)

      // 边界
      r = Math.max(0, Math.min(255, r))
      g = Math.max(0, Math.min(255, g))
      b = Math.max(0, Math.min(255, b))

      d[i] = r
      d[i + 1] = g
      d[i + 2] = b
    }

    ctx.putImageData(imgData, 0, 0)

    // 暗角
    if (vignette > 0) {
      const vig = vignette * k
      const grad = ctx.createRadialGradient(cx, cy, maxR * 0.3, cx, cy, maxR)
      grad.addColorStop(0, "rgba(0,0,0,0)")
      grad.addColorStop(1, `rgba(0,0,0,${vig * 0.01})`)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    }
  },

  onPresetChange(e) {
    const idx = e.detail.value
    const s = this.data.presets[idx]
    this.setData({
      selected: idx,
      exposure: s.exp,
      contrast: s.con,
      saturation: s.sat,
      temp: s.temp,
      tint: s.tint,
      fade: s.fade,
      vignette: s.vig
    })
    // 重新渲染原始图片，然后应用新的预设
    this.renderImage(this.data.src)
  },

  onIntensityChange(e) {
    this.setData({ intensity: e.detail.value })
    // 重新渲染原始图像，然后应用滤镜，确保每次调整强度时都是基于原始图像
    this.renderImage(this.data.src)
  },
  onExposure(e) { this.setData({ exposure: e.detail.value }); this.renderImage(this.data.src) },
  onContrast(e) { this.setData({ contrast: e.detail.value }); this.renderImage(this.data.src) },
  onSaturation(e) { this.setData({ saturation: e.detail.value }); this.renderImage(this.data.src) },
  onTemp(e) { this.setData({ temp: e.detail.value }); this.renderImage(this.data.src) },
  onTint(e) { this.setData({ tint: e.detail.value }); this.renderImage(this.data.src) },
  onFade(e) { this.setData({ fade: e.detail.value }); this.renderImage(this.data.src) },
  onVignette(e) { this.setData({ vignette: e.detail.value }); this.renderImage(this.data.src) },

  applyAllFilters() {
    const { ctx, width, height, exposure, contrast, saturation, temp, tint, fade, vignette, intensity } = this.data
    if (!ctx) return
    const k = intensity / 100

    const imgData = ctx.getImageData(0, 0, width, height)
    const d = imgData.data
    const cx = width / 2, cy = height / 2
    const maxR = Math.sqrt(cx * cx + cy * cy)

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i + 1], b = d[i + 2]

      // 曝光
      r += exposure * 2.5 * k
      g += exposure * 2.5 * k
      b += exposure * 2.5 * k

      // 色温 + 色调
      r += temp * 1.2 * k
      g += 0
      b -= temp * 1.2 * k
      r -= tint * 0.8 * k
      g += 0
      b += tint * 1.4 * k

      // 饱和度
      const avg = (r + g + b) / 3
      r = avg + (r - avg) * (1 + saturation * 0.015 * k)
      g = avg + (g - avg) * (1 + saturation * 0.015 * k)
      b = avg + (b - avg) * (1 + saturation * 0.015 * k)

      // 对比度
      r = 128 + (r - 128) * (1 + contrast * 0.015 * k)
      g = 128 + (g - 128) * (1 + contrast * 0.015 * k)
      b = 128 + (b - 128) * (1 + contrast * 0.015 * k)

      // 褪色
      r = r * (1 - fade * 0.006 * k) + 140 * (fade * 0.006 * k)
      g = g * (1 - fade * 0.006 * k) + 130 * (fade * 0.006 * k)
      b = b * (1 - fade * 0.006 * k) + 120 * (fade * 0.006 * k)

      // 边界
      r = Math.max(0, Math.min(255, r))
      g = Math.max(0, Math.min(255, g))
      b = Math.max(0, Math.min(255, b))

      d[i] = r
      d[i + 1] = g
      d[i + 2] = b
    }

    ctx.putImageData(imgData, 0, 0)

    // 暗角
    if (vignette > 0) {
      const vig = vignette * k
      const grad = ctx.createRadialGradient(cx, cy, maxR * 0.3, cx, cy, maxR)
      grad.addColorStop(0, "rgba(0,0,0,0)")
      grad.addColorStop(1, `rgba(0,0,0,${vig * 0.01})`)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    }
  },

  saveImage() {
    if (this.data.src && this.data.canvas) {
      // 尝试使用原始图片尺寸保存
      const saveWithOriginalSize = () => {
        wx.canvasToTempFilePath({
          canvas: this.data.canvas,
          // 使用原始图片的尺寸
          destWidth: this.data.originalWidth || 1080,
          destHeight: this.data.originalHeight || 1920,
          success: (res) => {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                wx.showToast({ title: "保存成功" });
              },
              fail: (err) => {
                console.log('保存失败:', err);
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
                  // 如果保存失败，尝试使用显示尺寸
                  saveWithDisplaySize();
                }
              }
            });
          },
          fail: (err) => {
            console.log('转换失败:', err);
            // 如果转换失败，尝试使用显示尺寸
            saveWithDisplaySize();
          }
        });
      };

      // 使用显示尺寸保存（备用方案）
      const saveWithDisplaySize = () => {
        wx.canvasToTempFilePath({
          canvas: this.data.canvas,
          // 使用显示尺寸的2倍
          destWidth: this.data.width * 2,
          destHeight: this.data.height * 2,
          success: (res) => {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                wx.showToast({ title: "保存成功" });
              },
              fail: (err) => {
                console.log('保存失败:', err);
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
                  wx.showToast({ title: "保存失败", icon: "none" });
                }
              }
            });
          },
          fail: (err) => {
            console.log('转换失败:', err);
            wx.showToast({ title: "保存失败", icon: "none" });
          }
        });
      };

      // 先尝试使用原始尺寸保存
      saveWithOriginalSize();
    } else {
      wx.showToast({ title: "请先选择图片", icon: "none" });
    }
  },



  // 重置所有滤镜参数到初始值
  resetFilters() {
    // 获取第一个预设的参数
    const firstPreset = this.data.presets[0];
    this.setData({
      selected: 0,
      intensity: 70,
      exposure: firstPreset.exp,
      contrast: firstPreset.con,
      saturation: firstPreset.sat,
      temp: firstPreset.temp,
      tint: firstPreset.tint,
      fade: firstPreset.fade,
      vignette: firstPreset.vig
    });
    // 重新渲染原始图像，应用初始参数
    this.renderImage(this.data.src);
  }
})