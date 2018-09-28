
// lyl/pages/person/person.js
var utils = require('../../utils/util.js');
var that, columnId, cmpyId;
Page({
  data: {
    videoSrc: "",      //视频地址
    imgUrl: '',   //照片地址
    text: '',   //内容
  },
  onLoad: function (options) {
    that = this
    columnId = options.columnId    //栏目id
    cmpyId = options.cmpyId   //企业id
    that.deatil();    //详情获取
  },
  //详情获取
  deatil: function () {
    wx.showLoading({ title: '加载中...', })
    let url = '/weiwebsite/mobile/moduleMedia/selectModuleMediaDetailsTextImg.action'
    let data = { columnId: columnId, cmpyId: cmpyId }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        wx.hideLoading();
        //编辑
        var videoSrc=''
        if (data.data.ModuleTextImgList[1]){
          videoSrc = data.data.ModuleTextImgList[1].content
        }
        var text = data.data.ModuleTextImgList[0].content
        that.setData({
          videoSrc: videoSrc,      //视频地址
          imgUrl: data.data.moduleMediaEntity.img,   //照片地址
          text: text,
        })
      }
    })
  },
  /**
   * 分享
   */
  onShareAppMessage: function () {
    return {
      title: '领军人物',
      path: 'lyl/pages/personDetail/personDetail?columnId=' + columnId + '&cmpyId=' + cmpyId,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})