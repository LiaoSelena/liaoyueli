const app = getApp()
const yx = require('../../utils/utils.js')
const validate = require('../../utils/validate.js')
Page({
  data: {
    flags: { 'btn': false, 'list': true,'default':true},
    columnList:[],
    linkName:'请选择跳转链接',
    value:''
  },
  myData:{
    'cmpyId':'',
    'flagSubmit':true,
    'type':'',
    'objectId':'',
    'from':'',
    'menuId':''
  },
  onLoad: function (options) {
    let myData = this.myData
    myData.cmpyId = app.globalData.company.id
    myData.from = options.from
    wx.setNavigationBarTitle({ title: '底部菜单设置' })
    if (myData.from=='edit'){
      //编辑
      //如果是首页或者店铺产品底部菜单则不能改跳转链接
      if (options.type == 1 || options.type == 2) this.setData({ 'flags.default': false })
      yx.showLoading()
      yx.ajax('/weiwebsite/mobile/cmpymeun/info.action', 'GET', { 'menuId': options.menuId},res=>{
        wx.hideLoading()
        yx.status(res,res=>{
          let data = res.data
          let linkName = ''
          if (data.columnName) linkName = data.columnName
          if (data.type == 4) linkName = data.title
          this.setData({ value: data.menuName, linkName: linkName})
          if (myData.objectId) data.objectId
          myData.type = data.type
          myData.menuId = options.menuId
        })
      })
    }
    //栏目列表
    yx.ajax('/weiwebsite/mobile/cmpycolumninfo/list.action', 'GET', { 'cmpyId': myData.cmpyId},res=>{
      yx.status2('栏目列表',res,res=>{
        let list = res.data
        let length = list.length
        let newList = []
        for(let i=0;i<length;i++){
          let obj = {
            'name': list[i].columnName,
            'flag': false,
            'columnId': list[i].columnId
          }
          newList.push(obj)
        }
        this.setData({ columnList: newList })
      })
    })
  },
  onShow:function(){
    let objectId = wx.getStorageSync('yxNews')
    if (objectId){
      this.myData.objectId = objectId.id
      this.setData({ linkName: objectId.title })
      wx.removeStorageSync('yxNews')
    }
  },
  //显示栏目列表
  showColumn:function(){
    this.myData.type = 3
    this.setData({ 'flags.list': !this.data.flags.list, linkName: '请选择跳转链接' })
  },
  //选择栏目
  chooseColumn:function(e){
    let dataset = e.currentTarget.dataset
    let columnList = this.data.columnList
    let length = columnList.length
    for (let i = 0; i < length; i++)columnList[i].flag = false
    columnList[dataset.index].flag = true
    this.setData({ columnList: columnList, linkName: dataset.name})
    this.myData.objectId = columnList[dataset.index].columnId
  },
  //去资讯
  showNews:function(){
    this.myData.type = 4
    let columnList = this.data.columnList
    let length = columnList.length
    for (let i = 0; i < length; i++)columnList[i].flag = false
    this.setData({ 'flags.btn': false, 'flags.list': true, columnList: columnList, linkName:'请选择跳转链接' })
    wx.navigateTo({ url: '/wh/pages/informationList/informationList?cmpyId=' + this.myData.cmpyId + '&from=setMenu' })
  },
  //保存
  submit:function(e){
    let value = e.detail.value
    let myData = this.myData
    //验证汉字
    if (!validate.strLength(value.name, 1, 4)) {
      yx.modal({ 'tip': '公司简称请输入1-4个汉字' })
      return
    }
    if (!validate.china(value.name)) {
      yx.modal({ 'tip': '公司简称请输入1-4个汉字' })
      return
    }
    //验证链接
    if (this.data.linkName =='请选择跳转链接'){
      yx.modal({ 'tip': '请选择跳转链接' })
      return
    }
    //开始提交
    if (myData.flagSubmit){
      myData.flagSubmit = false
      if (myData.from=='edit'){
        //如果是编辑菜单则不需要验证名称
        yx.showLoading()
        yx.ajax('/weiwebsite/mobile/cmpymeun/update.actio', 'GET', {
          'menuId': myData.menuId,'cmpyId': myData.cmpyId, 'menuName': value.name, 'type': myData.type, 'objectId': myData.objectId
        }, res => {
          wx.hideLoading()
          myData.flagSubmit = true
          yx.status(res, res => {
            yx.modal({ 'tip': '保存成功' }, res => {
              wx.navigateBack()
            })
          })
        })
      }else{
        yx.showLoading()
        yx.ajax('/weiwebsite/mobile/cmpymeun/existMenuName.action', 'GET', {
          'cmpyId': myData.cmpyId, 'menuName': value.name
        }, res => {
          wx.hideLoading()
          yx.status(res, res => {
            //验证菜单名称是否存在
            if (res.data.exist == '0') {
              yx.showLoading()
              yx.ajax('/weiwebsite/mobile/cmpymeun/save.action', 'GET', {
                'cmpyId': myData.cmpyId, 'menuName': value.name, 'type': myData.type, 'objectId': myData.objectId
              }, res => {
                wx.hideLoading()
                myData.flagSubmit = true
                yx.status(res, res => {
                  yx.modal({ 'tip': '保存成功' }, res => {
                    wx.navigateBack()
                  })
                })
              })
            } else {
              yx.modal({ 'tip': '底部菜单名称已经存在，请重新填写' })
              myData.flagSubmit = true
            }
          })
        })
      }
    }
  }
})