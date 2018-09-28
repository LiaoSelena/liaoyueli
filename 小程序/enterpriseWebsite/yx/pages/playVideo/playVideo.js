const yx = require('../../utils/utils.js')
Page({
  data: {
    src:''
  },
  onLoad: function (options) {
    this.ctx = wx.createVideoContext('video')
    wx.setNavigationBarTitle({ title: '播放视频' })
    let src = wx.getStorageSync('yxVideoSrc')
    this.setData({src:src})
    wx.getNetworkType({
      success: res=>{
        console.info(res.networkType)
        if (res.networkType == 'wifi'){
          this.ctx.play()
        }else{
          wx.showModal({
            title: '提示',
            content: '您现在处于移动网络，是否要播放视频？',
            showCancel:true,
            success:res=>{
              if(res.confirm){
                this.ctx.play()
              }
            }
          })
        }
      }
    })
    wx.removeStorageSync('yxVideoSrc')
  },
  back:function(){
    wx.navigateBack()
  }
})