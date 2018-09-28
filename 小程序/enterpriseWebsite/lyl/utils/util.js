const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const app = getApp();
function request(url, data, method, header, callBack) {
  var urldata = app.globalData.domainName + url;
  var methodData = 'GET';
  var headerData = 'application/json';
  if (method == '1') {
    methodData = methodData;
  } else if (method == '2') {
    methodData = 'POST';
  }
  if (header == '1') {
    headerData = headerData;
  } else if (headerData == '2') {
    headerData = 'application/x-www-form-urlencoded';
  }
  wx.request({
    url: urldata,
    data: data,
    method: methodData,
    header: {
      'content-type': headerData
    },
    success: function (res) {
      callBack(res.data);
    },
    fail: function (error) {
      callBack('error');
    }
  })
}
//上传图片
function upImg(callBack){
  wx.chooseImage({
    count: 1,
    sizeType: ['compressed', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    success: function (res) {
      wx.showLoading({ title: '图片上传中...', })
      var tempFilePaths = res.tempFilePaths
      wx.uploadFile({
        url: app.globalData.domainName + '/weiwebsite/mobile/upload/image.action',
        filePath: tempFilePaths[0],
        name: 'uploadFiles',
        formData: null,
        success: function (res) {
          var data = JSON.parse(res.data)
          wx.hideLoading();
          if (data.status == '100') {
            callBack(data.data.url)
          } else {
            tipFun("", data.msg, false, function () { })
          }
        }
      })
    }
  })
}
//上传视频
function upVideo(callBack){
  wx.chooseVideo({
    sourceType: ['album', 'camera'],
    maxDuration: 60,
    camera: 'back',
    compressed: true,
    success: function (res) {
      wx.showLoading({ title: '视频上传中...', })
      wx.uploadFile({
        url: app.globalData.domainName + '/weiwebsite/mobile/upload/media',
        filePath: res.tempFilePath,
        name: 'uploadFiles',
        formData: null,
        success: function (res) {
          var data = JSON.parse(res.data)
          wx.hideLoading();
          if (data.status == '100') {
            callBack(data.data.url)
          } else {
            tipFun("", data.msg, false, function () { })
          }
        }
      })
    }
  })
}
//提示框  标题 内容 是否展示取消按钮 执行函数
function tipFun(title, tip, showCancel, fun) {
  wx.showModal({
    title: title,
    content: tip,
    showCancel: showCancel,
    confirmColor: "#4fb1fc",
    success: function (res) {
      if (res.confirm) {
        fun();
      }
    }
  })
}
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
//地址选取
function split(_address, name) {
  let regex = /^(北京市|天津市|重庆市|上海市|香港特别行政区|澳门特别行政区)/
  let pro = []
  let addressBean = {
    pro: null,
    city: null,
    address: null
  }
  function regexAddressBean(_address, addressBean) {
    regex = /^(.*?[市州]|.*?地区|.*?特别行政区)(.*?)$/g
    let addxress = regex.exec(_address)
    addressBean.city = addxress[1]
    addressBean.address = addxress[2] + '(' + name + ')'
  }
  if (!(pro = regex.exec(_address))) {
    regex = /^(.*?(省|自治区))(.*?)$/
    pro = regex.exec(_address)
    addressBean.pro = pro[1]
    regexAddressBean(pro[3], addressBean)
  } else {
    addressBean.pro = pro[1]
    regexAddressBean(_address, addressBean)
  }
  return addressBean
}
module.exports = {
  request: request,
  tipFun: tipFun,
  upImg: upImg,
  upVideo: upVideo,
  iphone6Size: iphone6Size,
  split: split,
  formatTime: formatTime
}
