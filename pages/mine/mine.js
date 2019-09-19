//index.js
//获取应用实例
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const wxRequest = require('../../utils/wxRequest.js');
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    loginToken: "",
    userData: {},
    userId: "",
    infoShow: true,
    peopleSet: false,
    childrenSet: false,
    changeChild : false,
    changeChildIndex: -1,
    setInfo: {},
    parentInfo:{
      phone:'',
      hobby:'',
      address: ''
    },
    childInfo:{
      birthday: "",
      gender: "",
      name: "",
      parentId: null,
      hobby: '',
      school: "",
      agency:'',
      place:'',
    },
    date: '请选择日期',
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  bindsetUpTab: function () {
    wx.navigateTo({
      url: '../setUp/setUp'
    })
  },
  bindPeople: function(e) {
    this.setData({
      infoShow: false,
      peopleSet: true,
    })
  },
  bindChild: function (e) {
    this.setData({
      infoShow: false,
      childrenSet: true,
    })
  },
  blurInput(val) {
    console.log(val.detail.value)
    var that =this;
    const { parentInfo } = this.data;
    const { childInfo } = this.data;
    if (val.target.id == 'phone'){
      parentInfo.phone = val.detail.value;
    }
    if (val.target.id == 'address') {
      parentInfo.address = val.detail.value;
    }
    if (val.target.id == 'hobby') {
      parentInfo.hobby = val.detail.value;
    }
    if (val.target.id == 'name') {
      childInfo.name = val.detail.value;
    }
    if (val.target.id == 'gender') {
      childInfo.gender = val.detail.value;
    }
    if (val.target.id == 'birthday') {
      childInfo.birthday = val.detail.value;
    }
    if (val.target.id == 'childHobby') {
      childInfo.hobby = val.detail.value;
    }
    if (val.target.id == 'school') {
      childInfo.school = val.detail.value;
    }
    if (val.target.id == 'agency') {
      childInfo.agency = val.detail.value;
    }
    if (val.target.id == 'place') {
      childInfo.place = val.detail.value;
    }
    that.setData({
      parentInfo: parentInfo,
      childInfo: childInfo,
    })
  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    const { childInfo } = this.data;
    childInfo.birthday = e.detail.value;
    this.setData({
      date: e.detail.value,
      childInfo: childInfo,
    })
  },
  closeInfo: function (){
    var that = this;
    that.setData({
      infoShow: true,
      peopleSet: false,
      childrenSet: false,
      changeChild: false,
    })
  },
  setPeopleInfo: function () {
    var that = this;
    const { setInfo } = that.data;
    const { userId } = that.data;
    const { userInfo } = that.data;
    const { parentInfo } = that.data;
    if (setInfo.parent == null){
      setInfo.parent = {};
    }
    setInfo.parent.userId = userId;
    setInfo.parent.nickname = userInfo.nickName;
    setInfo.parent.phone = parentInfo.phone;
    setInfo.parent.address = parentInfo.address;
    setInfo.parent.hobby = parentInfo.hobby;
    console.log(setInfo)
    that.setData({
      setInfo: setInfo,
    })
    //创建个人信息
    var getPostsRequest = wxRequest.postRequest(api.setupPersonInfo(), setInfo, that.data.loginToken);
    getPostsRequest.then(res => {
      console.log('-----创建个人信息-------')
      console.log(res)
      if (res.data.code == 0){
        that.setData({
          infoShow: true,
          peopleSet: false,
        })
      }
    }).then(res => {
      //查询个人信息
      var queryPersonInfo = wxRequest.getRequest(api.queryPersonInfo(), '', that.data.loginToken);
      queryPersonInfo.then(res => {
        that.setData({
          setInfo: res.data.data,
          parentInfo: res.data.data.parent || {},
        })
        console.log(that.data)
      })
    })
  },
  setChildInfo: function () {
    var that = this;
    const { setInfo } = that.data;
    const { userId } = that.data;
    const { userInfo } = that.data;
    const { childInfo } = that.data;
    console.log(setInfo)
    setInfo.parent.userId = userId;
    setInfo.parent.nickname = userInfo.nickName;
    if (setInfo.children == null || setInfo.children == ''){
      setInfo.children = [];
    }
    console.log(childInfo)
    setInfo.children.push(childInfo);
    that.setData({
      setInfo: setInfo,
      childInfo: {},
    })
    wx.showLoading({
      title: '加载中',
    })
    //创建个人信息
    var getPostsRequest = wxRequest.postRequest(api.setupPersonInfo(), setInfo, that.data.loginToken);
    getPostsRequest.then(res => {
      console.log('-----创建个人信息-------')
    }).then(res => {
      //查询个人信息
      var queryPersonInfo = wxRequest.getRequest(api.queryPersonInfo(), '', that.data.loginToken);
      queryPersonInfo.then(res => {
        that.setData({
          setInfo: res.data.data,
          parentInfo: res.data.data.parent || {},
          infoShow: true,
          childrenSet: false,
        })
        wx.hideLoading()
        console.log(that.data)
      })
    })
  },
  bindChangeChild: function (e){
    console.log(e)
    var index = e.currentTarget.id *1;
    console.log(index)
    var that = this;
    const { setInfo } = that.data;
    var childInfo = setInfo.children[index];
    console.log(childInfo)
    that.setData({
      childInfo: childInfo,
      infoShow: false,
      changeChild: true,
      changeChildIndex: index,
      date: setInfo.children[index].birthday||'请选择日期',
    })
  },
  bindDeletChild: function (e) {
    var index = e.currentTarget.id * 1;
    console.log(index)
    var that = this;
    const { setInfo } = that.data;
    var data = {
      userId: setInfo.parent.userId,
      childId: setInfo.children[index].id
    }
    //删除个人子女信息
    wx.showModal({
      title: '删除子女信息',
      content: '你确定要删除子女信息吗？',
      showCancel: true,//是否显示取消按钮
      cancelText: "否",//默认是“取消”
      cancelColor: '007aff',//取消文字的颜色
      confirmText: "是",//默认是“确定”
      confirmColor: '007aff',//确定文字的颜色
      success: function (res) {
        if (res.confirm) {
          var getPostsRequest = wxRequest.postRequest(api.delChildInfo(data), '', that.data.loginToken);
          getPostsRequest.then(res => {
            that.setData({
              setInfo: setInfo,
            })
          }).then(res => {
            //查询个人信息
            var queryPersonInfo = wxRequest.getRequest(api.queryPersonInfo(), '', that.data.loginToken);
            queryPersonInfo.then(res => {
              that.setData({
                setInfo: res.data.data,
                parentInfo: res.data.data.parent || {},
              })
              console.log(that.data)
            })
          })
        }
      }
    }) 
  },
  setChangeChildInfo: function () {
    var that = this;
    const { setInfo } = that.data;
    const { userId } = that.data;
    const { userInfo } = that.data;
    const { childInfo } = that.data;
    const { changeChildIndex } = that.data;
    console.log(setInfo)
    setInfo.parent.userId = userId;
    setInfo.parent.nickname = userInfo.nickName;
    setInfo.children[changeChildIndex] = childInfo;
    that.setData({
      setInfo: setInfo,
      childInfo: {},
    })
    //创建个人信息
    var getPostsRequest = wxRequest.postRequest(api.setupPersonInfo(), setInfo, that.data.loginToken);
    getPostsRequest.then(res => {
      console.log('-----创建个人信息-------')
      that.setData({
        infoShow: true,
        childrenSet: false,
        changeChild:false
      })
    }).then(res => {
      //查询个人信息
      var queryPersonInfo = wxRequest.getRequest(api.queryPersonInfo(), '', that.data.loginToken);
      queryPersonInfo.then(res => {
        that.setData({
          setInfo: res.data.data,
          parentInfo: res.data.data.parent || {},
        })
        console.log(that.data)
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
            that.setData({
              setInfo: res.data.data,
              parentInfo: res.data.data.parent||{},
            })
            console.log(that.data)
          })
        })
      }
    })
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
