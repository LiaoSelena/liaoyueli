const app = getApp()
const yx = require('../../utils/utils.js')
const validate = require('../../utils/validate.js')
const splitAddress = require('../../utils/splitAddress.js')
Page({
  data: {
    flags: {'authStatus':false},
    name:'',
    company: '',
    trade: '',
    phone: '',
    address: '',
    src: '',
    door:'',
    industryList: []
  },
  myData: {
    'cmpyId': '',
    'location': { 'longitude': 0, 'latitude': 0 },
    'map': { 'pro': '', 'city': '', 'area': '' },
    'flagChooseImg':false
  },
  onLoad: function (options) {
    this.myData.cmpyId = app.globalData.company.id
    wx.getLocation()
    wx.setNavigationBarTitle({ title: '信息设置' })
    //企业详情
    yx.ajax('/weiwebsite/mobile/cmpyinfo/getCompanyInfo', 'GET', { 'cmpyId': this.myData.cmpyId }, res => {
      yx.status(res, res => {
        let data = res.data.cmpyInfo
        let src = data.logoUrl
        let name = data.simpCmpyName
        let company = data.cmpyName
        let trade = data.industry
        let phone = data.phone
        let address = data.address
        if (!address) address = '公司导航地址'
        let door = data.houseNumber
        let authStatus = true
        if (data.authStatus==0){
          authStatus = false
        }
        this.setData({ src: src, name: name, company: company, trade: trade, phone: phone, address: address, door: door, 'flags.authStatus': authStatus })
        this.myData.location.longitude = data.longitude
        this.myData.location.latitude = data.latitude
      })
    })
    //获取行业信息
    yx.ajax('/weiwebsite/mobile/cmpyinfo/getIndustryList', 'GET', {}, res => {
      yx.status2('获取行业信息',res, res => {
        this.setData({ industryList: res.data.list})
      })
    })
  },
  //选择地址
  address: function () {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userLocation']) {
          yx.modal({ tip: '请开启设置-使用我的地理位置' }, res => {
            wx.openSetting({})
          })
        } else {
          wx.chooseLocation({
            success: res => {
              if (res.address && res.name) {
                this.setData({ address: res.address })
                let split = splitAddress.split(res.address, res.name)
                this.myData.location.longitude = res.longitude
                this.myData.location.latitude = res.latitude
                this.myData.map = { 'pro': split.pro, 'city': split.city, 'area': '' }
              } else {
                yx.modal({ 'tip': '抱歉，未能获取地址，请重新选择！' })
              }
            }
          })
        }
      }
    })
  },
  //选择行业
  industry: function (e) {
    this.setData({ trade: this.data.industryList[e.detail.value].industry })
  },
  //选择logo
  logo: function () {
    wx.chooseImage({
      count: 1,
      success: res => {
        this.setData({ src: res.tempFilePaths[0] })
        this.myData.flagChooseImg = true
      }
    })
  },
  //提交
  submit: function (e) {
    let value = e.detail.value
    let data = this.data
    let myData = this.myData
    //验证简称
    if (!validate.strLength(value.name, 1, 6)) {
      yx.modal({ 'tip': '公司简称请输入1-6个汉字' })
      return
    }
    //验证公司全称
    if (!validate.strLength(value.company, 1, 30)) {
      yx.modal({ 'tip': '公司简称请输入1-30个汉字' })
      return
    }
    //验证电话
    if (!value.phone) {
      yx.modal({ 'tip': '请填写联系电话' })
      return
    }
    //验证公司地址
    if (data.address == '公司导航地址') {
      yx.modal({ 'tip': '请选择公司地址' })
      return
    }
    //开始创建
    yx.showLoading()
    if (this.myData.flagChooseImg){
      yx.upImg(data.src, logo => {
        if (logo){
          ajax(logo)
        }
      })
    }else{
      ajax(this.data.src)
    }

    function ajax(logo){
      yx.showLoading()
      yx.ajax('/weiwebsite/mobile/cmpyinfo/updateInfo', 'GET', {
        'cmpyId': myData.cmpyId,
        'simpCmpyName': value.name,
        'logo': logo,
        'province': myData.map.pro,
        'city': myData.map.city,
        'region': myData.map.area,
        'address': data.address,
        'longitude': myData.location.longitude,
        'latitude': myData.location.latitude,
        'houseNumber': value.door,
        'phone': value.phone,
        'cmpyName': value.company,
        'industry': data.trade
      }, res => {
        wx.hideLoading()
        yx.status(res, res => {
          yx.modal({ 'tip': '修改成功' }, res => {
            //储存简称和LOGO
            app.globalData.company.simpCmpyName = value.name
            app.globalData.company.logoUrl = logo
            wx.navigateBack()
          })
        })
      })
    }
  }
})
