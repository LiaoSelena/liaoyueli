// lyl/pages/personInfoEdit/personInfoEdit.js
var utils = require('../../utils/util.js');
var that, options, columnId, cmpyId, recruitId;
Page({
  data: {
    describeData:[],
    text:"",
    textLength:0,
  },
  onLoad: function (option) {
    that=this;
    options = option
    columnId = options.columnId
    cmpyId = options.cmpyId
    recruitId = options.recruitId
    that.describe(); //招聘描述
  },
  //招聘描述
  describe: function () {
    let url = '/weiwebsite/mobile/modulerecruit/ListModuleRecruit.action'
    let data = { columnId: columnId, cmpyId: cmpyId }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        //编辑
        that.setData({
          describeData: data.data,
          text: data.data.desc,
          textLength: data.data.desc.length,
        })
      } else if (data.status == "110"){
        //添加
        that.setData({
          tip: '请输入简介(限42字）',
        })
      }
    })
  },
  //获取文本
  getText:function(e){
    var text = e.detail.value;
    that.setData({
      textLength: text.length,
      text: text
    })
  },
  //保存
  saveFun:function(){
    var text=that.data.text;
    if (text==""){
      utils.tipFun("","请输入保存的文字！",false,function(){})
    }else{
      let url,data;
      if (that.data.describeData==""){
        //添加
        url = '/weiwebsite/mobile/modulerecruit/addModuleRecruit.action'
        data = { columnId: columnId, cmpyId: cmpyId, desc: text }
      }else{
        //修改
        url = '/weiwebsite/mobile/modulerecruit/updateModuleRecruit.action'
        data = { recruitId: that.data.describeData.recruitId,  desc: text }
      }
      utils.request(url, data, '1', '1', function (data) {
        if (data.status == "100") {
          wx.showToast({title: '保存成功',})
          wx.navigateBack({ url: '../joinUs/joinUs' })
        } else {
          utils.tipFun("", data.msg, false, function () { })
        }
      })
    }
  }
})