 const app = getApp()
//封装微信显示加载效果
function showLoading(_tip) {
  let tip = '加载中...'
  if (_tip) tip = _tip
  wx.showLoading({ title: tip })
}
//封装微信请求接口方法
function ajax(_url, _method, _data, callBack) {
  wx.request({
    url: app.globalData.domainName + _url,
    method: _method,
    data: _data,
    success: res => {
      if (callBack) callBack(res.data)
    }
  })
}
//封装微信请求接口方法2
function ajax2(_url, _method, _data, callBack) {
  wx.request({
    url: app.globalData.domainName + _url,
    method: _method,
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    data: _data,
    success: res => {
      if (callBack) callBack(res.data)
    }
  })
}
function recordAjax(_method, _data, callBack) {
  wx.request({
    url: app.globalData.domainName + '/weiwebsite/mobile/userloginfo/useLog',
    method: _method,
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    data: _data,
    success: res => {
      if (callBack) callBack(res.data)
    }
  })
}
//封装接口报错判断
function status(data, callBack) {
  if (data.status == '100') {
    if (callBack) callBack(data)
  } else {
    wx.showModal({
      title: '提示',
      content: data.msg,
      showCancel: false
    })
  }
}
//封装接口报错判断2
function code(data, callBack) {
  if (data.header.code == '100') {
    if (callBack) callBack(data)
  } else {
    wx.showModal({
      title: '提示',
      content: data.header.message,
      showCancel: false
    })
  }
}
//封装接口报错判断3
function status2(tip, data, callBack) {
  if (data.status == '100') {
    if (callBack) callBack(data)
  } else {
    console.info('---' + tip + '---接口报错原因:' + data.msg)
  }
}
//封装微信弹框
function modal(obj, callBack) {
  let showCancel = false
  if (obj.showCancel) showCancel = obj.showCancel
  wx.showModal({
    title: '提示',
    content: obj.tip,
    showCancel: showCancel,
    success: res => {
      if (callBack) callBack(res)
    }
  })
}
//封装计算尺寸比例
function iphone6Size(sizes, callBack) {
  let result = []
  let length = sizes.length
  wx.getSystemInfo({
    success: res => {
      for (let i = 0; i < length; i++) {
        result.push(res.windowHeight - res.windowWidth * sizes[i] / 750)
      }
      if (callBack) callBack(result)
    }
  })
}
//封装动态获取高度
function getHeight(_class, callBack) {
  let query = wx.createSelectorQuery()
  query.selectAll(_class).boundingClientRect(function (rects) {
    let array = []
    rects.forEach(function (rect) {
      array.push(rect.height)
    })
    callBack(array)
  }).exec()
}
//封装logo点击效果
function logoClick() {
  console.info(1);
  wx.navigateTo({
    url: '../../../pages/support/support',
  })
}
function menuMove(index, moveIndex) {
  let list = this.data.menu.list
  let length = list.length
  let newList = []
  let data = list[index]
  for (let i = 0; i < length; i++) {
    let obj = {
      'id': list[i].id,
      'index': i,
      'name': list[i].name,
      'active': false
    }
    if (i == index) {
      obj.id = list[moveIndex].id
      obj.name = list[moveIndex].name
    }
    if (i == moveIndex) {
      obj.id = list[index].id
      obj.name = list[index].name
    }
    newList.push(obj)
  }
  this.setData({ 'menu.run.rotate': '', 'menu.run.left': '', 'menu.list': newList })
}
module.exports = {
  showLoading: showLoading,
  ajax: ajax,
  ajax2: ajax2,
  status: status,
  code: code,
  modal: modal,
  iphone6Size: iphone6Size,
  logoClick:logoClick,
  status2: status2,
  recordAjax: recordAjax,
  getHeight: getHeight
}