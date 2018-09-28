// lyl/pages/partner/partner.js
var utils = require('../../utils/util.js');
var that, columnId, cmpyId, options, flag = true;
const app = getApp()
const cmpyExpired = require('../../../utils/cmpyExpired.js')
Page({
  data: {
    flags: { 'overTime': false, 'mask': false, 'fromManage': false, 'fromOther': false },
    mainData:[],  //列表数据
    style:'',
    page:1,
    rows:18
  },
  onLoad: function (option) {
    that=this;
    options = option;
    columnId = options.columnId;
    cmpyId = options.cmpyId
    wx.showLoading({title: '加载中...', })
    if (options.style){  //详情页面
      that.setData({ style: options.style})
    }
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
    that.setData({
      mainData: [],  //列表数据
      page: 1,
    })
    that.mainFun();
  },
  mainFun:function(){
    flag=false;
    let url ='/weiwebsite/mobile/modulepartner/list.action'
    let data = { columnId: columnId, cmpyId: cmpyId, page: that.data.page,rows:that.data.rows }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status=='100'){
        if (data.data!=''){
          that.setData({
            mainData: that.data.mainData.concat(data.data)
          })
          flag = true
        }
      }
      wx.hideLoading();
    })
  },
  //编辑
  edit:function(e){
    var style = e.currentTarget.dataset.style
    let data = 'style=' + style + '&columnId=' + columnId + "&cmpyId=" + cmpyId
    if (style=='edit'){
      var partnerId = e.currentTarget.dataset.partnerid
      data = data+'&partnerId=' + partnerId
    }
    wx.navigateTo({
      url: '../partnerEdit/partnerEdit?' + data,
    })
  },
  //删除
  deleteFun:function(e){
    var partnerId=e.currentTarget.dataset.partnerid
    var index = e.currentTarget.dataset.index
    let url = '/weiwebsite/mobile/modulepartner/delete.action'
    let data = { partnerId: partnerId }
    console.log(index);
    utils.tipFun("", '确定删除？', true, function () {
      utils.request(url, data, '1', '1', function (data) {
        if (data.status == '100') {
          var mainData = that.data.mainData;
          mainData.splice(index, 1)
          that.setData({
            mainData: mainData
          })
          wx.showToast({ title: '删除成功', })
        } else {
          utils.tipFun("", '删除失败，请稍后再试！', false, function () { })
        }
      })
    })
   
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(flag){
      that.setData({
        page: that.data.page+1,
      })
      that.mainFun();
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
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