// lyl/pages/contactUs/contactUs.js
var utils = require('../../utils/util.js');
var that, options, cmpyId, columnId, mapId;
Page({
  data: {
    content:'',
    address:'',
    style:''
  },
  onLoad: function (option) {
    that=this;
    options = option;
    cmpyId = options.cmpyId
    columnId = options.columnId
    if (options.mapId && options.mapId !='undefined'){
      mapId = options.mapId  //地图id
      that.detail();
    }
  },
  getText: function (e) {
    that.setData({
      content: e.detail.value 
    })
  },
  //查询信息
  detail:function(){
    let url = '/weiwebsite/mobile/modulemap/info.action'
    let data = { mapId: mapId }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == '100') {
        that.setData({
          content: data.data.content,
          address: data.data.address,
          style:'edit'
        })
      } else {
        utils.tipFun("", '保存失败，请稍后再试！', false, function () { })
      }
    })
  },
  //选择位置
  chooseAddress: function () {
    wx.chooseLocation({
      success: res => {
        if (res.address && res.name) {
          that.setData({ address: res.address })
        } else {
          utils.tipFun('', '抱歉，未能获取地址，请重新选择！', false, function () { })
        }
      }, fail: function (res) {
        wx.openSetting({
          success: (res) => {
          }
        })
      }
    })
  },
  //保存
  save:function(){
    let address = that.data.address
    let content = that.data.content
    if (content == "" || address == ""){
      utils.tipFun("", '请输入完整的信息哦！', false, function () { })
    }else{
      let url, data
      if (that.data.style =='edit'){
        url = '/weiwebsite/mobile/modulemap/edit.action'
        data = { mapId: mapId, columnId: columnId, address: address, content: content, showQrcode: '1' }
      }else{
        url = '/weiwebsite/mobile/modulemap/save.action'
        data = { cmpyId: cmpyId, columnId: columnId, address: address, content: content, showQrcode: '1' }
      }
      utils.request(url, data, '1', '1', function (data) {
        if (data.status == '100') {
          wx.showToast({ title: '保存成功', })
          if (options.from = 'manage') {
            wx.navigateBack()
          }
        } else {
          utils.tipFun("", '保存失败，请稍后再试！', false, function () { })
        }
      })
    }
    
  },
})