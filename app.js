// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    
      const disclaimerAccepted = wx.getStorageSync('disclaimerAccepted');
      if (!disclaimerAccepted) {
        console.log("-------------------------跳转了")
        wx.redirectTo({
          url: 'pages\disclaimer\disclaimer'
        
        });
        
      }
    
  },
  globalData: {
    userInfo: null
  }
})
