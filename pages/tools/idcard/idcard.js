Page({
  data: {
    // 身份证号码
    idCardNumber: '',
    // 校验结果
    result: [],
    // 校验状态
    status: ''
  },

  // 身份证号输入
  onIdCardInput(e) {
    this.setData({
      idCardNumber: e.detail.value
    });
  },

  // 校验身份证号
  verifyIdCard() {
    const { idCardNumber } = this.data;
    if (!idCardNumber) {
      wx.showToast({
        title: '请输入身份证号码',
        icon: 'none'
      });
      return;
    }

    // 验证格式
    if (!this.validateFormat(idCardNumber)) {
      this.setData({
        status: 'invalid',
        result: []
      });
      wx.showToast({
        title: '身份证号格式错误',
        icon: 'none'
      });
      return;
    }

    // 验证校验码
    if (!this.validateCheckCode(idCardNumber)) {
      this.setData({
        status: 'invalid',
        result: []
      });
      wx.showToast({
        title: '身份证号校验码错误',
        icon: 'none'
      });
      return;
    }

    // 提取信息
    const info = this.extractInfo(idCardNumber);
    this.setData({
      status: 'valid',
      result: info
    });
  },

  // 验证格式
  validateFormat(idCard) {
    // 18位身份证号正则
    const regex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/;
    return regex.test(idCard);
  },

  // 验证校验码
  validateCheckCode(idCard) {
    // 校验码计算规则
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(idCard[i]) * weights[i];
    }

    const checkCode = checkCodes[sum % 11];
    return idCard[17].toUpperCase() === checkCode;
  },

  // 提取信息
  extractInfo(idCard) {
    const info = [];

    // 出生日期
    const birthYear = idCard.substring(6, 10);
    const birthMonth = idCard.substring(10, 12);
    const birthDay = idCard.substring(12, 14);
    info.push({ label: '出生日期', value: `${birthYear}-${birthMonth}-${birthDay}` });

    // 性别
    const genderCode = parseInt(idCard.substring(16, 17));
    const gender = genderCode % 2 === 1 ? '男' : '女';
    info.push({ label: '性别', value: gender });

    // 地区码
    const areaCode = idCard.substring(0, 6);
    info.push({ label: '地区码', value: areaCode });

    return info;
  }
});