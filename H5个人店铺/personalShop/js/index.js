var shopName,logo;
var sysCommon=getSysCommonUrl();
(function(){
	var imgSrc='image/loding_img.png';
	$(function(){
		//判断url必须带的参数
		if(urlParam.cmpyId&&urlParam.openId){
			loading();
			botHtml();
			botMenu();
			selectCmpyId();
			lodingdata();
			doEvent();
			honeybeeHtml();
			$('#logo_bottom').css({'display':'block'});
		}else{
			console.info('亲，你少带了参数！');
		}
	})
	function lodingdata(){
		$.ajax({
			type:'get',
			url:'/newmedia/app/get/shopinfo.action',
			data:{'cmpyId':cmpyId},
			success:function(data){
				if (data.rows) {
					shopName = data.rows.shopName;
					logo = data.rows.logo;
					$('.shopkeeper-head img').attr('src',data.rows.logo);
					$('#shopName').text(data.rows.shopName);
					$('#owner').text('店主：'+data.rows.owner);
					topFloat('3','个人店铺首页',data.rows.shopNumber,urlParam.openId,'开微店，现在起用“搜空蜂商”');
					weixin();
				}
			}
		})
		$.ajax({
			type:'get',
			url:'/newmedia/app/get/ptypes.action',
			data:{'cmpyId':cmpyId},
			success:function(data){
				if (data.rows) {
					var html = '';
					var classifyList = '';
					var proprietaryProducts = data.rows[0].id;
					for (var i=0; i<data.rows.length; i++) {
						html+='<a class="link_to_list" ptype="'+data.rows[i].id+'"><li class="mui-ellipsis">'+data.rows[i].name+'</li></a>';
						classifyList+='<div id="classify-list'+i+'" class="classify-list mt20">'
										+		'<div class="top-lr-scatter bg-ff">'
										+			'<p class="color-ed7 ft28 border-left">'+data.rows[i].name+'</p>'
										+			'<a class="link_to_list" ptype="'+data.rows[i].id+'"><div class="more-btn mui-text-center">更多</div></a>'
										+		'</div>'
										+		'<ul type="'+data.rows[i].id+'" id="classify-ul'+data.rows[i].id+'" class="left-float-top-br top-lr-scatter">'
										+		'</ul>'
										+	'</div>'
										+'</div>';
					}
					$('.nva-listbox>ul').append(html);
					$('#classifybox>ul').append(html);
					$(".classify-listbox").append(classifyList);
					selfSupport(data);
				}
				if (data.header.code=='NOTEXIST') {
					$("#loading").hide();
					$('#nothing').text("吖，该店铺没有发布任何商品！");
					$('#nothing').css({'display':'flex','display':'-webkit-flex'});
				}
			}
		})
	}
	function selfSupport(ptype){
		$.ajax({
			type:'get',
			url:'/newmedia/app/own/getproducts.action',
			data:{'cmpyId':cmpyId,'ptype':ptype.rows[0].id,'iSelf':'1'},
			success:function(data){
				if (data.rows) {
					$('#loading').hide();
					$('#public_center').show();
					var html = '';
					for (var i=0; i<data.rows.length; i++) {
						html+='<a class="link_to_product" cmpyId="'+data.rows[i].cmpyId+'" ShopNumber="'+data.rows[i].shopNumber+'" ProductID="'+data.rows[i].productId+'"><li>'
							+	'<div class="img370 center-float-center">'
							+		'<img class="w100" src="'+data.rows[i].productImg+'" />'
							+	'</div>'
							+	'<div class="text-box bg-ff">'
							+		'<p class="h76 w100 mui-ellipsis-2 ft28 color-333">'+data.rows[i].productName+'</p>'
							+		'<div class="top-lr-scatter mt30">'
							+			'<span class="w65 color-ed7 ft24 font-weight mui-ellipsis">￥'+data.rows[i].price+'</span>'
							+			'<span class="color-d2 ft24">月销'+data.rows[i].sales+'</span>'
							+		'</div>'
							+	'</div>'
							+'</li></a>';
					}
					$('#classify-ul'+ptype.rows[0].id).append(html);
					$("#classify-list"+ptype.rows[0].id).show();
					for (var i=1; i<ptype.rows.length; i++) {
						typedata(ptype.rows[i].id);
					}
				}else{
					$("#nva-listbox .link_to_list:eq(0)").hide();
					$("#classifybox .link_to_list:eq(0)").hide();
					$("#classify-list0").hide();
//					$('#nothing').text("吖，该店铺没有发布任何商品！");
//					$('#nothing').css({'display':'flex','display':'-webkit-flex'});
				}
				if(data.header.code=="NOTEXIST"){
					for (var i=0; i<ptype.rows.length; i++) {
						typedata(ptype.rows[i].id);
					}
				}
				if(data.header.code=="E999"){
					for (var i=0; i<ptype.rows.length; i++) {
						typedata(ptype.rows[i].id);
					}
				}
				$("#loading").hide();
			}
		})
	}
	function typedata(ptype){
		$.ajax({
			type:'get',
			url:'/newmedia/app/own/getproducts.action',
			data:{'cmpyId':cmpyId,'ptype':ptype},
			success:function(data){
				$('#loading').hide();
				$('#public_center').show();
				if (data.rows) {
					var html = '';
					for (var i=0; i<data.rows.length; i++) {
						html+='<a class="link_to_product" cmpyId="'+data.rows[i].cmpyId+'" ShopNumber="'+data.rows[i].shopNumber+'" ProductID="'+data.rows[i].productId+'"><li>'
							+	'<div class="img370 center-float-center">'
							+		'<img class="w100" src="'+data.rows[i].productImg+'" />'
							+	'</div>'
							+	'<div class="text-box bg-ff">'
							+		'<p class="h76 w100 mui-ellipsis-2 ft28 color-333">'+data.rows[i].productName+'</p>'
							+		'<div class="top-lr-scatter mt30">'
							+			'<span class="w65 color-ed7 ft24 font-weight mui-ellipsis">￥'+data.rows[i].price+'</span>'
							+			'<span class="color-d2 ft24">月销'+data.rows[i].sales+'</span>'
							+		'</div>'
							+	'</div>'
							+'</li></a>';
					}
					$('#classify-ul'+ptype).append(html);
					$("#classify-list"+ptype).show();
				}
			}
		})
	}
	
	function weixin(){
		var _url=window.location.href;
		_url=_url.replace('&openId='+urlParam.openId,'');
		_url=_url.replace('?openId='+urlParam.openId,'');
		if(urlParam.UID){
			_url=_url.replace('&UID='+urlParam.UID,'&UID=');
			_url=_url.replace('?UID='+urlParam.UID,'?UID=');
		}
		var forwardUrl=sysCommon.silentAuthUrl+'?returnUrl='+encodeURIComponent(_url)+'&cmpyId='+cmpyId;
		weixinShare(sysCommon,cmpyId,forwardUrl,shopName,"欢迎光临"+shopName,logo);
	}
	
	//行为层
	function doEvent(){
		//判断上下滑动
		topFloatScroll();
		//跳转到搜素页
		$("#searchbox").on('tap',function(){
			if(urlParam.FUID){
				location.href = 'search.html?cmpyId='+cmpyId+'&openId='+openId+'&UID=&FUID='+urlParam.FUID+'&shopcmpyId='+urlParam.cmpyId;
			}else{
				location.href = 'search.html?cmpyId='+cmpyId+'&openId='+openId+'&shopcmpyId='+urlParam.cmpyId;
			}
		});
		//跳转到产品列表
		mui('.nav').on('click','.nav .link_to_list',function(){
			var _this=this;
			var title = _this.firstChild.innerText;
			var ptype=_this.getAttribute('ptype');
			if(urlParam.FUID){
				window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/classificationList.html?cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&ptype='+ptype+'&shopcmpyId='+urlParam.cmpyId+'&UID=&FUID='+urlParam.FUID+'&title='+title;
			}else{
				window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/classificationList.html?cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&ptype='+ptype+'&shopcmpyId='+urlParam.cmpyId+'&title='+title;
			}
		})
		mui('#classify-listbox').on('click','#classify-listbox .link_to_list',function(){
			var _this=this;
			var title = _this.parentNode.firstChild.innerText;
			var ptype=_this.getAttribute('ptype');
			if(urlParam.FUID){
				window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/classificationList.html?cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&ptype='+ptype+'&shopcmpyId='+urlParam.cmpyId+'&UID=&FUID='+urlParam.FUID+'&title='+title;
			}else{
				window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/classificationList.html?cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&ptype='+ptype+'&shopcmpyId='+urlParam.cmpyId+'&title='+title;
			}
		})
		//跳转到产品详情
		mui('#classify-listbox').on('click','#classify-listbox .link_to_product',function(){
			var _this=this;
			var cmpyId=_this.getAttribute('cmpyId');
			var ShopNumber=_this.getAttribute('ShopNumber');
			var ProductID=_this.getAttribute('ProductID');
			if(urlParam.FUID){
				window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/productDetail.html?cmpyId='+cmpyId+'&openId='+urlParam.openId+'&ShopNumber='+ShopNumber+'&ProductID='+ProductID+'&shopcmpyId='+urlParam.cmpyId+'&UID=&FUID='+urlParam.FUID;
			}else{
				window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/productDetail.html?cmpyId='+cmpyId+'&openId='+urlParam.openId+'&ShopNumber='+ShopNumber+'&ProductID='+ProductID+'&shopcmpyId='+urlParam.cmpyId+'&UID=';
			}
		})
		
		$("#gengduo").on('click',function(){
			$("#classifybox").fadeIn();
			$("#nva-listbox").hide();
//			if ($("#nva-listbox").is(":hidden")) {
//				$('body').css({"position":"fixed"});
//			}
		});
		$("#shouqi").on('click',function(){
			$("#classifybox").hide();
			$("#nva-listbox").fadeIn();
//			if ($("#classifybox").is(":hidden")) {
//				$('body').css({"position":"static"});
//			}
		});
		$(document).scroll(function(){
			var top = $(document).scrollTop();
			var htmlH = $(".storeinformation").outerHeight(true);
			if (top >= htmlH) {
				$(".position-fixed").css({"position":"fixed","left":"0","top":"-"+htmlH+"px"});
				$(".mask").css("top","1.2rem");
				$(".classify-listbox").css({"margin-top":"4.2rem"});
				$("#classifybox").hide();
				$("#nva-listbox").fadeIn();
			}else{
				$("#classifybox").hide();
				$("#nva-listbox").fadeIn();
				$(".position-fixed").css({"position":"static"});
				$(".mask").css("top","3.7rem");
				$(".classify-listbox").css({"margin-top":"0"});
			}
		})
	}
})()