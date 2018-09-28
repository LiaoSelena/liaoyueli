// lyl/pages/partnerEdit/partnerEdit.js
var utils = require('../../utils/util.js');
var that, columnId, cmpyId, options	;
Page({
  data: {
    box:false,
    style:'',
    logoUrl: 'http://q.img.soukong.cn/website/lyl/icon_Uploadlogo.png',  //logo图片
    logoDelete:false,    //删除按钮的展示
    logoArr: [{ name: '', logoUrl: 'http://q.img.soukong.cn/website/lyl/icon_Uploadlogo.png', logoDelete: false,itemsDelete:false }],
  },
  onLoad: function (option) {
    that=this;
    options = option;
    columnId = options.columnId;
    cmpyId = options.cmpyId
    console.log(options)
    if (options.style =='edit'){
        wx.showLoading({ title: '加载中...', })
        that.editDetail();
    }else{
      that.setData({ box: true, style:'add'})
    }
  },
  //编辑详情
  editDetail:function(){
    let url = '/weiwebsite/mobile/modulepartner/info.action'
    let data = { partnerId: options.partnerId}
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == '100') {
        var mainData = data.data
        var logoArr = that.data.logoArr;
        logoArr[0].name = mainData.partnerName
        logoArr[0].logoUrl = mainData.partnerLogo
        logoArr[0].logoDelete = true
        that.setData({
          logoArr: logoArr,
          box: true,
          style: 'edit'
        })
        wx.hideLoading();
      }
    })
  },
  //获取名字
  partnerName:function(e){
    let index = e.currentTarget.dataset.index;
    let name = e.detail.value;
    var logoArr = that.data.logoArr
    logoArr[index].name = name
    //判断是否填写完整 显示删除按钮
    that.finished(index);
    that.setData({
      logoArr: logoArr,
    })
  },
  //上传图片
  logoUp:function(e){
    let index = e.currentTarget.dataset.index;
    utils.upImg(function(url){
      var logoArr = that.data.logoArr
      logoArr[index].logoUrl = url
      logoArr[index].logoDelete = true
      //判断是否填写完整 显示删除按钮
      that.finished(index);
      that.setData({
        logoArr: logoArr,
      })
    })
  },
  //删除logo
  logoDelete:function(e){
    let index = e.currentTarget.dataset.index;
    var logoArr = that.data.logoArr
    logoArr[index].logoUrl = 'http://q.img.soukong.cn/website/lyl/icon_Uploadlogo.png'
    logoArr[index].logoDelete = false
    //判断是否填写完整 显示删除按钮
    that.finished(index);
    that.setData({ logoArr: logoArr, })
  },
  //判断是否填写完整 显示删除按钮
  finished:function(index){
    var logoArr = that.data.logoArr
    if (index>0){
      if (logoArr[index].name != '' && logoArr[index].logoDelete == true && options.style == "add") {
        logoArr[index].itemsDelete = true
      } else {
        logoArr[index].itemsDelete = false
      }
    }
    
  },
  //添加合作伙伴
  addItems: function () {
    var arr = { name: '', logoUrl: 'http://q.img.soukong.cn/website/lyl/icon_Uploadlogo.png', logoDelete: false, itemsDelete: false  }
    that.setData({ logoArr: that.data.logoArr.concat(arr)})
  },
  //删除合作伙伴
  deleteItems:function(e){
    let index = e.currentTarget.dataset.index;
    var logoArr = that.data.logoArr
    logoArr.splice(index,1);
    that.setData({ logoArr: logoArr })
  },
  //保存
  saveFun:function(){
    var partnerName='', partnerLogo='';
    var logoArr = that.data.logoArr
    for (var i = 0; i < logoArr.length;i++){
      if (logoArr[i].name != '' && logoArr[i].logoUrl !='http://q.img.soukong.cn/website/lyl/icon_Uploadlogo.png'){
        if (options.style == 'add') {
          partnerName = partnerName + logoArr[i].name + ','
          partnerLogo = partnerLogo + logoArr[i].logoUrl + ','
        }else{
          partnerName = partnerName + logoArr[i].name
          partnerLogo = partnerLogo + logoArr[i].logoUrl
        }
      }
    }
    if (partnerName != '' && partnerLogo!=''){
      let url,data;
      if(options.style=='add'){
        url = '/weiwebsite/mobile/modulepartner/save.action'
        data = { columnId: columnId, cmpyId: cmpyId, partnerName: partnerName, partnerLogo: partnerLogo }
      }else{
        url = '/weiwebsite/mobile/modulepartner/update.action'
        data = { partnerId: options.partnerId,columnId: columnId, cmpyId: cmpyId, partnerName: partnerName, partnerLogo: partnerLogo }
      }
      utils.request(url, data, '1', '1', function (data) {
        if (data.status=='100'){
          wx.showToast({ title: '保存成功', })
          wx.navigateBack({ url: '../partner/partner' })
        }else{
          utils.tipFun("", '保存失败，请稍后再试！', false, function () { })
        }
      })
    }else{
      utils.tipFun('','请填写完整信息！',false,function(){})
    }
    
  },
  onReady: function () {
  
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})