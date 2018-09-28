const app = getApp()
const yx = require('../../utils/utils.js')
Page({
  data: {
    flags:{'inShow':false},
    height:0,
    list:[],
    transition:''
  },
  myData:{
    flag:true,
    'cmpyId': ''
  },
  onLoad: function (options) {
    this.myData.cmpyId = app.globalData.company.id
    wx.setNavigationBarTitle({ title: '栏目菜单设置' })
    //计算高度
    yx.iphone6Size([180],height=>{
      this.setData({ height: height})
    })
  },
  onShow: function () {
    yx.showLoading()
    yx.ajax('/weiwebsite/mobile/cmpycolumninfo/list.action', 'GET', { 'cmpyId': this.myData.cmpyId},res=>{
      wx.hideLoading()
      yx.status(res,res=>{
        let list = res.data
        let length = list.length
        let newList = []
        for(let i=0;i<length;i++){
          let obj = {
            'name': list[i].columnName,
            'hide': list[i].isHide,
            'top': i * 140,
            'index':i,
            'id': list[i].columnId
          }
          newList.push(obj)
        }
        this.setData({ 'flags.inShow': true, list: newList })
      })
    })
  },
  //下移
  down:function(e){
    if(this.myData.flag){
      this.myData.flag = false
      let index = e.currentTarget.dataset.i
      let moveIndex = e.currentTarget.dataset.i + 1
      this.move(index, moveIndex)
    }
  },
  //上移
  up: function (e) {
    if (this.myData.flag) {
      this.myData.flag = false
      let index = e.currentTarget.dataset.i
      let moveIndex = e.currentTarget.dataset.i - 1
      this.move(index, moveIndex)
    }
  },
  //移动方法
  move: function (index, moveIndex){
    let list = this.data.list
    let newList = list
    let top = list[index].top
    let moveTop = list[moveIndex].top
    let columnId = list[index].id
    let nextId = list[moveIndex].id
    //移动
    newList[index].top = moveTop
    newList[moveIndex].top = top
    this.setData({ list: newList, transition: 'transition' })
    setTimeout(res => {
      let list = this.data.list
      let length = list.length
      let newList = []
      for (let i = 0; i < length; i++) {
        let obj = {
          'name': list[i].name,
          'hide': list[i].hide,
          'top': i * 140,
          'index': i,
          'id': list[i].id
        }
        if (i == index) {
          obj.name = list[moveIndex].name
          obj.hide = list[moveIndex].hide
          obj.id = list[moveIndex].id
        }
        if (i == moveIndex) {
          obj.name = list[index].name
          obj.hide = list[index].hide
          obj.id = list[index].id
        }
        newList.push(obj)
      }
      this.setData({ list: newList, transition: '' })
      //与接口交换数据
      yx.ajax('/weiwebsite/mobile/cmpycolumninfo/sort.action','GET',{
        'columnId': columnId, 'next': nextId
      },res=>{
        yx.status(res,res=>{
          this.myData.flag = true
        })
      })
    }, 600)
  },
  //新增
  add:function(){
    wx.navigateTo({ url: '../editColumn/editColumn?from=add' })
  },
  //编辑
  edit:function(e){
    wx.navigateTo({ url: '../editColumn/editColumn?from=edit&id='+e.currentTarget.dataset.id })
  }
})