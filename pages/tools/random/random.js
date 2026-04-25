Page({ 
data: { 
  // 最小值 
  min: '0', 
  // 最大值 
  max: '100', 
  // 生成结果 
  result: '', 
  // 历史记录 
  history: [] 
}, 

// 最小值输入 
onMinInput(e) { 
  this.setData({ 
    min: e.detail.value 
  }); 
}, 

// 最大值输入 
onMaxInput(e) { 
  this.setData({ 
    max: e.detail.value 
  }); 
}, 

// 生成随机数 
generateRandom() { 
  const { min, max, history } = this.data; 
  const minNum = parseInt(min) || 0; 
  const maxNum = parseInt(max) || 100; 

  if (minNum > maxNum) { 
    wx.showToast({ 
      title: '最小值不能大于最大值', 
      icon: 'none' 
    }); 
    return; 
  } 

  // 生成随机数 
  const randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum; 
   
  // 更新结果 
  this.setData({ 
    result: randomNum.toString() 
  }); 

  // 添加到历史记录 
  const newHistory = [randomNum.toString(), ...history].slice(0, 10); // 只保留最近10条 
  this.setData({ 
    history: newHistory 
  });   } 
});