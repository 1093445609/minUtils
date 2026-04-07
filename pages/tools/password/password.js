Page({
  data: {
    // 生成的密码
    generatedPassword: '',
    // 密码长度
    passwordLength: 12,
    // 包含大写字母
    includeUppercase: true,
    // 包含小写字母
    includeLowercase: true,
    // 包含数字
    includeNumbers: true,
    // 包含特殊字符
    includeSymbols: true,
    // 密码强度百分比
    strengthPercentage: 0,
    // 密码强度等级
    strengthLevel: '',
    // 密码强度颜色
    strengthColor: ''
  },

  // 密码长度变化
  onLengthChange(e) {
    this.setData({
      passwordLength: e.detail.value
    });
  },

  // 复选框变化
  onCheckboxChange(e) {
    const value = e.detail.value;
    this.setData({
      includeUppercase: value.includes('uppercase'),
      includeLowercase: value.includes('lowercase'),
      includeNumbers: value.includes('numbers'),
      includeSymbols: value.includes('symbols')
    });
  },

  // 生成密码
  generatePassword() {
    const { passwordLength, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = this.data;
    
    // 检查至少选择了一种字符类型
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
      wx.showToast({
        title: '请至少选择一种字符类型',
        icon: 'none'
      });
      return;
    }

    // 构建字符集
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // 生成密码
    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    // 更新密码
    this.setData({
      generatedPassword: password
    });

    // 计算密码强度
    this.calculateStrength(password);
  },

  // 计算密码强度
  calculateStrength(password) {
    const { passwordLength, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = this.data;
    
    // 计算强度分数
    let score = 0;
    
    // 长度得分
    if (passwordLength >= 12) score += 30;
    else if (passwordLength >= 8) score += 20;
    else score += 10;
    
    // 字符类型得分
    let typeCount = 0;
    if (includeUppercase) typeCount++;
    if (includeLowercase) typeCount++;
    if (includeNumbers) typeCount++;
    if (includeSymbols) typeCount++;
    score += typeCount * 15;

    // 确定强度等级和颜色
    let strengthLevel = '';
    let strengthColor = '';
    if (score < 40) {
      strengthLevel = '弱';
      strengthColor = '#F44336';
    } else if (score < 70) {
      strengthLevel = '中';
      strengthColor = '#FF9800';
    } else {
      strengthLevel = '强';
      strengthColor = '#4CAF50';
    }

    this.setData({
      strengthPercentage: score,
      strengthLevel: strengthLevel,
      strengthColor: strengthColor
    });
  },

  // 复制密码
  copyPassword() {
    const { generatedPassword } = this.data;
    if (!generatedPassword) return;

    wx.setClipboardData({
      data: generatedPassword,
      success: (res) => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  }
});