const app = getApp()
const yx = require('../../utils/utils.js')
const format = require('../../utils/format.js')
const useLog = require('../../utils/useLog.js')
const wxLogin = require('../../../utils/wxLogin.js')
const menuControl = require('../../../template/menu/menu.js')
const cmpyExpired = require('../../../utils/cmpyExpired.js')
Page({
  data: {
    flags: { 'inShow': false, 'authStatus': false, 'loading': false,'overTime':false,'mask':false},
    //企业信息
    company: { 'simpCmpyName': '', 'industry': '','logoUrl':''},
    //访问转发
    total:{'read':'','forward':''},
    //封面图
    coverImg:[],
    //模板
    template:[],
    //底部菜单
    menu:{},
    //地图模块二维码单独处理
    QRCode:'',
    //地图静态图单独处理
    mapUrl:[],
    //分享的图片地址
    shareImageUrl:''
  },
  myData:{
    'menuIndex':0,
    'cmpyId':'',
    'userId':'',
    'flagOnce': { 'companyInfo': false, 'coverImg': false, 'template': false,'menu':false},
    'cmpyName':'',
    'address':''
  },
  onLoad: function (options) {
    let from = options.from
    if (from == 'card'){
      //从名片进入要转换企业ID
      yx.showLoading()
      yx.ajax('/weiwebsite/mobile/cmpyinfo/getCmpyIdByMainCmpyId', 'GET', { 'mainCmpyId': options.cmpyId }, res => {
        wx.hideLoading()
        yx.status(res,res=>{
          let cmpyId = res.data.cmpyId
          console.info('---企业ID=' + cmpyId + '---')
          this.myData.cmpyId = cmpyId
          //存储企业ID
          app.globalData.company.id = cmpyId
          //调用接口
          this.selectForwardReadingTotal(cmpyId)
          this.getCompanyInfo(cmpyId)
          this.selectCoverList(cmpyId)
          this.selectMicroWebsite(cmpyId)
          this.generateQRCode(cmpyId, app.globalData.appId)
          //判断是否过期
          cmpyExpired.cmpyExpired(cmpyId,flag=>{
            if (flag){
              //过期了
              this.setData({'flags.overTime':true,'flags.mask':true})
            }
          })
          //存储userId
          wxLogin.login('', userId => { 
            this.myData.userId = userId
            useLog.log(userId, cmpyId)
          })
        })
      })
    }else{
      let cmpyId = options.cmpyId
      console.info('----企业ID=' + cmpyId + '----')
      this.myData.cmpyId = cmpyId
      //存储企业ID
      app.globalData.company.id = cmpyId
      //调用接口
      this.selectForwardReadingTotal(cmpyId)
      this.getCompanyInfo(cmpyId)
      this.selectCoverList(cmpyId)
      this.selectMicroWebsite(cmpyId)
      this.generateQRCode(cmpyId, app.globalData.appId)
      //判断是否过期
      cmpyExpired.cmpyExpired(cmpyId,flag=>{
        if (flag) {
          //过期了
          this.setData({ 'flags.overTime': true, 'flags.mask': true })
        }
      })
      if (from == 'share'){
        //存储userId
        wxLogin.login('', userId => {
          this.myData.userId = userId
          useLog.log(userId, cmpyId)
        })
      }else{
        useLog.log(app.globalData.info.userId, cmpyId)
      }
    }
    //底部菜单模块
    menuControl.data(menu => {
      this.setData({ menu: menu })
    })
  },
  onShow: function () {
    let myData = this.myData
    //企业详情
    if (myData.flagOnce.companyInfo){
      myData.flagOnce.companyInfo = false
      this.getCompanyInfo(myData.cmpyId)
    }
    //封面图
    if (myData.flagOnce.coverImg){
      myData.flagOnce.coverImg = false
      this.selectCoverList(myData.cmpyId)
    }
    //功能模块 1-图文类型(introduction) 2-资讯类型(news) 3-招聘模板(join) 4-合作伙伴(partner) 5-企业产品(product) 6-管理团队(team) 7-地图模板(us) 8-领袖(hero)
    if (myData.flagOnce.template) {
      myData.flagOnce.template = false
      this.selectMicroWebsite(myData.cmpyId)
    }
    //底部菜单
    if (myData.flagOnce.menu) {
      myData.flagOnce.menu = false
      let _this = this
      menuControl.load(this.myData.cmpyId, function (list, l) {
        _this.setData({ 'menu.list': list, 'menu.l': l })
      })
    }
  },

  //访问转发接口
  selectForwardReadingTotal: function (cmpyId){
    yx.ajax('/weiwebsite/mobile/microWebsite/selectForwardReadingTotal.action', 'GET', { 'cmpyId': cmpyId }, res => {
      yx.status2('访问转发', res, res => {
        let total = {}
        let data = res.data
        let read = data.readingTotal
        let forward = data.forwardTotal
        if (100000 > read && read >= 10000) {
          read = (read / 10000).toFixed(1) + 'W'
        } else {
          if (read >= 100000) read = '10W+'
        }
        if (100000 > forward && forward >= 10000) {
          forward = (forward / 10000).toFixed(1) + 'W'
        } else {
          if (forward >= 100000) forward = '10W+'
        }
        total.read = read
        total.forward = forward
        this.setData({ total: total })
      })
    })
  },
  //企业详情接口
  getCompanyInfo: function (cmpyId){
    yx.ajax('/weiwebsite/mobile/cmpyinfo/getCompanyInfo', 'GET', { 'cmpyId': cmpyId }, res => {
      yx.status(res, res => {
        let data = res.data.cmpyInfo
        let company = {}
        let authStatus = false
        company.simpCmpyName = data.simpCmpyName
        company.industry = data.industry
        company.logoUrl = data.logoUrl
        wx.setNavigationBarTitle({ title: data.simpCmpyName + '官网' })
        if (data.authStatus == 0) authStatus = true
        //储存简称和LOGO和行业
        app.globalData.company.simpCmpyName = data.simpCmpyName
        app.globalData.company.logoUrl = data.logoUrl
        app.globalData.company.industry = data.industry
        this.setData({ company: company, 'flags.authStatus': authStatus, 'flags.inShow': true })
        this.myData.address = data.address
        this.myData.cmpyName = data.cmpyName
      })
    })
  },
  //封面图接口
  selectCoverList: function (cmpyId){
    yx.ajax('/weiwebsite/mobile/microWebsite/selectCoverList.action', 'GET', { 'cmpyId': cmpyId }, res => {
      yx.status2('封面图', res, res => {
        let list = res.data
        let length = list.length
        let newList = []
        let shareImageUrl = ''
        if (length>0){
          for (let i = 0; i < length; i++) {
            newList.push(list[i].img)
          }
          shareImageUrl = list[0].img
        }else{
          shareImageUrl = 'http://q.img.soukong.cn/website/yx/mag_cover.jpg'
        }
        this.setData({ coverImg: newList, shareImageUrl: shareImageUrl })
        //临时保存封面图给编辑页面使用
        wx.setStorage({
          key: 'yxCoverImg',
          data: newList
        })
        //取第一张封面图作为分享图
      })
    })
  },
  //功能模块接口 1-图文类型(introduction) 2-资讯类型(news) 3-招聘模板(join) 4-合作伙伴(partner) 5-企业产品(product) 6-管理团队(team) 7-地图模板(us) 8-领袖(hero)
  selectMicroWebsite: function (cmpyId){
    yx.ajax('/weiwebsite/mobile/microWebsite/selectMicroWebsite.action', 'GET', { 'cmpyId': cmpyId, 'isSelf': 1 }, res => {
      yx.status2('模板数据', res, res => {
        let list = res.data
        let length = list.length
        for (let i = 0; i < length;i++){
          if (list[i].moduleType == 7){
            if (list[i].moduleMapList[0]){
              if (list[i].moduleMapList[0].markers[0]){
                if (list[i].moduleMapList[0].markers[0].latitude){
                  let lat = list[i].moduleMapList[0].markers[0].latitude
                  let lng = list[i].moduleMapList[0].markers[0].longitude
                  this.findMap(lat, lng,url=>{
                    list[i].moduleMapList[0].mapUrl = url
                    this.setData({ mapUrl: list})
                  })
                }
              }
            }
          }
        }
        this.setData({ template: list, 'flags.loading': true })
        setTimeout(res=>{
          yx.iphone6Size([480],res=>{
            yx.getHeight('.i_box', height => {
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
              this.setData({ template: list})
            })
          })
        },200)
      })
    })
  },
  //地图模板二维码单独处理
  generateQRCode: function (cmpyId, appId){
    yx.ajax('/weiwebsite/mobile/appletsQrCode/generateQRCode.action', 'GET', { 'appId': appId, 'cmpyId': cmpyId},res=>{
      yx.status2('地图模板二维码', res, res => {
        this.setData({ QRCode: res.data.appQrCode })
      })
    })
  },
  //地图模块静态图单独处理
  findMap: function (lat, lng,callback) {
    yx.ajax('/weiwebsite/mobile/location/getPic.action', 'GET', {
      'lat': lat, 'lng': lng,'width': 400,'height':300
    }, res => {
      yx.status2('地图模板静态图', res, res => {
        callback(res.data.url)
      })
    })
  },

  //设置
  set:function(){
    this.myData.flagOnce.companyInfo = true
    this.myData.flagOnce.template = true
    this.myData.flagOnce.menu = true
    wx.navigateTo({ url: '../set/set' })
  },
  //分享
  onShareAppMessage:function(){
    return {
      title: app.globalData.company.simpCmpyName + '官网',
      path: 'wh/pages/previewHome/previewHome?cmpyId=' + this.myData.cmpyId + '&from=share',
      imageUrl: this.data.shareImageUrl,
      success: res=> {
        // 转发成功
        wx.showToast({ title: '分享成功' })
        yx.ajax2('/weiwebsite/mobile/microWebsite/insertForwardReading.action','POST',{
          'cmpyId': this.myData.cmpyId, 'userId': this.myData.userId,'type':2
        },res=>{
          yx.status2('添加阅读转发记录',res,res={

          })
        })
      }
    }
  },
  //预览官网
  preWeb:function(){
    wx.navigateTo({ url: '/wh/pages/previewHome/previewHome?cmpyId=' + this.myData.cmpyId + '&from=manage' })
  },
  //去认证
  toAuthStatus:function(){
    this.myData.flagOnce.companyInfo = true
    wx.navigateTo({ url: '../setName/setName' })
  },
  //预览封面图
  coverPre:function(e){
    wx.previewImage({
      urls: [e.currentTarget.dataset.src]
    })
  },
  //编辑封面图
  coverLoc:function(){
    this.myData.flagOnce.coverImg = true
    wx.navigateTo({ url: '../coverImg/coverImg' })
  },

  //打开控制底部菜单
  menuOpen:function(){
    this.setData({ 'menu.flags.hide': false })
    let _this = this
    menuControl.load(this.myData.cmpyId, function(list,l) {
      _this.setData({ 'menu.list': list,'menu.l':l })
    })
  },
  //新增底部菜单
  menuAdd:function(){
    this.myData.flagOnce.menu = true
    wx.navigateTo({ url: '../setMenu/setMenu?from=add' })
    this.setData({ 'menu.run.left': '', 'menu.run.rotate': '' })
  },
  //编辑底部菜单
  menuEdit: function () {
    this.myData.flagOnce.menu = true
    let index = this.myData.menuIndex
    let list = this.data.menu.list
    wx.navigateTo({ url: '../setMenu/setMenu?from=edit&type=' + list[index].type + '&menuId=' + list[index].id})
    this.setData({ 'menu.run.left': '', 'menu.run.rotate': '' })
  },
  //控制底部菜单
  menuControl:function(e){
    let dataset = e.currentTarget.dataset
    if (dataset.from=='manage'){
      let list = this.data.menu.list
      let length = list.length
      let i = dataset.i
      let left = false
      let right = false
      let _delete = false
      if (dataset.type == 1 || dataset.type == 2) _delete = true
      //判断左移右移
      if (i == 0) left = true
      if (i == length - 1) right = true
      //重置
      for (let j = 0; j < length; j++) {
        if (j != i) list[j].active = false
      }
      this.setData({ 'menu.run.rotate': '', 'menu.run.left': '', 'menu.list': list, 'menu.flags.left': left, 'menu.flags.right': right, 'menu.flags.delete': _delete })
      if (!list[i].active) {
        list[i].active = true
        //动画
        setTimeout(res => {
          this.setData({ 'menu.run.rotate': 'run_rotate', 'menu.run.left': 'run_left', 'menu.list': list })
        }, 200)
      } else {
        list[i].active = false
        this.setData({ 'menu.list': list })
      }
      //记录菜单序列
      this.myData.menuIndex = i
    }
  },
  //底部菜单左移
  menuLeft:function(){
    let index = this.myData.menuIndex
    let list = this.data.menu.list
    yx.showLoading('移动中...')
    yx.ajax('/weiwebsite/mobile/cmpymeun/setUp.action','GET',{
      'menuId': list[index].id, 'previous': list[index-1].id
    },res=>{
      wx.hideLoading()
      yx.status(res,res=>{
        this.menuMove(index, index - 1)
      })
    })
  },
  //底部菜单右移
  menuRight: function () {
    let index = this.myData.menuIndex
    let list = this.data.menu.list
    yx.showLoading('移动中...')
    yx.ajax('/weiwebsite/mobile/cmpymeun/setDown.action', 'GET', {
      'menuId': list[index].id, 'next': list[index + 1].id
    }, res => {
      wx.hideLoading()
      yx.status(res, res => {
        this.menuMove(index, index + 1)
      })
    })
  },
  //移动
  menuMove: function (index, moveIndex){
    let list = this.data.menu.list
    let length = list.length
    let newList = []
    for (let i = 0; i < length; i++) {
      let obj = {
        'id': list[i].id,
        'index': i,
        'name': list[i].name,
        'active': false,
        'type': list[i].type,
        'objectId': list[i].objectId,
        'company': list[i].company
      }
      if (i == index) {
        obj.id = list[moveIndex].id
        obj.name = list[moveIndex].name
        obj.type = list[moveIndex].type
        obj.objectId = list[moveIndex].objectId
        obj.company = list[moveIndex].company
      }
      if (i == moveIndex) {
        obj.id = list[index].id
        obj.name = list[index].name
        obj.type = list[index].type
        obj.objectId = list[index].objectId
        obj.company = list[index].company
      }
      newList.push(obj)
    }
    this.setData({ 'menu.run.rotate': '', 'menu.run.left': '', 'menu.list': newList })
  },
  //删除底部菜单
  menuDelete:function(){
    yx.modal({'tip':'确定要删除吗？','showCancel':true},res=>{
      if(res.confirm){
        let index = this.myData.menuIndex
        let list = this.data.menu.list
        yx.showLoading('删除中...')
        yx.ajax('/weiwebsite/mobile/cmpymeun/delete.action', 'GET', { 'menuId': list[index].id }, res => {
          wx.hideLoading()
          yx.status(res, res => {
            let newList = []
            list.splice(index, 1)
            let length = list.length
            for (let i = 0; i < length; i++) {
              let obj = {
                'id': list[i].id,
                'index': i,
                'name': list[i].name,
                'active': false,
                'type': list[i].type,
                'objectId': list[i].objectId,
                'company': list[i].company
              }
              newList.push(obj)
            }
            this.setData({ 'menu.run.rotate': '', 'menu.run.left': '', 'menu.list': newList })
          })
        })
      }
    })
  },

  //模板事件
  seeMore:function(e){
    //图文模板展开更多
    let dataset = e.currentTarget.dataset
    let template = this.data.template
    template[dataset.i].showControl = !template[dataset.i].showControl
    this.setData({ template: template})
  },
  playVideo:function(e){
    //播放视频
    wx.setStorageSync('yxVideoSrc', e.currentTarget.dataset.src)
    wx.navigateTo({ url: '../playVideo/playVideo' })
  },
  playMap:function(e){
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
  newsLink:function(){
    //资讯模板
  },
  callHR:function(e){
    //招聘模板
    let dataset = e.currentTarget.dataset
    wx.makePhoneCall({ phoneNumber: dataset.phone })
  },
  usPre: function (e) {
    //联系我们模板
    //识别二维码
    wx.previewImage({
      current: e.currentTarget.dataset.img,
      urls: [e.currentTarget.dataset.img]
    })
  },
  Tshow: function (e) {
    //模板隐藏显示
    let dataset = e.currentTarget.dataset
    let template = this.data.template
    let index = dataset.index
    let isHide = ''
    let tip = ''
    if (template[index].isHide == '0') {
      //隐藏
      template[index].isHide = '1'
      isHide = '1'
      tip = '隐藏成功'
    } else {
      //显示
      template[index].isHide = '0'
      isHide = '0'
      tip = '显示成功'
    }
    yx.showLoading()
    yx.ajax('/weiwebsite/mobile/cmpycolumninfo/hide.action', 'GET', {
      'columnId': dataset.id, 'isHide': isHide
    }, res => {
      wx.hideLoading()
      yx.status(res, res => {
        wx.showToast({ title: tip })
        this.setData({ template: template })
      })
    })
  },
  Tedit: function (e) {
    let dataset = e.currentTarget.dataset
    this.myData.flagOnce.template = true
    //模板编辑
    switch (dataset.show) {
      case 1:
        //图文模板
        wx.navigateTo({ url: '/wh/pages/editEnterprise/editEnterprise?cmpyId=' + this.myData.cmpyId + '&columnId=' + dataset.id+'&from=mange'})
        break
      case 2:
        //资讯模板
        wx.navigateTo({ url: '/wh/pages/informationList/informationList?cmpyId=' + this.myData.cmpyId + '&columnId=' + dataset.id + '&from=mange' })
        break
      case 3:
        //招聘模板
        wx.navigateTo({ url: '/lyl/pages/joinUs/joinUs?cmpyId=' + this.myData.cmpyId + '&columnId=' + dataset.id + '&from=mange&style=edit' })
        break
      case 4:
        //合作伙伴模板
        wx.navigateTo({ url: '/lyl/pages/partner/partner?cmpyId=' + this.myData.cmpyId + '&columnId=' + dataset.id + '&from=mange&style=edit' })
        break
      case 5:
        //产品模板
        wx.navigateTo({ url: '/wh/pages/productList/productList?cmpyId=' + this.myData.cmpyId + '&columnId=' + dataset.id + '&from=mange' })
        break
      case 6:
        //管理团队模板
        wx.navigateTo({ url: '/lyl/pages/teamManagement/teamManagement?cmpyId=' + this.myData.cmpyId + '&columnId=' + dataset.id + '&from=mange' })
        break
      case 7:
        //联系我们模板
        wx.navigateTo({ url: '/lyl/pages/contactUs/contactUs?cmpyId=' + this.myData.cmpyId + '&columnId=' + dataset.id + '&mapId=' + dataset.map + '&from=mange' })
        break
      case 8:
        //领军人物模板
        wx.navigateTo({ url: '/lyl/pages/person/person?cmpyId=' + this.myData.cmpyId + '&columnId=' + dataset.id + '&from=mange' })
        break
    }
  },
  //企业过期
  overTime1:function(e){
    let dataset = e.currentTarget.dataset
    switch (dataset.flag){
      case 'call':
        //拨打热线
        wx.makePhoneCall({ phoneNumber: app.globalData.servicePhone })
        break
      case 'close':
        //关闭
        this.setData({'flags.overTime':false})
        break
    }
  },

  //底部LOGO
  logoClick: function () {
    yx.logoClick()
  }
})
