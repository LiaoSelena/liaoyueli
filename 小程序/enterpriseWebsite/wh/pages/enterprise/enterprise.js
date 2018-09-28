const wh = require('../../utils/utils.js')
const app = getApp()
Page({
  data: {
    list: [],
    top: { title:'',time:''}
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '招商合作' })
    wh.ajax("/weiwebsite/mobile/moduleMedia/selectModuleMediaDetailsTextImg.action", "GET", {
      'columnId': options.columnId, 'cmpyId': options.cmpyId
    }, res => {  
      if (res.status=='100'){
        //图片数组分割
        let ModuleTextImgList = res.data.ModuleTextImgList
        let length = ModuleTextImgList.length
        for (var i = 0; i < length; i++) {
          if (ModuleTextImgList[i].contentType == '2') {
            let imgs = (ModuleTextImgList[i].content).split(",")
            ModuleTextImgList[i].imgs = imgs
          }
        }
        let title = res.data.moduleMediaEntity.title
        let createTime = res.data.moduleMediaEntity.createTime
        this.setData({ list: res.data.ModuleTextImgList, 'top.title': title, 'top.createTime': createTime })
      }     
    })
  },
  onShow: function () {

  }
})
