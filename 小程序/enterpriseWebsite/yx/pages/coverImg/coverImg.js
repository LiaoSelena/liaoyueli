const app = getApp()
const yx = require('../../utils/utils.js')
Page({
  data: {
    flags: { 'up': true, 'down': true, 'add': true, 'no': true,'delete':false},
    height:0,
    list:[],
    transition:''
  },
  myData:{
    'tip':true,
    'cmpyId':'',
    'flagSubmit':true
  },
  onLoad: function (options) {
    this.myData.cmpyId = app.globalData.company.id
    wx.setNavigationBarTitle({ title: '编辑官网封面图' })
    //计算高度
    yx.iphone6Size([158],height=>{
      this.setData({ height: height })
    })
    //封面图
    let list = wx.getStorageSync('yxCoverImg')
    let length = list.length
    let newList = []
    if (length>0){
      for (let i = 0; i < length; i++) {
        let obj = {
          'index': i,
          'img': list[i],
          'top': i * 418,
          'control': true,
          'default': false
        }
        if (i == 0) obj.default = true
        newList.push(obj)
      }
      this.setData({ list: newList })
    }else{
      this.setData({'flags.no':false})
    }
    wx.removeStorageSync('yxCoverImg')
  },
  //显示操作
  control:function(e){
    let list = this.data.list
    let length = list.length
    //重置
    for (let i = 0; i < length; i++){
      list[i].control = true
    }
    this.setData({ list: list, 'flags.up': true, 'flags.down': true })
    let index = e.currentTarget.dataset.i
    let up = false
    let down = false
    let _delete = false
    if (index == 0) up = true
    if (index == length - 1) down = true
    if (length == 1) _delete = true
    list[index].control = false
    this.setData({ list: list, 'flags.up': up, 'flags.down': down, 'flags.delete': _delete})
  },
  //下移
  down:function(e) {
    this.move(e.currentTarget.dataset.i, e.currentTarget.dataset.i + 1)
  },
  //上移
  up: function (e) {
    this.move(e.currentTarget.dataset.i, e.currentTarget.dataset.i - 1)
  },
  //移动方法
  move:function(index,moveIndex){
    let list = this.data.list
    let newList = list
    let downTop = list[moveIndex].top
    let upTop = list[index].top
    let downImg = list[moveIndex].img
    let upImg = list[index].img
    //隐藏控制板
    newList[index].control = true
    //移动
    newList[index].top = downTop
    newList[moveIndex].top = upTop
    //重置顺序
    newList[index].index = moveIndex
    newList[moveIndex].index = index
    this.setData({ list: newList, transition: 'transition' })
    //重新排序图片
    newList[index].img = downImg
    newList[moveIndex].img = upImg
    let imgs = []
    let length = newList.length
    for (let i = 0; i < length; i++) {
      imgs.push(newList[i].img)
    }
    setTimeout(res => {
      let list = this.data.list
      let length = list.length
      let newList = []
      for (let i = 0; i < length; i++) {
        let obj = {
          'index': i,
          'img': imgs[i],
          'top': i * 418,
          'control': true,
          'default': false
        }
        if (i == 0) obj.default = true
        newList.push(obj)
      }
      this.setData({ list: newList, transition: '' })
    }, 600)
  },
  //删除
  delete:function(e){
    yx.modal({'tip':'是否要删除该封面图?','showCancel':true},res=>{
      if(res.confirm){
        let list = this.data.list
        let newList = []
        let length = list.length
        let flag = true
        list.splice(e.currentTarget.dataset.i, 1)
        if (length==1){
          
        }else{
          for (let i = 0; i < length - 1; i++) {
            let obj = {
              'index': i,
              'img': list[i].img,
              'top': i * 418,
              'control': true,
              'default': false
            }
            if (i == 0) obj.default = true
            newList.push(obj)
          }
        }
        this.setData({ list: newList, 'flags.add': true,'flags.no':flag })
        this.tip()
      }
    })
  },
  //更换
  change:function(e){
    let list = this.data.list
    wx.chooseImage({
      count:1,
      success: res=>{
        yx.showLoading()
        yx.upImg(res.tempFilePaths[0],img=>{
          list[e.currentTarget.dataset.i].img = img
          list[e.currentTarget.dataset.i].control = true
          this.setData({ list: list })
          this.tip()
        })
      }
    })
  },
  //添加图片
  add:function(){
    if(this.data.flags.add){
      let list = this.data.list
      let length = list.length
      for (let i = 0; i < length; i++) {
        list[i].control = true
      }
      let obj = {
        'index': length,
        'top': length * 418,
        'control': true,
        'default': false
      }
      wx.chooseImage({
        count: 1,
        success: res => {
          yx.showLoading()
          yx.upImg(res.tempFilePaths[0],img=>{
            obj.img = img
            list.push(obj)
            let flag = true
            if (length == 8) flag = false
            this.setData({ list: list, 'flags.add': flag, 'flags.no': true })
            this.tip()
          })
        }
      })
    }
  },
  //点击保存
  save:function(){
    if(this.myData.flagSubmit){
      this.myData.flagSubmit = false
      this.saveCoverPicture()
    }
  },
  //保存方法
  saveCoverPicture:function(){
    let list = this.data.list
    let length = list.length
    let imgs = ''
    for (let i = 0; i < length; i++) {
      if (i == 0) {
        imgs = list[i].img
      } else {
        imgs = imgs + ',' + list[i].img
      }
    }
    yx.showLoading()
    yx.ajax2('/weiwebsite/mobile/microWebsite/saveCoverPicture.action', 'POST', {
      'cmpyId': this.myData.cmpyId, 'imgs': imgs
    }, res => {
      wx.hideLoading()
      this.myData.flagSubmit = true
      yx.status(res, res => {
        yx.modal({ 'tip': '保存成功' }, res => {
          wx.navigateBack()
        })
      })
    })
  },
  //一次性提示
  tip:function(){
    if (this.myData.tip) {
      wx.showToast({
        icon: 'none',
        title: '点击左下方的"保存修改"按钮方可成功保存哦'
      })
      this.myData.tip = false
    }
  }
})
