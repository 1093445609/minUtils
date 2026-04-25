// pages/test/test.js
Page({
  data: {
    count: 0
  },
  
  onLoad() {
    console.log('Test page loaded');
    // 初始化音频
    this.audioCtx = wx.createInnerAudioContext();
    this.audioCtx.src = '/audio/knock.m4a';
    this.audioCtx.obeyMuteSwitch = false;
    this.audioCtx.onError((err) => console.error('Audio error:', err));
    this.audioCtx.onCanplay(() => console.log('Audio can play'));
  },
  
  onTap() {
    console.log('onTap called');
    // 增加计数
    let newCount = this.data.count + 1;
    this.setData({ count: newCount });
    console.log('New count:', newCount);
    
    // 播放音频
    try {
      this.audioCtx.stop();
      this.audioCtx.currentTime = 0;
      this.audioCtx.play();
      console.log('Audio played');
    } catch(e) {
      console.error('Audio play error:', e);
    }
    
    // 震动反馈
    wx.vibrateShort({ type: 'medium' });
  }
});