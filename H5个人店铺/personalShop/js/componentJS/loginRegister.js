//登陆注册的接口都是一样 当页面脱离openId的时登录 有openId的时注册
/*-------------------注册strat--------------------*/
//注册HTMl
function registerHTML(){
  var registerHTML='<aside class="login register_box">'
					+	'<dl class="login_header">'
					+	    '<p class="close"><img src="image/close_white.png"></p>'
					+		'<dt><img src="image/login_touxiang.png"></dt>'
					+		'<dd>您还未注册 <p>请先注册</p></dd>'
					+	'</dl>'
					+	'<section class="login_content">'
					+		'<dl class="left-float-top">'
					+			'<dt><img src="image/login_zhuce.png"></dt>'
					+			'<dd class="flex-1"><input id="tel" type="number" /></dd>'
					+		'</dl>'
					+		'<div class="left-float-top">'
					+			'<dl class="left-float-top flex-1">'
					+				'<dt><img src="image/login_yanzheng.png"></dt>'
					+				'<dd class="flex-1"><input type="text" id="yzcode" /></dd>'
					+			'</dl>'
					+			'<button class="code_btn" id="codeBtn">获取验证码</button>'
					+		'</div>'
					+		'<ul>'
					+			'<li class="login_register" id="registerBtn">注册</li>'
					+		'</ul>'
					+		'<div class="change go_login">已有账号，点击<span>登陆</span></div>'
					+	'</section>'
					+'</aside>';
	$("body").append(registerHTML+"<aside class='blackBg_public'></aside>");
	registerfun();
}
//注册fun
function registerfun(){
	var telR,codeR;
	var r=60;//验证倒计时
    var telReg=/^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/;//手机匹配
    $(".go_login").on("click",function(){
		$(".register_box").remove();
		$(".blackBg_public").remove();
		loginHTML();
	})
	$(".register_box .close").on("click",function(){
		$(".register_box").remove();
		$(".blackBg_public").remove();
		clearTimeout(flagTime);
	})
	$(".register_box #registerBtn").on("click",function(){
		 telR=$(".register_box #tel").val();
		 codeR=$(".register_box #yzcode").val();
		  $("#uidHidden").val("123");
		 if(verification()){
		 	registerData();
		 }
	})
	$(".register_box #codeBtn").on("click",function(){
		telR=$(".register_box #tel").val();
		if(codeClick()){
			veriData();
		}
	})
	//验证_手机号码 验证码
	function verification(){
		var YZ=true;
		telR=$(".register_box #tel").val();
		codeR=$(".register_box #yzcode").val();
		if(telR == ""){
		 	mui.toast("手机号码不能为空！");
		 	YZ=false;
		 }else if(!telReg.test(telR)){
		 	mui.toast("请输入有效的手机号码！");
		 	YZ=false;
		 }else if(codeR == ""){
		 	mui.toast("验证码不能为空！");
		 	YZ=false;
		 }
		 return YZ;
	}
	//点击验证码验证手机号码
	function codeClick(){
		var telYz=true;
		if($('.register_box #codeBtn').text()=='获取验证码'){
			var telR = $('.register_box #tel').val();
			if( telR == '' ){
				mui.toast('手机不能为空');
				telYz=false;
			}else if( !telReg.test(telR) ){
				mui.toast('请输入有效的手机号码!');
				telYz=false;
			}
			return telYz;
		}else{
			mui.toast('您刚才已经获取过验证码了,请在'+n+'秒后再获取!');
		}
	}
	var flagTime;
	//重新获取验证码倒计时方法
	function countdown(){
		if(r==0){
			$('.register_box #codeBtn').removeAttr('disabled').text('获取验证码');
			$('.register_box #codeBtn').css({'background-color':'#fff','color':'#ED7E00','border':'1px solid #ED7E00'});
			r=60;
		}else{
			$('.register_box #codeBtn').attr('disabled',true).text('重新获取'+r);
			r--;
			flagTime=setTimeout(function(){countdown()},1000);
		}	
	}
	//获取验证码
	function veriData(){
		$.ajax({
			type:'get',
			dataType : "json",
			url:"/newmedia/mobile/smsClient/sendSmsCode.action?phoneNo="+telR,
			success:function(data){
				if(data.status == "SUCCESS" ){
					mui.toast('验证码已发送到您手机,请注意查收!');
					countdown();
				}else if(data.status == "FAIL"){
					mui.toast('您刚才已经获取过验证码了,请在'+r+'秒后再获取!');
				}else{
					mui.toast('验证码发送失败！');
				}
			}
	   }) 
	}
	//1.注册—获取baseUserId
	function registerData(){
		$.ajax({
			type:'get',
			dataType : "json",
			url:"/newmedia/mobile/baseUserInfo/registerByPhone.action?phone="+telR+"&vcode="+codeR,
			success:function(data){
				if(data.code=="SUCCESS" || data.code=="EXIST"){
				   var baseUserId=data.data.baseUserId;
				   uid=data.data.soukongId;
				   localStorage.setItem("uidHidden_"+ShopNumber,uid);
				   if($("#uidHidden").length=="0" ){
						$("body").append("<input type='hidden' value='' id='uidHidden'>");
					}
				   $("#uidHidden").val(uid);
				   console.log("注册之后的的uid："+uid);
				   if(openId && openId!="undefined" && openId!="" && openId!="null"){
				     	registerByopenId(baseUserId);
				   }else{
				   	   mui.toast("注册成功");
				   	   $(".login").remove();
					   $(".blackBg_public").remove();
				   }
				}else{
					mui.toast(data.msg);
				}
			}
	   })
	}
	//2.注册—通过openId，baseUserId成功
	function registerByopenId(baseUserId){
		$.ajax({
			type:'get',
			dataType : "json",
			url:"/newmedia/mobile/baseUserInfo/addBaseUserLoginInfo.action?type=OPENID&loginUserName="+openId+"&baseUserId="+baseUserId,
			success:function(data){
				if(data.code=="SUCCESS"){
					mui.toast("注册成功");
					$(".login").remove();
					$(".blackBg_public").remove();
				}else{
					mui.toast("注册失败");
					$("#yzcode").val("");
				}
			}
			
	    })
	}
}
/*-------------------注册end--------------------*/

