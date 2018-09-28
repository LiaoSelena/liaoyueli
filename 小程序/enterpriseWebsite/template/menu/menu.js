const app = getApp()

//底部菜单data
function data(callBack){
  let menu = {
    'flags': { 'hide': true, 'left': false, 'right': false, 'delete': false },
    'list': [],
    'run': { 'rotate': '', 'left': '' },
    'l':5,
    'appId':'',
    'xcxUrl':''
  }
  if (callBack) callBack(menu)
}

//底部菜单加载
function load(cmpyId,callBack){
  wx.showLoading({ title: '加载中...' })
  wx.request({
    url: app.globalData.domainName + '/weiwebsite/mobile/cmpymeun/list.action',
    method: 'GET',
    data: { 'cmpyId': cmpyId },
    success: res => {
      wx.hideLoading()
      if (res.data.status=='100'){
        let list = res.data.data
        let length = list.length
        let newList = []
        let l = 4
        if (length > 0) {
          for (let i = 0; i < length; i++) {
            if (list[i].type == 2) l = 5
            let obj = {
              'id': list[i].menuId,
              'index': i,
              'name': list[i].menuName,
              'active': false,
              'type': list[i].type,
              'objectId': list[i].objectId,
              'company': list[i].cmpyId,
              'moduleType': list[i].moduleType,
              'mapId': list[i].mapId,
              'mediaId': list[i].mediaId,
              'unionCmpyId': list[i].unionCmpyId,
              'appId': list[i].appId,
              'columnId': list[i].columnId
            }
            newList.push(obj)
          }
        }
        if (callBack) callBack(newList,l)
      }else{
        wx.showModal({
          title: '提示',
          content: res.data.msg,
          showCancel: false
        })
      }
    }
  })
}

//底部菜单跳转
function link(e){
  let that=this
  let dataset = e.currentTarget.dataset
  console.info(dataset)
  if (dataset.from=='pre'){
      switch (dataset.type){
        case 1:
          //跳转首页预览
          wx.reLaunch({ url: '/wh/pages/previewHome/previewHome?cmpyId=' + dataset.company })
          break
        case 2:
          //跳转共享蜂商联营店
          wx.navigateToMiniProgram({
            appId: dataset.appid,
            path: 'pages/index/index?unionCmpyId=' + dataset.union+'',
            envVersion: app.globalData.minPro.v
          })
          break
        case 3:
          //跳转栏目
          //(功能模块 1-图文类型 2-资讯类型 3-招聘模板 4-合作伙伴 5-企业产品 6-管理团队 7-地图模板 8-领军人物)
          console.info(dataset.mtype)
          switch (dataset.mtype) {
            case 1:
              //图文模板
              wx.navigateTo({ url: '/wh/pages/attractInvestment/attractInvestment?cmpyId=' + dataset.company + '&columnId=' + dataset.obj + '' })
              break
            case 2:
              //资讯模板
              wx.navigateTo({ url: '/wh/pages/informationList/informationList?cmpyId=' + dataset.company + '&columnId=' + dataset.obj + '&from=pre' })
              break
            case 3:
              //招聘模板
              wx.navigateTo({ url: '../../../lyl/pages/joinUs/joinUs?cmpyId=' +dataset.company+ '&columnId=' + dataset.obj + '&from=pre&style=detail' })
              break
            case 4:
              //合作伙伴模板
              wx.navigateTo({ url: '../../../lyl/pages/partner/partner?style=&columnId=' + dataset.obj + '&cmpyId=' + dataset.company+'' })
              break
            case 5:
              //产品模板
              wx.navigateTo({ url: '/wh/pages/productList/productList?cmpyId=' + dataset.company + '&columnId=' + dataset.obj + '&from=pre' })
              break
            case 6:
              //管理团队模板
              wx.navigateTo({ url: '../../../lyl/pages/team/team?columnId=' + dataset.obj + '&cmpyId=' + dataset.company+'' })
              break
            case 7:
              //联系我们模板
              wx.navigateTo({ url: '../../../lyl/pages/contactUsDeail/contactUsDeail?mapId=' + dataset.mapid+'' })
              break
            case 8:
              //领军人物模板
              wx.navigateTo({ url: '../../../lyl/pages/personDetail/personDetail?columnId=' + dataset.obj + '&cmpyId=' + dataset.company+'' })
              break
          }
          break
        case 4:
          //跳转资讯
          wx.navigateTo({
            url: '/wh/pages/informationPreview/informationPreview?cmpyId=' + dataset.company + '&columnId=' + dataset.columnid + '&id=' + dataset.obj +'&state=1&from=pre' })
          break
      }
  }
}

module.exports = {
  data: data,
  load: load,
  link: link
}