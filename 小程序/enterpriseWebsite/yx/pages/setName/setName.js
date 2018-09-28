const app = getApp()
const yx = require('../../utils/utils.js')
Page({
  data: {
    flags:{'inShow':false},
    status:'',
    name:'',
    phone:'',
    img:'',
    type:'',
    color:'',
    examineMsg:''
  },
  myData:{
    'cmpyId':''
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '实名认证' })
    this.myData.cmpyId = app.globalData.company.id
  },
  onShow: function () {
    yx.showLoading()
    yx.ajax('/weiwebsite/mobile/CmpyAuthentication/getCompanyAuthExamine.action', 'GET', { 'cmpyId': this.myData.cmpyId},res=>{
      wx.hideLoading()
      yx.status(res,res=>{
        let status = res.data.status
        let type = ''
        let color = ''
        switch (status){
          case 1:
            type = '审核中'
            color = '#ffa800'
            break
          case 2:
            type = '审核通过'
            color = '#5cb8f7'
            break
          case 0:
            type = '审核失败'
            color = '#ff0036'
            this.setData({ examineMsg: res.data.examineMsg})
            break
        }
        if(status != 3){
          this.setData({ status: status, type: type, color: color, name: res.data.linkMan, phone: res.data.phone, img: res.data.authImgUrl })
        }else{
          this.setData({ status: status, type: type, color: color })
        }
      })
      this.setData({ 'flags.inShow': true })
    })
  },
  edit:function(){
    wx.navigateTo({ url: '../editName/editName' })
  },
  pre:function(e){
    wx.previewImage({
      urls: [e.currentTarget.dataset.img]
    })
  }
})