/*-------------------登陆start--------------------*/
//登陆html
 function loginHTML(){
	 var loginHTML='<aside class="login login_box">'
					+	'<dl class="login_header">'
					+	    '<p class="close"><img src="image/close_white.png"></p>'
					+		'<dt><img src="image/login_touxiang.png"></dt>'
					+		'<dd>您还未登陆</br>请先登陆</dd>'
					+	'</dl>'
					+	'<section class="login_content">'
					+		'<dl class="left-float-top">'
					+			'<dt><img src="image/login_zhuce.png"></dt>'
					+			'<dd class="flex-1"><input id="tel" type="number" /></dd>'
					+		'</dl>'
					+		'<div class="left-float-top">'
					+			'<dl class="left-float-top flex-1">'
					+				'<dt><img src="image/login_yanzheng.png"></dt>'
					+				'<dd class="flex-1"><input type="text" id="yzcode" /></dd>'
					+			'</dl>'
					+			'<button class="code_btn" id="codeBtn">获取验证码</button>'
					+		'</div>'
					+		'<ul>'
					+			'<li class="login_register" id="loginBtn">登录</li>'
					+		'</ul>'
					+	'</section>'
					+'</aside>';
	$("body").append(loginHTML+"<aside class='blackBg_public'></aside>");
	loginfun();
}
//登陆fun
function loginfun(){
	var tel,code;
	var n=60;//验证倒计时
    var telReg=/^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/;//手机匹配
	$(".login_box .close").on("click",function(){
		$(".login_box").remove();
		$(".blackBg_public").remove();
		clearTimeout(flagTimeLogin);
	})
	$(".login_box #loginBtn").on("click",function(){
		 tel=$(".login_box #tel").val();
		 code=$(".login_box #yzcode").val();
		 if(verification()){
		 	registerData();
		 }
	})
	$(".login_box #codeBtn").on("click",function(){
		tel=$(".login_box #tel").val();
		if(codeClick()){
			veriData();
		}
	})
	//验证_手机号码 验证码
	function verification(){
		var YZ=true;
		tel=$(".login_box #tel").val();
		code=$(".login_box #yzcode").val();
		if(tel == ""){
		 	mui.toast("手机号码不能为空！");
		 	YZ=false;
		 }else if(!telReg.test(tel)){
		 	mui.toast("请输入有效的手机号码！");
		 	YZ=false;
		 }else if(code == ""){
		 	mui.toast("验证码不能为空！");
		 	YZ=false;
		 }
		 return YZ;
	}
	//点击验证码验证手机号码
	function codeClick(){
		var telYz=true;
		if($('.login_box #codeBtn').text()=='获取验证码'){
			var tel = $('.login #tel').val();
			if( tel == '' ){
				mui.toast('手机不能为空');
				telYz=false;
			}else if( !telReg.test(tel) ){
				mui.toast('请输入有效的手机号码!');
				telYz=false;
			}
			return telYz;
		}else{
			mui.toast('您刚才已经获取过验证码了,请在'+n+'秒后再获取!');
		}
	}
	//重新获取验证码倒计时方法
	var flagTimeLogin;
	function countdown(){
		if(n==0){
			$('.login_box #codeBtn').removeAttr('disabled').text('获取验证码');
			$('.login_box #codeBtn').css({'background-color':'#fff','color':'#ED7E00','border':'1px solid #ED7E00'});
			n=60;
		}else{
			$('.login_box #codeBtn').attr('disabled',true).text('重新获取'+n);
			n--;
			flagTimeLogin=setTimeout(function(){countdown()},1000);
		}	
	}
	//获取验证码
	function veriData(){
		$.ajax({
			type:'get',
			dataType : "json",
			url:"/newmedia/mobile/smsClient/sendSmsCode.action?phoneNo="+tel,
			success:function(data){
				if(data.status == "SUCCESS"){
					mui.toast('验证码已发送到您手机,请注意查收!');
					countdown();
				}else if(data.status == "FAIL"){
					mui.toast('您刚才已经获取过验证码了,请在'+n+'秒后再获取!');
				}else{
					mui.toast('验证码发送失败！');
				}
			}
	   }) 
	}
	//1.登录—获取baseUserId
	function registerData(){
		$.ajax({
			type:'get',
			dataType : "json",
			url:"/newmedia/mobile/baseUserInfo/registerByPhone.action?phone="+tel+"&vcode="+code,
			success:function(data){
				if(data.code=="SUCCESS" || data.code=="EXIST"){
				   var baseUserId=data.data.baseUserId;
				   uid=data.data.soukongId;
				   localStorage.setItem("uidHidden_"+ShopNumber,uid);
				   if($("#uidHidden").length=="0" ){
						$("body").append("<input type='hidden' value='' id='uidHidden'>");
					}
				   $("#uidHidden").val(uid);
				   if(openId && openId!="undefined" && openId!="" && openId!="null"){
				   	  registerByopenId(baseUserId);
				   }else{
				   	  mui.toast("登陆成功");
				   	  $(".login").remove();
					  $(".blackBg_public").remove();
				   }
				   console.log("登陆之后的的uid："+uid);
				}else if(data.code=="NULL"){
					mui.toast("账号未注册！");
				}else{
					mui.toast("验证码不正确！");
				}
			}
	   })
	}
	//2.登录—通过openId，baseUserId成功
	function registerByopenId(baseUserId){
		$.ajax({
			type:'get',
			dataType : "json",
			url:"/newmedia/mobile/baseUserInfo/addBaseUserLoginInfo.action?type=OPENID&loginUserName="+openId+"&baseUserId="+baseUserId,
			success:function(data){
				if(data.code=="SUCCESS"){
					mui.toast("登陆成功");
					$(".login").remove();
					$(".blackBg_public").remove();
				}else{
					mui.toast("登陆失败");
					$("#yzcode").val("");
				}
			}
	    })
	}
}
/*-------------------登陆end--------------------*/