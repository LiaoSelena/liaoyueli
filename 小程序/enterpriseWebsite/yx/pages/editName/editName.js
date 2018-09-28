const app = getApp()
const yx = require('../../utils/utils.js')
const validate = require('../../utils/validate.js')
Page({
  data: {
    flags:{'choose':true},
    licence:'http://q.img.soukong.cn/website/yx/editName_add.jpg'
  },
  myData:{
    userId:'',
    cmpyId:''
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '实名认证编辑' })
    this.myData.userId = app.globalData.info.userId
    this.myData.cmpyId = app.globalData.company.id
  },
  //选择营业执照
  choose:function(){
    wx.chooseImage({
      count:1,
      success: res=> {
        this.setData({ licence: res.tempFilePaths[0],'flags.choose':false})
      }
    })
  },
  //取消
  cancel:function(){
    this.setData({ licence: 'http://q.img.soukong.cn/website/yx/editName_add.jpg', 'flags.choose': true })
  },
  //完成
  submit:function(e){
    let value = e.detail.value
    let myData = this.myData
    //验证联系人
    if (value.name==''){
      yx.modal({'tip':'请输入联系人姓名'})
      return
    }
    //验证联系电话
    if (!validate.phone(value.phone)) {
      yx.modal({ 'tip': '请输入有效的联系电话' })
      return
    }
    //验证营业执照
    if(this.data.flags.choose){
      yx.modal({ 'tip': '请上传营业执照' })
      return
    }
    yx.showLoading()
    yx.upImg(this.data.licence,logo=>{
      yx.ajax2('/weiwebsite/mobile/CmpyAuthentication/addCmpyAuthentication.action', 'POST', {
        'userId': myData.userId, 'cmpyId': myData.cmpyId, 'linkman': value.name, 'phone': value.phone, 'businessLicenceImgUrl': logo
      },res=>{
        wx.hideLoading()
        yx.status(res,res=>{
          yx.modal({'tip':'提交成功'},res=>{
            wx.navigateBack()
          })
        })
      })
    })
  }
})