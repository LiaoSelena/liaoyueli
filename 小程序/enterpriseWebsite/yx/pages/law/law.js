Page({
  data: {
    list:[]
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '企业官网法律声明' })
    let list = [
      '您可以选择不使用官网小程序服务,但如果您使用官网小程序服务,您的使用行为将被视为对本声明全部内容的认可。',
      '官网小程序提供的服务属于自助建立小程序服务您可以选择不使用官网小程序服务, 但如果您使用官网小程序服务, 您的使用行为将被视为对本声明全部内容的认可。'
    ]
    this.setData({list:list})
  }
})
