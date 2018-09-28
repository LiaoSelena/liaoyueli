// lyl/pages/HRinfoEdit/HRinfoEdit.js
var utils = require('../../utils/util.js');
var that, options, columnId, cmpyId, recruitId;
var telReg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
Page({
  data: {
    HRName:'',  //姓名
    HRTel:'',    //电话
    finishIs: false, //是否填写必填项
    codeIs:false,      //判断是否上传微信二维码
    layerIs:false,    //微信二维码弹窗的展示
    codeImg:'',      //微信二维码图
    avatar:'http://q.img.soukong.cn/website/lyl/00HR_mrtx.png', //HR头像
    tipData:{},
    style:'',  //add 添加 edit 编辑
  },
  onLoad: function (option) {
    that=this;
    options = option
    columnId = options.columnId
    cmpyId = options.cmpyId
    recruitId = options.recruitId
    that.HRInfo();//获取编辑信息
  },
  onReady: function () {},
  //获取HR信息
  HRInfo: function () {
    let url = '/weiwebsite/mobile/modulerecruithr/listModuleRecruitHr.action'
    let data = { columnId: columnId, cmpyId: cmpyId, recruitId: recruitId, }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        that.setData({
          tipData: data.data,
          avatar: data.data.headImg,
          codeImg: data.data.weixinQrcod,
          codeIs:true,
          HRName: data.data.hrName,  //姓名
          HRTel: data.data.phone,    //电话
          finishIs:true,
          style:'edit'
        })
      } else if (data.status == "110"){
        let tipData = {
          hrName: '填写您的姓名',
          phone: '请输入联系电话号码'
        }
        that.setData({
          tipData: tipData,
          style: 'add'
        })
      }
    })
  },
  //上传头像
  changeAvatar:function(){
    utils.upImg(function (url) {
      that.setData({
        avatar: url,
      })
    })
  },
  //获取HR姓名
  HRNameGet:function(e){
    console.log(e.detail.value)
    that.setData({ HRName: e.detail.value})
    that.finishIs();
  },
  //获取HR电话
  HRTelGet: function (e) {
    console.log(e.detail.value)
    that.setData({ HRTel: e.detail.value })
    that.finishIs();
  },
  //是否完成必填项目
  finishIs:function(){
    if (that.data.HRName != '' && that.data.HRTel != '' && telReg.test(that.data.HRTel) ){
      that.setData({ finishIs: true })
    }else{
      that.setData({ finishIs: false })
    }
  },
  //上传微信二维码
  codeFun:function(){
    utils.upImg(function(url){
      that.setData({
        codeImg: url,
        codeIs: true,
      })
    })
  },
  //查看微信二维码
  lookCode:function(){
    that.setData({ layerIs: true })
  },
  //关闭弹窗
  colseLayer:function(){
    that.setData({ layerIs:false})
  },
  //点击’确定‘
  sureFun:function(){
    var HRName=that.data.HRName
    var HRTel=that.data.HRTel
    var codeImg = that.data.codeImg
    var avatar = that.data.avatar
    var tipData = that.data.tipData
    if (that.data.finishIs){
      let url;
      let data;
      if (that.data.style == 'add'){
        url = '/weiwebsite/mobile/modulerecruithr/addModuleRecruitHr.action'
        data = { columnId: columnId, cmpyId: cmpyId, hrName: HRName, phone: HRTel, headImg: avatar, weixinQrcod: codeImg, recruitId: recruitId }
      } else if (that.data.style == 'edit'){
        url = '/weiwebsite/mobile/modulerecruithr/updateModuleRecruitHr.action'
        data = { hrId: tipData.hrId, hrName: HRName, phone: HRTel, headImg: avatar, weixinQrcod: codeImg, recruitId: recruitId }
      }
      utils.request(url, data, '1', '1', function (data) {
        if (data.status == "100") {
          wx.showToast({title: '保存成功',})
          wx.navigateBack({ url: '../joinUs/joinUs',})
        }else{
          utils.tipFun("", data.msg, false, function () { })
        }
      })
    }else{
      utils.tipFun("","请填写完整的信息",false,function(){})
    }
  },
})