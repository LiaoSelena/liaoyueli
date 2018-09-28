const wh = require('../../utils/utils.js')
const app = getApp()
const wxLogin = require("../../utils/wxLogin.js")
const cmpyExpired = require('../../../utils/cmpyExpired.js')
Page({
  data: {
    flags: { 'overTime': false, 'mask': false, 'fromManage': false, 'fromOther': false },
    moduleMediaEntity: { title: '', createTime:''},
    template:[],
    haveFlag:1,
    name:''
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '资讯详情' })
    if(options.state=='2'){
      wx.setNavigationBarTitle({ title: '预览' })
    }
    wh.ajax("/weiwebsite/mobile/cmpyinfo/getCompanyInfo", "GET", { cmpyId: options.cmpyId }, res => {
      this.setData({ name: res.data.cmpyInfo.cmpyName })
    })
    wh.ajax2("/weiwebsite/mobile/moduleMedia/selectModuleMediaDetails.action", "GET", {
      'cmpyId': options.cmpyId,
      'state': options.state,
      'columnId': options.columnId,
      'mediaId': options.id
    }, res => {
      if (res.status=='100'){
        console.info(res)
        var length = res.data.ModuleTextImgList.length
        let ModuleTextImgList = res.data.ModuleTextImgList
        for (var i = 0; i < length; i++) {
          if (ModuleTextImgList[i].contentType == 2) {
            let imgs = (ModuleTextImgList[i].content).split(",")
            ModuleTextImgList[i].imgs = imgs
          }
        }
        this.setData({
          'moduleMediaEntity.title': res.data.moduleMediaEntity.title, 'moduleMediaEntity.createTime': res.data.moduleMediaEntity.createTime,
          template: res.data.ModuleTextImgList
        })
      }else{
        this.setData({ haveFlag:2})
      }   
    })
    //分享企业过期
    cmpyExpired.cmpyExpired(options.cmpyId, flag => {
      if (flag) {
        console.info('过期了')
        //过期了判断是否为管理员
        cmpyExpired.selectUserIdentity(options.cmpyId,isAdmin=>{
          if (isAdmin){
            this.setData({ 'flags.fromOther': false, 'flags.fromManage': true, 'flags.overTime': true, 'flags.mask': true })
          }else{
            this.setData({ 'flags.fromOther': true, 'flags.fromManage': false, 'flags.overTime': true, 'flags.mask': true })
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
      title: this.data.moduleMediaEntity.title,
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
