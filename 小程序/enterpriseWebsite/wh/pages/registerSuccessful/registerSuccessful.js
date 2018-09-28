Page({
  data: {
    cmpyName:''
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '注册成功' })
    this.setData({ cmpyName: options.cmpyName})
  },
  onShow: function () {

  },
  showCode:function(){
    wx.previewImage({
      urls: ['http://q.img.soukong.cn/website/wh/taiyangma.png'],
    })
  }
})
