Page({
  data: {
    // 选中的颜色
    selectedColor: '#ff0000',
    // 色相
    hue: 0,
    // 饱和度
    saturation: 100,
    // 亮度
    lightness: 50,
    // 常用颜色
    presetColors: [
      '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
      '#ff8000', '#8000ff', '#80ff00', '#0080ff', '#ff0080', '#00ff80',
      '#808080', '#c0c0c0', '#ffffff', '#000000', '#800000', '#008000'
    ]
  },

  // 色相变化
  onHueChange(e) {
    const { clientX } = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    let hue = ((clientX - rect.left) / rect.width) * 100;
    hue = Math.max(0, Math.min(100, hue));
    
    this.setData({
      hue: hue
    });
    this.updateColor();
  },

  // 饱和度和亮度变化
  onSLChange(e) {
    const { clientX, clientY } = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    let saturation = ((clientX - rect.left) / rect.width) * 100;
    let lightness = 100 - ((clientY - rect.top) / rect.height) * 100;
    
    saturation = Math.max(0, Math.min(100, saturation));
    lightness = Math.max(0, Math.min(100, lightness));
    
    this.setData({
      saturation: saturation,
      lightness: lightness
    });
    this.updateColor();
  },

  // 更新颜色
  updateColor() {
    const { hue, saturation, lightness } = this.data;
    const hexColor = this.hslToHex(hue, saturation, lightness);
    this.setData({
      selectedColor: hexColor
    });
  },

  // HSL转HEX
  hslToHex(h, s, l) {
    h /= 100;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  },

  // HEX输入
  onHexInput(e) {
    const hex = e.detail.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      this.setData({
        selectedColor: hex
      });
      // 这里可以添加HEX转HSL的逻辑，更新hue, saturation, lightness
    }
  },

  // 选择预设颜色
  selectPresetColor(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({
      selectedColor: color
    });
    // 这里可以添加HEX转HSL的逻辑，更新hue, saturation, lightness
  }
});