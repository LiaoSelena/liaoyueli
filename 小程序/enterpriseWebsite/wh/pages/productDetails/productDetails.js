const wh = require("../../utils/utils.js")
const cmpyExpired = require('../../../utils/cmpyExpired.js')
const app = getApp()
Page({
  data: {
    flags: { 'overTime': false, 'mask': false, 'fromManage': false, 'fromOther': false },
    list: [],
    haveFlag: 1,
    phone:''
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '产品详情' })
    this.setData({ phone: options.phone})
    wx.showLoading({
      title: '加载中',
    })
    let productId = options.id
    wh.ajax("/weiwebsite/mobile/moduleproduct/info.action", "GET", {
      'productId': productId
    }, res => {
      if (res.status=='100'){
        wx.hideLoading()
        this.setData({ list: res.data })
      }else{
        wx.hideLoading()
        this.setData({ haveFlag: 2})
      }
      
    })
    //分享企业过期
    cmpyExpired.cmpyExpired(options.cmpyId, flag => {
      if (flag) {
        console.info('过期了')
        //过期了判断是否为管理员
        cmpyExpired.selectUserIdentity(options.cmpyId, isAdmin => {
          if (isAdmin) {
            this.setData({ 'flags.fromOther': false, 'flags.fromManage': true, 'flags.overTime': true, 'flags.mask': true })
          } else {
            this.setData({ 'flags.fromOther': true, 'flags.fromManage': false, 'flags.overTime': true, 'flags.mask': true })
          }
        })
      }
    })
  },
  onShow: function () {

  },
  onShareAppMessage:function(){
    return {
      title: this.data.list.moduleProduct.productName,
      success: function (res) {
        wx.showToast({
          title: '转发成功',
          icon:'none'
        })
      },
      fail: function (res) {
        
      }
    }
  },
  goPhone:function(){
    let phone=this.data.phone
    wx.makePhoneCall({
      phoneNumber: '' + phone+'',
    })
    // wx.showActionSheet({
    //   itemList: ['拨打电话:'+phone+''],
    //   itemColor:'#000',
    //   success:function(){
        
    //   }
    // })
  },
  //企业过期
  tep_overTime2: function () {
    this.setData({ 'flags.overTime': false })
  },
  overTime1: function (e) {
    let dataset = e.currentTarget.dataset
    switch (dataset.flag) {
      case 'call':
        //拨打热线
        wx.makePhoneCall({ phoneNumber: app.globalData.servicePhone })
        break
      case 'close':
        //关闭
        this.setData({ 'flags.overTime': false })
        break
    }
  }
})
