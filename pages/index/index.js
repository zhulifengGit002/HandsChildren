//index.js
//获取应用实例
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const wxRequest = require('../../utils/wxRequest.js');
const app = getApp();
const { emojis, emojiToPath, textToEmoji } = require('../../utils/emojis');
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // 中心点纬度、经度
    latitude: "",
    longitude: "",
    // 标记点 当前位置
    markers: [],
    choseAddress:{},
    msgData: "",
    brrageMsg: [],
    loginToken:"",
    unread:null,
    personalId:null,
    inputValue:null,
    inputInfo: '', // cover-view 显示的 input 的输入内容
    inputFocus: false, // input 框的focus状态
    searchText: '', // input 框的输入内容
    emojiList: [],
    showEmojis: false,
    display:'none',
    showJzq:false,
    showBrrage: true,
    mapHeight: '90%',
    totalCount:0,
    activeCount:0,
    noticeMsg:'',
    userIdArr:[],
    noticeShow:true,
    childSummary:'',
    business:[],
    businessInfo:{},
    navigationShow:false,
    evaluate: ['/images/heart-null.png', '/images/heart-null.png', '/images/heart-null.png', '/images/heart-null.png', '/images/heart-null.png'],
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  bindMineTap: function () {
    this.setData({
      showBrrage: false,
      mapHeight: '100%',
    });
    wx.navigateTo({
      url: '../mine/mine'
    })
  },
  bindMessageTap: function () {
    this.setData({
      showBrrage: false,
      mapHeight: '100%',
    });
    wx.navigateTo({
      url: '../messageList/messageList'
    })
  },
  onLoad: function () {
    //用户信息获取
    var that = this;
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      setTimeout(function(){
        that.setData({
          display: 'block',
        })
      },1000)
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        console.log(res)
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        that.setData({
          display: 'none',
        })
        that.onLoad()
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          that.onLoad()
        }
      })
    }
    if (!app.globalData.userInfo){
      return;
    }
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res.code)
        var query = {
          code: res.code, 
        }
        var getPostsRequest = wxRequest.getRequest(api.userLogin(query));
        getPostsRequest.then(res => {
          console.log('-----登陆信息提交-------')
          that.setData({
            loginToken: res.data.token,
            unread: res.data.unread,
            personalId: res.data.userId,
          })
        }).then(res => {
          // 获取表情包
          const emojiList = Object.keys(emojis).map(key => ({
            key: key,
            img: emojiToPath(key)
          }))
          that.setData({
            emojiList: emojiList
          })
          console.log('-----获取当前位置提交-------')
          //获取当前位置提交
          wx.getLocation({
            type: 'gcj02',
            success(res) {
              console.log(res)
              var iconPath='';
              if (that.data.userInfo.gender == 1){
                iconPath = '/images/man.png'
              }
              if (that.data.userInfo.gender == 2) {
                iconPath = '/images/woman.png'
              }
              that.setData({
                latitude: res.latitude,
                longitude: res.longitude,
                markers: [{
                  iconPath: iconPath,
                  id: 0,
                  latitude: res.latitude,
                  longitude: res.longitude,
                  width: 20,
                  height: 20,
                }],
              })
              //位置信息提交
              console.log(that.data.userInfo)
              var data = {
                longitude: res.longitude,
                latitude: res.latitude,
                nickName: that.data.userInfo.nickName,
                avatarUrl: that.data.userInfo.avatarUrl,
                gender: that.data.userInfo.gender
              }
              var postRequest = wxRequest.postRequest(api.locationDate(), data,that.data.loginToken);
              postRequest.then(res => {
                console.log('-----登陆位置提交-------')
                console.log(res);
              })
              var postNoticeRequest = wxRequest.postRequest(api.noticeMsg(), '', that.data.loginToken);
              postNoticeRequest.then(res => {
                console.log('-----公告获取-------')
                console.log(res);
                that.setData({
                  noticeMsg: res.data.data
                })
              })
              var postchildSummaryRequest = wxRequest.getRequest(api.childSummaryMsg(), '', that.data.loginToken);
              postchildSummaryRequest.then(res => {
                console.log('-----学生人数-------')
                console.log(res.data.result);
                that.setData({
                  childSummary: res.data.result
                })
              })
              //获取附近的消息
              that.barrageDome();      
            },
            fail: function () {
              wx.showModal({
                title: '定位失败',
                content: '未获取到你的地理位置，暂时无法为你提供服务。请检查是否已关闭定位权限，或尝试重新打开小程序',
                showCancel: false,
                confirmColor: '#007aff',
                success: function () {
                  that.onLoad()
                }
              })  
            }
          })
          })
      }
    })
  },
  /**
   * 弹幕函数
  */
  barrageDome(){
    var that = this;
    wx.login({
      success: res => {
        console.log(res.code)
        var query = {
          code: res.code,
        }
        var getPostsRequest = wxRequest.getRequest(api.userLogin(query));
        getPostsRequest.then(res => {
          console.log('-----登陆信息提交-------')
          that.setData({
            loginToken: res.data.token,
          })
        }).then(res => {
          var time = util.formatTime(new Date());
          // var brrageHeight = '';
          // var query = wx.createSelectorQuery();
          // query.select('.brrageWarp').boundingClientRect()
          // query.exec(function (res) {
          //   //取高度
          //   brrageHeight = res[0].height - 16;
          // })
          var queryMsgCode = {
            distance: '5000',
            longitude: that.data.longitude,
            latitude: that.data.latitude,
            beginDate: time
          }
          console.log(queryMsgCode)
          var postRequest = wxRequest.postRequest(api.queryMsg(), queryMsgCode, that.data.loginToken);
          postRequest.then(res => {
            console.log('-------弹幕消息获取-----')
            console.log(res.data)
            if (res.data.data == '' || res.data.data == null) {
              wx.showToast({
                title: '数据为空',
                icon: 'succes',
                duration: 1000,
                mask: true
              })
              that.setData({
                showBrrage: false,
                mapHeight: '100%',
              });
              return;
            }
            //坐标点循环
            var activeCount = that.data.activeCount;
            console.log(activeCount)
            if (that.data.activeCount != res.data.data.activeCount){
              var markerArr = [];
              var userIdArr = [];
              var business = [];
              markerArr.push(that.data.markers[0]);
              for (var i = 0; i < res.data.data.locationList.length; i++) {
                var iconPath = '';
                if (res.data.data.locationList[i].gender == 1) {
                  iconPath = '/images/man.png'
                }
                if (res.data.data.locationList[i].gender == 2) {
                  iconPath = '/images/woman.png'
                }
                markerArr.push({
                  iconPath: iconPath,
                  id: i + 1,
                  latitude: res.data.data.locationList[i].latitude,
                  longitude: res.data.data.locationList[i].longitude,
                  width: 20,
                  height: 20,
                })
                userIdArr.push({
                  userId: res.data.data.locationList[i].userId,
                  userImg: res.data.data.locationList[i].avatarUrl,
                  latitude: res.data.data.locationList[i].latitude,
                  longitude: res.data.data.locationList[i].longitude,
                  nickName: res.data.data.locationList[i].nickName
                })
              }
              //商家数据循环
              var dataArr = [];
              var idNum = res.data.data.locationList.length + 1;
              console.log(idNum)
              for (var i = 0; i < res.data.data.storeList.length; i++) {
                business.push({
                  id: i + idNum,
                  latitude: res.data.data.storeList[i].latitude,
                  longitude: res.data.data.storeList[i].longitude,
                  content: res.data.data.storeList[i].name,
                  phone: res.data.data.storeList[i].phone,
                  scope: res.data.data.storeList[i].scope,
                  address: res.data.data.storeList[i].address,
                  businessId: res.data.data.storeList[i].id,
                })
                markerArr.push({
                  iconPath: '/images/coordinate-' + res.data.data.storeList[i].level +'.png',
                  id: i + idNum,
                  latitude: res.data.data.storeList[i].latitude,
                  longitude: res.data.data.storeList[i].longitude,
                  width: 40,
                  height: 20,
                  Zindex:99,
                  label: {
                    content: res.data.data.storeList[i].name,
                    color: "#333",
                    fontSize: 10,
                    borderRadius: 2,
                    bgColor: "#fff",
                    padding: 2,
                    boxShadow: "2px 2px 10px #aaa"
                  }
                })
              }
              console.log(markerArr)
              that.setData({
                msgData: res.data.data.messageList,
                brrageMsg: [],
                markers: markerArr,
                totalCount: res.data.data.totalCount,
                activeCount: res.data.data.activeCount,
                userIdArr: userIdArr,
                business: business
              })
            }
            var cont = 0;
            var barrageTop = 16;
            //console.log(brrageHeight)
            var barrageDome = setInterval(function () {
              const { showBrrage } = that.data;
              if (!showBrrage) {
                clearInterval(barrageDome)
                that.setData({
                  brrageMsg: []
                })
                return;
              }
              if (cont < that.data.msgData.length) {
                var newData = {
                  message: textToEmoji(that.data.msgData[cont].message),
                  nickName: that.data.msgData[cont].nickName
                }
                newData.time = 5;
                //barrageTop = barrageTop + 12;
                if (barrageTop == 16) {
                  barrageTop = 30;
                  newData.top = barrageTop;
                } else {
                  barrageTop = 16;
                  newData.top = barrageTop;
                }
                var arr = that.data.brrageMsg;
                arr.push(newData);
                that.setData({
                  brrageMsg: arr,
                })
                cont = cont + 1;
              } else {
                clearInterval(barrageDome)
                setTimeout(function () { 
                  that.barrageDome();
                }, 4000);
              }
            }, 4000);
          })
        })
      },
      fail: function (res) {
        console.log(res)
        that.onLoad()
        // wx.showModal({
        //   title: '',
        //   content: '未获取到你的地理位置，暂时无法为你提供服务。请检查是否已关闭定位权限，或尝试重新打开小程序',
        //   showCancel: false,
        //   confirmColor: '#007aff',
        //   success: function () {
        //     that.onLoad()
        //   }
        // })
      }
    })
  },
  markerTap(e){
    console.log(e)
    console.log(e.markerId)
    if (e.markerId == 0){
      return false;
    }
    var that = this;
    const { userIdArr } = that.data;
    const { loginToken } = that.data;
    const { business } = that.data;
    var evaluate = ['/images/heart-null.png', '/images/heart-null.png', '/images/heart-null.png', '/images/heart-null.png', '/images/heart-null.png'];
    for (var i = 0; i < business.length;i++){
      if (business[i].id == e.markerId){
        that.setData({
          businessInfo: business[i],
          navigationShow:true,
          evaluate: evaluate,
          noticeShow:false,
        });
        return;
      }
    }
    that.setData({
      navigationShow: false,
      evaluate: evaluate,
    });
    if (userIdArr.length > 0){
      const userId = userIdArr[e.markerId-1].userId;
      const userImg = userIdArr[e.markerId - 1].userImg;
      const latitude = userIdArr[e.markerId - 1].latitude;
      const longitude = userIdArr[e.markerId - 1].longitude; 
      const userName = userIdArr[e.markerId - 1].nickName; 
      app.globalData.userId = userId;
      app.globalData.loginToken = loginToken;
      app.globalData.userImg = userImg;
      app.globalData.userName = userName;
      app.globalData.latitude = latitude;
      app.globalData.longitude = longitude;
      that.setData({
        showBrrage: false,
        mapHeight: '100%',
      });
      wx.navigateTo({
        url: '../userInfo/userInfo'
      })
    }
  },
  bindpoitap(){
    console.log(222)
  },
  startNavigation(){
    var that = this;
    const { businessInfo } = that.data;
    wx.openLocation({//​使用微信内置地图查看位置。
      latitude: businessInfo.latitude,//要去的纬度-地址
      longitude: businessInfo.longitude,//要去的经度-地址
      name: businessInfo.content,
      address: businessInfo.content
    })
    that.setData({
      navigationShow: false,
    });
  },
  bindNavShow() {
    this.setData({
      navigationShow: false,
    });
  },
  /**
   * 将焦点给到 input
  */
  tapInput() {
    this.setData({
      inputFocus: true
    });
  },
  blurInput(val) {
    this.setData({
      inputInfo: val.detail.value || '',
      navigationShow: false,
    });
  },
  // 点击表情
  clickEmoji: function (e) {
    const { key } = e.currentTarget.dataset;
    const { inputInfo } = this.data;
    this.setData({ inputInfo: inputInfo + key });
  },
  saveMsg: function(e){
    //数据提交
    var that =this;
    //位置信息提交
    console.log(that.data.inputInfo)
    if (that.data.inputInfo == '' || that.data.inputInfo== null){
      return false;
    }
    var data = {
      message: that.data.inputInfo,
      longitude: that.data.longitude,
      latitude: that.data.latitude,
    }
    var postRequest = wxRequest.postRequest(api.locationMsg(), data, that.data.loginToken);
    postRequest.then(res => {
      console.log('-----弹幕信息提交-------')
      console.log(res.data)
      if (res.data.code ==700){
        wx.showModal({
          title: '定位失败',
          content: res.data.msg,
          showCancel: false,
          confirmColor: '#007aff',
          success: function () {
            this.setData({
              inputInfo: ''
            })
          }
        }) 
      }else{
        var newData = {
          message: textToEmoji(that.data.inputInfo),
          nickName: that.data.userInfo.nickName
        }
        newData.time = 5;
        newData.top = 2;
        var arr = that.data.brrageMsg;
        arr.push(newData);
        console.log(newData)
        that.setData({
          brrageMsg: arr,
        })
        this.setData({
          inputInfo: ''
        })
      }
    })
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    this.onLoad()
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
  toggleAddjzq: function(){
    const { showJzq } = this.data;
    if (showJzq) {
      this.setData({
        showJzq: false,
      });
    } else {
      this.setData({
        showJzq: true,
      });
    }
  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接 
      urls: this.data.imgalist, // 需要预览的图片http链接列表 
    })
  },
  toggleBrrage: function () {
    const { showBrrage } = this.data;
    if (showBrrage) {
      this.setData({
        showBrrage: false,
        mapHeight: '100%',
      });
    } else {
      this.setData({
        showBrrage: true,
        mapHeight: '90%',
      });
      this.barrageDome();
    }
  },
  bindNoticeTap : function () {
    const { noticeShow } = this.data;
    this.setData({
      noticeShow: false,
    });
  },
  evaluate :function (e) {
    var that = this;
    const { evaluate } = that.data;
    const { businessInfo } = that.data;
    const { personalId } = that.data;
    var index = e.target.id.substr(8, 1)*1 + 1;
    var number = 0;
    // if (evaluate[index] == '/images/heart.png'){
    //   evaluate[index] = '/images/heart-null.png';
    // }else{
    //   evaluate[index] = '/images/heart.png';
    // }
    for (var i = 0; i < index;i++){
      evaluate[i] = '/images/heart.png';
    }
    that.setData({
      evaluate: evaluate,
    });
    // for (var i = 0; i < evaluate.length;i++){
    //   if (evaluate[i] == '/images/heart.png'){
    //     number = number+1;
    //   }
    // }
    var data = {
      userId: personalId,
      storeId: businessInfo.id,
      score: index,
      commet:'',
    }
    var postRequest = wxRequest.postRequest(api.addEvalute(), data, that.data.loginToken);
    postRequest.then(res => {
      console.log('-----评价提交-------')
      console.log(res);
    })
  },
  onShow: function () {
    const { showBrrage } = this.data;
    if (showBrrage == false){
      this.setData({
        showBrrage: true,
        mapHeight: '90%',
      });
      this.barrageDome();
    }
  },
  returnMap: function () {
    console.log(1111)
    wx.navigateTo({
      url: '../index/index'
    })
  },
  onShareAppMessage: function (res){
    // return {
    //   title:''
    // }
  }
})
