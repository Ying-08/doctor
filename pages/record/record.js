Page({
  data: {
    records: []
  },

  onLoad() {
    const records = wx.getStorageSync('records') || [];
    this.setData({ records });
  }
});