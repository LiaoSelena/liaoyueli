const wh = require('../../utils/utils.js')
const app = getApp()
const menuControl = require('../../../template/menu/menu.js')
const format = require('../../utils/format.js')
const wxLogin = require("../../utils/wxLogin.js")
const cmpyExpired = require('../../../utils/cmpyExpired.js')
Page({
  data: {
    flags: { 'overTime': false, 'mask': false, 'fromManage': false,'fromOther':false},
    codeScr: '',
    template: [],
     //底部菜单
    menu:{},
    height:'',
    imgUrls: [],
    userId:'',
    isAdmin:'',
    nothing:2,
    cjIcon:'',
    cmpyId:'',
    //地图模块二维码单独处理
    QRCode: '',
    simpCmpyName:'',
    phone:'',
    pre:'pre',
    //地图模块静态图单独处理
    mapUrl: [],
    logoMagirn:''
  },
  myData:{
    'cmpyName': '',
    'address': ''
  },
  onLoad: function (options) {
    let scene = decodeURIComponent(options.scene)
    console.info('---scene=' + scene + '---')
    let _from = ''
    let cmpyId = ''
    if (scene != 'undefined' && typeof (scene) != 'undefined') {
      scene = scene.split(',')
      cmpyId = scene[0].split('=')[1]
      _from = scene[1].split('=')[1]
    } else {
      _from = options.from
      cmpyId = options.cmpyId
    }
    console.info('---from=' + _from + '---')
    console.info('---企业ID=' + cmpyId + '---')
    if (_from == 'manage') { this.setData({ pre:'nogo'})}
    if (_from == 'card'){
      wh.ajax("/weiwebsite/mobile/cmpyinfo/getCmpyIdByMainCmpyId", "GET", { mainCmpyId: cmpyId},res=>{
        if (res.status=='100'){
          cmpyId=res.data.cmpyId
          app.globalData.company.id = cmpyId
          this.setData({ cmpyId: cmpyId })
          this.generateQRCode(cmpyId, app.globalData.appId)
          wh.ajax("/weiwebsite/mobile/cmpyinfo/getCompanyInfo", "GET", { cmpyId: cmpyId }, res => {
            if (res.status == '100') {
              this.setData({ simpCmpyName: res.data.cmpyInfo.simpCmpyName,phone:res.data.cmpyInfo.phone})
              let lat = res.data.cmpyInfo.latitude
              let lng = res.data.cmpyInfo.longitude
              wx.setNavigationBarTitle({ title: res.data.cmpyInfo.simpCmpyName + '官网' })
              this.myData.address = res.data.cmpyInfo.address
              this.myData.cmpyName = res.data.cmpyInfo.cmpyName
            }
          })
          wxLogin.login('', userId => {
            console.info(userId)
            this.setData({ userId: userId })
            wh.recordAjax("GET", {
              userId: this.data.userId, cmpyId: cmpyId
            }, res => {
              console.info(res)
            })
            wh.ajax2("/weiwebsite/mobile/microWebsite/insertForwardReading.action", "POST", { 
              cmpyId: cmpyId, userId: this.data.userId, type:1
              },res=>{console.info(res)})
            wh.ajax("/weiwebsite/mobile/staffManagement/selectUserIdentity.action", "GET", {
              cmpyId: cmpyId, userId: this.data.userId
            }, res => {
              if (res.status == '100') {
                if (res.data.isAdmin == '1') {
                  this.setData({ isAdmin: '管理者' })
                  this.setData({ 'flags.fromOther':false, 'flags.fromManage': true })
                } else {
                  this.setData({ 'flags.fromOther': true, 'flags.fromManage': false })
                  wh.ajax("/weiwebsite/mobile/microWebsite/selectCmpyBindList.action", "GET", {
                    userId: this.data.userId,
                  }, res => {
                    if (res.data.length != 0) {
                      this.setData({ nothing: 1 })
                    }else{
                      this.setData({ cjIcon: 2 })
                    }
                  })
                }
              }
            })
          })
          wh.ajax("/weiwebsite/mobile/microWebsite/selectCoverList.action", "GET", {
            cmpyId: cmpyId
          }, res => {
            if (res.status == '100') {
              this.setData({ imgUrls: res.data })
            }
          })
          wh.iphone6Size([98], height => {
            this.setData({ height: height })
          })
          let _this = this
          menuControl.load(cmpyId, function (list, l) {
            _this.setData({ 'menu.list': list, 'menu.l': l })
            if(list.length<=1){
              _this.setData({ logoMagirn:'margin:28rpx auto 20rpx;'})
            }
          })
          menuControl.data(menu => {
            this.setData({ menu: menu })
          })

          wh.ajax('/weiwebsite/mobile/microWebsite/selectMicroWebsite.action', 'GET', { 'cmpyId': cmpyId, 'isSelf': 0 }, res => {
            wh.status2('模板数据', res, res => {
              let list = res.data
              let length = list.length
              for (let i = 0; i < length; i++) {
                if (list[i].moduleType == 7) {
                  if (list[i].moduleMapList[0]) {
                    if (list[i].moduleMapList[0].markers[0]) {
                      if (list[i].moduleMapList[0].markers[0].latitude) {
                        let lat = list[i].moduleMapList[0].markers[0].latitude
                        let lng = list[i].moduleMapList[0].markers[0].longitude
                        this.findMap(lat, lng, url => {
                          list[i].moduleMapList[0].mapUrl = url
                          this.setData({ mapUrl: list })
                        })
                      }
                    }
                  }
                }
              }
              this.setData({ template: res.data })
              setTimeout(res => {
                wh.iphone6Size([480], res => {
                  wh.getHeight('.i_box', height => {
                    let list = this.data.template
                    let length = list.length
                    let n = -1
                    for (let i = 0; i < length; i++) {
                      if (list[i].moduleType == 1) {
                        n = n + 1
                        list[i].showControl = true
                        if (height[n] > res[0]) {
                          list[i].showMore = true
                        } else {
                          list[i].showMore = false
                        }
                      }
                    }
                    this.setData({ template: list })
                  })
                })
              }, 200)
            })
          })
          //企业过期
          cmpyExpired.cmpyExpired(cmpyId, flag => {
            if (flag) {
              //过期了
              this.setData({ 'flags.overTime': true, 'flags.mask': true })
            }
          })
        }
      })
    }else{
      app.globalData.company.id = cmpyId
      this.setData({ cmpyId: cmpyId })
      this.generateQRCode(cmpyId, app.globalData.appId)
      wh.ajax("/weiwebsite/mobile/cmpyinfo/getCompanyInfo", "GET", { cmpyId: cmpyId }, res => {
        if (res.status == '100') {
          let lat = res.data.cmpyInfo.latitude
          let lng = res.data.cmpyInfo.longitude
          this.setData({ simpCmpyName: res.data.cmpyInfo.simpCmpyName, phone: res.data.cmpyInfo.phone})
          wx.setNavigationBarTitle({ title: res.data.cmpyInfo.simpCmpyName + '官网', })
          this.myData.address = res.data.cmpyInfo.address
          this.myData.cmpyName = res.data.cmpyInfo.cmpyName
        }
      })
      wxLogin.login('', userId => {
        console.info(userId)
        this.setData({ userId: userId})
        wh.recordAjax("GET", {
          userId: this.data.userId, cmpyId: cmpyId
        }, res => {
          console.info(res)
        })
        wh.ajax2("/weiwebsite/mobile/microWebsite/insertForwardReading.action", "POST", {
          cmpyId: cmpyId, userId: this.data.userId, type: 1
        }, res => { console.info(res) })
        wh.ajax("/weiwebsite/mobile/staffManagement/selectUserIdentity.action", "GET", {
          cmpyId: cmpyId, userId: this.data.userId
        }, res => {
          if (res.status == '100') {
            if (res.data.isAdmin == '1') {
              this.setData({ isAdmin: '管理者' })
              this.setData({ 'flags.fromOther': false, 'flags.fromManage': true })
            } else {
              this.setData({ 'flags.fromOther': true, 'flags.fromManage': false })
              wh.ajax("/weiwebsite/mobile/microWebsite/selectCmpyBindList.action", "GET", {
                userId: this.data.userId,
              }, res => {
                if (res.data.length != 0) {
                  this.setData({ nothing: 1 })
                } else {
                  this.setData({ cjIcon: 2 })
                }
              })
            }
          }
        })
      })
      wh.ajax("/weiwebsite/mobile/microWebsite/selectCoverList.action", "GET", {
        cmpyId: cmpyId
      }, res => {
        if (res.status == '100') {
          this.setData({ imgUrls: res.data })
        }
      })
      wh.iphone6Size([98], height => {
        this.setData({ height: height })
      })
      let _this = this
      menuControl.load(cmpyId, function (list, l) {
        _this.setData({ 'menu.list': list, 'menu.l': l })
        if (list.length <= 1) {
          _this.setData({ logoMagirn: 'margin:28rpx auto 20rpx;' })
        }
      })
      menuControl.data(menu => {
        this.setData({ menu: menu })
      })

      wh.ajax('/weiwebsite/mobile/microWebsite/selectMicroWebsite.action', 'GET', { 'cmpyId': cmpyId, 'isSelf': 0 }, res => {
        wh.status2('模板数据', res, res => {
          let list = res.data
          let length = list.length
          for (let i = 0; i < length; i++) {
            if (list[i].moduleType == 7) {
              if (list[i].moduleMapList[0]) {
                if (list[i].moduleMapList[0].markers[0]) {
                  if (list[i].moduleMapList[0].markers[0].latitude) {
                    let lat = list[i].moduleMapList[0].markers[0].latitude
                    let lng = list[i].moduleMapList[0].markers[0].longitude
                    this.findMap(lat, lng, url => {
                      list[i].moduleMapList[0].mapUrl = url
                      this.setData({ mapUrl: list })
                    })
                  }
                }
              }
            }
          }
          this.setData({ template: res.data })
          setTimeout(res => {
            wh.iphone6Size([480], res => {
              wh.getHeight('.i_box', height => {
                let list = this.data.template
                let length = list.length
                let n = -1
                for (let i = 0; i < length; i++) {
                  if (list[i].moduleType == 1) {
                    n = n + 1
                    list[i].showControl = true
                    if (height[n] > res[0]) {
                      list[i].showMore = true
                    } else {
                      list[i].showMore = false
                    }
                  }
                }
                this.setData({ template: list })
              })
            })
          }, 200)
        })
      })
      //企业过期
      cmpyExpired.cmpyExpired(cmpyId, flag => {
        if (flag) {
          //过期了
          this.setData({ 'flags.overTime': true, 'flags.mask': true })
        }
      })
    }   
  },
  onShow: function () {

  },
  //底部LOGO
  logoClick: function () {
    wh.logoClick()
  },
  //地图模板二维码单独处理
  generateQRCode: function (cmpyId, appId) {
    wh.ajax('/weiwebsite/mobile/appletsQrCode/generateQRCode.action', 'GET', { 'appId': appId, 'cmpyId': cmpyId }, res => {
      wh.status2('地图模板二维码', res, res => {
        console.info(res)
        this.setData({ QRCode: res.data.appQrCode })
      })
    })
  },
  onShareAppMessage: function (res) {
    let that=this
    if (res.from === 'button') {
      // 来自页面内转发按钮
      wh.ajax2("/weiwebsite/mobile/microWebsite/insertForwardReading.action", "POST", {
        cmpyId: that.data.cmpyId, userId: that.data.userId, type: 2
      }, res => { console.info(res) })
    }
    return {
      title: this.data.simpCmpyName + '官网',
      path: 'wh/pages/previewHome/previewHome?cmpyId=' + this.data.cmpyId + '&from=share',
      success: function (res) {
        wh.ajax2("/weiwebsite/mobile/microWebsite/insertForwardReading.action", "POST", {
          cmpyId: that.data.cmpyId, userId: that.data.userId, type: 2
        }, res => { console.info(res) })
        wx.showToast({
          title: '分享成功',
          icon: 'none'
        })
      },
      fail: function (res) {

      }
    }
  },
  //底部菜单模块
  menuControl:function(e){
    menuControl.link(e)
  },
  //跳转自己绑定的官网或者自己创建的官网
  goList:function(){
    wx.navigateTo({
      url: '../../../lyl/pages/officialNetwork/officialNetwork?userId=' + this.data.userId+'',
    })
  },
  //编辑自己的官网
  goMyedit:function(){
    wx.reLaunch({
      url: '../../../yx/pages/manage/manage?cmpyId=' + this.data.cmpyId + '&from=pre',
    })
  },
  playVideo: function (e) {
    //播放视频
    wx.setStorageSync('yxVideoSrc', e.currentTarget.dataset.src)
    wx.navigateTo({ url: '../../../yx/pages/playVideo/playVideo' })
  },
  seeMore: function (e) {
    //图文模板展开更多
    let dataset = e.currentTarget.dataset
    let template = this.data.template
    template[dataset.i].showControl = !template[dataset.i].showControl
    this.setData({ template: template })
  },
  //地图模块静态图单独处理
  findMap: function (lat, lng, callback) {
    wh.ajax('/weiwebsite/mobile/location/getPic.action', 'GET', {
      'lat': lat, 'lng': lng, 'width': 400, 'height': 300
    }, res => {
      wh.status2('地图模板静态图', res, res => {
        callback(res.data.url)
      })
    })
  },
  //拨打人事电话
  callHR:function(e){
    let phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: ''+phone+'',
    })
  },
  //加入我们招聘列表
  joinUs:function(e){
    let dataset = e.currentTarget.dataset
    wx.navigateTo({ url: '../../../lyl/pages/joinUs/joinUs?from=pre&cmpyId=' + this.data.cmpyId + '&columnId=' + dataset.id + '&style=detail', })
  },
  playMap: function (e) {
    //查看地图
    wx.showLoading({ title: '正在打开地图...' })
    let dataset = e.currentTarget.dataset
    let lat = Number(dataset.latitude)
    let lon = Number(dataset.longitude)
    let address = dataset.address
    wx.openLocation({
      latitude: lat,
      longitude: lon,
      name: this.myData.cmpyName,
      address: address,
      complete:res=>{
        wx.hideLoading()
      }
    })
  },
  usPre: function (e) {
    //联系我们模板
    //识别二维码
    wx.previewImage({
      current: e.currentTarget.dataset.img,
      urls: [e.currentTarget.dataset.img]
    })
  },
  //栏目事件
  More:function(e){
    //查看更多
      let dataset = e.currentTarget.dataset
      switch (dataset.type) {
        case 2:
          //资讯列表
          wx.navigateTo({ url: '../informationList/informationList?from=pre&cmpyId=' + this.data.cmpyId + '&columnId=' + dataset.id + '', })
          break
        case 4:
          //合作伙伴
          wx.navigateTo({ url: '../../../lyl/pages/partner/partner?style=&cmpyId=' + this.data.cmpyId + '&columnId=' + dataset.id + '', })
          break
        case 5:
          //产品详情
          wx.navigateTo({ url: '../productList/productList?from=pre&cmpyId=' + this.data.cmpyId + '&columnId=' + dataset.id + '&phone=' + this.data.phone + '', })
          break
        case 6:
          //管理团队
          wx.navigateTo({ url: '../../../lyl/pages/team/team?from=pre&cmpyId=' + this.data.cmpyId + '&columnId=' + dataset.id + '', })
          break
      }
  },
  //企业资讯跳某一条详情
  newsLink:function(e){
    let dataset = e.currentTarget.dataset
    wx.navigateTo({ url: '../informationPreview/informationPreview?from=pre&cmpyId=' + this.data.cmpyId + '&columnId=' + dataset.cid + '&id=' + dataset.id+'&state=1', })
  },
  //企业产品跳某一条详情
  goProduct:function(e){
    let dataset = e.currentTarget.dataset
    wx.navigateTo({ url: '../productDetails/productDetails?from=pre&cmpyId=' + this.data.cmpyId + '&columnId=' + dataset.cid + '&id=' + dataset.id + '&state=1&phone='+this.data.phone+'', })
  },
  //跳某一条招聘详情
  goDetailView:function(e){
    let dataset = e.currentTarget.dataset
    wx.navigateTo({
      url: '../../../lyl/pages/postDetailView/postDetailView?id=' + dataset.i + '&cmpyId=' + dataset.cmpyid + '&recruitId=' + dataset.rid+'&style=detail', })
  },
  //预览人事二维码
  ckCode:function(e){
    let dataset = e.currentTarget.dataset
    wx.previewImage({
      urls: [dataset.code],
    })
  },
  //跳创建官网
  goCreate: function () {
    wx.navigateTo({
      url: '../../../yx/pages/create/create',
    })
  },
  //企业过期
  tep_overTime2:function(){
    this.setData({'flags.overTime':false})
  },
  overTime1: function (e) {
    let dataset = e.currentTarget.dataset
    switch (dataset.flag) {
      case 'call':
        //拨打热线
        wx.makePhoneCall({ phoneNumber: app.globalData.servicePhone })
        break
      case 'close':
        //关闭
        this.setData({ 'flags.overTime': false })
        break
    }
  }
})
