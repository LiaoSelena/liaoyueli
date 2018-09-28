const cs = wx.getSystemInfoSync();
const radio = cs.screenWidth / 750;//rpx和px的转换比
const app =getApp()
const wh =require('../../utils/utils.js')
Page({
  data: {
    
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: "分享官网" })
    const context = wx.createCanvasContext('bigCanvas')
    wx.showLoading()
    wh.ajax("/weiwebsite/mobile/appletsQrCode/generateQRCode.action", "GET", {
      'appId': app.globalData.appId,
      'cmpyId': 11
    }, res => {
      if (res.status=='100'){
          let codeUrl = res.data.appQrCode
          codeUrl = codeUrl.replace('http', 'https');
          //画布750宽 960高
          context.fillRect(0, 0, 750 * radio, 960 * radio)
          //画出第一张背景
          wx.downloadFile({
            url: 'https://q.img.soukong.cn/website/wh/hb_pic.png',
            success: res => {
              context.drawImage(res.tempFilePath, 0 * radio, 0 * radio, 750 * radio, 960 * radio)
              //画出企业名字 和底部文字
              context.setFillStyle('Black')
              context.setFontSize(32 * radio)
              context.setTextAlign('center')
              context.fillText('搜空集团', 375 * radio, 310 * radio)
              context.setFillStyle('#999999')
              context.setFontSize(26 * radio)
              context.setTextAlign('center')
              context.fillText('长按识别小程序，进入企业官网', 375 * radio, 788 * radio)
              //画出第二张企业LOGO图
              wx.downloadFile({
                url: 'https://q.img.soukong.cn/website/wh/testcode.png',
                success: res => {
                  context.drawImage(res.tempFilePath, 311 * radio, 131 * radio, 129 * radio, 129 * radio)
                  wx.downloadFile({
                    url: codeUrl,
                    success: res => {
                      console.info(res.tempFilePath)
                      context.drawImage(res.tempFilePath, 194 * radio, 382 * radio, 358 * radio, 358 * radio)
                      context.draw()
                      wx.hideLoading()
                    }
                  })
                }
              })
            }
          })
      }
        
    })

    
  },
  onShow: function () {

  },
  preview:function(){
    wx.canvasToTempFilePath({
      canvasId: 'bigCanvas',
      width: 750,
      height: 960,
      destWidth: 750,
      destHeight: 960,
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
    }, this)
  },
  onShareAppMessage:function(res){
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
  }
})
