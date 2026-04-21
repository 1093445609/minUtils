Page({
  data: {
    // 当前换算类型
    currentType: 'length',
    // 输入值
    inputValue: '',
    // 输出值
    outputValue: '',
    // 单位列表
    units: {
      length: ['毫米', '厘米', '米', '千米', '英寸', '英尺', '码', '英里'],
      weight: ['毫克', '克', '两', '斤', '千克', '吨', '磅', '盎司'],
      temperature: ['摄氏度', '华氏度', '开尔文']
    },
    // 换算系数（转换到基准单位的值）
    conversionFactors: {
      length: {
        '毫米': 1,
        '厘米': 10,
        '米': 1000,
        '千米': 1000000,
        '英寸': 25.4,
        '英尺': 304.8,
        '码': 914.4,
        '英里': 1609344
      },
      weight: {
        '克': 1,
        '千克': 1000,
        '吨': 1000000,
        '磅': 453.592,
        '盎司': 28.3495,
        '毫克': 0.001,
        '斤': 500,
        '两': 50
      }
    },
    // 从单位索引
    fromUnitIndex: 0,
    // 到单位索引
    toUnitIndex: 2
  },

  onLoad() {
    // 初始化单位列表
    this.setUnits();
  },

  // 设置单位列表
  setUnits() {
    const { currentType, units, fromUnitIndex, toUnitIndex } = this.data;
    this.setData({
      fromUnits: units[currentType],
      toUnits: units[currentType],
      fromUnitIndex: fromUnitIndex,
      toUnitIndex: toUnitIndex
    });
    // 执行换算
    this.convert();
  },

  // 选择换算类型
  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      currentType: type,
      fromUnitIndex: 0,
      toUnitIndex: 2
    });
    this.setUnits();
  },

  // 输入值变化
  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
    this.convert();
  },

  // 从单位变化
  onFromUnitChange(e) {
    this.setData({
      fromUnitIndex: e.detail.value
    });
    this.convert();
  },

  // 到单位变化
  onToUnitChange(e) {
    this.setData({
      toUnitIndex: e.detail.value
    });
    this.convert();
  },

  // 交换单位
  swapUnits() {
    const { fromUnitIndex, toUnitIndex } = this.data;
    this.setData({
      fromUnitIndex: toUnitIndex,
      toUnitIndex: fromUnitIndex
    });
    this.convert();
  },

  // 执行换算
  convert() {
    const { currentType, inputValue, fromUnits, toUnits, fromUnitIndex, toUnitIndex, conversionFactors } = this.data;
    const value = parseFloat(inputValue);

    if (isNaN(value)) {
      this.setData({ outputValue: '' });
      return;
    }

    let result = '';

    if (currentType === 'temperature') {
      // 温度换算
      const fromUnit = fromUnits[fromUnitIndex];
      const toUnit = toUnits[toUnitIndex];

      if (fromUnit === '摄氏度') {
        if (toUnit === '华氏度') {
          result = (value * 9/5 + 32).toFixed(2);
        } else if (toUnit === '开尔文') {
          result = (value + 273.15).toFixed(2);
        } else {
          result = value.toString();
        }
      } else if (fromUnit === '华氏度') {
        if (toUnit === '摄氏度') {
          result = ((value - 32) * 5/9).toFixed(2);
        } else if (toUnit === '开尔文') {
          result = ((value - 32) * 5/9 + 273.15).toFixed(2);
        } else {
          result = value.toString();
        }
      } else if (fromUnit === '开尔文') {
        if (toUnit === '摄氏度') {
          result = (value - 273.15).toFixed(2);
        } else if (toUnit === '华氏度') {
          result = ((value - 273.15) * 9/5 + 32).toFixed(2);
        } else {
          result = value.toString();
        }
      }
    } else {
      // 长度和重量换算
      const fromUnit = fromUnits[fromUnitIndex];
      const toUnit = toUnits[toUnitIndex];
      // 先转换到基准单位，再转换到目标单位
      const baseValue = value * conversionFactors[currentType][fromUnit];
      const convertedValue = baseValue / conversionFactors[currentType][toUnit];
      result = convertedValue.toFixed(6);
    }

    this.setData({ outputValue: result });
  }
});