// lyl/joinUs/joinUs.js
var utils = require('../../utils/util.js');
var that, options,columnId, cmpyId, recruitId='';
const app = getApp()
const cmpyExpired = require('../../../utils/cmpyExpired.js')
Page({
  data: {
    flags: { 'overTime': false, 'mask': false, 'fromManage': false, 'fromOther': false },
    box:false,
    describeData:[], //描述
    jobListData: [],  //招聘岗位
    HRData:[],  //人事信息
    deleteIndex:'',  //删除岗位的序号
    page:1,
    rows:10,
    style:'',
  },
  onLoad: function (options) {
    that=this;
    columnId = options.columnId
    cmpyId = options.cmpyId
    console.log(options)
    if (options.style){  //详情页
      wx.showLoading({ title: '加载中...', })
      that.setData({
        style: options.style
      })
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
    that.describe(); //招聘描述
  },
  //招聘描述
  describe:function(){
    let url = '/weiwebsite/mobile/modulerecruit/ListModuleRecruit.action'
    let data = { columnId: columnId, cmpyId: cmpyId }
    utils.request(url, data, '1', '1', function (data) {
      wx.hideLoading();
      if (data.status == "100") {
        recruitId = data.data.recruitId //招聘企业ID
        that.setData({
          describeData: data.data,
          recruitId: data.data.recruitId,
          box:true,
        })
      }else{
        that.setData({
          box: true,
        })
      }
      that.jobList(); //招聘岗位
    })
  },
  //招聘岗位
  jobList: function () {
    let url = '/weiwebsite/mobile/modulerecruitjob/listModuleRecruitjob.action'
    let data = { columnId: columnId, cmpyId: cmpyId, recruitId: recruitId, page: that.data.page, rows: that.data.rows}
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        var jobListData = data.data
        for (var i = 0; i < jobListData.length;i++){
          jobListData[i].checked=false
          jobListData[i].workAddress = jobListData[i].workAddress.substring(3,5)
        }
        that.setData({
          jobListData: jobListData,
        })
      }
      that.HRInfo(); //获取HR信息
    })
  },
  //单选
  radioChange:function(e){
    let index = e.detail.value;
    let jobListData = that.data.jobListData;
    for (var i = 0; i < jobListData.length; i++) {
      if (i == index){
        jobListData[i].checked = true
      }else{
        jobListData[i].checked = false
      }
    }
    that.setData({
      jobListData: jobListData,
      deleteIndex: index
    })
  },
  //删除岗位
  deletePost:function(){
    let jobListData = that.data.jobListData;
    let deleteIndex = that.data.deleteIndex
    let url = '/weiwebsite/mobile/modulerecruitjob/delModuleRecruitjob.action'
    let data = { id: jobListData[deleteIndex].id }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        wx.showToast({title: '删除成功',})
        jobListData.splice(deleteIndex,1);
        that.setData({
          jobListData: jobListData,
        })
      }
    })
  },
  //获取HR信息
  HRInfo:function(){
    let url = '/weiwebsite/mobile/modulerecruithr/listModuleRecruitHr.action'
    let data = { columnId: columnId, cmpyId: cmpyId, recruitId: recruitId, }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        that.setData({
          HRData: data.data,
        })
      }
    })
  },
  //预览Hr微信二维码
  lookCode:function(){
    wx.previewImage({
      current: that.data.HRData.weixinQrcod, // 当前显示图片的http链接
      urls: [that.data.HRData.weixinQrcod] // 需要预览的图片http链接列表
    })
  },
  //编辑
  goEdit: function () {
    let data = 'columnId=' + columnId + '&cmpyId=' + cmpyId + '&recruitId=' + recruitId
    wx.navigateTo({
      url: '../personInfoEdit/personInfoEdit?' + data,
    })
  },
  //添加 编辑 职位
  addPost:function(e){
    if (recruitId==''){
      utils.tipFun('','请先编辑加入我们描述！',true,function(){
        let data = 'columnId=' + columnId + '&cmpyId=' + cmpyId + '&recruitId=' + recruitId
        wx.navigateTo({
          url: '../personInfoEdit/personInfoEdit?' + data,
        })
      })
    }else{
      let style = e.currentTarget.dataset.style
      let id = e.currentTarget.dataset.id
      let data = 'columnId=' + columnId + '&cmpyId=' + cmpyId + '&recruitId=' + recruitId + '&style=' + style + '&id=' + id
      wx.navigateTo({
        url: '../addPost/addPost?' + data,
      })
    }
    
  },
  //HR信息编辑
  HRinfoEdit:function(){
    let data = 'recruitId=' + recruitId + '&columnId=' + columnId + '&cmpyId=' + cmpyId
    wx.navigateTo({
      url: '../HRinfoEdit/HRinfoEdit?' + data,
    })
    
  },
  //预览
  postDetailView:function(e){
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../postDetailView/postDetailView?style=' + that.data.style + '&id=' + id+ '&cmpyId=' + cmpyId + '&recruitId=' + recruitId
   })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '加入我们',
      path: 'lyl/pages/joinUs/joinUs?columnId=' + columnId + '&cmpyId=' + cmpyId + '&recruitId=' + recruitId + '&style=detail',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
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