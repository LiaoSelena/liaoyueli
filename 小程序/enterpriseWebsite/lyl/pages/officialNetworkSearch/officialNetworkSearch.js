// pages/officialNetworkSearch/officialNetworkSearch.js
const utils = require('../../utils/util.js');
const app = getApp();
var that, options, flag = true, registerFlag = true, id, tel, bindFlag=true;
var userId, openId;
Page({
  data: {
    searchVal:'',         //搜索值
    serchCloaseIs:false,  //搜索状态
    cmpyData:[],
    emptyIs:false,   //搜索不到内容
    box:false,
    page:1,
    rows:8,
    height:'',
    joninCmpy:[], //联名卡数据
  },
  onLoad: function (option) {
   that=this;
   options = option;
   id = options.id  //名片详情id
   tel = options.tel  //名片带过来的电话号码
   console.log(options)
   wx.login({
     success: function (res) {
       if (res.code) {
         //发起网络请求 
         let url = '/weiwebsite/mobile/wechatApp/getOpenIdByCode.action'
         let data = { code: res.code, appId: app.globalData.appId }
         utils.request(url, data, '1', '1', function (data) {
           if (data.status=='100'){
             openId = data.data.openId;
             that.getUserId(); //获取useId
           }
         })
       } else {
         console.log('登录失败！' + res.errMsg)
       }
     }
   })
   utils.iphone6Size([205], height => {
     that.setData({ height: height })
   })
  },
  onReady: function () {
  },
  //获取useId
  getUserId:function(){
    console.log(options.mainUserId)
    if (options.mainUserId){
      console.log(options.mainUserId)
      //代理商协同--个人名片官网--这里  通过mainUserId获取userId
      let url = '/weiwebsite/mobile/userinfo/registerUserByMianUserId'
      let data = { mainUserId: options.mainUserId }
      utils.request(url, data, '1', '1', function (data) {
        if (data.status == '100') {
          userId = data.data.userId;
          that.getJoninCmpyInfo();
          if (options.cmpyName && options.cmpyName != '') {
            that.setData({
              // searchVal: options.cmpyName,
              // serchCloaseIs: true,
            })
            // that.searchCmpy("first");
          }
        }
      })
    }else{
      let url = '/weiwebsite/mobile/userinfo/registerUserByPhoneAndOpenId.action'
      let data = { openId: openId, appId: app.globalData.appId, phone: tel }
      utils.request(url, data, '1', '1', function (data) {
        if (data.status == '100') {
          userId = data.data.userId;
          that.getJoninCmpyInfo();
          if (options.cmpyName && options.cmpyName != '') {
            that.setData({
              // searchVal: options.cmpyName,
              // serchCloaseIs: true,
            })
            // that.searchCmpy("first");
          }
        }
      })
    } 
  },
  //获取联名卡数据
  getJoninCmpyInfo:function(){
    let url = '/weiwebsite/mobile/microWebsite/getJoninCmpyInfo.action'
    let data = { userId: '13'}
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == '100') {
        that.setData({
          cmpyData: data.data,
          joninCmpy:data.data
        })
      }
    })
  },
  //搜索-获取搜索框值
  searchValFun:function(e){
    let searchInput = e.detail.value;
    if (searchInput!=''){
      that.setData({
        serchCloaseIs:true,
        searchVal: searchInput,
      })
    }
  },
  //搜索-点击搜索
  searchFun:function(){
    let searchVal = that.data.searchVal;
    that.setData({
      searchVal: searchVal,
      cmpyData: [],
      page: 1,
    })
    that.searchCmpy("first");
  },
  //搜索-取消搜索
  searchColseFun:function(){
    wx.hideLoading();
    that.setData({
      serchCloaseIs: false,
      searchVal: '',
      page: 1,
      cmpyData: [],
      emptyIs: false,   //搜索不到内容
    })
  },
  
  //搜索企业
  searchCmpy:function(ly){
    wx.showLoading({title: '搜索中...',})
    flag = false
    let url,data;
    if (options.mainUserId){
       url = '/weiwebsite/mobile/microWebsite/selectCmpyList'
       data = { cmpyNameLike: that.data.searchVal, userId: userId, page: that.data.page, pageSize: that.data.rows }
    }else{
       url = '/weiwebsite/mobile/microWebsite/selectCmpyList2.action'
       data = { cmpyNameLike: that.data.searchVal, userId: userId, page: that.data.page, pageSize: that.data.rows, cardDetailId: options.id }
    }
    
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        wx.hideLoading();
        var dataArr=data.data.rows
        if (ly == "first" && dataArr == ''){
          that.setData({ emptyIs: true,  })
        }
        if(dataArr!=''){
          flag = true
          let cmpyData = that.data.cmpyData.concat(dataArr)
          that.setData({
            cmpyData: cmpyData,
          })
        }
        if (dataArr.length < that.data.rows && that.data.page > 1) {
          console.log(that.data.joninCmpy)
          that.setData({
            cmpyData: that.data.cmpyData.concat(that.data.joninCmpy),
          })
        }
      }else{
        
      }
    })
  },
  //解绑
  untie:function(e){
      let index = e.currentTarget.dataset.index
      let cmpyId = e.currentTarget.dataset.cmpyid
      utils.tipFun("解除绑定企业", "确定解除已经绑定的企业吗？", true, function () {
        wx.showLoading({ title: '解绑中...', })
        if (bindFlag) {
           bindFlag = false
            let url = '/weiwebsite/mobile/microWebsite/unbinding.action'
            let data = { userId: userId, cmpyId: cmpyId }
            utils.request(url, data, '1', '1', function (data) {
              bindFlag = true;
              wx.hideLoading();
              if (data.status == "100") {
                wx.showToast({
                  title: '解绑成功',
                })
                var cmpyData = that.data.cmpyData;
                cmpyData[index]['bindStatus'] = '0';
                that.setData({
                  cmpyData: cmpyData
                })
              } else {
                utils.tipFun("", "解绑失败！请稍后再试！", false, function () { })
              }
            })
        }
      })
  },
  //绑定
  binding:function(e){
    wx.showLoading({ title: '绑定中...', })
    if(bindFlag){
      bindFlag=false
      let cmpyId = e.currentTarget.dataset.cmpyid
      let index = e.currentTarget.dataset.index
      let url = '/weiwebsite/mobile/cmpyinfo/bindCmpy'
      let data = { userId: userId, cmpyId: cmpyId, cardDetailId: id }
      utils.request(url, data, '1', '1', function (data) {
        bindFlag=true;
        wx.hideLoading();
        if (data.status == "100") {
          utils.tipFun("", "绑定成功！", false, function () {
            wx.navigateTo({
              url: '../officialNetwork/officialNetwork?userId=' + userId,
            })
          })
          var cmpyData = that.data.cmpyData;
          cmpyData[index]['bindStatus'] = '1';
          that.setData({
            cmpyData: cmpyData
          })
        } else {
          utils.tipFun("", "绑定失败！请稍后再试！", false, function () { })
        }
      })
    }
  },
  //下拉加载
  lower: function () {
    if (flag){
      console.log('ok')
      that.setData({
        page: that.data.page + 1
      })
      that.searchCmpy();
    }
    
  },
  //快速创建官网
  creatNetwork: function () {
    // url: '../../../yx/pages/create/create?id=' + id + '&phone=' + tel,
    wx.navigateTo({
      url: '../../../yx/pages/create/create',
    })
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
  // onPullDownRefresh: function () {
  
  // },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})