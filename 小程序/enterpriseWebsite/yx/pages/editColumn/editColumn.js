const app = getApp()
const yx = require('../../utils/utils.js')
const validate = require('../../utils/validate.js')
Page({
  data: {
    flags: { 'btn': false,'edit':false },
    template: '选择功能模块',
    list:[],
    value: ''
  },
  myData: {
    'cmpyId': '',
    'moduleType':'',
    'edit':false,
    'columnId':''
  },
  onLoad: function (options) {
    this.myData.cmpyId = app.globalData.company.id
    //获取模块列表
    let list = [
      {
        'img': 'http://q.img.soukong.cn/website/yx/editColumn_pic1.jpg?1',
        'type': '图文类型',
        'choose': false,
        'moduleType': 1
      },
      {
        'img': 'http://q.img.soukong.cn/website/yx/editColumn_pic2.jpg?2',
        'type': '资讯类型',
        'choose': false,
        'moduleType': 2
      },
      {
        'img': 'http://q.img.soukong.cn/website/yx/editColumn_pic3.jpg',
        'type': '招聘模板',
        'choose': false,
        'moduleType': 3
      },
      {
        'img': 'http://q.img.soukong.cn/website/yx/editColumn_pic4.jpg',
        'type': '合作伙伴',
        'choose': false,
        'moduleType': 4
      },
      {
        'img': 'http://q.img.soukong.cn/website/yx/editColumn_pic5.jpg?01',
        'type': '主推产品',
        'choose': false,
        'moduleType': 5
      },
      {
        'img': 'http://q.img.soukong.cn/website/yx/editColumn_pic6.jpg',
        'type': '管理团队',
        'choose': false,
        'moduleType': 6
      },
      {
        'img': 'http://q.img.soukong.cn/website/yx/editColumn_pic7.jpg',
        'type': '地图模板',
        'choose': false,
        'moduleType': 7
      },
      {
        'img': 'http://q.img.soukong.cn/website/yx/editColumn_pic8.jpg',
        'type': '领军人物',
        'choose': false,
        'moduleType': 8
      }
    ]
    if (options.from=='edit'){
      wx.setNavigationBarTitle({ title: '编辑栏目菜单' })
      this.myData.columnId = options.id
      yx.ajax('/weiwebsite/mobile/cmpycolumninfo/info.action', 'GET', { 'columnId': options.id},res=>{
        yx.status(res,res=>{
          let moduleType = res.data.moduleType
          list[moduleType - 1].choose = true
          this.setData({ list: list, value: res.data.columnName, template: list[moduleType - 1].type })
          this.myData.moduleType = moduleType
        })
      })
      this.myData.edit = true
    }else{
      wx.setNavigationBarTitle({ title: '添加栏目菜单' })
      this.setData({ list: list, 'flags.edit':true })
    }
  },
  //选择模块
  choose:function(e){
    let list = this.data.list
    let length = list.length
    for (let i = 0; i < length; i++) list[i].choose = false
    list[e.currentTarget.dataset.index].choose = true
    this.setData({ list: list, template: e.currentTarget.dataset.type})
    this.myData.moduleType = e.currentTarget.dataset.id
  },
  //保存
  submit: function (e) {
    let value = e.detail.value
    let myData = this.myData
    //验证汉字
    if (!validate.strLength(value.name, 1, 8)) {
      yx.modal({ 'tip': '公司简称请输入1-8个汉字' })
      return
    }
    if (!validate.china(value.name)) {
      yx.modal({ 'tip': '公司简称请输入1-8个汉字' })
      return
    }
    //验证模板
    if (!this.data.flags.hero) {
      if (this.data.template == '选择功能模块') {
        yx.modal({ 'tip': '选择功能模块' })
        return
      }
    }
    yx.showLoading()
    if (myData.edit) {
      //编辑
      ajax()
    }else{
      //验证栏目名是否存在
      yx.ajax('/weiwebsite/mobile/cmpycolumninfo/existColumnName.action', 'GET', {
        'cmpyId': myData.cmpyId,
        'columnName': value.name
      }, res => {
        wx.hideLoading()
        yx.status(res, res => {
          if (res.data.exist == '0') {
            ajax()
          } else {
            yx.modal({ 'tip': '栏目名称已存在，请更换' })
          }
        })
      })
    }

    function ajax(){
      yx.showLoading()
      let url = ''
      let data = {
        'cmpyId': myData.cmpyId,
        'columnName': value.name,
        'moduleType': myData.moduleType,
        'defStatus': 0
      }
      if (myData.edit) {
        //编辑
        url = '/weiwebsite/mobile/cmpycolumninfo/edit.action'
        data.columnId = myData.columnId
      } else {
        //新增
        url = '/weiwebsite/mobile/cmpycolumninfo/save.action'
      }
      yx.ajax(url, 'GET', data, res => {
        wx.hideLoading()
        yx.status(res, res => {
          yx.modal({ 'tip': '保存成功' }, res => {
            wx.navigateBack()
          })
        })
      })
    }
  }
})