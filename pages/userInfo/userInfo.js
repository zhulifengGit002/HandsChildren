//index.js
//获取应用实例
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const wxRequest = require('../../utils/wxRequest.js');
const app = getApp()

Page({
  data: {
    setInfo: {},
    userImg:'',
  },
  startNavigation() {
    wx.openLocation({//​使用微信内置地图查看位置。
      latitude: app.globalData.latitude,//要去的纬度-地址
      longitude: app.globalData.longitude,//要去的经度-地址
      name: '用户位置',
      address: '用户位置'
    })
  },
  startChat: function () {
    wx.navigateTo({
      url: '../chat/chat'
    })
  },
  onLoad: function () {
    var that = this;
    var query = {
      userId: app.globalData.userId,
    }
    console.log(app.globalData.userId)
    var getPostsRequest = wxRequest.getRequest(api.queryNeighbourInfo(query), '', app.globalData.loginToken);
    getPostsRequest.then(res => {
      console.log('-----登陆信息提交-------')
      console.log(res.data.data)
      that.setData({
        setInfo: res.data.data,
        userImg:app.globalData.userImg,
      })
    })
  },
  copyText: function (e) {
    console.log(e)
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },
})
