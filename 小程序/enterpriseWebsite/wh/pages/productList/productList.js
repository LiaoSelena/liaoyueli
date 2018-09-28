const wh = require("../../utils/utils.js")
Page({
  data: {
    list: [],
    lower: { height: '', flag: true, pullTip: '上拉加载更多...', page: 1, rows: 8, pullShow: 'none', },
    parameter: { cmpyId: '', columnId: '' },
    from: '',
    pullTipStys: 1,
    phone:'',
    inShow: ''
  },
  onLoad: function (options) {
    this.setData({ 'parameter.cmpyId': options.cmpyId, 'parameter.columnId': options.columnId, from: options.from, phone: options.phone})
    wx.setNavigationBarTitle({ title: '产品列表' })
  },
  onShow: function () {
    wx.showLoading({
      title: '加载中',
    })
    wh.ajax("/weiwebsite/mobile/cmpyinfo/getCompanyInfo", "GET", { 'cmpyId': this.data.parameter.cmpyId},res=>{
      if (res.status == '100') {
        this.setData({ phone: res.data.cmpyInfo.phone})
      }
    })
    var res = wx.getSystemInfoSync()
    this.setData({ 'lower.height': res.windowHeight })
    wh.ajax("/weiwebsite/mobile/moduleproduct/list.action", "GET", {
      'columnId': this.data.parameter.columnId, 'cmpyId': this.data.parameter.cmpyId, 'page': 1, 'rows': 8
    }, res => {
      if (res.status == '100') {
        if (res.data.length>=8){
          this.setData({ pullTipStys:2 })
        }
        this.setData({ list: res.data, inShow: 2 })
        wx.hideLoading()
      }else if(res.msg=='暂无数据'){
        wx.hideLoading()
      }
    })
  },
  goDelete:function(e){
    let that=this
    wx.showModal({
      title: '提示',
      content: '是否删除该产品',
      success: function (res) {
        if (res.confirm) {
          let productId = e.currentTarget.dataset.id
          console.info(productId)
          wh.ajax("/weiwebsite/mobile/moduleproduct/delete.action", "GET", {
            'productId': productId,
          }, res => {
            wh.ajax("/weiwebsite/mobile/moduleproduct/list.action", "GET", {
              'columnId': that.data.parameter.columnId, 'cmpyId': that.data.parameter.cmpyId, 'page': 1, 'rows': 8
            }, res => {
              if (res.data.length >= 8) {
                that.setData({ pullTipStys: 2 })
              }
              that.setData({ list: res.data, 'lower.flag': true, 'lower.pullTip': '上拉加载更多...', 'lower.page': that.data.lower.page})
            })
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })      
  },
  browse:function(e){
    let that=this
    let productId = e.currentTarget.dataset.pid
    if (this.data.from=='pre'){
      wx.navigateTo({
        url: '../productDetails/productDetails?id=' + productId + '&from=pre&phone='+this.data.phone+'',
        success: function () {
          that.setData({ 'lower.flag': true, 'lower.pullTip': '上拉加载更多...', 'lower.page': that.data.lower.page })
        }
      })
    }else{
      wx.navigateTo({
        url: '../../../lyl/pages/productEdit/productEdit?productId=' + productId + '&cmpyId=' + this.data.parameter.cmpyId + '&columnId=' + this.data.parameter.columnId + '&style=edit',
        success: function () {
          that.setData({ 'lower.flag': true, 'lower.pullTip': '上拉加载更多...', 'lower.page': that.data.lower.page })
        }
      })
    }  
  },
  lower: function () {
    console.info(1)
    let that = this
    if (this.data.lower.flag) {
      this.setData({ 'lower.flag': false, 'lower.page': parseInt(this.data.lower.page) + 1, 'lower.pullTip': '加载中...' })
      wh.ajax("/weiwebsite/mobile/moduleproduct/list.action", "GET", {
        'columnId': this.data.parameter.columnId, 'cmpyId': this.data.parameter.cmpyId, 'page': this.data.lower.page, 'rows': 8
      }, res => {
        if (res.status == '100') {
          if (res.data.length > 0) {
            if (res.data.length >= 8) {
              that.setData({ pullTipStys: 2 })
            }
            let list = res.data
            this.setData({ list: this.data.list.concat(list), 'lower.flag': true, 'lower.pullTip': '加载中...' })
            if (list.length < this.data.lower.rows) {
              this.setData({ 'lower.flag': false, 'lower.pullTip': '没有更多数据了' })
            }
            console.info(this.data.list)
          }

        } else if (res.status == '110'){
          this.setData({ 'lower.flag': false, 'lower.pullTip': '没有更多数据了' })
        }
      })
    }
  },
  goEstablish:function(){
    wx.navigateTo({
      url: '../../../lyl/pages/productEdit/productEdit?cmpyId=' + this.data.parameter.cmpyId + '&columnId=' + this.data.parameter.columnId+'&style=add',
    })
  },
  //logo跳技术支持
  logoClick:function() {
    console.info(1);
    wx.navigateTo({
      url: '../../../pages/support/support',
    })
  }
})