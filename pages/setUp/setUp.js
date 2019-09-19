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
    loginToken:'',
    userId:'',
    userInfo:'',
    hasUserInfo:'',
    setting:'',
  },
  setUpHide: function(e) {
    var that = this;
    console.log(e.target.dataset.name);
    const { setting } = that.data;
    console.log(setting[e.target.dataset.name]);
    if (setting[e.target.dataset.name] == true){
      setting[e.target.dataset.name] = false;
    }else{
      setting[e.target.dataset.name] = true;
    }
    var postRequest = wxRequest.postRequest(api.setUpHide(), setting, that.data.loginToken);
    postRequest.then(res => {
      console.log('-----登陆位置提交-------')
      console.log(res);
      that.setData({
        setting: res.data.result,
      })
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    //查询个人信息
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res.code)
        var query = {
          code: res.code,
        }
        var that = this;
        var getPostsRequest = wxRequest.getRequest(api.userLogin(query));
        getPostsRequest.then(res => {
          console.log('-----登陆信息提交-------')
          that.setData({
            loginToken: res.data.token,
            userId: res.data.userId,
          })
        }).then(res => {
          //查询个人信息
          var queryPersonInfo = wxRequest.getRequest(api.queryPersonInfo(), '', that.data.loginToken);
          queryPersonInfo.then(res => {
            console.log(res.data)
            that.setData({
              setInfo: res.data.data,
              setting:res.data.data.setting,
            })
            console.log(that.data)
          })
        })
      }
    })
  },
})
