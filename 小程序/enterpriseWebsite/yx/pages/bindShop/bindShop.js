const app = getApp()
const yx = require('../../utils/utils.js')
const validate = require('../../utils/validate.js')
const sendSMS = require('../../utils/sendSMS.js')
Page({
  data: {
    flags: { 'inShow': false, 'more': true, 'focus': false, 'close': true,'main':false, 'mask': true, 'bind': true, 'apply': true,'nothing':true,'code':true},
    height: 0,
    top: 0,
    list: [],
    more: '上拉加载更多',
    keyWord:'',
    bindPhone:'',
    code:'获取验证码'
  },
  myData: {
    'cmpyId':'',
    'userId':'',
    'rows': 8,
    'page': 1,
    'flagLow': true,
    'flagSubmit':true
  },
  onLoad: function (options) {
    this.myData.cmpyId = app.globalData.company.id
    this.myData.userId = app.globalData.info.userId
    wx.setNavigationBarTitle({ title: '绑定联营店' })
    //计算高度
    yx.iphone6Size([120], height => {
      this.setData({ height: height })
    })
  },
  onShow: function () {
    this.load('show')
  },
  //清空关键字
  clearSearch: function () {
    this.setData({ keyWord: '', 'flags.close': true })
  },
  //输入关键字时
  input: function (e) {
    if (e.detail.value) {
      this.setData({ 'flags.close': false, keyWord: e.detail.value })
    } else {
      this.setData({ 'flags.close': true })
    }
  },
  //搜索
  search: function (e) {
    this.setData({ keyWord:e.detail.value})
    this.load('search')
  },
  //搜索2
  search2: function () {
    this.load('search')
  },
  //公共数据加载
  load: function (from) {
    //重置
    this.myData.flagLow = true
    this.myData.page = 1
    let url=''
    let data = {}
    if (from == 'show') {
      url = '/weiwebsite/mobile/userinfo/isBind'
      data = { 'cmpyId': this.myData.cmpyId}
      //重置
      this.setData({ keyWord: '', 'flags.close': true, 'flags.main': false })
    } else {
      url ='/weiwebsite/mobile/unioncmpy/get'
      data = { 'name': this.data.keyWord, 'cmpyId': this.myData.cmpyId, 'pageSize': this.myData.rows, 'pageNo': this.myData.page }
    }
    yx.showLoading()
    yx.ajax(url, 'GET', data,res=>{
      wx.hideLoading()
      yx.status(res,res=>{
        let list = res.data
        let length = list.length
        if (length > 0) {
          let more = false
          //只有一页数据的情况
          if (length < this.myData.rows) {
            more = true
            this.myData.flagLow = false
          }
          this.setData({ list: list, 'flags.more': more, top: 0, more: '上拉加载更多', 'flags.inShow': true, 'flags.nothing': true })
        }else{
          this.setData({ 'flags.nothing': false, 'flags.inShow': true})
        }
      })
    })
  },
  //上拉加载
  low: function () {
    if (this.myData.flagLow) {
      this.myData.flagLow = false
      let more = '加载中...'
      this.myData.page++
      this.setData({ more: more })
      yx.ajax('/weiwebsite/mobile/unioncmpy/get','GET',{
        'name': this.data.keyWord, 'cmpyId': this.myData.cmpyId, 'pageSize': this.myData.rows, 'pageNo': this.myData.page
      },res=>{
        this.myData.flagLow = true
        yx.status(res, res => {
          let list = res.data
          let length = list.length
          more = '上拉加载更多'
          if (length < this.myData.rows) {
            //下一页为最终页的情况
            this.myData.flagLow = false
            more = '没有更多数据了'
          }
          this.setData({ list: this.data.list.concat(list), more: more })
        })
      })
    }
  },
  //我要申请
  apply:function(){
    this.setData({'flags.mask':false,'flags.apply':false})
  },
  //申请提交
  applySubmit:function(e){
    let value = e.detail.value
    let myData = this.myData
    //验证姓名
    if (value.name==''){
      yx.modal({'tip':'请填写姓名'})
      return
    }
    //验证手机号
    if (!validate.phone(value.phone)){
      yx.modal({ 'tip': '请填写合法手机' })
      return
    }
    if (myData.flagSubmit){
      myData.flagSubmit = false
      yx.showLoading()
      yx.ajax('/weiwebsite/mobile/userinfo/applyUnion','GET',{
        'userId': myData.userId, 'userName': value.name, 'phone': value.phone
      },res=>{
        myData.flagSubmit = true
        wx.hideLoading()
        yx.status(res,res=>{
          yx.modal({'tip':'申请成功'},res=>{
            this.setData({ 'flags.mask': true, 'flags.apply': true })
          })
        })
      })
    }
  },
  //绑定联营店
  bind:function(e){
    let dataset = e.currentTarget.dataset
    this.setData({ 'flags.mask': false, 'flags.bind': false, bindPhone:dataset.phone })
    this.myData.unionId = dataset.id
  },
  //获取验证码
  getCode:function(){
    if(this.data.flags.code){
      sendSMS.send(this.data.bindPhone,res=>{
        let n = 60
        this.setData({ code: '剩余' + n + 's', 'flags.code': false })
        let time = setInterval(res => {
          if (n != 0) {
            n = n - 1
            this.setData({ code: '剩余' + n + 's' })
          } else {
            clearInterval(time)
            this.setData({ code: '重新获取', 'flags.code': true })
          }
        }, 1000)
      })
    }
  },
  //确定绑定联营店
  bindShop:function(e){
    let dataset = e.currentTarget.dataset
    let myData = this.myData
    if (myData.flagSubmit) {
      myData.flagSubmit = false
      yx.showLoading()
      yx.ajax('/weiwebsite/mobile/userinfo/bindUnion','GET',{
        'cmpyId': myData.cmpyId, 'unionId': dataset.id
      },res=>{
        wx.hideLoading()
        myData.flagSubmit = true
        yx.status(res,res=>{
          yx.modal({'tip':'绑定成功'},res=>{
            this.setData({ 'flags.mask': true, 'flags.bind': true })
            this.load('show')
          })
        })
      })
    }
  },
  //解除绑定
  bindCancel:function(e){
    yx.modal({'tip':'确定要解绑吗？','showCancel':true},res=>{
      if(res.confirm){
        yx.showLoading()
        yx.ajax('/weiwebsite/mobile/userinfo/bindRelieve', 'GET', { 'cmpyId': this.myData.cmpyId},res=>{
          wx.hideLoading()
          yx.status(res,res=>{
            yx.modal({'tip':'解绑成功'},res=>{
              this.load('show')
            })
          })
        })
      }
    })
  },
  //关闭弹层
  close:function(){
    this.setData({ 'flags.mask': true, 'flags.bind': true,'flags.apply':true})
  }
})