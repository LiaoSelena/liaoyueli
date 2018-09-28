// lyl/pages/team/team.js
var utils = require('../../utils/util.js');
var that, options, flag = true, columnId, cmpyId;
const app = getApp()
const cmpyExpired = require('../../../utils/cmpyExpired.js')
Page({
  data: {
    flags: { 'overTime': false, 'mask': false, 'fromManage': false, 'fromOther': false },
    emptyIs: false,   //搜索不到内容
    page: 1,
    rows: 6,
    height: 0,
    list: [],
    transition: ''
  },
  onLoad: function (option) {
    that=this;
    options = option;
    columnId = options.columnId
    cmpyId = options.cmpyId
    wx.showLoading({title: '加载中...',})
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
    that.listFun();
  },
  //列表
  listFun: function () {
    flag = false;
    let url = '/weiwebsite/mobile/moduleteam/TeamList.action'
    let data = { columnId: columnId, cmpyId: cmpyId, page: that.data.page, rows: that.data.rows }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        wx.hideLoading();
        let list = data.data
        if (list != '') {
          flag = true;
          that.setData({
            list: that.data.list.concat(list),
          })
        }else{
          flag = false;
        }
      } else {
        utils.tipFun("", data.msg, false, function () { })
      }
    })
  },
  onReady: function () {
  
  },
  
  onPullDownRefresh: function () {
  
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
     if(flag){
       that.setData({
         page:that.data.page+1,
       })
       that.listFun();
     }
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