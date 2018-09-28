const wh=require('../../utils/utils.js')
const wxLogin = require('../../utils/wxLogin.js')
Page({
  data: {
    flags: { 'inShow': false, 'more': false, 'nothing': false },
    height: 0,
    userId:'',
    list:{},
    serhflag:1,
    searchInput:'',
    kongShow:2,
    urslFlag:true
  },
  myData: {
    'userId': '',
    'page': 1,
    'rows': 8,
    'flagPull': true
  },
  onLoad: function (options) {
    var that=this;
    wx.setNavigationBarTitle({ title: '首页' })
    wh.iphone6Size([300], function (height) {
      that.setData({ height: height })
    })
  },
  onShow: function () {
    //获取scroll高度
    let topHeight = 91
    wx.showLoading({
      title: '加载中',
    })
   
    // wx.getSystemInfo({
    //   success: res => {
    //     this.setData({ 'flags.inShow': true, height: res.windowHeight })
    //   }
    // })
    wxLogin.login('', userId => {
      this.data.userId = userId
      console.info(userId)
      //用户访问过的官网
      wh.ajax("/weiwebsite/mobile/userloginfo/byuserlist", "GET", {
        userId: this.data.userId,
        page: 1,
        pageSize: 100
      }, res => {
        if (res.status == '100') {
          if (res.data.total != 0) {
            wx.hideLoading()
            this.setData({ list: res.data.list, urslFlag:false })
          } else {
            //没有访问过出现推荐列表
            wh.ajax("/weiwebsite/mobile/cmpyinfo/recommendCmpyList", "GET", {
              page: 1, pageSize: 8, cmpyName: ''
            }, res => {
              wx.hideLoading()
              this.setData({ list: res.data.list })
              console.info(this.data.list)
            })
          }
        }
      })
    })

  },
  searchGW:function(e){
    wh.ajax("/weiwebsite/mobile/userloginfo/byuserlist","GET",{
      page: 1, pageSize: 8, cmpyName: this.data.searchInput, userId: this.data.userId
    },res=>{
      if (res.status=='100'){
        wx.getSystemInfo({
          success: res => {
            this.setData({height: res.windowHeight })
          }
        })
        this.setData({ list: res.data.list,})
        if (res.data.total==0){
          this.setData({ kongShow: 1, height:0})
        }
      }else{

      }    
    })
  },
  //获取搜索框值
  searchValFun: function (e) {
    let searchInput = e.detail.value;
    if (searchInput!=''){
      this.setData({ serhflag: 2, searchInput: searchInput})  
    }else{
      this.setData({ serhflag: 1, searchInput: searchInput})  
      wh.ajax("/weiwebsite/mobile/userloginfo/byuserlist", "GET", {
        page: 1, pageSize: 8, cmpyName: this.data.searchInput, userId: this.data.userId
      }, res => {
        if (res.status == '100') {
          this.setData({ list: res.data.list})
          if (res.data.total != 0) {
            this.setData({ kongShow: 2 })
          }
        } else {

        }
      })
    }
  },
  deleteInput:function(){
    this.setData({ searchInput: '', serhflag: 1,})
    wh.ajax("/weiwebsite/mobile/userloginfo/byuserlist", "GET", {
      page: 1, pageSize: 8, cmpyName: this.data.searchInput, userId: this.data.userId
    }, res => {
      if (res.status == '100') {
        this.setData({ list: res.data.list })
        if (res.data.total != 0) {
          this.setData({ kongShow: 2 })
        }
      } else {

      }
    })
  },
  Record:function(e){
    let cmpyid = e.currentTarget.dataset.cmpyid
    wh.ajax("/weiwebsite/mobile/userloginfo/useLog","GET",{
      'userId': this.data.userId, 'cmpyId': cmpyid
    },res=>{
      wx.navigateTo({
        url: '../../wh/pages/previewHome/previewHome?cmpyId=' + cmpyid+'',
      })
    })
  },
  goCreate:function(){
    wx.navigateTo({
      url: '../../yx/pages/create/create',
    })
  },
  low:function(){
    let myData = this.myData
    if (myData.flagPull) {
      myData.flagPull = false
      myData.page++
      wx.showLoading({
        title: '加载中',
      })
      //判断是否为新用户
      let url =''
      if (this.data.urslFlag){
        url = '/weiwebsite/mobile/cmpyinfo/recommendCmpyList'
      }else{
        url = '/weiwebsite/mobile/userloginfo/byuserlist'  
      }
     
      wh.ajax(url, "GET", { 'userId': this.data.userId, 'page': myData.page, 'pageSize': myData.rows },
        res => {
          if (res.status == '100') {
            wx.hideLoading()
            myData.flagPull = true
            let list = res.data.list
            let length = list.length
            console.info(length)
            let moreText = '上拉加载更多...'
            if (length < myData.rows) {
              //最后一页
              myData.flagPull = false
              moreText = '没有更多数据了'
            }
            this.setData({ list: this.data.list.concat(list), 'flags.more': true, moreText: moreText,})
          }

        })
    }  
  }
})
