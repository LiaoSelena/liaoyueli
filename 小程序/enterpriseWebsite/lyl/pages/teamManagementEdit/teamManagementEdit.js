// lyl/pages/teamManagementEdit/teamManagementEdit.js
var utils = require('../../utils/util.js');
var that, options, columnId, cmpyId;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:'http://q.img.soukong.cn/website/lyl/79_mrteam.png',//照片路径
    userName:'', //用户名字
    userJob:'',  //用户职位
    style:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that=this;
    options = options;
    columnId = options.columnId
    cmpyId = options.cmpyId
    if (options.style=="add"){
      that.setData({
        style: 'add',
        tipName: '请输入姓名', 
        tipJob: '请输入职位',  
      })
    } else if (options.style == "edit"){
      that.setData({
        imgUrl: options.img,//照片路径
        userName: options.name, //用户名字
        userJob: options.job,  //用户职位
        tipName: options.name,
        tipJob: options.job, 
        style: 'edit',
        teamId: options.teamId,
      })
    }
  },
  //获取名字
  getUserName:function(e){
    that.setData({
      userName: e.detail.value,
    })
  },
  //获取职位
  getUserJob: function (e) {
    that.setData({
      userJob: e.detail.value,
    })
  },
  btnTeam:function(e){
    var userName = that.data.userName
    var imgUrl = that.data.imgUrl
    var userJob = that.data.userJob
    if (userName == "" || userJob == "") {
      utils.tipFun("", "请输入完整的信息", false, function () { })
    } else {
      let url,data;
      if (that.data.style == 'add') {
        //添加成员
        url = '/weiwebsite/mobile/moduleteam/addTeam.action'
        data = { columnId: columnId, cmpyId: cmpyId, userName: userName, img: imgUrl, userJob: userJob }
      }else{
        //编辑成员
        url = '/weiwebsite/mobile/moduleteam/updateTeam.action'
        data = { teamId: that.data.teamId, userName: userName, img: imgUrl, userJob: userJob }
      }
      utils.request(url, data, '1', '1', function (data) {
        if (data.status == "100") {
          wx.showToast({ title: '保存成功', })
          wx.navigateBack();
        } else {
          utils.tipFun("", "保存失败", false, function () { })
        }
      })
    }
  },
  //更改照片
  changePhoto:function(){
    utils.upImg(function(url){
      console.log(url)
      that.setData({
        imgUrl: url,
      })
    })
  }
})