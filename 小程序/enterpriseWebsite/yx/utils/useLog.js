const app = getApp()

function log(userId, cmpyId){
  wx.request({
    url: app.globalData.domainName + '/weiwebsite/mobile/userloginfo/useLog',
    method: 'GET',
    data: { 'userId': userId, 'cmpyId': cmpyId},
    success: res => {
      if (res.data.status=='100'){
        
      }else{
        console.info('----记录用户访问过的微官网接口报错原因： ' + res.data.msg)
      }
    }
  })
}

module.exports = {
  log : log
}