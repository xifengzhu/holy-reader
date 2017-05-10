import * as api from './utils/request';

// app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    const that = this;
    if(this.globalData.userInfo){
      typeof cb === 'function' && cb(this.globalData.userInfo);
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb === 'function' && cb(that.globalData.userInfo);
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null
  },
  ApiURI: 'https://api.zhuishushenqi.com',
  Api: api
});
