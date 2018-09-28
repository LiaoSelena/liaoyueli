const yx = require('../../utils/utils.js')
Page({
  data: {
    longitude:'',
    latitude:'',
    markers:[]
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '查看地图' })
    let obj = wx.getStorageSync('yxPlayMap')
    this.setData({ longitude: obj.longitude, latitude: obj.latitude, markers: obj.markers})
    wx.removeStorageSync('yxPlayMap')
  },
  back: function () {
    wx.navigateBack()
  }
})