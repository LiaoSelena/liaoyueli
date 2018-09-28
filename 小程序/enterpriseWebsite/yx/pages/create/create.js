const app = getApp()
const yx = require('../../utils/utils.js')
const validate = require('../../utils/validate.js')
const sendSMS = require('../../utils/sendSMS.js')
const splitAddress = require('../../utils/splitAddress.js')
const wxLogin = require('../../../utils/wxLogin.js')
Page({
  data: {
    flags: { 'inShow': false, 'law': true, 'agree': false, 'new': false,'code':true},
    company:'',
    name:'',
    nickName:'',
    door:'',
    code:'',
    codeText:'',
    trade:'',
    phone:'',
    address:'',
    src:'',
    lawList:[],
    industryList:[],
    type_:'',
    isDisabled:false,
    isClick:true,
  },
  myData:{
    'cardId':'',
    'cardDetailId':'',
    'openId':'',
    'location': { 'longitude': 0,'latitude':0 },
    'createUserId':'',
    'map': { 'pro': '', 'city': '', 'area': '' },
    'flagSubmit':true,
    'flag':''
  },
  onLoad: function (options) {
    var that=this;
    wx.getLocation()
    
    if (options.id) {//名片过来的创建
      console.log("名片过来的创建")
      wx.setNavigationBarTitle({ title: '创建官网' })
      this.myData.cardDetailId = options.id
      yx.showLoading()
      yx.ajax('/weiwebsite/mobile/carddetail/getCardDetailById', 'GET', { 'cardDetailId': this.myData.cardDetailId }, res => {
        wx.hideLoading()
        yx.status(res, res => {
          if (res.data.phone) {
            let data = res.data
            // let company = data.cmpyName
            // let trade = data.industry
            let phone = data.phone
            let address = data.locationName
            if (!address) address = '公司导航地址'
            // this.setData({ 'flags.inShow': true, company: company, trade: trade, phone: phone, address: address})
            this.setData({ 'flags.inShow': true,phone: phone})

            //获取行业信息
            yx.ajax('/weiwebsite/mobile/cmpyinfo/getIndustryList', 'GET', {}, res => {
              yx.status(res, res => {
                this.setData({industryList: res.data.list, trade: '请选择'})
              })
            })

            this.myData.location.longitude = data.longitude
            this.myData.location.latitude = data.latitude

            //获取createUserId
            wxLogin.login(options.phone, userId => {
              this.myData.createUserId = userId
            })

            if (res.data.phone != '') {//有电话号码 
              this.setData({ isDisabled: true })     
            } else {
              this.getPhoneByOpenId(this.myData.openId);//通过openid查询手机号
            }
            
          } else {
            yx.modal({ 'tip': '请先前往名片绑定手机号' })
          }
        })
      })
    }else{
      if (options.mainUserId) {//从代理商协同平台进来
        console.log("从代理商协同平台进来")
        that.setData({ type_:'2'})
        
        wx.setNavigationBarTitle({ title: '创建官网' })
        yx.ajax('/weiwebsite/mobile/userinfo/registerUserByMianUserId', 'GET', { 'mainUserId': options.mainUserId }, res => {
          console.log(res)
          if (res.status == '100') {
            let userId = res.data.userId
            this.myData.createUserId = res.data.userId
            app.globalData.info.userId = res.data.userId
            yx.ajax('/weiwebsite/mobile/userinfo/getDetail', 'GET', { 'userId': userId }, res => {
              yx.status2('查询用户信息获取手机号', res, res => {
                this.setData({ phone: res.data.phone })
              })
            })
            if (res.data.phone != '') {//有电话号码 
              this.setData({ isDisabled: true })
            } else {
              this.getPhoneByOpenId(this.myData.openId);//通过openid查询手机号
            }
            
          }
        })
      }else{
        //查询用户信息获取手机号
        wxLogin.login(options.phone, userId => {
          this.myData.createUserId = userId
          this.myData.openId = app.globalData.info.openId
          yx.ajax('/weiwebsite/mobile/userinfo/getDetail', 'GET', { 'userId': userId }, res => {
            yx.status2('查询用户信息获取手机号', res, res => {
              this.setData({ phone: res.data.phone })
              
              if (res.data.phone != '') {//有电话号码 
                this.setData({ isDisabled: true })
              } else {
                this.getPhoneByOpenId(this.myData.openId);//通过openid查询手机号
              }

            })
          })
          
        })
      }
      //全新创建
      if (options.cardId) this.myData.cardId = options.cardId
      console.log("全新创建")
      yx.showLoading()
      //获取行业信息
      yx.ajax('/weiwebsite/mobile/cmpyinfo/getIndustryList','GET',{},res=>{
        wx.hideLoading()
        yx.status(res,res=>{
          this.setData({ 'flags.new': true, industryList: res.data.list, trade: '请选择', codeText: '获取验证码', address:'公司导航地址' })
        })
      })

      if (this.data.phone != ''){
        // console.log("有电话号码")
        this.setData({ isDisabled: true })
      }else{
        // console.log("没有电话号码")
        this.getPhoneByOpenId(this.myData.openId);//通过openid查询手机号
      }
    }
  },
  //选择地址
  address:function(){
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userLocation']) {
          yx.modal({ tip: '请开启设置-使用我的地理位置' }, res => {
            wx.openSetting({})
          })
        }else{
          wx.chooseLocation({
            success: res => {
              if (res.address && res.name){
                let split = splitAddress.split(res.address, res.name)
                this.setData({ address: res.address })
                this.myData.location.longitude = res.longitude
                this.myData.location.latitude = res.latitude
                this.myData.map = { 'pro': split.pro, 'city': split.city, 'area': '' }
              }else{
                yx.modal({'tip':'抱歉，未能获取地址，请重新选择！'})
              }
            }
          })
        }
      }
    })
  },
  //选择行业
  industry:function(e){
    this.setData({ trade: this.data.industryList[e.detail.value].industry})
  },
  //获取验证码
  getCode: function () {
    if (this.data.isClick){
      console.log('222222222222222222222222' + this.data.phone)
      console.log(validate.phone(this.data.flags.code))
      console.log(validate.phone(this.data.phone))
      //验证手机
      if (!validate.phone(this.data.phone)) {
        yx.modal({ 'tip': '请输入合法手机号' })
        return
      }
      if (this.data.flags.code) {
        sendSMS.send(this.data.phone, res => {
          let n = 60
          this.setData({ codeText: '剩余' + n + 's', 'flags.code': false })
          let time = setInterval(res => {
            if (n != 0) {
              n = n - 1
              this.setData({ codeText: '剩余' + n + 's' })
            } else {
              clearInterval(time)
              this.setData({ codeText: '重新获取', 'flags.code': true })
            }
          }, 1000)
        })
      }
    }
  
  },
  //选择logo
  logo:function(){
    wx.chooseImage({
      count: 1,
      success: res=> {
        this.setData({ src: res.tempFilePaths[0] })
      }
    })
  },
  //对勾同意
  agreeControl:function(){
    this.setData({'flags.agree':!this.data.flags.agree})
  },
  name:function(e){
    this.setData({ name: e.detail.value})
  },
  door: function (e) {
    this.setData({ door: e.detail.value })
  },
  phone: function (e) {
    console.log(e.detail.value)
    this.setData({ phone: e.detail.value })
  },
  code: function (e) {
    this.setData({ code: e.detail.value })
  },
  nickName: function (e) {
    this.setData({ nickName: e.detail.value })
  },
  company: function (e) {
    this.setData({ company: e.detail.value })
  },
  //阅读平台服务协议
  read1:function(e){
    wx.setNavigationBarTitle({ title: '搜空微网服务协议' })
    //平台服务协议
    let lawList = [
      '接受条款: 以任何方式进入搜空微网或者搜空微网小程序，即表示您同意自己已经与搜空微网订立本条款，且您同意接受本条款的条件约束。您应在第一次登录后仔细阋读修订后的“条款”，并有权选择停止继续使用“服务”；一旦您继续使用“服务”，则表示您已接受经修订的“条款”。当您与搜空微网发生争议时，应以最新的服务条款为准。除另行明确声明外，任何使“服务”范围扩大或功能增强的新内容均受本条款约束。条款的解释权归搜空微网所有。',
      '谁可使用搜空微网网站？ : “服务”仅提供遵守国家相关法律法规订立具有法律约束力合约的企业、个体商户和非企业/非个体工商使用。如不符合本项条件，请勿选择使用“服务”。搜空微网可随时自行全权決定拒绝向任何人土提供“服务”。 “服务”不提供给被暂时或永久中止资格的搜空微网用户，以及含任何涉及违规违法操作或使用搜空微网的所有用户。',
      '服务收费: 本公司保留在根据第1条通知您后，收取“服务”费用的权利。您因进行交易、向本公司获取有偿服务或接触本公司服务器而发生的所有应纳税赋，以及相关硬件、软件、通讯、网络服务及其他方面的费用均由您自行承担。本公司保留在无须发出书面通知，仅在搜空微网网站公示的情况下，暂时或永久地更改或停止部分或全部“服务”的权利。',
      '您在开通服务时，所必须具备的资料:  您需要提交资料以配合与本产品服务有关的使用，并需保证你所提交资料真实、有效，因提交伪造、虚假等资料，而导致的风险及使用相关问题，将由您本人承担。在搜空微网上注册的用户需经过认证机制，经微信公众平台认证过的用户，可在搜空微网平台复用认证资质，未经微信公众平台认证，或未经搜空微网平台认证的用户，在搜空微网平台因提交伪造、虚假等资料、发布违规信息、实施违法行为等导致的风险及使用相关问题，将由发布者自行承担。同时：针对企业主体用户：您须要遵照微信公众平台的规则，在使用搜空微网服务时，须具有企业的营业执照及法人证照，包括：有效的企业营业执照、法人身份、企业对公账号、联系手机号码等，并自行承担微信公众平台所需支付款项。搜空微网也将复用您在微信公众平台的资质。 针对个体工商户用户：您须要遵照微信公众平台的规则，在使用搜空微网服务时，须具有个体工商的营业执照、经营者的身份证、经营者身份证绑定开通的一张银行卡、联系手机号码等并自行承担微信公众平台所需支付款项。搜空微网也将复用您在微信公众平台的资质。针对非企业/非个体工商用户：请您遵照本平台规则，提供有效的身份证明、联系手机号码等资料方可注册，但针对非企业/非个体工商用户，搜空微网将不予认证。未经搜空微网平台认证的用户，在搜空微网平台因提交伪造、虚假等资料、发布违规信息、实施违法行为等导致的风险及使用相关问题，将由发布者自行承担。除了我方授权给您使用的资料，我方不提出拥有对您所发布或者向我方提供（称为“提交”）的与服务有关的资料的所有权。但是，经您发布或以其他方式提交的资料，您授予我们免费许可；做与服务有关的使用、复制、传播、显示、发表和修改；在与您的提交有关时发布您的姓名或单位名称；将这些许可授予其他人。本节仅适用于法律所允许的内容并仅适用于在不违反法律的限度内使用和发布上述法律所允许的内容。我方不会为您的提交向您支付费用。我方有权拒绝发布，并且有权随时从服务中删除您的提交。您应当对您所做出的每一提交享有以实施本节所规定的授权行为所必要的完整权利。',
      '隐私:  为了协作和提供服务，我们会收集您的某些信息。此外，我方还可以访问或者透露关于您的信息，包括您通讯的內容，以：（a）遵守法律、响应司法要求或法律程序；（b）保护小官网及其客户的权利、财产，包括协议的执行和遵守适用于服务的策略；（c）保护搜空微网及其雇员、客户和公众的权利、财产或安全。我方可采取技术或其他措施以保护服务，保护我们的客户，或阻止您违反本合同。这些措施可能包括，例如，通过过滤来阻止垃圾邮件或提高安全级别。这些措施可能阻止或中断您对服务的使用。为了向您提供服务，我方可收集有关服务状况，您的机器和您对服务的使用的某些信息。我方有权从您的机器自动上传这些信息。这些数据不会构成对您私人身份的确认。',
      '终止或访问限制:  在搜空微网未向您收费的情况下，搜空微网可自行全权决定以任何理由（包括但不限于搜空微网认为您已违反本条款的字面意义和精神，或您以不符合本条款的字面意义和精神的方式行事，终止您对“服务”的使用，及可自行全权决定以任何理由（包括但不限于搜空微网认为您已违反本条款的字面意乂和精神，或您以不符合本条款的字面意义和精神的方式行事，或您在超过60天的时间内未以您的账号及密码登录网站）终止您的“服务”密码、账户（或其任何部份）或并删除您在使用“服务”中提交的“您的资料”。根据本条款的任何规定终止您使用“服务”之措施可在不发出事先通知的情况下实施，并承认和同意，搜空微网可立即使您的账户无效，或撤销您的账户以及在您的账户内的所有相关资料和档案，禁止您进一步接入该等档案或“服务”。账号终止后，小官网没有义务为您保留原账号中或与之相关的任何信息，或转发任何未曾阋读或发送的信息给您或第三方。此外，搜空微网不会就终止您接入“服务”而对您或任何第三者承担任何责任。第8、9和10各条应在本条款终止后继续有效。',
      '违反规则会有什么后果？ :  在不限制其他补救措施的前提下，发生下述任一情况，本公司可立即发出警告，暂时中止、永久中止或终止您的会员资格及使用权限，不退还已交付款项并删除您的任何现有产品信息，以及您在网站上展示的任何其他资料：（1）您违反本条款；（2）本公司无法核实或鉴定您向本公司提供的任何资料；本公司相信您的行为可能会使您、本公司用户或通过本公司或本公司网站提供服务的第三者服务供应商发生任何法律责任；（3）发表、传送、传播、储存个人网站类，在线音视频类，刷钻／闹QB／QQ业务／刷流量 ／taobao刷信誉类，色情／成人內容／低俗內容类，游戏类/代练／涉及交易的虚拟物品类，彩票预测／赌博类內容网站，盗号／外挂／私服／辅助类，代办证／代考/代开发票类，黑客／网站挂马／放置病毒／收费下载／收费传授黑客技术类，虚假信息／诈骗信息类，代办证代考代开发票类，不利利国家与社会稳定和谐，违反国家相关法律与政策的內容，将配合有关部门逴究责任。',
      '服务“按现状”提供:  本公司会尽一切努力使您在使用搜空微网网站的过程中得到服务。遗憾的是，本公司司不能随时预见到任何技术上的问题或其他困难。该等困难可能会导致数据损失或其他服务中断。为此，您明确理解和同意，您使用“服务”的风险由您自行承担。“服务”以“按现状”和“按可得到”的基础提供。搜空微网明确声明不作出任何种类的所有明示或暗示的保证，包括但不限于关于适销性、适用于某一特定用途和无侵权行为等方面的保证。搜空微网对下述内容不作保证:（1）“服务”会符合您的要求；（2）“服务”不会中断，且适时、安全和不帯任何错误；（3）通过使用“服务”而可能获取的结果将是准确或可信赖的；（4）您通过“服务”而购买或获取的任何产品、服务、资料或其他材料的质量将符合您的预期。通通使用“服务”而下载或以其他形式获取任何材料是由您自行全权决定进行的，且与此有关的风险由您自行承担，对于因您下载任何该等材料而发生的您的电脑系统的任何损毁或任何数据损失，您将自行承担责任。您从搜空微网或通过或从“服务”获取的任何口头或书面意见或资料，均不产生未在本条款对明确载明的任何保证。',
      '责任范围:   您明确理解和同意，搜空微网不对因下述任一情况而发生的任何损害赔偿承担责任，包括但不限于利润、商誉使用、数据等方面的损失或其他无形损失的损害婄偿（无论搜空微网是否已被告知该等损害赔偿的可能性）：（1）使用或未能使用“服务”；（2）因通过或从“服务”购买或获取任何货物、样品、数据、资料或服务，或通过或从“服务”接收任何信息或缔结任何交易所产生的获取替代货物和服务的费用；（3）未经批准接入或更改您的传输资料或数据；（4）任何第三者对“服务”的声明或关于“服务”的行为；（5）或因任何原因而引起的与“服务”有关的任何其他事宜，包括疏忽。',
      '赔偿:  您同意，因您违反本条款或经在此提及而纳入本条款的其他文件，或因您违反了法律或侵害了第三方的权利，而使第三方对搜空微网及其子公司、分公司、董事、职员、代理人提出索赔要求（包括司法费用和其他专业人士的费用），您必须赔偿给搜空微网及其分公司、董事、职员、代理人，使其等免遭损失。',
      '遵守法律:  您在搜空微网上不得发布各类违法或违规信息。您应遵守与您使用“服务”，以及与您竞买、购买和销售任何物品以及提供商贸信息有关的所有相关的法律、法规、条例和规章。',
      '广告和金融服务:     您与在“服务”上或通过“服务”物色的刊登广告人士通讯或进行业务往来或参与其推广活动，包括就相关货物或服务付款和交付相关货物或服务，以及与该等业务往来相关的任何其他条款、条件、保证或声明，仅限于在您和该刊登广告人士之间发生。您同意，对于因任何该等业务往来或因在“服务”上出现该等刊登广告人士而发生的任何种类的任何损失或损毁，搜空微网无需负责或承担任何责任。您如打算通过“服务”创设或参与与任何公司、股票行情、投资或证券有关的任何服务，或通过“服务”收取或要求与任何公司、股票行情、投资或证券有关的任何新闻信息、警戒性信息或其他资料，敬请注意，小官网不会就通过“服务”传送的任何该等资料的准确性、有用性或可用性、可获利性负责或承担任何责任，且不会对根据该等资料而作出的任何交易或投资決策负责或承担任何责任。',
      '您对我们的通知:  您可以按照为本服务在客户支持或“帮助”部分所指明的方式向我们发出通知。我方不接受以电子邮件所作的通知。',
      '我方向您发出通知:  我方向您发出通知，同意使用电子信息。本合同系电子形式。我方承诺向您发送与本服务有关的特定信息，并有权向您发送某些附加信息。我方可能还会向您发送法律要求发送的有关本服务的其他信息。我方可以电子形式向您发送这些信息。您有权取消您的同意，但如果您取消，我方可取消对您的服务。我方可以下列方式向您提供必需的信息：通过您在注册本服务时所指明的电子邮件地址向您发送电子邮件；在信息可供使用时，通过在向您发送的电子邮件通知中指明供访问的某一网站；或通过访问为此目的而通常事先指定的某网站。通过电子邮件向您发出的通知将被视为在该电子邮件中标明的传输日期发送并且收到。在您能够访问和使用本服务期间，您拥有必要的软件和硬件以接受此类通知。如果您不同意以电子形式接受任何通知，那么您应当停止使用本服务。',
      '与第三方网站的链接:  提供与第三方网站的链接仅仅为了给您带来方便。如果您使用这些链接，将离开搜空微网站点。搜空微网没有审查过所有这些第三方站点，对任何这些站点及其内容或它们的保密政策不进行控制，也不负任何责任。因此，我们对这些网站上的任何信息、软件以及其它产品或材料，或者通过使用它们可能获得的任何结果不予认可，也不作任何表述。如果您决定访问本站点链接的任何第三方站点，其风险完全由您自己承担。',
      '不可抗力:  由于自然灾害、罢工或骚乱、物质短缺或定量配给、暴动、战争行为、政府行为、通电信网络、供电单位采取的限电或断电措施、供电单位的电力设施故障、通讯或其他设施故障或严重伤亡事故、黑客攻击、尚无有效防御措施的计算机病毒的发作及其他各方不能预见并且对其发生和后果不能防止并避免的不可抗力原因，致使本公司延迟或未能履约的，本公司不对您承担任何责任。',
      '关于网络:   您明白由于因特网上通路的阻塞或造成访问速度下降，均是正常，不属于我方违约，若遇电信运莒商或国家政策等原因造成的网络中断，我方不承担相应责任。',
      '关于版权:   以任何方式使用搜空微网提供的服务，包括但不限于基于搜空微网搭建的企业网站、企业邮箱等服务，所涉及的版权信息的解释权归搜空微网所有。',
      '关于退款:  凡购买搜空的微网各种产品的客户，支付完成后，可以进行升级套餐，更改支付周期，续费取消额外网站等操作，由于网络产品一经生效即产生费用，故无特殊原因，搜空微网产品不支持退款，请知知晓。',
      '适用法律和管辖:   本条款适用于中国法律并依照中国法律解释，不会造成任何法律的冲突。任何因有关使用本站而发生的诉讼均应提交搜空微网公司住所地的人民法院。如果您还有疑问，您可以直接给我们客服中心留言。'
    ]
    this.setData({ lawList: lawList })
    if (e.currentTarget.dataset.flag == 'new'){
      this.myData.flag = 'new'
    }else{
      this.myData.flag = 'old'
    }
    this.setData({ 'flags.law': false, 'flags.inShow': false, 'flags.new': false})
  },
  read2: function (e) {
    wx.setNavigationBarTitle({ title: '法律声明' })
    //法律声明
    let lawList = [
      '在使用搜空微网平台各项服务前，请您务必仔细阋读并透彻理解本声明。您可以选择不使用搜空微网平台服务，但如果您使用搜空微网平台服务的，您的使用行为将被视为对本声明全部内容的认可。“搜空微网小程序”（简称“搜空微网”）指由益阳搜空高科软件有限公司运营的微信小程序建站服务系统平台。',
      '鉴于搜空微网提供的服务属于自助建立企业官网小程序服务，通过搜空微网平台搭建的站点上关于搜空微网平台用户或其发布的相关资讯、产品、服务（包括但不限于企业名称、联系人及联络信息，产品／服务的描述和说明，视讯等）的信息均由用户自行提供，用户依法应对其提供的任何信息承担全部责任。',
      '除搜空微网注明之服务条款外，其他一切因使用搜空微网建站系统而引致之任何意外、疏忽、合约毀坏、诽谤、版权或知识产权侵权及其所造成的损失（包括因下载而感染电脑病毒），搜空微网概不负责，亦不承担任何法律责任。',
      '任何单位或个人认为通过搜空微网平台搭建的网站內容可能涉嫌侵犯其合法权益，应该及时向搜空微网书面反馈，并提供身份证明、权属证明及详细侵权情况证明，搜空微网在收到上述法律文件后，将会尽快移相相关涉嫌侵权的内容。',
      '任何搜空微网发现可能涉嫌违规违法侵权等性质使用搜空微网产品的单位或个人，搜空微网有权即时暂停涉嫌单位或个人的搜空微网会员资格及使用权限，而无需通知并关停搜空微网相关服务账号。',
      '搜空微网保留随时修改本网站服务条款及声明之权利，并通过网络于搜空微网平台公示修改之后内容，不另行个别通知。若您于服务条款、法律声明修改后仍继续使用搜空微网平台的，即表示您同意修改后之内容。',
      '任何单位或个人在使用搜空微网时，因违反使用条款或经条款中提及而纳入条款的其他文件，或因违反了法律或侵害了第三方的权利，而使第三方对搜空微网及其子公司、分公司、董事、职员、代理人提出索赔要求（包括司法费用和其他专业人士的费用），搜空微网将保留追究其法律责任的权利，并有权要求其赔偿搜空微网及其分公司、董事、职员、代理人的损失。',
    ]
    this.setData({ lawList: lawList })
    if (e.currentTarget.dataset.flag == 'new') {
      this.myData.flag = 'new'
    } else {
      this.myData.flag = 'old'
    }
    this.setData({ 'flags.law': false, 'flags.inShow': false, 'flags.new': false })
  },
  //同意
  agree:function(){
    wx.setNavigationBarTitle({ title: '创建官网' })
    if (this.myData.flag == 'new'){
      this.setData({ 'flags.law': true, 'flags.agree': true, 'flags.new': true })
    }else{
      this.setData({ 'flags.law': true, 'flags.agree': true, 'flags.inShow': true })
    }
  },
  //提交
  submit:function(e){
    let value = e.detail.value
    //验证简称
    if (!validate.strLength(value.name, 1, 6)) {
      yx.modal({ 'tip': '公司简称请输入1-6个汉字' })
      return
    }
    //验证logo
    if(!this.data.src){
      yx.modal({ 'tip': '请上传公司logo' })
      return
    }
    //验证电话
    if (!value.phone){
      yx.modal({ 'tip': '请填写联系电话' })
      return
    }

    //验证公司地址
    if(this.data.address=='公司导航地址'){
      yx.modal({ 'tip': '请选择公司地址' })
      return
    }
    //验证同意
    if(!this.data.flags.agree){
      yx.modal({ 'tip': '勾选同意协议' })
      return
    }
    //开始创建
    if (this.myData.flagSubmit){
      this.myData.flagSubmit = false
      yx.showLoading()
      let data = this.data
      let myData = this.myData
      //上传logo
      yx.upImg(data.src, logo => {
        this.myData.flagSubmit = true
        wx.hideLoading()
        if (logo){
          yx.showLoading('创建中...')
          yx.ajax('/weiwebsite/mobile/cmpyinfo/createCompany', 'GET', {
            'cmpyName': data.company,
            'simpCmpyName': value.name,
            'logo': logo,
            'industry': data.trade,
            'phone': value.phone,
            'province': myData.map.pro,
            'city': myData.map.city,
            'region': myData.map.area,
            'address': data.address,
            'createUserId': myData.createUserId,
            'cardDetailId': myData.cardDetailId,
            'longitude': myData.location.longitude,
            'latitude': myData.location.latitude,
            'houseNumber': value.door
          }, res => {
            this.myData.flagSubmit = true
            wx.hideLoading()
            if (res.status == '100') {
              let cmpyId = res.data.cmpyId
              yx.modal({ 'tip': '创建成功' }, res => {
                wx.redirectTo({
                  url: '../manage/manage?from=create&cmpyId=' + cmpyId
                })
              })
            } else {
              wx.showModal({
                title: '提示',
                content: res.msg,
                showCancel: true,
                confirmText: '去绑定',
                success: res => {
                  if (res.confirm) {
                    wx.navigateBackMiniProgram()
                  }
                }
              })
            }
          })
        }
      })
    }
  },
  //提交全新创建
  submitNew:function(e){
    let value = e.detail.value
    let myData = this.myData
    let data = this.data
    let type_=this.data.type_;
    //验证简称
    if (!validate.strLength(value.name, 1, 6)) {
      yx.modal({ 'tip': '公司简称请输入1-6个汉字' })
      return
    }
    //验证logo
    if (!data.src) {
      yx.modal({ 'tip': '请上传公司logo' })
      return
    }
    //验证公司名称
    if (!validate.strLength(value.company, 1, 30)) {
      yx.modal({ 'tip': '公司简称请输入1-6个汉字' })
      return
    }
    //验证姓名
    if (!validate.strLength(value.nickName, 1, 30)) {
      yx.modal({ 'tip': '姓名请输入1-30个汉字' })
      return
    }

    //验证电话
    if (!value.phone) {
      yx.modal({ 'tip': '请填写联系电话' })
      return
    }

    //验证码
    if (!validate.strLength(value.code, 4, 4)) {
      yx.modal({ 'tip': '请输入4位验证码' })
      return
    }
    //验证公司行业
    if (data.trade=='请选择') {
      yx.modal({ 'tip': '请选择公司行业' })
      return
    }
    //验证公司地址
    if (data.address == '公司导航地址') {
      yx.modal({ 'tip': '请选择公司地址' })
      return
    }
    //验证同意
    if (!data.flags.agree) {
      yx.modal({ 'tip': '勾选同意协议' })
      return
    }
    
    //开始创建
    if (myData.flagSubmit){
      myData.flagSubmit = false
      yx.showLoading()
      yx.upImg(data.src, logo => {
        wx.hideLoading()
        myData.flagSubmit = true
        if(logo){
          yx.showLoading('创建中...')
          yx.ajax('/weiwebsite/mobile/cmpyinfo/createCompanyByPhone','GET',{
            'cmpyName': value.company,
            'simpCmpyName': value.name,
            'logo': logo,
            'industry': data.trade,
            'phone': value.phone,
            'province': myData.map.pro,
            'city': myData.map.city,
            'region': myData.map.area,
            'address': data.address,
            'createUserId': myData.createUserId,
            'linkMan': value.nickName,
            'longitude': myData.location.longitude,
            'latitude': myData.location.latitude,
            'houseNumber': value.door,
            'vcode': value.code,
            'openId': myData.openId,
            'appId': app.globalData.appId,
            'cardId': myData.cardId,
            'type': type_,
          },res=>{
            myData.flagSubmit = true
            wx.hideLoading()
            console.log(res)
            yx.status(res,res=>{
              let cmpyId = res.data.cmpyId
              yx.modal({ 'tip': '创建成功' }, res => {
                wx.redirectTo({
                  url: '../manage/manage?from=create&cmpyId=' + cmpyId
                })
              })
            })
          })
        }
      })
    }
  },
  //检查手机号码是否可以
  checkPhone: function (e) {
    var _phone = e.detail.value;
    if (_phone.length == 11){
      yx.ajax('/weiwebsite/mobile/cmpyinfo/checkPhone.action', 'GET', { 'phone': _phone, 'userId': this.myData.createUserId }, res => {
        if (res.status == '100') {
          console.log(res.msg)
        } else {
          console.log(res.msg)
          yx.modal({ 'tip': res.msg })
          this.setData({ isClick:false})//手机号码验证不对的话验证码无法点击
          return
        }
      })
    }
    this.setData({ isDisabled: false, phone:_phone})

  },
  //通过openid查询手机号
  getPhoneByOpenId: function (_openId){
    yx.ajax('/weiwebsite/mobile/userinfo/getPhoneByOpenId', 'GET', { 'openId': _openId}, res => {
      if (res.status == '100') {
        console.log(res.msg+" 电话号码是："+res.data.phone)
        this.setData({ phone:res.data.phone})
        this.setData({ isDisabled: true }) 
      } else {
        console.log(res.msg+" 查不到电话号码")
        this.setData({ isDisabled: false }) 
      }
    })
  }
})
