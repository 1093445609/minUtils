Page({
  data: {
    src: "",
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,

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
    this.applyAllFilters()
  },

  onIntensityChange(e) {
    this.setData({ intensity: e.detail.value })
    this.applyAllFilters()
  },
  onExposure(e) { this.setData({ exposure: e.detail.value }); this.applyAllFilters() },
  onContrast(e) { this.setData({ contrast: e.detail.value }); this.applyAllFilters() },
  onSaturation(e) { this.setData({ saturation: e.detail.value }); this.applyAllFilters() },
  onTemp(e) { this.setData({ temp: e.detail.value }); this.applyAllFilters() },
  onTint(e) { this.setData({ tint: e.detail.value }); this.applyAllFilters() },
  onFade(e) { this.setData({ fade: e.detail.value }); this.applyAllFilters() },
  onVignette(e) { this.setData({ vignette: e.detail.value }); this.applyAllFilters() },

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
    wx.canvasToTempFilePath({ canvas: this.data.canvas, success: res => {
      wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => wx.showToast({ title: "保存成功" }),
        fail: () => wx.showToast({ title: "请授权相册", icon: "none" })
      })
    }})
  }
})