const wh = require('../../utils/utils.js')
const app=getApp()
Page({
  data: {
    codeScr:'',
    cmpyId:'',
    name:''
  },
  onLoad: function (options) {
    wh.ajax("/weiwebsite/mobile/cmpyinfo/getCompanyInfo", "GET", { cmpyId: options.cmpyId }, res => {
      this.setData({ name: res.data.cmpyInfo.cmpyName })
    })
    this.setData({ cmpyId: options.cmpyId})
    wx.showLoading({
      title: '加载中',
    })
    wx.setNavigationBarTitle({ title: '邀请员工' })
    wh.ajax2("/weiwebsite/mobile/staffManagement/generateInvitationQRCode.action","POST",{
      'appId': app.globalData.appId, 'cmpyId': options.cmpyId
    },res=>{
      if (res.status=='100'){
        wx.hideLoading()
        this.setData({ codeScr: res.data.empQrCode })
      }
    })
  },
  onShow: function () {

  },
  onShareAppMessage:function(res){
    
  },
  showCode:function(){
    wx.previewImage({
      urls: [this.data.codeScr],
    })
    // wx.navigateTo({
    //   url: '../register/register?cmpyId=' + this.data.cmpyId+''
    // })
  }
})
