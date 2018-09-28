// pages/officialNetworkSearch/officialNetworkSearch.js
var utils = require('../../utils/util.js');
var that, options, flag = true, columnId, cmpyId;
var userId = '1';
Page({
  data: {
    searchVal: '',         //搜索值
    serchCloaseIs: false,  //搜索状态
    cmpyData: [],
    emptyIs: false,   //搜索不到内容
    page: 1,
    rows: 5,
    flags: { 'inShow': false },
    height: 0,
    list: [],
    transition: ''
  },
   myData: {
    flag: true
  },
  onLoad: function (option) {
    that = this;
    options = option
    columnId = options.columnId
    cmpyId = options.cmpyId
    // wx.setNavigationBarTitle({ title: '栏目菜单设置' })
    //计算高度
    utils.iphone6Size([205], height => {
      this.setData({ height: height })
    })
    wx.showLoading({title: '加载中...',})
  },
  onShow: function () {
    that.setData({
      list: [],
      'flags.inShow': false,
      page: 1,
      rows: 5,
    })
    that.listFun("first");
  },
  onReady: function () {
  },
  //列表
  listFun:function(ly){
    flag = false;
    let url = '/weiwebsite/mobile/moduleteam/TeamList.action'
    let data = { columnId: columnId, cmpyId: cmpyId, userName: that.data.searchVal, page:that.data.page,rows:that.data.rows }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        wx.hideLoading();
        let list = data.data
        if (ly == 'search' && list == ''){
          that.setData({ emptyIs:true})
        } else if (ly == 'first' && list == ''){
          that.setData({ emptyIs: true })
        }else{
          that.setData({ emptyIs: false })
        }
        if (list!=''){
          flag = true;
          that.setData({
            list: that.data.list.concat(list),
            'flags.inShow': true,
          })
          var listLong=that.data.list
          for (let i = 0; i < listLong.length; i++) {
            listLong[i].top = i * 334
            listLong[i].index = i
          }
          that.setData({
            list: listLong,
            'flags.inShow': true,
          })
          console.log(that.data.list);
        }
      } else {
        utils.tipFun("", data.msg, false, function () { })
      }
    })
  },
  //搜索-获取搜索框值
  searchValFun: function (e) {
    let searchInput = e.detail.value;
    if (searchInput != '') {
      that.setData({
        serchCloaseIs: true,
        searchVal: searchInput,
      })
    }

  },
  //搜索-点击搜索
  searchFun: function () {
    let searchVal = that.data.searchVal;
    that.setData({
      searchVal: searchVal,
      page: 1,
      rows: 5,
      flags: { 'inShow': false },
      list: [],
      transition: ''
    })
    that.listFun('search');
  },
  //搜索-取消搜索
  searchColseFun: function () {
    that.setData({
      serchCloaseIs: false,
      searchVal: '',
      page: 1,
      flags: { 'inShow': false },
      list: [],
      transition: '',
    })
    that.listFun();
  },
  //下移
  down: function (e) {
    if (that.myData.flag) {
      this.myData.flag = false
      let index = e.currentTarget.dataset.i
      let moveIndex = e.currentTarget.dataset.i + 1
      that.move(index, moveIndex,"2")
    }
  },
  //上移
  up: function (e) {
    if (that.myData.flag) {
      this.myData.flag = false
      let index = e.currentTarget.dataset.i
      let moveIndex = e.currentTarget.dataset.i - 1
      that.move(index, moveIndex,"1")

    }
  },
  //移动方法
  move: function (index, moveIndex,type_) {
    let list = that.data.list
    let newList = list
    let top = list[index].top
    let moveTop = list[moveIndex].top
    let url = '/weiwebsite/mobile/moduleteam/sortTeam.action'
    let data = { teamId: list[index].teamId, moveteamId: list[moveIndex].teamId, type: type_ }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        //移动
        newList[index].top = moveTop
        newList[moveIndex].top = top
        that.setData({ list: newList, transition: 'transition' })
        setTimeout(res => {
          let list = that.data.list
          let length = list.length
          let newList = []
          for (let i = 0; i < length; i++) {
            let obj = {
              'userName': list[i].userName,
              'img': list[i].img,
              'userJob': list[i].userJob,
              'teamId': list[i].teamId,
              'top': i * 334,
              'index': i
            }
            if (i == index) {
              obj.userName = list[moveIndex].userName
              obj.img = list[moveIndex].img
              obj.userJob = list[moveIndex].userJob
              obj.teamId = list[moveIndex].teamId
            }
            if (i == moveIndex) {
              obj.userName = list[index].userName
              obj.img = list[index].img
              obj.userJob = list[index].userJob
              obj.teamId = list[index].teamId
            }
            newList.push(obj)
          }
          console.log(newList)
          that.setData({ list: newList, transition: '' })
          that.myData.flag = true
        }, 600)
      } else {
        utils.tipFun("", "移动失败！请稍后再试！", false, function () { })
      }
    })
  },
  //去编辑 新增
  goEdit: function (e) {
    let type_ = e.currentTarget.dataset.type
    let urlData = 'columnId=' + columnId + '&cmpyId=' + cmpyId
    if (type_=="add"){
      wx.navigateTo({
        url: '../teamManagementEdit/teamManagementEdit?style=add&' + urlData
      })
    }else{
      var name = e.currentTarget.dataset.name
      var job = e.currentTarget.dataset.job
      var img = e.currentTarget.dataset.img
      var teamId = e.currentTarget.dataset.teamid
      wx.navigateTo({
        url: '../teamManagementEdit/teamManagementEdit?style=edit&name=' + name + "&job=" + job + '&img=' + img + '&teamId=' + teamId + '&'+urlData
      })
    }
  },
  //删除成员
  deleteFun:function(e){
    let teamId = e.currentTarget.dataset.teamid
    let index = e.currentTarget.dataset.index
    console.log(index)
    let url = '/weiwebsite/mobile/moduleteam/delTeam.action'
    let data = { teamId: teamId }
    utils.tipFun("", "确定删除吗？", true, function () {
      utils.request(url, data, '1', '1', function (data) {
        if (data.status == "100") {
           wx.showToast({ title: '删除成功',})
           var list=that.data.list;
           list.splice(index, 1);
           for (var i = 0; i < list.length;i++){
             list[i].top = i * 334
             list[i].index = i
           }
           console.log(list)
           that.setData({
             list: list,
           })
        }
      })
    })
  },
  //下拉加载
  lower:function(){
    if (flag) {
      that.setData({
        page: that.data.page + 1
      })
      that.listFun();
    }
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
     console.log("ok");
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})