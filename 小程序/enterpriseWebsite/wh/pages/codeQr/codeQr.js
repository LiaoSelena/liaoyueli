const cs = wx.getSystemInfoSync();
const radio = cs.screenWidth / 750;//rpx和px的转换比
const wh = require("../../utils/utils.js")
const app=getApp()
Page({
  data: {
    appQrCode:'',
    onshowflag:'none'
  },
  onLoad: function (options) {
    let that=this
    wx.showLoading()
    wh.ajax("/weiwebsite/mobile/appletsQrCode/generateQRCode.action","GET",{
      'appId': app.globalData.appId,
      'cmpyId': options.cmpyId
    },res=>{
      if (res.status=='100'){
        wx.hideLoading()
        this.setData({ appQrCode: res.data.appQrCode, })
        wx.setNavigationBarTitle({ title: '小程序码' })
        const context = wx.createCanvasContext('QRcode')
        context.setFillStyle('#ffffff')
        context.fillRect(0, 0, 600 * radio, 600 * radio)
        wx.downloadFile({
          url: (this.data.appQrCode).replace('http', 'https'),
          success: res => {
            context.drawImage(res.tempFilePath, 106 * radio, 115 * radio, 389 * radio, 370 * radio)
            context.draw()
            that.setData({ onshowflag: 'block' })
          }
        })
      }     
    })
   
   
    
  },
  onShow: function () {

  },
  //转发
  onShareAppMessage: function () {
    return {
      title: '小程序码',
      success: function (res) {
        wx.showToast({
          title: '分享成功',
          icon: 'none'
        })
      },
      fail: function (res) {

      }
    }
  },
  //预览保存
  screenshot:function(){ 
    wx.canvasToTempFilePath({
      width: 600,
      height: 600,
      destWidth: 600,
      destHeight: 600,
      canvasId: 'QRcode',
      quality: 1,
      fileType: 'png',
      success: function (res) {
        let url = res.tempFilePath
        wx.getSetting({
          success: (res) => {
            wx.previewImage({
              urls: [url],
              success(res) {
              }
            })
          }
        })
      }
    })
  }
})
