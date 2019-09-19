const apiURL = 'https://handschildren.com';


const wxRequest = (params, url) => {
  wx.request({
    url,
    method: params.method || 'GET',
    data: params.data || {},
    header: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    success(res) {
      if (params.success) {
        params.success(res);
      }
    },
    fail(res) {
      if (params.fail) {
        params.fail(res);
      }
    },
    complete(res) {
      if (params.complete) {
        params.complete(res);
      }
    },
  });
};

/**
 * 位置上报，消息上报
 */
const locationDate = (params) => {
  var url = `${apiURL}/location/api/v1/location`;
  return url
};

/**
 * 位置上报，消息上报
 */
const locationMsg = (params) => {
  var url = `${apiURL}/location/api/v1/message`;
  return url
};

/**
 * 学生人数
 */
const childSummaryMsg = (params) => {
  var url = `${apiURL}/location/api/v1/childSummary`;
  return url
};

/**
 *  微信小程序用户接口，包括登录、鉴权和获取手机号码
 */
const userLogin = (params) => {
  var url = `${apiURL}/api/v1/wechat/user/login?code=${params.code}`;
  return url
};
/**
 *   微信小程序查询
 */
const queryMsg = (params) => {
  var url = `${apiURL}/location/api/v1/neighbourMessage`;
  return url
};
/**
 *   微信小程序公告
 */
const noticeMsg = (params) => {
  var url = `${apiURL}/location/api/v1/report`;
  return url
};
/**
 *   查询个人信息
 */
const queryPersonInfo = (params) => {
  var url = `${apiURL}/location/api/v1/member`;
  return url
};
/**
 *   创建个人信息
 */
const setupPersonInfo = (params) => {
  var url = `${apiURL}/location/api/v1/member`;
  return url
};
/**
 *   查询个人信息个人信息
 */
const queryNeighbourInfo = (params) => {
  var url = `${apiURL}/location/api/v1/neighbourInfo?userId=${params.userId}`;
  return url
};
/**
 *   删除子女信息
 */
const delChildInfo = (params) => {
  var url = `${apiURL}/location/api/v1/child?userId=${params.userId}&childId=${params.childId}`;
  return url
};
/**
 *   隐私设置
 */
const setUpHide = (params) => {
  var url = `${apiURL}/location/api/v1/config`;
  return url
};
/**
 *   点对点发送消息会话接口
 */
const sendMessage = (params) => {
  var url = `${apiURL}/location/api/v1/chat`;
  return url
};
/**
 *   获取点对点消息会话接口
 */
const getMessage = (params) => {
  var url = `${apiURL}/location/api/v1/queryConversation`;
  return url
};
/**
 *   删除点对点消息会话接口
 */
const delMessage = (params) => {
  var url = `${apiURL}/location/api/v1/deleteChat`;
  return url
};
/**
 *   删除点对点消息会话接口
 */
const addEvalute = (params) => {
  var url = `${apiURL}/location/api/v1/addEvalute`;
  return url
};
module.exports = {
  locationDate,
  locationMsg,
  userLogin,
  queryMsg,
  noticeMsg,
  queryPersonInfo,
  setupPersonInfo,
  queryNeighbourInfo,
  delChildInfo,
  childSummaryMsg,
  setUpHide,
  sendMessage,
  getMessage,
  delMessage,
  addEvalute
};
