// pages/woodenfish/woodenfish.js
Page({
  data: { mode: 'merit', count: 0, floats: [], isPressed: false, showRipple: false, autoTap: false },
  audioPool: [],
  floatIdPool: 0,
  maxFloats: 3, // 限制同时存在的浮动文字数量，彻底解决卡顿
  longPressTimer: null,
  autoTapInterval: null,
  autoTapCount: 0,
  maxAutoTapCount: 100, // 自动敲击限制次数
  lastTapTime: 0,
  tapInterval: 100, // 普通模式限制敲击频率为100ms一次

  MILESTONES: {
    50: '善念初显，心灯渐明', 99: '九九归一，福慧双修', 199: '破百之功，尘埃落定',
    299: '三三不尽，善缘广结', 399: '四时平安，功德渐满', 499: '五福临门，心有所安',
    599: '六根清净，烦恼不侵', 699: '七星高照，前路明朗', 799: '八面春风，顺遂无忧',
    899: '久久安康，岁月静好', 999: '功德圆满，万事胜意'
  },
  MONEY_MILESTONES: {
    50: '财源初聚，积沙成塔', 99: '财运亨通，金玉满堂', 199: '破局而生，财路渐宽',
    299: '三阳开泰，利市三倍', 399: '四季发财，稳赚不赔', 499: '五路财神，八方来财',
    599: '六六大顺，日进斗金', 699: '七星报喜，财气冲天', 799: '八面玲珑，富贵双全',
    899: '久久为富，长流水转', 999: '富甲一方，金玉满堂'
  },

  onLoad() {
    // 初始化音频池
    this.initAudioPool();
    
    // 恢复计数
    const saved = wx.getStorageSync(`wf_count_${this.data.mode}`);
    if (saved !== '') this.setData({ count: Number(saved) });
    console.log('页面加载完成，初始计数:', this.data.count);
  },

  // 初始化音频池
  initAudioPool() {
    this.audioPool = [];
    for (let i = 0; i < 3; i++) {
      const audio = wx.createInnerAudioContext();
      audio.src = '/audio/knock.m4a';
      audio.obeyMuteSwitch = false;
      audio.onError((err) => console.error('音频错误:', err));
      audio.onCanplay(() => console.log('音频加载完成'));
      this.audioPool.push(audio);
    }
  },

  // 获取空闲的音频实例
  getFreeAudio() {
    for (const audio of this.audioPool) {
      if (audio.paused) return audio;
    }
    // 如果没有空闲实例，返回第一个实例（复用）
    return this.audioPool[0];
  },

  switchMode(e) {
    this.setData({ mode: e.currentTarget.dataset.mode, floats: [] });
    const saved = wx.getStorageSync(`wf_count_${this.data.mode}`);
    this.setData({ count: saved !== '' ? Number(saved) : 0 });
    console.log('切换模式:', this.data.mode, '计数:', this.data.count);
  },

  onTouchStart() {
    console.log('触摸开始');
    this.setData({ isPressed: true });
  },

  onTap() {
    console.log('点击事件触发');
    // 普通模式限制敲击频率
    const now = Date.now();
    if (now - this.lastTapTime < this.tapInterval) {
      console.log('点击过于频繁，忽略');
      return;
    }
    this.lastTapTime = now;

    this.triggerTap();
  },

  // 切换自动连续敲击模式
  toggleAutoTap() {
    if (this.data.autoTap) {
      // 停止自动连击
      if (this.autoTapInterval) {
        clearInterval(this.autoTapInterval);
        this.autoTapInterval = null;
      }
      this.autoTapCount = 0;
      this.setData({ autoTap: false, isPressed: false });
      console.log('停止自动连击');
    } else {
      // 开始自动连击
      this.autoTapCount = 0;
      this.setData({ autoTap: true, isPressed: true });
      this.autoTapInterval = setInterval(() => this.triggerTap(), 300);
      console.log('开始自动连击');
      console.log('自动连击频率: 300ms一次');
    }
  },

  triggerTap() {
    console.log('触发敲击');
    // 1. 计数 & 存储
    let newCount = this.data.count + 1;
    console.log('新计数:', newCount);
    this.setData({ count: newCount });
    wx.setStorageSync(`wf_count_${this.data.mode}`, newCount);

    // 2. 检查自动敲击次数限制
    if (this.data.autoTap) {
      this.autoTapCount++;
      console.log('自动敲击次数:', this.autoTapCount);
      if (this.autoTapCount >= this.maxAutoTapCount) {
        console.log('达到自动敲击次数限制，停止自动连击');
        if (this.autoTapInterval) {
          clearInterval(this.autoTapInterval);
          this.autoTapInterval = null;
        }
        this.autoTapCount = 0;
        this.setData({ autoTap: false, isPressed: false });
        wx.showToast({
          title: '自动敲击已完成',
          icon: 'none',
          duration: 2000
        });
      }
    }

    // 3. 音效处理（使用音频池）
    try {
      console.log('播放音频');
      const audio = this.getFreeAudio();
      audio.stop();
      audio.currentTime = 0;
      audio.play();
    } catch(e) {
      console.error('音频播放错误:', e);
    }
    wx.vibrateShort({ type: 'medium' });

    // 4. 动画状态
    this.setData({ showRipple: true });
    setTimeout(() => this.setData({ showRipple: false }), 200);

    // 5. 生成浮动文字
    const milestoneText = this.data.mode === 'merit' ? this.MILESTONES[newCount] : this.MONEY_MILESTONES[newCount];
    const isMilestone = !!milestoneText;
    const text = isMilestone 
      ? `${this.data.mode==='merit'?'🪵':'💰'} ${milestoneText}` 
      : `${this.data.mode==='merit'?'功德':'金钱'}+1`;
    console.log('浮动文字:', text);
    
    const newFloat = {
      id: ++this.floatIdPool,
      text,
      left: '50%',
      delay: 0
    };

    let newFloats = [...this.data.floats, newFloat];
    if (newFloats.length > this.maxFloats) newFloats = newFloats.slice(-this.maxFloats);
    console.log('新浮动文字数组:', newFloats);
    this.setData({ floats: newFloats });

    // 0.6s 后安全清理
    setTimeout(() => {
      this.setData({ floats: this.data.floats.filter(f => f.id !== newFloat.id) });
    }, 650);

    // 5. 里程碑提示
    if (isMilestone) {
      wx.showToast({
        title: text,
        icon: 'none',
        duration: 3000
      });
    }
  },

  onTouchEnd() {
    console.log('触摸结束');
    // 只有在非自动连击模式下才重置isPressed状态
    if (!this.data.autoTap) {
      this.setData({ isPressed: false });
    }
  },



  onUnload() {
    // 清除自动连击定时器
    if (this.autoTapInterval) {
      clearInterval(this.autoTapInterval);
      this.autoTapInterval = null;
    }
    // 销毁所有音频实例
    for (const audio of this.audioPool) {
      audio.destroy();
    }
  }
});