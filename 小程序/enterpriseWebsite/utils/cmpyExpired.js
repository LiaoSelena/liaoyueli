const yx = require('utils.js')
const app = getApp()

//判断是否过期
function cmpyExpired(cmpyId,callBack) {
  yx.ajax('/weiwebsite/mobile/microWebsite/cmpyExpired.action', 'GET', { 'cmpyId': cmpyId }, res => {
    yx.status2('判断是否过期', res, res => {
      //储存过期日期
      app.globalData.company.overTime = res.data.endTime
      //储存客服电话
      app.globalData.servicePhone = res.data.phone
      let flag = false
      if (res.data.isExpired == 1){
        flag = true
      }else{
        flag = false
      }
      if (callBack) callBack(flag)
    })
  })
}

//判断是否为管理员
function selectUserIdentity(cmpyId, callBack){
  //微信登录获取userId
  wx.login({
    success: res => {
      wx.request({
        url: app.globalData.domainName + '/weiwebsite/mobile/wechatApp/getOpenIdByCode.action',
        method: 'GET',
        data: { 'code': res.code, 'appId': app.globalData.appId },
        success: res => {
          if (res.data.status == '100') {
            wx.request({
              url: app.globalData.domainName + '/weiwebsite/mobile/userinfo/registerUserSimpleWechat',
              method: 'GET',
              data: { 'openId': res.data.data.openId, 'appId': app.globalData.appId },
              success: res => {
                if (res.data.status == '100') {
                  wx.request({
                    url: app.globalData.domainName + '/weiwebsite/mobile/staffManagement/selectUserIdentity.action',
                    method: 'GET',
                    data: { 'cmpyId': cmpyId, 'userId': res.data.data.userId },
                    success: res => {
                      if (res.data.status == '100') {
                        let flag = false
                        if (res.data.data.isAdmin == '1') {
                          //是管理员
                          flag = true
                        }
                        if (callBack) callBack(flag)
                      } else {
                        console.info('---判断是否为管理员接口报错:' + res.data.msg + '---')
                      }
                    }
                  })
                } else {
                  wx.showModal({
                    title: '提示',
                    content: res.data.msg,
                    showCancel: false
                  })
                }
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: false
            })
          }
        }
      })
    }
  })
}

module.exports = {
  cmpyExpired: cmpyExpired,
  selectUserIdentity: selectUserIdentity
}