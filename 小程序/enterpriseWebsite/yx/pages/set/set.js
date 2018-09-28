const app = getApp()
const yx = require('../../utils/utils.js')
Page({
  data: {
    img:'',
    name:'',
    time:'',
    num:0
  },
  myData:{
    'cmpyId':'',
    'userId':'',
    'flagBind':true
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '官网设置' })
    this.myData.cmpyId = app.globalData.company.id
    this.myData.userId = app.globalData.info.userId
    //获取查看绑定数量
    yx.ajax('/weiwebsite/mobile/cmpyinfo/getNewBindCount', 'GET', { 'cmpyId': this.myData.cmpyId }, res => {
      yx.status2('获取查看绑定数量', res, res => {
        this.setData({ num: res.data.count })
      })
    })
  },
  onShow: function () {
    //获取企业LOGO、简称和到期日期
    let img = app.globalData.company.logoUrl
    let name = app.globalData.company.simpCmpyName
    let time = app.globalData.company.overTime
    this.setData({ img: img, name: name, time: time})
  },
  //企业设置
  setCompany:function(){
    wx.navigateTo({ url: '../setCompany/setCompany' })
  },
  //栏目设置
  setColumn: function () {
    wx.navigateTo({ url: '../setColumn/setColumn' })
  },
  //查看绑定
  setBind:function(){
    if (this.myData.flagBind){
      this.myData.flagBind = false
      //清空最新绑定数量
      yx.ajax('/weiwebsite/mobile/cmpyinfo/zeroNewBindCount', 'GET', { 'cmpyId': this.myData.cmpyId }, res => {
        yx.status2('清空最新绑定数量', res, res => { })
      })
    }
    this.setData({ num: 0 })
    wx.navigateTo({ url: '../listBind/listBind' })
  },
  //员工管理
  setWorker: function () {
    wx.navigateTo({ url: '../setWorker/setWorker' })
  },
  //官网小程序码设置
  setCode:function(){
    wx.navigateTo({ url: '/wh/pages/codeQr/codeQr?cmpyId=' + this.myData.cmpyId + '&from=set' })
  },
  //实名认证
  setName:function(){
    wx.navigateTo({ url: '../setName/setName' })
  },
  //我的官网
  mineWeb:function(){
    wx.navigateTo({ url: '/lyl/pages/officialNetwork/officialNetwork?userId=' + this.myData.userId + '&from=set' })
  },
  //管理店铺
  bindShop:function(){
    wx.navigateTo({ url: '../bindShop/bindShop' })
  }
})