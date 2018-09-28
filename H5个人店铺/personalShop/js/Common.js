//个人店铺小蜜蜂按钮
function personalShopBeeBtn(){
	var urlParam=SKgetUrlParam();
	var _style='<style>.btn_img{width: 1.02rem;height: 1rem;}.honeybee_btn{position: fixed;bottom: 1.24rem;right: .48rem;z-index: 3;}.honeybee_box{position: fixed;bottom: 0;right: 0;z-index: 99;}.rgbabg78{background: rgba(255,255,255,0.78);}.honeybee_box ul a{width: 33.3%;}.honeybee_box ul li img{display: inline;}.img102{width: 1.02rem;height: 1.02rem;}.icno-wrong33{width: .33rem;height: .33rem;}.ft28{font-size: .28rem;}.color-333{color: #333;}.bg-ff{background: #fff;}.w100{width: 100%;}</style>';
	$('title').after(_style);
	var html='<div class="honeybee_btn">'
			+	'<img class="btn_img" src="/newmedia/pages/mobile/MicroWebsite/personalShop/image/gd_fsmenu.png" />'
			+'</div>'
			+'<div style="display:none;" class="honeybee_box w100">'
			+	'<div class="pt40 pb40 w100 rgbabg78">'
			+		'<ul class="left-float-top">'
			+			'<a id="linkToIndex"><li class="mui-text-center">'
			+				'<img class="img102" src="/newmedia/pages/mobile/MicroWebsite/personalShop/image/shouye.png" />'
			+				'<p class="ft28 color-333">我的</p>'
			+			'</li></a>'
			+			'<a id="linkToFindings"><li class="mui-text-center">'
			+				'<img class="img102" src="/newmedia/pages/mobile/MicroWebsite/personalShop/image/find.png" />'
			+				'<p class="ft28 color-333">发现</p>'
			+			'</li></a>'
			+			'<a id="linkToShoppingCart"><li class="mui-text-center">'
			+				'<img class="img102" src="/newmedia/pages/mobile/MicroWebsite/personalShop/image/cart.png" />'
			+				'<p class="ft28 color-333">购物车</p>'
			+			'</li></a>'
			+		'</ul>'
			+	'</div>'
			+	'<div id="icno-wrong" class="pt35 pb35 center-float-center bg-ff">'
			+		'<img class="icno-wrong33" src="/newmedia/pages/mobile/MicroWebsite/personalShop/image/close.png" />'
			+	'</div>'
			+'</div>';
	$('#SK_personal_shop_btn').append(html);
	$(".honeybee_btn").on('click',function(){
		$(".honeybee_box").fadeIn();
		$(".honeybee_btn").hide();
	})
	$("#icno-wrong").on('tap',function(){
		$(".honeybee_box").fadeOut();
		$(".honeybee_btn").show();
	})
	//跳转到首页
	var fuid='';if(urlParam.FUID){fuid='&UID=&FUID='+urlParam.FUID;}
	$('#linkToIndex').on('click',function(){
		window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/index.html?cmpyId='+urlParam.shopcmpyId+'&openId='+urlParam.openId+'&shopcmpyId='+urlParam.shopcmpyId+fuid;
	})
	//跳转到发现
	$('#linkToFindings').on('click',function(){
		window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/findings.html?cmpyId='+urlParam.shopcmpyId+'&openId='+urlParam.openId+'&shopcmpyId='+urlParam.shopcmpyId+fuid;
	})
	//跳转到购物车
	$('#linkToShoppingCart').on('click',function(){
		window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/shoppingCart.html?cmpyId='+urlParam.shopcmpyId+'&openId='+urlParam.openId+'&UID=&shopcmpyId='+urlParam.shopcmpyId+fuid;
	})
}