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
    senderInfo: '',
    receiverInfo:'',
    messageInfo:'',
    chatInfoList:{},
    top_value:'',
    closeTime:false,
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
            senderInfo: res.data,
          })
        }).then(res => {
          //对话用户信息保存
          that.setData({
            receiverInfo: {
              userId: app.globalData.userId,
              userName: app.globalData.userName,
              userImg: app.globalData.userImg,
            },
          })
          console.log(that.data.receiverInfo)
        }).then(res => {
          //对话信息查询定时查询
          var getMessageLoop = setInterval(function () { 
            if(that.data.closeTime == true){
              clearInterval(getMessageLoop);
              return false;
            }
            var data = {
              limit: 100,
              offset: 0,
              receiver: that.data.receiverInfo.userId,
              sender: that.data.senderInfo.userId,
            }
            var postRequest = wxRequest.postRequest(api.getMessage(), data, that.data.loginToken);
            postRequest.then(res => {
              console.log('-----对话信息获取-------')
              if (that.data.chatInfoList.length == res.data.result.length){
                console.log('------数据未发生变化-------')
              }else{
                that.setData({
                  chatInfoList: res.data.result.reverse(),
                  top_value: res.data.result.length * 100,
                })
                console.log(that.data.chatInfoList)
              }
            })
          }, 1000);
        })
      }
    })
  },
  blurInput(val) {
    this.setData({
      messageInfo: val.detail.value || '',
    });
    console.log(this.data.messageInfo)
  },
  longPress: function (e) {
    console.log(e.target.id)
    var that = this;
    wx.showModal({ //使用模态框提示用户进行操作
      title: '确认删除吗？',
      content: '你是否删除此条信息！',
      success: function (res) {
        if (res.confirm) { //判断用户是否点击了确定
          var data = {
            id: e.target.id,
            receiver: that.data.receiverInfo.userId,
            sender: that.data.senderInfo.userId,
          }
          var postRequest = wxRequest.postRequest(api.delMessage(), data, that.data.loginToken);
          postRequest.then(res => {
            console.log(res.data)
          })
        }
      }
    })
  },
  sendMessage: function () {
    //信息的发送
    var that = this;
    if (that.data.messageInfo == null || that.data.messageInfo == ''){
      return false;
    }
    var data = {
      message: that.data.messageInfo,
      receiver: that.data.receiverInfo.userId,
      sender: that.data.senderInfo.userId,
    }
    const { chatInfoList } = this.data;
    chatInfoList.push(data);
    console.log(chatInfoList)
    var postRequest = wxRequest.postRequest(api.sendMessage(), data, that.data.loginToken);
    postRequest.then(res => {
      console.log('-----对话信息发送-------')
      that.setData({
        messageInfo:'',
        chatInfoList: chatInfoList,
        top_value: chatInfoList.length * 100,
      });      
      console.log(res);
    })
  }, 
  toggleEmojis: function () {
    const { showEmojis} = this.data;
    console.log(showEmojis)
    if (showEmojis){
      this.setData({
        showEmojis: false,
      });
    }else{
      this.setData({
        showEmojis: true,
      });
    }
  }, 
  onShow: function () {
  },
  onUnload: function () {
    this.setData({
      closeTime: true,
    });
  },
  onShareAppMessage: function (res){
    // return {
    //   title:''
    // }
  }
})
