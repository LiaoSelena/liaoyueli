const wh= require('../../utils/utils.js')
const validata=require('../../utils/validate.js')
const wxLogin=require("../../utils/wxLogin.js")
Page({
  data: { 
    cmpyName:'',
    logoUrl:'',
    userId:'',
    cmpyId:'',
    morenPhone:'',
    name:'',
    bindPhone: { Vcode: '', verifyCodeTime: '获取验证码', Flga: true, color: '#5CB8F7', border: '1px solid #5CB8F7', mobile:'',}
  },
  onLoad: function (options) {
    let scene = decodeURIComponent(options.scene)
    console.info('---scene=' + scene + '---')
    let cmpyId = ''
    if (scene != 'undefined' && typeof (scene) != 'undefined') {
      scene = scene.split(',')
      cmpyId = scene[0].split('=')[1]
    } else {
      cmpyId = options.cmpyId
    }
    console.info('---企业ID=' + cmpyId + '---')
    wh.ajax("/weiwebsite/mobile/cmpyinfo/getCompanyInfo", "GET", { cmpyId: cmpyId }, res => {
      this.setData({ name: res.data.cmpyInfo.cmpyName })
    })
    wx.setNavigationBarTitle({ title: '员工注册' })
    wxLogin.login('', userId=>{
      this.setData({ userId: userId})
      wh.ajax("/weiwebsite/mobile/userloginfo/getUserByPhone", "GET", { userId: this.data.userId },
        res => {
          if(res.status=='100'){
            console.info(res)
            this.setData({ morenPhone: res.data, 'bindPhone.mobile': res.data})
          }
        })
    })
    //用企业ID查企业LOGO
    wh.ajax("/weiwebsite/mobile/cmpyinfo/getCompanyInfo","GET",{
      cmpyId: cmpyId
    },res=>{
      if (res.status=='100'){
        this.setData({ logoUrl: res.data.cmpyInfo.logoUrl, cmpyName: res.data.cmpyInfo.cmpyName, cmpyId: cmpyId})
      }
    })
  },
  onShow: function () {
   
  },
  getMobi: function (e) {
    this.setData({
     'bindPhone.mobile': e.detail.value,
    })
  },
  getVcode:function(){
    this.setData({ 'bindPhone.Flga': validata.phone(this.data.bindPhone.mobile)})
    let flga = this.data.bindPhone.mobile
    if (flga) {
      if (this.data.bindPhone.Flga) {
        let phone = this.data.bindPhone.mobile
        wh.ajax("/weiwebsite/mobile/staffManagement/sendSMS.action", "GET", { 'phone': phone }, res => {
          wx.showToast({
            title: '验证码已发送',
            icon: 'none',
          })
        })
        this.setData({
          'bindPhone.Flga': false, 'bindPhone.color': '#BAC8D2', 'bindPhone.border': '1px solid #BAC8D2'
        })
        var that = this;
        var c = 60;
        var intervalId = setInterval(function () {
          c = c - 1;
          that.setData({ 'bindPhone.verifyCodeTime': c + 's后重发', })
          if (c == 0) {
            clearInterval(intervalId);
            that.setData({ 'bindPhone.verifyCodeTime': '获取验证码', 'bindPhone.Flga': true, 'bindPhone.border': '1px solid #5CB8F7', 'bindPhone.color': '#5CB8F7', })
          }
        }, 1000)
      }else{
        wx.showToast({
          title: '请输入正确的手机',
          icon: 'none',
        })
      }
    }else{wx.showToast({
      title: '请输入正确的手机',
      icon:'none',
    })}
   
  },
  submit:function(e){
    wh.ajax2("/weiwebsite/mobile/staffManagement/staffRegistration.action","POST",{
      'cmpyId': this.data.cmpyId, 'userId': this.data.userId, 'userName': e.detail.value.name, 'phone': e.detail.value.phone, 'code': e.detail.value.code
    },res=>{
      if (res.status=='100'){
        wx.reLaunch({
          url: '../registerSuccessful/registerSuccessful?cmpyName=' + this.data.cmpyName+'',
        })
      }else{
        wx.showToast({
          title: res.msg,
          icon:'none'
        })
      }       
    })
  },

})
