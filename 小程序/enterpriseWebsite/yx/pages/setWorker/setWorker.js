const app = getApp()
const yx = require('../../utils/utils.js')
Page({
  data: {
    simpCmpyName:'',
    logoUrl:'',
    industry:''
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '员工管理' })
    let company = app.globalData.company
    this.setData({ simpCmpyName: company.simpCmpyName, logoUrl: company.logoUrl, industry: company.industry})
  },
  //我的员工
  listWorker:function(){
    wx.navigateTo({ url: '../listWorker/listWorker' })
  },
  //邀请员工
  invite:function(){
    wx.navigateTo({ url: '/wh/pages/Invitation/Invitation?cmpyId=' + app.globalData.company.id + '&from=setWorker' })
  }
})