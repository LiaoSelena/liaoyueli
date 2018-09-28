// lyl/pages/addPost/addPost.js
var utils = require('../../utils/util.js');
var that;
var options,columnId, cmpyId, recruitId
Page({
  data: {
    educationArray: ['请选择学历', '中专及以下', '高中', '大专','本科','本科以上'], //学历选择
    educationIndex:0,
    MoneyArray: ['请选择薪资', '1000以下', '1000-2000', '2001-4000', '4001-6000', '6001-8000', '8001-10000', '10001-15000', '15001-25000', '25001-35000', '35001-50000', '50001-70000', '70001-100000', '100000以上','面议'], //薪资选择
    moneyIndex: 0,
    timeArray: [['00：00', '00：30', '01：00', '01：30', '02：00', '02：30', '03：00', '03：30', '04：00', '04：30', '05：00', '05：30', '06：00', '06：30', '07：00', '07：30', '08：00', '08：30', '09：00', '09：30', '10：00', '10：30', '11：00', '11：30', '12：00', '12：30', '13：00', '13：30', '14：00', '14：30', '15：00', '15：30', '16：00', '16：30', '17：00', '17：30', '18：00', '18：30', '19：00', '19：30', '20：00', '20：30', '21：00', '21：30', '22：00', '22：30', '23：00', '23：30'], ['00：00', '00：30', '01：00', '01：30', '02：00', '02：30', '03：00', '03：30', '04：00', '04：30', '05：00', '05：30', '06：00', '06：30', '07：00', '07：30', '08：00', '08：30', '09：00', '09：30', '10：00', '10：30', '11：00', '11：30', '12：00', '12：30', '13：00', '13：30', '14：00', '14：30', '15：00', '15：30', '16：00', '16：30', '17：00', '17：30', '18：00', '18：30', '19：00', '19：30', '20：00', '20：30', '21：00', '21：30', '22：00', '22：30', '23：00', '23：30']],  //工作时间选择
    timeIs: false,
    timeIndex:[],
    address:'请选择地址',
    addrssIs:false,
    finishIs:false, //是否完成必填项目
    postName:'',    //职务
    postExperience:'',  //工作经验
    postDuty:'',     //岗位职责
    postAsk:'',      //任职要求
    cmpyWelfare:'',   //公司福利
    cityname:'',  //城市名称
  },
  onLoad: function (option) {
    that=this;
    options = option
    columnId = options.columnId
    cmpyId = options.cmpyId
    recruitId = options.recruitId  //招聘信息id
    console.log(options)
    if (options.style == 'edit') {   //编辑
      that.getDetail(); //获取详情
    }
  },
  //获取详情
  getDetail:function(){
    let url = '/weiwebsite/mobile/modulerecruitjob/selectModuleRecruitjobDetails.action'
    let data = { id: options.id }
    utils.request(url, data, '1', '1', function (data) {
      if (data.status == "100") {
        var detailData=data.data;
        var timeIndex=[];
        
        if (detailData.workTimeSubscript && detailData.workTimeSubscript != '[]' && detailData.workTimeSubscript != ''){
          console.log(detailData.workTimeSubscript)
          var workTimeSubscript = detailData.workTimeSubscript.split(",")
          for (var i = 0; i < workTimeSubscript.length;i++){
            timeIndex.push(workTimeSubscript[i])
          }
          console.log(timeIndex)
          that.setData({
            timeIs: true,
          })
        }else{
          that.setData({
            timeIs: false,
          })
        }
        that.setData({
          postName: detailData.jobName,    //职务
          postExperience: detailData.workYeas,  //工作经验
          postDuty: detailData.jobDuty,     //岗位职责
          postAsk: detailData.jobRequire,      //任职要求
          cmpyWelfare: detailData.cmpyWelfare,   //公司福利
          address: detailData.workAddress,
          addrssIs: true,
          educationIndex: detailData.educationSubscript,
          educationIs: true,
          moneyIndex: detailData.amountMaxSubscript,
          MoneyIs: true,
          timeIndex: timeIndex,
          cityname: detailData.cityName
        })
        that.finishFun();
      }
    })
  },
  //职务
  postNameGet:function(e){
    that.setData({
      postName: e.detail.value,
    })
    that.finishFun();
  },
  //工作经验
  postExperienceGet: function (e) {
    that.setData({
      postExperience: e.detail.value,
    })
    that.finishFun();
  },
  //岗位职责
  postDutyGet: function (e) {
    console.log(e.detail.value);
    that.setData({
      postDuty: e.detail.value,
    })
    that.finishFun();
  },
  //任职要求
  postAskGet: function (e) {
    that.setData({
      postAsk: e.detail.value,
    })
    that.finishFun();
  },
  //公司福利
  cmpyWelfare: function (e) {
    that.setData({
      cmpyWelfare: e.detail.value,
    })
  },
  //学历选择
  educationPick: function (e) {
    if (e.detail.value > 0) {
      this.setData({
        educationIs: true,
      })
    } else {
      this.setData({
        educationIs: false,
      })
    }
    this.setData({
      educationIndex: e.detail.value
    })
    that.finishFun();
  },
  //薪资选择
  moenyPick: function (e) {
    if (e.detail.value > 0) {
      this.setData({
        MoneyIs: true,
      })
    } else {
      this.setData({
        MoneyIs: false,
      })
    }
    this.setData({
      moneyIndex: e.detail.value
    })
    that.finishFun();
  },
  //判断是否完成必填项
  finishFun:function(){
    if (that.data.postName != '' && that.data.postExperience != '' && that.data.educationIndex != 0 && that.data.moneyIndex != 0 && that.data.postDuty != '' && that.data.postAsk != '') {
      that.setData({finishIs: true})
    }else{
      that.setData({ finishIs: false})
    }
  },
  //工作时间选择
  bindMultiPickerChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      timeIs:true,
      timeIndex: e.detail.value
    })
  },
  //选择位置
  chooseAddressOne:function(){
    console.log("ok")
    wx.chooseLocation({
      success: res => {
        if (res.address && res.name) {
          let split = utils.split(res.address, res.name)
          that.setData({ address: res.address, addrssIs: true, cityname: split.city })
          // this.myData.map = { 'pro': split.pro, 'city': split.city, 'area': split.area }
        } else {
          utils.tipFun('', '抱歉，未能获取地址，请重新选择！', false, function () { })
        }
      }, fail: function (res) {
        wx.openSetting({
          success: (res) => {
          }
        })
      }
    })
  },
  //保存
  saveFun:function(){
    if (that.data.finishIs){
      let url,data;
      var postName = that.data.postName    //职务  
      var postExperience = that.data.postExperience   //工作经验
      var educationSubscript = that.data.educationIndex;//学历下标
      var education = that.data.educationArray[educationSubscript]  //学历
      var amountMaxSubscript = that.data.moneyIndex //薪资下标
      var amountMax = that.data.MoneyArray[amountMaxSubscript]   //薪资
      var postDuty = that.data.postDuty    //岗位职责
      var postAsk = that.data.postAsk     //任职要求
      var cmpyWelfare = that.data.cmpyWelfare;  //公司福利
      var timeArray = that.data.timeArray
      var timeIndex = that.data.timeIndex 
      var workTimeSubscript='' 
      var workTime = ''
      if (timeIndex!=''){
        workTimeSubscript = timeIndex[0] + ',' + timeIndex[1]  //工作时间下标
        workTime = timeArray[0][timeIndex[0]] + '-' + timeArray[1][timeIndex[1]];     //工作时间
      }
      var address = that.data.address;  //工作地址
      if (options.style == 'edit'){
        url ='/weiwebsite/mobile/modulerecruitjob/updateModuleRecruitjob.action'
        data = { id: options.id, columnId: columnId, cmpyId: cmpyId, recruitId: recruitId, jobName: postName, workYeas: postExperience, education: education, amountMax: amountMax, amountMin: amountMax, jobDuty: postDuty, jobRequire: postAsk, cmpyWelfare: cmpyWelfare, workTime: workTime, workAddress: address, educationSubscript: educationSubscript, amountMaxSubscript: amountMaxSubscript, workTimeSubscript: workTimeSubscript, cityName: that.data.cityname}
      }else{
        url = '/weiwebsite/mobile/modulerecruitjob/addModuleRecruitjob.action'
        data = { columnId: columnId, cmpyId: cmpyId, recruitId: recruitId, jobName: postName, workYeas: postExperience, education: education, amountMax: amountMax, amountMin: amountMax, jobDuty: postDuty, jobRequire: postAsk, cmpyWelfare: cmpyWelfare, workTime: workTime, workAddress: address, educationSubscript: educationSubscript, amountMaxSubscript: amountMaxSubscript, workTimeSubscript: workTimeSubscript, cityName: that.data.cityname }
      }
      utils.request(url, data, '1', '1', function (data) {
        if (data.status == "100") {
          wx.showToast({ title: '保存成功', })
          wx.navigateBack()
        }else{
          utils.tipFun("", data.msg, false, function () { })
        }
      })
    }else{
      utils.tipFun("", "请输入必填字段！", false, function () { })
    }
  },
})