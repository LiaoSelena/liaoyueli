// lyl/pages/productEdit/productEdit.js
var utils = require('../../utils/util.js');
var that, columnId, cmpyId, options;
const appUrl = getApp().globalData.domainName
Page({
  data: {
    bannerUrl:'',  //产品banner
    productName:'',//产品名称
    productPriceMin:'', //产品价格最小
    productPriceMax: '',//产品价格最大
    productImg:[],  //产品图片
    productContent:'', //产品描述
    finish:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    that=this;
    options = option;
    cmpyId = options.cmpyId
    columnId = options.columnId
    if (options.style=='edit'){
      that.detailFun();
    }
  },
  detailFun:function(){
    let url ='/weiwebsite/mobile/moduleproduct/info.action'
    let data = { productId: options.productId}
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == '100') {
        var content = data.data.moduleTextImg;
        var productContent='';
        var productImgdata=[];
        for (var i = 0; i < content.length;i++){
          if (content[i].contentType=='1'){
            productContent = content[i].content
          }
          if (content[i].contentType == '2') {
            productImgdata = content[i].imgContent
          }
        }
        that.setData({
          bannerUrl: data.data.moduleProduct.productImg,  //产品banner
          productName: data.data.moduleProduct.productName,//产品名称
          productPriceMin: data.data.moduleProduct.amountMin, //产品价格最小
          productPriceMax: data.data.moduleProduct.amountMax,//产品价格最大
          productImg: productImgdata,  //产品图片
          productContent: productContent, //产品描述
          finish: true,
        })
      }else{
         console.log('编辑')
      }
    })
  },
  //上传banner图片
  bannerUp: function (e) {
    utils.upImg(function (url) {
      console.log(url)
      that.setData({
        bannerUrl: url,
      })
      that.finishFun();
    })
  },
  //获取产品名称
  productNameGet: function (e) {
    that.setData({
      productName: e.detail.value,
    })
    that.finishFun();
  },
  //获取产品价格 最小
  productPriceMinGet: function (e) {
    that.setData({
      productPriceMin: e.detail.value,
    })
    that.finishFun();
  },
  //获取产品价格 最大
  productPriceMaxGet: function (e) {
    that.setData({
      productPriceMax: e.detail.value,
    })
    that.finishFun();
  },
  //上传产品图片
  imgUp: function (e) {
    console.log(that.data.productImg)
    utils.upImg(function (url) {
      that.setData({
        productImg: that.data.productImg.concat(url),
      })
      console.log(url)
      console.log(that.data.productImg)
    })
  },
  //更换产品图片
  changeImg:function(e){
    let index = e.currentTarget.dataset.index;
    utils.upImg(function (url) {
      var productImg = that.data.productImg
      productImg[index] = url
      that.setData({
        productImg: productImg,
      })
    })
  },
  //产品描述
  productContent:function(e){
    that.setData({
      productContent: e.detail.value,
    })
  },
  //判断是否输入必填字段
  finishFun:function(){
    let productName = that.data.productName;
    let bannerImg = that.data.bannerUrl;    //封面banner图
    let amountMin = that.data.productPriceMin;
    let amountMax = that.data.productPriceMax;
    if (productName != '' && bannerImg != '' && (amountMin != '' || amountMax!="") ){
      that.setData({ finish: true})
    }else{
      that.setData({ finish: false })
    }
  },
  //保存
  save:function(){
    if (that.data.finish){
      let productName = that.data.productName;
      let bannerImg = that.data.bannerUrl;    //封面banner图
      let amountMin= that.data.productPriceMin;
      let amountMax = that.data.productPriceMax;
      let productImg = that.data.productImg;      //产品图片
      let productImg_='';
      if (productImg!=''){
        for (var i = 0; i < productImg.length;i++){
          productImg_ = productImg_ + productImg[i]+','
        }
      }
      let contents = that.data.productContent + "@,@" + productImg_;  //内容详情 不同内容用|@|分隔
      let contentTypes ='1,2'  //contentTypes:1-文本 2-图片 3-视频
      let url,data;
      if (options.style == 'edit'){  //编辑保存
        url = '/weiwebsite/mobile/moduleproduct/update.action'
        data = { productId:options.productId,productName: productName, productImg: bannerImg, amountMin: amountMin, amountMax: amountMax, contents: contents, contentTypes: contentTypes, type: '3' }
      }else{  //添加保存
        url = '/weiwebsite/mobile/moduleproduct/save.action'
        data = { cmpyId: cmpyId, columnId: columnId, productName: productName, productImg: bannerImg, amountMin: amountMin, amountMax: amountMax, contents: contents, contentTypes: contentTypes, type: '3' }
      }
      utils.request(url, data, '1', '2', function (data) {
        if (data.status == '100') {
          wx.showToast({ title: '保存成功', })
          wx.navigateBack();
          // wx.redirectTo({ url: '../../../wh/pages/productDetails/productDetails' })
        } else {
          utils.tipFun("", '保存失败，请稍后再试！', false, function () { })
        }
      })
    }else{
      utils.tipFun("", '请输入完整的产品信息哦！', false, function () { })
    }
  },
  onReady: function () {
  }
})