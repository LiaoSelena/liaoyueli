const app = getApp()
function send(phone, callBack){
  wx.showLoading({ title: '发送中' })
  wx.request({
    url: app.globalData.domainName + '/weiwebsite/mobile/staffManagement/sendSMS.action',
    method: 'GET',
    data: { 'phone': phone},
    success: res => {
      wx.hideLoading()
      if (res.data.status=='100'){
        wx.showToast({ title: '验证码已发送' })
        if (callBack) callBack()
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
module.exports = {
  send: send
}