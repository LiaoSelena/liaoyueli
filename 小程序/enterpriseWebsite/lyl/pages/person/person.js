
// lyl/pages/person/person.js
var utils = require('../../utils/util.js');
var that, columnId, cmpyId, options;
Page({
  data: {
    videoSrc:"",      //视频地址
    imgUrl:'',   //照片地址
    textLength: 0,
    textOver: 500,
    textTotal: 500,
    tip:'',   //内容提示
    text:'',   //内容
    style:'',   //add 添加 edit修改
    mediaId: '', //主键id
  },
  onLoad: function (option) {
    that = this
    options = option
    columnId = options.columnId    //栏目id
    cmpyId = options.cmpyId   //企业id
    that.deatil();    //详情获取
  },
  //详情获取
  deatil: function () {
    wx.showLoading({title: '加载中...',})
    let url = '/weiwebsite/mobile/moduleMedia/selectModuleMediaDetailsTextImg.action'
    let data = { columnId: columnId, cmpyId: cmpyId }
    utils.request(url, data, '1', '1', function (data) {
      wx.hideLoading();
      if (data.status == "100") {
        //编辑
        var text = data.data.ModuleTextImgList[0].content
        var videoSrc=''
        if (data.data.ModuleTextImgList[1]){
          videoSrc = data.data.ModuleTextImgList[1].content
        }
        that.setData({
          videoSrc: videoSrc,      //视频地址
          imgUrl: data.data.moduleMediaEntity.img,   //照片地址
          text: text,
          textLength: text.length,
          textOver: 500 - text.length,
          style:'edit',
          mediaId: data.data.moduleMediaEntity.mediaId,//主键id
        })
      } else if (data.status == "110"){
        //添加
        that.setData({
          tip: '请输入简介（限500字）',
          style: 'add'
        })
      }
    })
  },
  //更换照片
  changePhoto:function(){
    utils.upImg(function (url) {
      that.setData({
        imgUrl: url,
      })
    })
  },
  //添加视频
  addVideo:function(){ 
    utils.upVideo(function(url){
      that.setData({
        videoSrc: url,
      })
    })
  },
  //删除视频
  deleteVideo:function(){
    wx.showToast({title: '删除视频成功',})
    that.setData({
      videoSrc: '',
    })
  },
  //获取文本的长度
  getText: function (e) {
    var text = e.detail.value;
    var textTotal = that.data.textTotal;
    that.setData({
      text: text,
      textLength: text.length,
      textOver: Number(textTotal - text.length)
    })
  },
  //编辑
  goEdit:function(){
    wx.navigateTo({
      url: '../personInfoEdit/personInfoEdit',
    })
  },
  //保存
  saveFun: function () {
    let text = that.data.text
    let imgUrl = that.data.imgUrl
    if (text != '' && imgUrl!=''){
      let url, data
      let contents = that.data.text + '@,@' + that.data.videoSrc
      let contentTypes = '1,3'
      if (that.data.style == 'add') {
        url = '/weiwebsite/mobile/moduleMedia/addModuleMedia.action'
        data = { columnId: columnId, cmpyId: cmpyId, title: "领军人物", img: that.data.imgUrl, contents: contents, contentTypes: contentTypes, type: '1', struts: '1' }
      } else if (that.data.style == 'edit') {
        url = '/weiwebsite/mobile/moduleMedia/updateModuleMedia.action'
        data = { mediaId: that.data.mediaId, title: "领军人物", img: that.data.imgUrl, contents: contents, contentTypes: contentTypes, type: '1', struts: '1' }
      }
      utils.request(url, data, '1', '1', function (data) {
        if (data.status == "100") {
          wx.showToast({ title: '保存成功', })
          if (options.from = 'manage'){
            wx.navigateBack()
          }
        } else if (data.status == "110") {
          utils.tipFun("", "保存失败！", false, function () { })
        }
      })
    }else{
      utils.tipFun("", "照片跟简介不能为空！", false, function () { })
    }
    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
})