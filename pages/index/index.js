// index.js
Page({
  data: {
    // 搜索文本
    searchText: '',
    // 选中的分类
    selectedCategory: 'all',
    // 分类列表
    categories: [
      { id: 'all', name: '全部' },
      { id: 'daily', name: '日常工具' },
      { id: 'calc', name: '计算工具' },
      { id: 'text', name: '文本工具' },
      { id: 'life', name: '生活工具' }
    ],
    // 工具列表
    tools: [
      { id: 14, name: '电子木鱼', icon: '🥁', path: '/pages/tools/woodenfish/woodenfish', category: 'daily' },
      { id: 15, name: '亲戚计算器', icon: '👨‍👩‍👧‍👦', path: '/pages/tools/relationcalculator/relation', category: 'life' },
      { id: 1, name: '手持弹幕', icon: '📢', path: '/pages/tools/handheld/handheld', category: 'daily' },
      { id: 2, name: '尺子', icon: '📏', path: '/pages/tools/ruler/ruler', category: 'daily' },
      { id: 4, name: '计算器', icon: '🧮', path: '/pages/tools/calculator/calculator', category: 'calc' },
      { id: 5, name: '文本大小写转换', icon: '🔤', path: '/pages/tools/textcase/textcase', category: 'text' },
      { id: 7, name: '单位换算', icon: '⚖️', path: '/pages/tools/converter/converter', category: 'calc' },
      { id: 8, name: '时间戳转换', icon: '⏰', path: '/pages/tools/timestamp/timestamp', category: 'calc' },
      { id: 9, name: '身份证号校验', icon: '🆔', path: '/pages/tools/idcard/idcard', category: 'life' },
      { id: 10, name: '颜色拾取器', icon: '🎨', path: '/pages/tools/colorpicker/colorpicker', category: 'daily' },
      { id: 11, name: '图片压缩', icon: '🖼️', path: '/pages/tools/imagecompress/imagecompress', category: 'daily' },
      { id: 12, name: '密码生成器', icon: '🔐', path: '/pages/tools/password/password', category: 'life' },
      { id: 13, name: '照片调色', icon: '🖼️', path: '/pages/tools/photofilter/photofilter', category: 'daily' },
      { id: 3, name: '分贝测试仪', icon: '🔊', path: '/pages/tools/decibel/decibel', category: 'daily' },
      { id: 6, name: '随机数生成', icon: '🎲', path: '/pages/tools/random/random', category: 'calc' }
    ],
    // 过滤后的工具列表
    filteredTools: [],
    // 分页相关
    pageSize: 12,
    currentPage: 1,
  },

  onLoad() {
    // 初始化过滤工具列表
    this.filterTools();
  },

  // 过滤工具列表
  filterTools() {
    const { searchText, selectedCategory, tools, pageSize, currentPage } = this.data;
    let filtered = tools;

    // 按分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    // 按搜索文本过滤
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(tool => tool.name.toLowerCase().includes(searchLower));
    }

    // 分页处理
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedTools = filtered.slice(start, end);

    this.setData({
      filteredTools: paginatedTools,
      totalFiltered: filtered.length
    });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchText: e.detail.value,
      currentPage: 1
    });
    this.filterTools();
  },

  // 选择分类
  selectCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({
      selectedCategory: categoryId,
      currentPage: 1
    });
    this.filterTools();
  },

  // 导航到工具页面
  navigateToTool(e) {
    const path = e.currentTarget.dataset.path;
    wx.navigateTo({
      url: path
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    // 模拟刷新
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新完成',
        icon: 'success'
      });
    }, 1000);
  },

  // 上拉加载更多
  onReachBottom() {
    const { currentPage, pageSize, totalFiltered } = this.data;
    const maxPage = Math.ceil(totalFiltered / pageSize);
    
    if (currentPage < maxPage) {
      this.setData({
        currentPage: currentPage + 1
      });
      this.filterTools();
    }
  }
});