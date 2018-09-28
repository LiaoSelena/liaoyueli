// lyl/pages/postDetailView/postDetailView.js
var utils = require('../../utils/util.js');
var that, options;
const app = getApp()
const cmpyExpired = require('../../../utils/cmpyExpired.js')
Page({
  data: {
    flags: { 'overTime': false, 'mask': false, 'fromManage': false, 'fromOther': false },
    detailData:{},
    markers: [{
      iconPath: "http://q.img.soukong.cn/website/lyl/31_dh.png",
      latitude: '',
      longitude: '',
      content:'',
    }],
  },
  onLoad: function (option) {
    that=this;
    options = option;
    wx.showLoading({title: '加载中...',})
    console.log(options)
    that.mainFun();
    if (option.style =='edit'){
      wx.setNavigationBarTitle({ title: '预览招聘详情' })
    }else{
      wx.setNavigationBarTitle({ title: '招聘详情' })
    }
    that.setData({
      style: option.style
    })
    //分享企业过期
    cmpyExpired.cmpyExpired(options.cmpyId, flag => {
      if (flag) {
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
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
  },
  // 详情接口
  mainFun:function(){
    let url = '/weiwebsite/mobile/modulerecruitjob/selectModuleRecruitjobDetails.action'
    let data = { id: options.id }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        wx.hideLoading();
        var detailData=data.data;
        detailData["province"] = detailData.workAddress.substring(0,9);
        var markers = that.data.markers
        markers[0].latitude = detailData.latitude
        markers[0].longitude = detailData.longitude
        markers[0].content = detailData.workAddress
        that.setData({
          detailData: detailData,
          markers: markers,
        })
        // console.log(that.data.markers)
        // that.mapCtx = wx.createMapContext('myMap')
        // that.mapCtx.includePoints({
        //   padding: [10],
        //   points: [{
        //     latitude: detailData.latitude,
        //     longitude: detailData.longitude,
        //   }, {
        //       latitude: detailData.latitude,
        //       longitude: detailData.longitude,
        //   }]
        // })
        that.cmpyFun();//企业详情
      }
    })
  },
  //导航-点击地图
  navigation: function () {
    let detailData = that.data.detailData;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = detailData.latitude //坐标纬度（接口获取的会议位置）
        var longitude = detailData.longitude //坐标经度（接口获取的会议位置）
        wx.openLocation({
          latitude: Number(latitude),
          longitude: Number(longitude),
          name: detailData.workAddress, //打开后显示的地址名称
          address: detailData.workAddress, //打开后显示的地址汉字
          scale: 28
        })
      }
    })
  },
  // 获取电话号码
  cmpyFun: function () {
    let url = '/weiwebsite/mobile/modulerecruithr/selectCmpyHrOrCmpyPhone.action'
    let data = { cmpyId: options.cmpyId, recruitId: options.recruitId }  //cmpyId本地缓存取
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        console.log(data.data)
        that.setData({
          tel: data.data
        })
      }
    })
  },
  //拨打电话
  callingFun:function(){
    wx.makePhoneCall({
      phoneNumber: '' + that.data.tel + '' //仅为示例，并非真实的电话号码
    })
  },
  onReady: function () {
    
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    if (options.style != 'edit'){
      return {
        title: that.data.detailData.jobName + '招聘详情',
        path: 'lyl/pages/postDetailView/postDetailView?id=' + options.id + '&style=' + options.style + '&cmpyId=' + app.globalData.company.id,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
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