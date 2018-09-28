const app = getApp()
function login(phone,callback) {
  wx.login({
    success: res => {
      wx.request({
        url: app.globalData.domainName + '/weiwebsite/mobile/wechatApp/getOpenIdByCode.action',
        method:'GET',
        data: { 'code': res.code, 'appId': app.globalData.appId},
        success:res=>{
          if (res.data.status=='100'){
            let url = ''
            //存储openId
            app.globalData.info.openId = res.data.data.openId
            let data = { 'openId': res.data.data.openId, 'appId': app.globalData.appId}
            if (phone){
              //从名片跳转到此小程序，带有phone
              url = '/weiwebsite/mobile/userinfo/registerUserByPhoneAndOpenId'
              data.phone = phone
            }else{
              url = '/weiwebsite/mobile/userinfo/registerUserSimpleWechat'
            }
            wx.request({
              url: app.globalData.domainName + url,
              method: 'GET',
              data: data,
              success:res=>{
                if (res.data.status=='100'){
                  //返回用户id
                  app.globalData.info.userId = res.data.data.userId
                  if (callback) callback(res.data.data.userId)
                }else{
                  wx.showModal({
                    title: '提示',
                    content: res.data.msg,
                    showCancel: false
                  })
                }
              }
            })
          }else{
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel:false
            })
          }
        }
      })
    }
  })
}

module.exports = {
  login: login
}