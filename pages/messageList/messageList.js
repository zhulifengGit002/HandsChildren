//index.js
//获取应用实例
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const wxRequest = require('../../utils/wxRequest.js');
const app = getApp();
const { emojis, emojiToPath, textToEmoji } = require('../../utils/emojis');
Page({
  data: {
    loginToken: '',
    messageInfo:'',
  },
  bindChatTap: function (e) {
    console.log(e)
    var that = this;
    const index = e.currentTarget.id;
    const { messageInfo } = that.data;
    app.globalData.userId = messageInfo[index].sender;
    app.globalData.loginToken = that.data.loginToken;
    app.globalData.userImg = messageInfo[index].avatarUrl;
    app.globalData.userName = messageInfo[index].nickName;
    wx.navigateTo({
      url: '../chat/chat'
    })
  },
  onLoad: function () {
    //用户信息获取
    var that = this;
    // 用户userId: 183，个人userId 178
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
          console.log('-----登陆信息提交-------');
          console.log(res.data);
          that.setData({
            loginToken: res.data.token,
          })
        }).then(res => {
          //列表信息保存
          var postRequest = wxRequest.getRequest(api.sendMessage(), '', that.data.loginToken);
          postRequest.then(res => {
            console.log('-----对话信息查询-------')
            console.log(res.data.result);
            that.setData({
              messageInfo: res.data.result,
            })
          })
        })
      }
    })
  },
  onShow: function () {
  },
  onUnload: function () {
  },
  onShareAppMessage: function (res){
    // return {
    //   title:''
    // }
  }
})
