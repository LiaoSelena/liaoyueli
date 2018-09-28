// lyl/pages/officialNetwork/officialNetwork.js
var utils = require('../../utils/util.js');
var that, options,flag=true;
var userId;
Page({
  data: {
    box:false,
    noData:false,
  },
  onLoad: function (options) {
    that = this;
    
    wx.showLoading({title: '加载中...',})
    if (options.mainUserId){
      //从代理商协同平台进来
      that.getUserId(options.mainUserId);
    }else{
      userId = options.userId
      that.cmpyList();
    }
  },
  //获取userId
  getUserId: function (id) {
    let url = '/weiwebsite/mobile/userinfo/registerUserByMianUserId'
    let data = { mainUserId: id }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        userId=data.data.userId;
        that.cmpyList();
      } else {
        utils.tipFun("", data.msg, false, function () { })
      }
    })
  },
  //官网列表
  cmpyList:function(){
    let url = '/weiwebsite/mobile/microWebsite/selectCmpyBindList.action'
    let data = { userId: userId }
    utils.request(url, data, '1', '1', function (data) {
      wx.hideLoading();
      if (data.status == "100" && data.data!="") {
        that.setData({
          cmpyData: data.data,
          box:true,
        })
      }else{
        that.setData({ noData:true})
        utils.tipFun("", data.msg, false, function () { })
      }
    })
  },
  lookFun:function(e){
    var cmpyId = e.currentTarget.dataset.cmpyid
    var type_ = e.currentTarget.dataset.type
    if (type_=='1'){
      //预览官网
      wx.navigateTo({
        url: '../../../wh/pages/previewHome/previewHome?cmpyId=' + cmpyId,
      })
    } else if (type_ == '2'){
      //编辑官网
      wx.navigateTo({
        url: '../../../yx/pages/manage/manage?from=share&cmpyId=' + cmpyId,
      })
    }
  },
  //解绑
  untie:function(e){
    var type_ = e.currentTarget.dataset.type   //1：绑定关系，2：创建人
    var cmpyId = e.currentTarget.dataset.cmpyid  //企业id
    var id = e.currentTarget.dataset.id  //列表里面的用户id
    let url, data;
    if (type_=='1'){
      url = '/weiwebsite/mobile/microWebsite/unbinding.action'
      data = { userId: id, cmpyId: cmpyId, administratorId: userId }
    } else if (type_ == '2'){
      url = '/weiwebsite/mobile/microWebsite/unbinding.action'
      data = { cmpyId: cmpyId, userId: userId }
    }
    utils.tipFun("", "确定解除绑定？", true, function () { 
      wx.showLoading({title: '解绑中...',})
      if (flag){
        flag=false;
        utils.request(url, data, '1', '1', function (data) {
          flag = true;
          wx.hideLoading();
          if (data.status == "100") {
            wx.showToast({ title: '解除绑定成功', })
            that.cmpyList();
          } else {
            utils.tipFun("", data.msg, false, function () { })
          }
        })
      }
    })
  },
  //快速创建官网
  creatNetwork: function () {
    wx.navigateTo({
      url: '../../../yx/pages/create/create',
    })
  },
  //快速绑定官网
  bindNetwork:function(){
    wx.navigateTo({
      url: '../officialNetworkSearch/officialNetworkSearch',
    })
  },
  onReady: function () {
  
  },
  onShow: function () {
    
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  }
})