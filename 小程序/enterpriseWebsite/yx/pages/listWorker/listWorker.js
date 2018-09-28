const app = getApp()
const yx = require('../../utils/utils.js')
Page({
  data: {
    flags: { 'inShow': false, 'more': true, 'see': true, 'focus': false, 'close': true, 'gif': false, 'nothing': false},
    height:0,
    top:0,
    list:[],
    more:'上拉加载更多',
    total:'',
    keyWord:'',
    dataSee:{},
    version:''
  },
  myData:{
    'cmpyId':'',
    'userId':'',
    'rows':8,
    'page':1,
    'flagLow':true,
    'flagSet':true
  },
  onLoad: function (options) {
    this.myData.cmpyId = app.globalData.company.id
    this.myData.userId = app.globalData.info.userId
    wx.setNavigationBarTitle({ title: '我的员工' })
    //计算高度
    yx.iphone6Size([140], height => {
      this.setData({ height: height, version: app.globalData.minPro.v })
    })
  },
  onShow:function(){
    this.setData({ keyWord: '', 'flags.close': true })
    this.load('show')
  },
  //清空关键字
  clearSearch:function(){
    this.setData({ keyWord: '', 'flags.close': true })
  },
  //输入关键字时
  input:function(e){
    if (e.detail.value){
      this.setData({ 'flags.close': false, keyWord:e.detail.value })
    }else{
      this.setData({ 'flags.close': true })
    }
  },
  //搜索
  search:function(e){
    this.setData({ keyWord: e.detail.value })
    if (this.data.keyWord!=''){
      this.load('search')
    }else{
      yx.modal({'tip':'请输入员工姓名'},res=>{
        this.setData({'flags.focus':true})
      })
    }
  },
  //搜索2
  search2: function () {
    if (this.data.keyWord != '') {
      this.load('search')
    } else {
      yx.modal({ 'tip': '请输入员工姓名' }, res => {
        this.setData({ 'flags.focus': true })
      })
    }
  },
  //公共数据加载
  load:function(from){
    //重置
    this.myData.flagLow = true
    this.myData.page = 1
    yx.showLoading()
    yx.ajax2('/weiwebsite/mobile/staffManagement/selectStaffList.action','POST',{
      'cmpyId': this.myData.cmpyId, 'administratorId': this.myData.userId, 'empName': this.data.keyWord, 'rows': this.myData.rows, 'page': this.myData.page
    },res=>{
      wx.hideLoading()
      yx.status(res,res=>{
        //获取员工列表
        let list = res.data.rows
        let length = list.length
        if (length > 0) {
          let total = ''
          if (from == 'show') {
            total = '共' + res.data.total +'名员工'
          } else {
            total = '共搜索到' + res.data.total +'名员工'
          }
          let more = false
          //只有一页数据的情况
          if (length < this.myData.rows) {
            more = true
            this.myData.flagLow = false
          }
          this.setData({ list: list, 'flags.more': more, top: 0, more: '上拉加载更多', 'flags.inShow': true, total: total, 'flags.nothing': false })
        }else{
          this.setData({'flags.nothing':true})
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
      yx.ajax2('/weiwebsite/mobile/staffManagement/selectStaffList.action','POST',{
        'cmpyId': this.myData.cmpyId, 'administratorId': this.myData.userId, 'empName': this.data.keyWord, 'rows': this.myData.rows, 'page': this.myData.page
      },res=>{
        this.myData.flagLow = true
        //获取员工列表
        let list = res.data.rows
        let length = list.length
        more = '上拉加载更多'
        if (length < this.myData.rows) {
          //下一页为最终页的情况
          this.myData.flagLow = false
          more = '没有更多数据了'
        }
        this.setData({ list: this.data.list.concat(list), more: more })
      })
    }
  },
  //查看数据
  see:function(e){
    let dataset = e.currentTarget.dataset
    let dataSee = {
      'img': dataset.img,
      'name': dataset.name,
      'phone': dataset.phone,
      'count': dataset.count,
      'time': dataset.time,
      'userId': dataset.use,
      'creater': dataset.creater
    }
    this.setData({ 'flags.see': false, dataSee: dataSee })
  },
  //关闭查看
  closeSee:function(){
    this.setData({ 'flags.see': true })
  },
  //关闭动态图
  gifClick:function(){
    this.setData({'flags.gif':true})
  },
  //添加员工
  add:function(){
    this.setData({ 'flags.gif': true })
    wx.navigateTo({ url: '/wh/pages/Invitation/Invitation?cmpyId=' + this.myData.cmpyId + '&from=listWorker' })
  },
  //查看名片
  checkCard:function(e){
    let data = e.currentTarget.dataset
    wx.navigateToMiniProgram({
      appId: data.app,
      path: 'pages/shareIndex/shareIndex?appId=' + data.app + '&appKey=' + data.key + '&mainUserId=' + data.id + '&mp=' + data.mp + '&shareIndex=1&fUserId=-1&fCardId=-1',
      envVersion: app.globalData.minPro.v
    })
  },
  //设置取消管理员
  setManager:function(e){
    if (this.myData.flagSet){
      let data = e.currentTarget.dataset
      let type = ''
      let tip = ''
      let ask = ''
      if (data.flag == 'set') {
        type = 1
        tip = '设置管理员成功'
        ask = '确定设置管理员？'
      } else {
        type = 2
        tip = '取消管理员成功'
        ask = '确定取消管理员？'
      }
      yx.modal({ 'tip': ask,'showCancel':true},res=>{
        if(res.confirm){
          yx.showLoading()
          this.myData.flagSet = false
          yx.ajax('/weiwebsite/mobile/staffManagement/settingsCancelAdministrator.action', 'GET', {
            'cmpyId': this.myData.cmpyId, 'userId': data.use, 'type': type
          }, res => {
            this.myData.flagSet = true
            wx.hideLoading()
            yx.status(res, res => {
              yx.modal({ 'tip': tip }, res => {
                //重置关键字
                this.setData({ keyWord: '', 'flags.close': true })
                this.load('show')
              })
            })
          })
        }
      })
    }
  },
  //删除员工
  delete:function(e){
    yx.modal({'tip':'确定要删除员工吗？','showCancel':true},res=>{
      if(res.confirm){
        yx.showLoading()
        yx.ajax2('/weiwebsite/mobile/staffManagement/deleteStaff.action','POST',{
          'cmpyId': this.myData.cmpyId, 'userId': e.currentTarget.dataset.use
        },res=>{
          wx.hideLoading()
          yx.status(res,res=>{
            yx.modal({'tip':'删除员工成功'},res=>{
              //重置关键字
              this.setData({ keyWord: '', 'flags.close': true })
              this.load('show')
            })
          })
        })
        this.setData({ 'flags.see': true })
      }
    })
  }
})