const wh=require("../../utils/utils.js")
const app=getApp()
Page({
  data: {
    template: [],
    conts: 0,
    cover:{flag:'',src:''},
    Release: { title: '', img: '', covreStyle: 'none'},
    ImgsControl:'inline-block',
    parameter: { cmpyId: '', columnId: '' },
    form: '',
    length:'',
    reFlga:true
  },
  onLoad: function (options) {
    this.setData({ 'parameter.cmpyId': options.cmpyId, 'parameter.columnId': options.columnId })
    wx.setNavigationBarTitle({ title: '发布资讯' })
  },
  onShow: function () {

  },
  addText: function () {
    let arr = this.data.template
    let i = arr.length
    let array = [{
      'i': i,
      'ifTemplate': '1',
      'data':''
    }]
    arr = arr.concat(array)
    let length = arr.length
    this.setData({ template: arr, conts: i, length:length })
  },
  addImg: function () {
    var that = this
    wx.chooseImage({
      count: 9,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        if (tempFilePaths.length >= 9) { that.setData({ ImgsControl: 'none' }) }
        let list=[]
        let plan = that.data.template
        for (var j = 0; j < tempFilePaths.length;j++){
          wx.uploadFile({
            url: app.globalData.domainName + '/weiwebsite/mobile/upload/image',
            filePath: tempFilePaths[j],
            name: 'uploadFiles',
            formData: null,
            success: function (res) {
               var data = JSON.parse(res.data)
               if (data.status=='100'){
                 var url = data.data.url
                 list.push(url)
               }else{
                 wh.modal({ tip:'此图片大小超过2M 上传失败'})
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
             if (data.status=='100'){
               var url=data.data.url
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
    let length = arr.length
    length = arr.length
    this.setData({ template: arr, length: length })
    console.info(this.data.template)
  },
  movedown: function (e) {
    let index = e.currentTarget.dataset.indexa
    let arr = this.data.template
    let downArr = arr[index + 1]
    let thisArr = arr[index]
    arr.splice(index, 1, downArr)
    arr.splice(index + 1, 1, thisArr)
    let length = arr.length
    length = arr.length
    this.setData({ template: arr, length: length })
    console.info(this.data.template)
  },
  setCover:function(){
    let that=this
    wx.chooseImage({
      count: 1,
      success: function(res) {
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: app.globalData.domainName + '/weiwebsite/mobile/upload/image',
          filePath: tempFilePaths[0],
          name: 'uploadFiles',
          formData: null,
          success: function (res) {
            var data = JSON.parse(res.data)
            if (data.status == '100') {
              var url = data.data.url
              that.setData({ 'cover.src': url, 'cover.flag': '1', 'Release.img': url, "Release.covreStyle": 'inline-block' })
            } else {
              wh.modal({ tip: '此图片大小超过2M 上传失败' })
            } 
          }
        })
      },
    })
  },
  getTitle:function(e){
    this.setData({ 'Release.title':e.detail.value})
  },
  getcont:function(e){
    let index = e.currentTarget.dataset.i
    let text = e.detail.value
    var template = this.data.template
    template[index].data = text
    this.setData({ template: template, })
  },
  Release: function () {
    let that=this
    if (that.data.reFlga){
      wx.showLoading({
        title: '发布中',
      })
      that.setData({ reFlga:false})
      let title = this.data.Release.title
      let img = this.data.Release.img
      let template = this.data.template
      console.info(template)
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
        'columnId': this.data.parameter.columnId, 'cmpyId': this.data.parameter.cmpyId, 'title': title, 'img': img,
        'contents': contents,
        'contentTypes': contentTypes,
        'type': 2,
        'struts': 1
      }, res => {
        wh.status(res, res => {
          wx.hideLoading()
          wx.navigateBack({})
          that.setData({ reFlga: true })
        })
      })
    }   
  },
  Preview:function(){ 
    let title = this.data.Release.title
    let img = this.data.Release.img
    let template = this.data.template
    console.info(template)
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
      'columnId': this.data.parameter.columnId, 'cmpyId': this.data.parameter.cmpyId, 'title': title, 'img': img,
      'contents': contents,
      'contentTypes': contentTypes,
      'type': 2,
      'struts': 2
    }, res => {
      wh.status(res,res=>{
        wx.navigateTo({
          url: '../informationPreview/informationPreview?id=' + res.data + '&cmpyId=' + this.data.parameter.cmpyId + '&columnId=' + this.data.parameter.columnId +'&state=2',
        })
      })
    })
  }
})
