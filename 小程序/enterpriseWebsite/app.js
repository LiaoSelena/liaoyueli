App({
  globalData: {
    domainName: 'https://xcx.yc.soukong.cn',  //测试环境域名
    // domainName:'https://weiwebsite.soukong.com',  //正式环境域名
    appId: 'wx725ccb3359ac796d',
    sessionKey: '',
    //用户信息
    info: {
      'userId': '',
      'openId':''
    },
    //企业信息
    company: {
      'id':'',
      'simpCmpyName':'',  //简称
      'industry':'',  //行业
      'logoUrl':'',
      'overTime':'',  //过期日期
      'phone':'',  //企业电话
    },
    servicePhone: '',  //客服电话
    minPro:{
      'v': 'develop'  //打开小程序版本 develop=>开发版 trial=>体验版 release=>正式版
    }
  }
})