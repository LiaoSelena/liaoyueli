// lyl/pages/contactUsDeail/contactUsDeail.js
var utils = require('../../utils/util.js');
var that, options, cmpyId, columnId, mapId;
const app = getApp();
Page({
  data: {
     detailData:[],
     cpyName: app.globalData.company.simpCmpyName
  },
  onLoad: function (option) {
    that = this;
    options = option;
    mapId = options.mapId  //地图id
    wx.showLoading({ title: '加载中...', })
    console.log(options)
    that.detail();
  },
  //查询信息
  detail: function () {
    let url = '/weiwebsite/mobile/modulemap/info.action'
    let data = { mapId: mapId }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == '100') {
        wx.hideLoading();
        that.setData({
          detailData: data.data,
        })
        that.mapCtx = wx.createMapContext('myMap')
        that.mapCtx.includePoints({
          padding: [10],
          points: [{
            latitude: data.data.latitude,
            longitude: data.data.longitude,
          }, {
              latitude: data.data.latitude,
              longitude: data.data.longitude,
          }]
        })
      } else {
        utils.tipFun("", '保存失败，请稍后再试！', false, function () { })
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
          name: detailData.address, //打开后显示的地址名称
          address: detailData.address, //打开后显示的地址汉字
          scale: 28
        })
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: that.data.detailData.cmpyName + '联系我们',
      path: 'lyl/pages/contactUsDeail/contactUsDeail?mapId=' + mapId,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})