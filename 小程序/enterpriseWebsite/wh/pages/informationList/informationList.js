const wh = require("../../utils/utils.js")
Page({
  data: {
    list:[],
    Style: { tiletStyle: '#333', timeStyle:'#999',listStyle:'#fff'},
    lower: { height: '', flag: true, pullTip: '上拉加载更多...', page: 1, rows: 8, pullShow: 'none',},
    parameter: { cmpyId: '', columnId: '' },
    from: '',
    pullTipStys:1,
    inShow:''
  },
  onLoad: function (options) {
    this.setData({ 'parameter.cmpyId': options.cmpyId, 'parameter.columnId': options.columnId, from: options.from})
  },
  onShow: function () {
    wx.showLoading({
      title: '加载中',
    })
    var res = wx.getSystemInfoSync()
    wx.setNavigationBarTitle({ title: '资讯列表' })
    this.setData({ 'lower.height': res.windowHeight})
    let list = this.data.list
    let length = list.length
    for(var i=0;i<length;i++){
      list[i].tiletStyle = '#333'
      list[i].timeStyle = '#999'
      list[i].listStyle = ''
    }
    this.setData({ list: list })
    if (this.data.from == 'setMenu') {
      wh.ajax("/weiwebsite/mobile/moduleMedia/columnListModuleMedia.action", "GET", {
        'cmpyId': this.data.parameter.cmpyId, 'page': 1, 'rows': 8
      }, res => {
        if (res.status == '100') {
          wx.hideLoading()
          let list = res.data
          if (list.length>=8){
            this.setData({ pullTipStys: 2 })
          }
          this.setData({ list: list, inShow:2 })
        } else if (res.msg == '暂无数据') {
          wx.hideLoading()
        }
      })
    } else {
      wh.ajax("/weiwebsite/mobile/moduleMedia/listModuleMedia", "GET", {
        'columnId': this.data.parameter.columnId, 'cmpyId': this.data.parameter.cmpyId, 'page': 1, 'rows': 8
      }, res => {
        if (res.status == '100') {
          wx.hideLoading()
          if (res.data.length >= 8) {
            this.setData({ pullTipStys: 2 })
          }
          let list = res.data
          this.setData({ list: list, inShow:2 })
        }else if (res.msg=='暂无数据'){
          wx.hideLoading()
        }
      })
    }     
  },
  goEdit:function(e){
    let that=this
    let id= e.currentTarget.dataset.i
    let index = e.currentTarget.dataset.index
    let list = this.data.list
    let length = list.length
    for (var i = 0; i < length; i++) {
      list[index].tiletStyle = '#fff'
      list[index].timeStyle = '#fff'
      list[index].listStyle = '#BDE5FF'
    }
    this.setData({ list: list})
    if (this.data.from =='setMenu'){
      let yxNews = {
        'id': that.data.list[index].mediaId,
        'title': that.data.list[index].title
      }
      console.info(yxNews)
      wx.setStorage({
        key: "yxNews",
        data: yxNews
      })
      wx.navigateBack({})
    } else if (this.data.from == 'pre'){
      this.setData({ list: list, 'lower.flag': true, 'lower.pullTip': '上拉加载更多...', 'lower.page': 1 })
      wx.navigateTo({
        url: '/wh/pages/informationPreview/informationPreview?cmpyId=' + that.data.parameter.cmpyId + '&columnId=' + that.data.parameter.columnId + '&id=' + id + '&state=1'
      })
     }else{
      wx.showActionSheet({
        itemList: ["编辑", "置顶","删除"],
        itemColor: '#5CB8F7',
        success: function (res) {
          //编辑
          if (res.tapIndex == 0) {
            wx.navigateTo({
              url: '../editInformation/editInformation?id=' + id + '&columnId=' + that.data.parameter.columnId + '&cmpyId=' + that.data.parameter.cmpyId + '',
              success: function () {
                that.setData({ list: list, 'lower.flag': true, 'lower.pullTip': '上拉加载更多...', 'lower.page': that.data.lower.page })
              }
            })
          }
          //置顶
          if (res.tapIndex == 1) {
            wh.ajax("/weiwebsite/mobile/moduleMedia/addisTop.action", "GET", { 'mediaId': id },
              res => {
                if (res.status=='100'){
                  wx.showToast({
                    title: '置顶成功',
                    icon: "success",
                    success: function () {
                      wh.ajax("/weiwebsite/mobile/moduleMedia/listModuleMedia", "GET", {
                        'columnId': that.data.parameter.columnId, 'cmpyId': that.data.parameter.cmpyId, 'page': 1, 'rows': 8
                      }, res => {
                        if (res.status == '100') {
                          let list = res.data
                          if (res.data.length >= 8) {
                            that.setData({ pullTipStys: 2 })
                          }
                          let length = list.length
                          for (var i = 0; i < length; i++) {
                            list[i].tiletStyle = '#333'
                            list[i].timeStyle = '#999'
                            list[i].listStyle = ''
                          }
                          that.setData({ list: list, 'lower.flag': true, 'lower.pullTip': '上拉加载更多...', 'lower.page': 1 })
                        }
                      })
                    }
                  })
                }             
              })
         }
         //删除
          if (res.tapIndex ==2){
            wh.ajax("/weiwebsite/mobile/moduleMedia/delModuleMedia.action", "GET", { 'mediaId': id },
            res=>{
              if (res.status == '100') {
                wx.showToast({
                  title: '删除成功',
                  icon: "success",
                  success: function () {
                    wh.ajax("/weiwebsite/mobile/moduleMedia/listModuleMedia", "GET", {
                      'columnId': that.data.parameter.columnId, 'cmpyId': that.data.parameter.cmpyId, 'page': 1, 'rows': 8
                    }, res => {
                      if (res.status == '100') {
                        console.info(res)
                        if (res.data.length >= 8) {
                          that.setData({ pullTipStys: 2 })
                        }
                        let list = res.data
                        let length = list.length
                        for (var i = 0; i < length; i++) {
                          list[i].tiletStyle = '#333'
                          list[i].timeStyle = '#999'
                          list[i].listStyle = ''
                        }
                        that.setData({ list: list, 'lower.flag': true, 'lower.pullTip': '上拉加载更多...', 'lower.page': 1 })
                      }else if(res.msg=='暂无数据'){
                        that.setData({ list:[]})
                      }
                    })
                  }
                })
              }
            })
          }
        },
        fail: function (res) {
          for (var i = 0; i < length; i++) {
            console.log(res.errMsg)
            list[index].tiletStyle = '#333'
            list[index].timeStyle = '#999'
            list[index].listStyle = ''
          }
          that.setData({ list: list })
        }
      })
    }   
  },
  goRelease:function(){
    wx.navigateTo({
      url: '../releaseInformation/releaseInformation?columnId=' + this.data.parameter.columnId + '&cmpyId=' + this.data.parameter.cmpyId+'',
      success: function () {
      }
    })
  }, 
  lower:function(){
    let that=this
    if (this.data.lower.flag) {
      this.setData({ 'lower.flag': false, 'lower.page': parseInt(this.data.lower.page) + 1, 'lower.pullTip': '加载中...' })
      wh.ajax("/weiwebsite/mobile/moduleMedia/listModuleMedia", "GET", {
        'columnId': this.data.parameter.columnId, 'cmpyId': this.data.parameter.cmpyId, 'page': this.data.lower.page, 'rows': 8
      }, res => {
        if (res.status=='100'){
          if (res.data.length>0){
            if (res.data.length >= 8) {
              this.setData({ pullTipStys: 2 })
            }
            let list = res.data
            this.setData({ list: this.data.list.concat(list), 'lower.flag': true, 'lower.pullTip': '加载中...' })
            if (list.length < this.data.lower.rows) {
              this.setData({ 'lower.flag': false, 'lower.pullTip': '没有更多数据了' })
            } 
            console.info(this.data.list)
          } else{
            this.setData({ 'lower.flag': false, 'lower.pullTip': '没有更多数据了' })
          } 
         
        } else if (res.status == '110'){
          this.setData({ 'lower.flag': false, 'lower.pullTip': '没有更多数据了' })
        }       
      })
    }
  },
  //logo跳技术支持
  logoClick: function () {
    console.info(1);
    wx.navigateTo({
      url: '../../../pages/support/support',
    })
  }
})
