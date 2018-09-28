const wh=require("../../utils/utils.js")
const app = getApp()
Page({
  data: {
    // flags:{'template':false},
    template:[],
    ImgsControl:'inline-block',
    conts:0,
    ifTemplate:'',
    parameter: { cmpyId: '', columnId:''},
    form:'',
    length:'',
    reFlga: true
  },
  onLoad: function (options) {
    this.setData({ 'parameter.cmpyId': options.cmpyId, 'parameter.columnId': options.columnId})
    wx.setNavigationBarTitle({ title: '编辑信息' })
    wh.ajax("/weiwebsite/mobile/moduleMedia/selectModuleMediaDetailsTextImg.action", "GET", {
      'cmpyId': options.cmpyId,
      'columnId': options.columnId,
    }, res => {
      if (res.status=='100'){
        let ModuleTextImgList = res.data.ModuleTextImgList
        let length = ModuleTextImgList.length
        for (var i = 0; i < length; i++) {
          ModuleTextImgList[i].ifTemplate = ModuleTextImgList[i].contentType
          ModuleTextImgList[i].data = ModuleTextImgList[i].content
          if (ModuleTextImgList[i].contentType == '2') {
            ModuleTextImgList[i].data = (ModuleTextImgList[i].data).split(",")
            console.info(ModuleTextImgList[i].data)
          }
        }
        this.setData({
          template: ModuleTextImgList,
          length: length
        })
      }
    })
  },
  onShow: function () {

  },
  uploadPhoto: function (e) {
    let index = e.currentTarget.dataset.i
    let conts = this.data.template[index].data.length
    var that = this
    wx.chooseImage({
      count: 9,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        var template = that.data.template
        let list = []
        let plan = that.data.template
        for (var j = 0; j < tempFilePaths.length; j++) {
          wx.uploadFile({
            url: app.globalData.domainName + '/weiwebsite/mobile/upload/image',
            filePath: tempFilePaths[j],
            name: 'uploadFiles',
            formData: null,
            success: function (res) {
              var data = JSON.parse(res.data)
              if (data.status == '100') {
                var url = data.data.url
                list.push(url)
              } else {
                wh.modal({ tip: '此图片大小超过2M 上传失败' })
              }
              template[index].data = list
              that.setData({ template: template, })
            }
          })
        }

        // if (that.data.Imgs.length >= 9) { that.setData({ ImgsControl: 'none' })}
        console.info(that.data.template[index].data)
      },
    })
  },
  getcont: function (e) {
    let index = e.currentTarget.dataset.i
    let text = e.detail.value
    var template = this.data.template
    template[index].data = text
    this.setData({ template: template, })
  },
  addText: function () {
    let arr = this.data.template
    let i = arr.length
    let array = [{
      'i': i,
      'ifTemplate': '1',
      'data': ''
    }]
    arr = arr.concat(array)
    let length = arr.length
    this.setData({ template: arr, conts: i, length: length})
  },
  addImg: function () {
    var that = this
    wx.chooseImage({
      count: 9,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        if (tempFilePaths.length >= 9) { that.setData({ ImgsControl: 'none' }) }
        let list = []
        let plan = that.data.template
        for (var j = 0; j < tempFilePaths.length; j++) {
          wx.uploadFile({
            url: app.globalData.domainName + '/weiwebsite/mobile/upload/image',
            filePath: tempFilePaths[j],
            name: 'uploadFiles',
            formData: null,
            success: function (res) {
              var data = JSON.parse(res.data)
              if (data.status == '100') {
                var url = data.data.url
                list.push(url)
              } else {
                wh.modal({ tip: '此图片大小超过2M 上传失败' })
              }
              let arr = plan
              let i = arr.length
              let array = [{
                'i': i,
                'ifTemplate': '2',
                'data': list
              }]
              arr = arr.concat(array)
              let length = arr.length
              that.setData({ template: arr, conts: i, length: length })
            }
          })
        }

      },
    })

  },
  addVideo: function () {
    var that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        wx.showLoading({
          title: '视频上传中',
        })
        let tempFilePath = res.tempFilePath
        let arr = that.data.template
        wx.uploadFile({
          url: app.globalData.domainName + '/weiwebsite/mobile/upload/media',
          filePath: tempFilePath,
          name: 'uploadFiles',
          formData: null,
          success: function (res) {
            var data = JSON.parse(res.data)
            if (data.status == '100') {
              var url = data.data.url
              let i = arr.length
              let array = [{
                'i': i,
                'ifTemplate': '3',
                'data': url
              }]
              arr = arr.concat(array)
              wx.hideLoading()
              let length = arr.length
              that.setData({ template: arr, conts: i, length: length })
            }
          }
        })
      }
    })
  },
  deletePlan: function (e) {
    let index = e.currentTarget.dataset.indexa
    let arr = this.data.template
    console.info(this.data.template)
    arr.splice(index, 1)
    let length = arr.length
    this.setData({ template: arr, length: length })
  },
  movetop: function (e) {
    let index = e.currentTarget.dataset.indexa
    let arr = this.data.template
    let topArr = arr[index - 1]
    let thisArr = arr[index]
    arr.splice(index, 1, topArr)
    arr.splice(index - 1, 1, thisArr)
    this.setData({ template: arr })
  },
  movedown: function (e) {
    let index = e.currentTarget.dataset.indexa
    let arr = this.data.template
    let downArr = arr[index + 1]
    let thisArr = arr[index]
    arr.splice(index, 1, downArr)
    arr.splice(index + 1, 1, thisArr)
    this.setData({ template: arr })
  },
  uploadPhoto: function (e) {
    let index = e.currentTarget.dataset.i
    let conts = this.data.template[index].data.length
    var that = this
    wx.chooseImage({
      count: 9,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        var template = that.data.template
        let list = []
        let plan = that.data.template
        for (var j = 0; j < tempFilePaths.length; j++) {
          wx.uploadFile({
            url: app.globalData.domainName + '/weiwebsite/mobile/upload/image',
            filePath: tempFilePaths[j],
            name: 'uploadFiles',
            formData: null,
            success: function (res) {
              var data = JSON.parse(res.data)
              if (data.status == '100') {
                var url = data.data.url
                list.push(url)
              } else {
                wh.modal({ tip: '此图片大小超过2M 上传失败' })
              }
              template[index].data = list
              that.setData({ template: template, })
            }
          })
        }

        // if (that.data.Imgs.length >= 9) { that.setData({ ImgsControl: 'none' })}
        console.info(that.data.template[index].data)
      },
    })
  },
  goSave:function(){
    let that=this
    wx.showLoading({
      title: '保存中',
    })
    if (that.data.reFlga) {
      that.setData({ reFlga: false })
      let template = this.data.template
      let length = template.length
      let contentTypes = ''
      let contents = ''
      for (let i = 0; i < length; i++) {
        if (contentTypes != '') {
          contentTypes = contentTypes + ',' + template[i].ifTemplate
        } else {
          contentTypes = template[i].ifTemplate
        }

        if (i == 0) { contents = template[i].data } else {
          contents = contents + '@,@' + template[i].data
        }
      }
      wh.ajax2("/weiwebsite/mobile/moduleMedia/addModuleMedia.action", "POST", {
        'columnId': this.data.parameter.columnId, 'cmpyId': this.data.parameter.cmpyId, 'title': "企业简介", 'img': "企业简介",
        'contents': contents,
        'contentTypes': contentTypes,
        'type': 1,
        'struts': 1
      }, res => {
        if (res.status == '100') {
          wx.hideLoading()
          that.setData({ reFlga: true })
          wx.navigateBack({})
        }else{
          wx.showToast({
            title: res.msg,
            icon:'none'
          })
        }
      })
    }  
  }
})
