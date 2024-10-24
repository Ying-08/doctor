// disclaimer.js
Page({
  data: {},

  onAgree() {
    // 用户同意，跳转到主页面
    wx.setStorageSync('disclaimerAccepted', true);
    wx.redirectTo({
      url: '/pages/index/index' // 假设主页面是 index 页面
    });
  },

  onDisagree() {
    // 用户不同意，退出小程序
    wx.showModal({
      title: '提示',
      content: '您必须同意免责声明才能使用本小程序。',
      showCancel: false
    });
  }
});