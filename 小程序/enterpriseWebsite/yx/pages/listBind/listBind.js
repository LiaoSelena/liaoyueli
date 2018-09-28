const app = getApp()
const yx = require('../../utils/utils.js')
Page({
  data: {
    flags:{'inShow':false,'more':true,'nothing':false},
    height:0,
    total:'',
    list:[],
    more:'上拉加载更多',
    top:0,
    version:''
  },
  myData:{
    'rows':8,
    'page':1,
    'flagLow':true,
    'cmpyId': '',
    'userId':'',
    'flagCancel':true
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '绑定我的官网列表' })
    this.myData.cmpyId = app.globalData.company.id
    this.myData.userId = app.globalData.info.userId
    //计算高度
    yx.iphone6Size([78],height=>{
      this.setData({ height: height, version: app.globalData.minPro.v})
    })
  },
  onShow: function () {
    this.load('show')
  },
  //上拉加载
  low:function(){
    if(this.myData.flagLow){
      this.myData.flagLow = false
      let more = '加载中...'
      this.myData.page ++
      this.setData({ more: more})
      yx.ajax('/weiwebsite/mobile/staffManagement/viewBoundUsers.action','GET',{
        'cmpyId': this.myData.cmpyId, 'administratorId': this.myData.userId, 'rows': this.myData.rows, 'page': this.myData.page
      },res=>{
        this.myData.flagLow = true
        yx.status(res,res=>{
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
      })
    }
  },
  //查看名片
  card: function (e) {
    let data = e.currentTarget.dataset
    wx.navigateToMiniProgram({
      appId: data.app,
      path: 'pages/shareIndex/shareIndex?appId=' + data.app + '&appKey=' + data.key + '&mainUserId=' + data.id + '&mp=' + data.mp + '&shareIndex=1&fUserId=-1&fCardId=-1',
      envVersion: app.globalData.minPro.v
    })
  },
  //解除绑定
  remove: function (e) {
    if (this.myData.flagCancel){
      yx.modal({ 'tip': '确定要解除绑定吗？', 'showCancel': true }, res => {
        if (res.confirm) {
          yx.showLoading()
          this.myData.flagCancel = false
          yx.ajax2('/weiwebsite/mobile/staffManagement/unbind.action', 'POST', {
            'cmpyId': this.myData.cmpyId, 'administratorId': this.myData.userId, 'userId': e.currentTarget.dataset.use
          }, res => {
            this.myData.flagCancel = true
            wx.hideLoading()
            yx.status(res, res => {
              yx.modal({ 'tip': '解除成功' }, res => {
                this.load('remove')
              })
            })
          })
        }
      })
    }
  },
  //加载数据方法
  load:function(from){
    //重置
    this.myData.flagLow = true
    this.myData.page = 1
    yx.showLoading()
    //获取列表
    yx.ajax('/weiwebsite/mobile/staffManagement/viewBoundUsers.action','GET',{
      'cmpyId': this.myData.cmpyId, 'administratorId': this.myData.userId, 'rows': this.myData.rows, 'page': this.myData.page
    },res=>{
      wx.hideLoading()
      yx.status(res,res=>{
        let list = res.data.rows
        let length = list.length
        if (length > 0) {
          let more = false
          if (length < this.myData.rows) {
            //只有一页数据情况
            this.myData.flagLow = false
            more = true
          }
          this.setData({ list: list, 'flags.more': more, top: 0, more: '上拉加载更多', total: res.data.total, 'flags.inShow': true })
        } else {
          this.setData({ 'flags.nothing': true, 'flags.inShow': true })
        }
      })
    })
  }
})