var ProductID=urlParam.ProductID;
var ShopNumber=urlParam.ShopNumber;
var FUID=urlParam.FUID;
var UID=urlParam.UID;
var shopid;
var logoUrl = "image/logo@2x.png";//店铺默认logo
var forwardPicUrl="image/noimg.png";
var ProductName;
var ShopName;
var forwardDesc;//分享描述
var level = urlParam.level;
var recordId = urlParam.recordId;
var dataLocal=0;//本地储存数值
var uid;
var isdeleted;//是否下架
var soukongUID;//是否为蜂商
var shopcmpyId=urlParam.shopcmpyId;//个人店铺id
var productId=urlParam.productId;
var imglength;
$(function(){
	$('.product_detail').hide();
	if( !FUID || FUID=="undefined" || FUID==''){
		FUID="";
	}else{
		FUID= urlParam.FUID;
	}
	console.log(FUID);
	if(shopcmpyId=="undefined" || shopcmpyId=='' || !shopcmpyId){
		shopcmpyId="";
	}
	//loading();
	$(".productDetail_img").hide();
	LoadImg();//纯图文接口
	//uid同步获取 
	$.ajax({
    	type:"get",
		url:'/newmedia/mobile/wechatAccount/getSoukongAccountIdByOpenIdAndCmpyId.action',
		data:{'cmpyId':cmpyId,'openId':openId},
		async: false,
    	success:function(data){
    		if(data.soukongAccountId!=''){
    			soukongUID=data.soukongAccountId;//判断是否为蜂商
    			getSoukongUID=data.soukongAccountId;
    		}else{
    			getSoukongUID=getUid();//基本用户
    			soukongUID='';
    		}
    	}
    })
	if(getSoukongUID != "null" && getSoukongUID !="undefined"){
		uid=getSoukongUID;
		console.log("1+"+uid);
		getShopCartCount(ShopNumber,uid);//获取购物车的数量
	}else{
		if(UID!='' && UID!='undefined' && UID!='null'){
			uid=UID;
			console.log("2：url获取");
			getShopCartCount(ShopNumber,uid);//获取购物车的数量
		}else{
			uid='';
			console.log("3：没有uid");
			//当没有uid的时候 ,购物车的数量从本地存储中获取购物车的数量
			if(window.localStorage){
				var count=0;
				for(var i=localStorage.length - 1 ; i >=0; i--){
					$(".cartSum").show();
					  var array_=localStorage.key(i).split("^");
				      if(array_[2]==openId ){
				      	  count++;
				      }
		       }
			   $(".cartSum").html(count);
		    }
		}
	}
	console.log("uid:"+uid);
	//跳转到首页
	$(".header_box .btn_index").on("tap",function(){
		ToIndexFun();
	})
	//返回上一步到首页
	$('#go_back').on('tap',function(){
		ToIndexFun();
	})
})
function LoadImg(){
	$.ajax({
		type:"get",
		url:'/newmedia/app/get/shopinfo.action',
		data:{'cmpyId':cmpyId},
		success:function(data){
			if(data.header.code=="000"){
				if (typeof(data.rows.logo) != "undefined"){
					logoUrl = data.rows.logo;
				}
			}
		}
	});
	$.ajax({
		type:'get',
		timeout:8000,  //设置8秒超时
		dataType : "json",
		url:'/newmedia/app/picgood/getImglist.action?ShopNumber='+ShopNumber+'&ProductID='+ProductID+'&openId='+openId,
		success:function(data){
			$("#loading").hide();
			$(".productDetail_img").show();
			if(data.header.code=='000'){
				isdeleted=data.rows.iShow
				var html='';
				ProductName=unescape(data.rows.prodcutName);
				//产品标题
//				if(ProductName.length>12){  //限制名字长度
//					$('.head_name').html(ProductName.substring(0,10)+"...");
//				}else{
//					$(".head_name").html(ProductName);
//				}
				//店铺名称
				ShopName=unescape(data.rows.shopName);
				document.title=ShopName;
				forwardDesc="欢迎光临"+ShopName;
				//设置图片
				var ishow="hide";
				imglength = data.rows.imgs.length
				if(data.rows.imgs){
					for(var i=0;i<data.rows.imgs.length;i++){
						if(unescape(data.rows.imgs[i].remark)==''){
							ishow="hide";
						}else{
							ishow="show";
						}
						html+='<section class="swiper-slide">'
						   	+  	 	'<div class="box" data-x="'+data.rows.imgs[i].x+'" data-y="'+data.rows.imgs[i].y+'">'
						   	+ 	 		'<img src="'+unescape(data.rows.imgs[i].imgUrl)+'">'
						   	+  	        '<p class="'+ishow+'">'+unescape(data.rows.imgs[i].remark)+'</p>'
						   	+  	 	'</div>'
						   	+  	 '</section>';
					}
					$("#swiperBannerIn").append(html);
					console.log(data.rows.imgs.length)
				}
				//设置规格
				if(data.rows.skus){
					var skusData=data.rows.skus;
					var skusNameHTML='';
					var priceall=new Array();//商品价格
					for(var i=0;i<skusData.length;i++){
						//1规格上架    0 规格下架
						if(skusData[i].iShow == "1" ){
						    priceall.push(skusData[i].price);
						}else{
							continue;
						}
						if(skusData.length==1){
							skusNameHTML='<a class="on" data-name="'+unescape(skusData[i].skuName)+'" data-price="'+skusData[i].price+'" data-skuid="'+skusData[i].skuId+'" data-kd="'+skusData[i].kdRMB+'" data-zt="'+skusData[i].zTRMB+'">'+unescape(skusData[i].skuName)+'</a>';
						    Kdyj=skusData[i].kdRMB;
					    	ztyj=skusData[i].zTRMB;
					    	Price=skusData[i].price;//单价
					    	SkuName=unescape(skusData[i].skuName);//规格名称
					    	skuID=skusData[i].skuId;//规格
					    	$(".select_guige_moren").hide();
					    	$(".product_pic dd ul").removeClass('hide');
						    $(".product_pic dd ul").show();
						    $("#kd").html(Kdyj);//快递佣金
						    $("#zt").html(ztyj);//自提佣金
						    if(soukongUID!=""){
								 $(".select_guige_moren").hide();
						    	 $(".product_pic dd ul").show();
						    	 $("#kd").html(Kdyj);//快递佣金
						    	 $("#zt").html(ztyj);//自提佣金
							}else{
								 $(".select_guige_moren").show();
								 $(".select_guige_moren").html("已选择 '"+SkuName+"'");
						    	 $(".product_pic dd ul").hide();
						    	 $(".product_pic dd ul").removeClass('hide');
							}
						}else{
							skusNameHTML+='<a data-name="'+unescape(skusData[i].skuName)+'" data-skuid="'+skusData[i].skuId+'" data-price="'+skusData[i].price+'" data-zt="'+skusData[i].zTRMB+'" data-kd="'+skusData[i].kdRMB+'" href="javsScript:void(0)">'+unescape(skusData[i].skuName)+'</a>';
						}
					}
					$(".format_btn_box .format_btn").append(skusNameHTML);
					var pricemax=Math.max.apply(null, priceall);//价格最高
					var pricemin=Math.min.apply(null, priceall);//价格最低
					if(pricemax==pricemin||pricemax==""||pricemin==""){
						$(".product_name dd").html("￥"+pricemin);
						$(".format_price em").append(pricemin);
					}else{
						$(".product_name dd").html("￥"+pricemin+"-"+pricemax);
						$(".format_price em").append(pricemin+"-"+pricemax);
					}
				}
				if(urlParam.shopcmpyId && urlParam.shopcmpyId !="undefined"){
					honeybeeHtml();  //底部按钮
				}
				selectCompanyInFo();
				effectFun();
				//从接口获取fuid
				getFuid=ajaxGetData("/newmedia/mobile/wechatAccount/getSoukongAccountId.action?openId="+openId+"&cmpyId="+cmpyId+"&shopcmpyId="+shopcmpyId,'get').soukongAccountId;
				addReadShopDetailRecord();//插入阅读记录
			}
		},
		error:function(){
				mui.confirm('网络超时了，刷新试试？','提示',['否', '刷新'],function(e){
					if(e.index==1)location.reload();
				})
				$('#public_center,#loading').hide();
		},
		complete:function(XMLHttpRequest,status){
			if(status=='timeout'){
				mui.confirm('网络超时了，刷新试试？','提示',['否', '刷新'],function(e){
					if(e.index==1)location.reload();
				})
			}
		}
	})
}
var formatNameTip=$(".select_detail .format_name").text();
function effectFun(){
	//纯图片 文字定位
	$(".swiper-container .swiper-slide").each(function(){
		var x=$(this).find(".box").attr("data-x");
		var y=$(this).find(".box").attr("data-y");
		$(this).find("p").css({"left":y,"top":x});
	})
	//设置一屏高
	var windowHeigth=window.innerHeight;
	var footer=$("footer").outerHeight(true);
	var headerH=$(".header_box").outerHeight(true);
	var contentH=Number(windowHeigth-footer-headerH).toFixed(2);
	$(".swiper-container").css({"height":contentH+"px","margin-top":headerH});
	forwardPicUrl=$(".swiper-container .swiper-slide").eq(0).find("img").attr("src");
	console.log($(".swiper-container .swiper-slide").eq(0).find("img").attr("src"));
	$(".product_pic dl dt").html('<img src="'+forwardPicUrl+'"/>');
	var mySwiper = new Swiper('.swiper-container',{
       direction : 'vertical',
       onSlideChangeStart: function(swiper){
       	  //向下滑动则隐藏顶部按钮
		  if(swiper.swipeDirection=='prev'){
			$('#leader_float').hide();
		  }
		  if(swiper.swipeDirection=='next'){
			$('#leader_float').show();
		  }
       	  $(".product_pic dl dt").html('');
	      forwardPicUrl=$(".swiper-container .swiper-slide").eq(swiper.activeIndex).find("img").attr("src");
	      $(".product_pic dl dt").html('<img src="'+forwardPicUrl+'"/>');
	   }
	})
	
	//弹窗滑动
	mui('.format_btn_scroll').scroll({
		deceleration: 0.0005
	});
    //规格的选择
    $(".format_btn a").on("tap",function(){
    	var Athis_=$(this).index;
    	 Kdyj=$(this).attr("data-kd");
    	 ztyj=$(this).attr("data-zt");
    	 Price=$(this).attr("data-price");//单价
    	 SkuName=$(this).attr("data-name");//规格名称
    	 skuID=$(this).attr("data-skuid");//规格
    	 $(".format_price em").html(Price);
    	 $(".format_btn a").removeClass("on");
    	 $(this).addClass("on");
		if(soukongUID!=""){
			 $(".select_guige_moren").hide();
	    	 $(".product_pic dd ul").show();
	    	 $("#kd").html(Kdyj);//快递佣金
	    	 $("#zt").html(ztyj);//自提佣金
		}else{
			 $(".select_guige_moren").show();
			 $(".select_guige_moren").html("已选择 '"+SkuName+"'");
	    	 $(".product_pic dd ul").hide();
		}
    })
    //购买数量的加减
    var buyNum=$("#buyNum").text();
    $(".num #reduceBtn").on("tap",function(){
    	buyNum--;
    	if(buyNum<=1){
    		buyNum=1;
//  		$(this).css({"background":"#ddd","color":"#999"});
    		mui.toast("不能少于1");
        } 
    	$("#buyNum").text(buyNum);
    })
    $(".num #addBtn").on("tap",function(){
    	buyNum++;
//  	if(buyNum>1){
// 		$(".num #reduceBtn").css({"background":"#fff","color":"#000"});
//      } 
    	$("#buyNum").text(buyNum);
    })
    //弹窗显示与消失
    $("#closeLayer").on("tap",function(){
    	$("body").removeClass("fixed");
    	$(this).parents(".choose_format").addClass("transform");
    	$(".black_bg").hide();
    })
    var type;
    console.log("hhhhhhhhhhhhhhhhh");
    $("#buyNow").on("tap",function(){
    	console.log("okokooko");
    	$("body").addClass("fixed");
		$(".choose_format").removeClass("transform");
		$(".black_bg").show();
        type="2";
    	$(".choose_format").find(".sure_btn").show();
    	$(".choose_format").find(".sure_btn").attr("data-type",type);
    	$(".choose_format").find(".footerLayer").hide();
    })
    $("#goCart").on("tap",function(){
    	$("body").addClass("fixed");
		$(".choose_format").removeClass("transform");
		$(".black_bg").show();
    	type="1";
    	$(".choose_format").find(".sure_btn").show();
    	$(".choose_format").find(".sure_btn").attr("data-type",type);
    	$(".choose_format").find(".footerLayer").hide();
    })
    //进入购物车
    $("footer span").on("tap",function(){
    	toCartFun();
    })
    //购物车的数量为0.则隐藏数量
    var cartSum=$(".cartSum").text();
    if(Number(cartSum)<=0){
    	$(".cartSum").hide();
    }else{
    	$(".cartSum").show();
    }
    //1产品下架   0上架
    if(isdeleted == 1){
		$("body").append("<div class='no_tip'>此商品已下架</div>");
		$(".icno_up").addClass("in");
		$("#goCart").off('tap');
		$("#buyNow").off('tap');
		$(".specifications").off('tap');
		$("#goCart").css('background','#9b9b9b');
		$("#buyNow").css('background','#9b9b9b');
		$(".logo_bottom").css("margin-bottom",'.5rem');
	}
    //点击确定
    var aOn=true;
	$(".sure_btn").on("tap",function(){
		var type=$(this).attr("data-type");
		console.log("type:"+type);
		if($(".format_btn a").hasClass("on")){
			sureFun(type);
		}else{
			mui.toast("请选择"+formatNameTip+"!");
		}
	})
	//客服显示
	serviceFun();
	$("#service").on("tap",function(){
		$(".customer_service").show();
		$(this).find("img").attr("src",'image/p_service_in.png');
		$(this).find("p").addClass("orange_txt");
	})
	$('.customer_service .close').on("tap",function(){
		$(".customer_service").hide();
		$('#service').find("img").attr("src",'image/p_service_gray.png');
		$("#service").find("p").removeClass("orange_txt");
	})
}
function serviceFun(){
	$.ajax({
		type:"post",
		url:"/newmedia/mobile/cmpySetting/selectCmpyByIda.action",
		data:{"shopNumber":ShopNumber},
		success:function(data){
			if(data.header.code=='000'){
				if(data.telephone=='' && data.qq==''){
					$("#service").hide();
					$(".cartSum").css({'right':'.35rem'});
				}else{
					$("#service").show();
					$(".cartSum").css({'right':'.15rem'});
					console.log(data.telephone);
					if(data.telephone!=''){
						$(".pd_tel_a").show();
						$(".pd_tel_a a").attr("href",'tel:'+data.telephone);
					}
					if(data.qq!=''){
						$(".pd_qq_a").show();
						var qqurl="http://wpa.qq.com/msgrd?v=3&uin="+data.qq+"&site=qq&menu=yes";
				        $(".pd_qq_a").on("tap",function(){
						    mui.confirm("是否QQ交谈","提示",["取消","确定"],function(e){
						    	if(e.index==1)window.location.href=qqurl;
						    });
						})
					}
				}
			}else if(data.code=='NO'){
				$("#service").hide();
				$(".cartSum").css({'right':'.35rem'});
			}
		}
	});
}
function addCartFun(type){
	$("body").addClass("fixed");
	$(".choose_format").removeClass("transform");
	$(".black_bg").show();
	var aOn=true;
	$(".sure_btn button").on("tap",function(){
    	if($(".format_btn a").hasClass("on")){
    		if(aOn){
    			sureFun(type);
    			aOn=false;
    		}
    	}else{
    		mui.toast("请选择"+formatNameTip+"!");
    	}
    })
}
var skuID = "";
var Price ="";
var Kdyj = "";
var ztyj = "";
var SkuName="";//规格名称
/*  确定订单
 * type 1加入购物车 2立即购买
 * */
function sureFun(type){
	if(localStorage.getItem("uidHidden_"+ShopNumber)){
			uid=localStorage.getItem("uidHidden_"+ShopNumber);
	}
	if($("#uidHidden").length!="0" && $("#uidHidden").val()!=''){
			uid=$("#uidHidden").val();
	}
	if(uid !=''){
			$(".choose_format").addClass("transform");
		    $(".black_bg").hide();
			$("body").removeClass("fixed");
			sureInFun(type,uid);
	}else{
	        var sum = parseInt($("#buyNum").text()) ;//
			var dianName=$(".shop_name span").html();
			var price=$(".format_price em").html();
			//var proname=$(".head_name").html().trim();
			var proname=ProductName
			var photo=$(".product_pic dt img").attr("src");
			var b =false;
			var num_ = 0;
			var key=0;
			//type=2立即购买 type=1加入购物车
			if(type==2){
				if(!openId || openId=="undefined" || openId=="" || openId=="null"){
					loginHTML();
					console.log("no openid");
			    }else{
			    	registerHTML();
			    	console.log("yes openid");
			    }
			}else{
				$(".choose_format").addClass("transform");
			    $(".black_bg").hide();
				$("body").removeClass("fixed");
				mui.toast("添加购物车成功");
				if(window.localStorage){
					dataLocal=window.localStorage.length;
					for(var i=localStorage.length - 1 ; i >=0; i--){
						  var array_=localStorage.key(i).split("^");
					      if(array_[1]==ShopNumber && array_[2]==openId){
					      	  var res=localStorage.getItem(localStorage.key(i)).split("|");
				              if(skuID == res[1]){
				              	num_ = parseInt(res[5]);
				              	key=localStorage.key(i);
				              	b = true;
				              	break;
				              }
					      }
			        }
				}
				if(!b){
		          	dataLocal++;
					$(".cartSum").show();
					$(".cartSum").html(Number($(".cartSum").html())+Number("1"));
		       }else{
		       	    sum = sum + num_;
		       }
		       //商品ID|skuID|商品name|skuName|价格|添加到购物车的商品数量|商品名称|店铺名称|店铺logo|商品的图片
			    var data=ProductID+"|"+skuID+"|"+ProductName+"|"+SkuName+"|"+Price+"|"+sum+"|"+ShopNumber+"|"+ShopName+"|"+logoUrl+"|"+forwardPicUrl;
				if(b){
					localStorage.setItem(key,data);
				}else{
					localStorage.setItem(dataLocal+"^"+ShopNumber+"^"+openId,data);
				}
			}
		}
		
}
/*
 * type 1加入购物车 2立即购买
 * */
function sureInFun(type,uid){
	var buyNum=$("#buyNum").text();
	if(type=='2'){
		str = ProductID+"|"+skuID+"|"+ProductName+"|"+SkuName+"|"+Price +"|"+buyNum+"|"+ShopNumber+"|"+ShopName+"|"+logoUrl+"|"+forwardPicUrl;
		var sourceId='';
		if(urlParam.sourceId){
			sourceId='&sourceId='+urlParam.sourceId+'&sourceType='+urlParam.sourceType;
		}
		if(urlParam.shopcmpyId){
			shopcmpyId='&shopcmpyId='+urlParam.shopcmpyId;
		}
		var fuid='';
        if(urlParam.FUID && urlParam.FUID!=''){
        	fuid=urlParam.FUID;
        }else{
        	fuid=getFuid;
        }
		var Url = "sureOrder.html?ShopNumber="+ShopNumber+ "&UID="+uid+"&openId="+openId+"&cmpyId="+cmpyId+"&FUID="+fuid+shopcmpyId+sourceId+'&allImg=y';
		//不用授权、直接跳转到确认订单页面
		localStorage.setItem("shop"+ShopNumber+"^"+openId,str);
		window.location.href = Url;
	}else{
		var url ="/newmedia/mobile/shop/cart/addShopCart.action?shopNumber="+ShopNumber+"&skuID="+skuID+"&uid="+uid + "&productID=" + ProductID + "&cmpyId=" + cmpyId + "&quantity=" + buyNum;
		// 增加fuid参数，记录用户添加购物车时对应的分享人uid
		if(urlParam.FUID && urlParam.FUID!=''){
			url = url + "&fuid="+urlParam.FUID;
        }else{
        	url = url + "&fuid="+getFuid;
        }
		fun(openId,cmpyId,url,uid);
	}
}
function fun(openId,cmpyId,url,uid){
	$.ajax({
		type : "GET",
		url : url,
		dataType : "json",
		success : function(data) {
			if(data.RES==100){
				mui.toast("添加购物车成功");
				$(".choose_format").addClass("transform");
				$(".black_bg").hide();
				$("body").removeClass("fixed");
				getShopCartCount(ShopNumber,uid);
			}else{
				mui.toast("网络异常添加失败,请稍后再试");
			}
		},
	});
}
//去购物车
function toCartFun(){
	var shopcmpyId='';
	if(urlParam.shopcmpyId){
		shopcmpyId='&shopcmpyId='+urlParam.shopcmpyId;
	}
	if(urlParam.FUID){
		var returnUrl ="shoppingCart.html?ShopNumber="+ShopNumber+"&openId="+ openId +"&cmpyId=" + cmpyId+shopcmpyId+'&UID='+uid+'&FUID='+FUID+'&allImg=y&botMenu=1';
	}else{
		var returnUrl ="shoppingCart.html?ShopNumber="+ShopNumber+"&openId="+ openId +"&cmpyId=" + cmpyId+shopcmpyId+'&UID='+uid+'&allImg=y&botMenu=1';
	}
    window.location.href=returnUrl;
}
function getShopCartCount(shopNumber,uid){
	$.ajax({
		type : "GET",
		url : "/newmedia/mobile/shop/cart/getShopCartCount.action?uid="+uid,
		dataType : "json",
		success : function(data) {
			 if(data.RES=="100"){
			 	var cartSum=0;
				$(".cartSum").show();
				if(data.DATA.COUNT){
					cartSum=data.DATA.COUNT
//					var shop=data.DATA.Shop;
//					for(var i=0;i<shop.length;i++){
//						cartSum+=shop[i].ShopCart.length;
//					}
					$(".cartSum").html(cartSum);
				}
			}else if(data.RES=="102"){
				$(".cartSum").hide();
			}else{
				var cartSumText=$(".cartSum").text();
				if(Number(cartSumText)<=0){
					$(".cartSum").hide();
				}
			}
		}
	})
}
//判断数值
function isNumber(obj){ 
	return (typeof obj=='number')&&obj.constructor==Number; 
} 
//点击图片放大
function imgToBig(_obj){
	$('#big_code *').remove();
	$('#big_code').show();
	console.info(_obj.src);
	$('#big_code').append('<img src="'+_obj.src+'">');
	var imgHeight=$('#big_code img').height();
	$('#big_code img').css({'margin-top':-imgHeight/2});
}
$('#big_code').on('touchend',function(){
	$('#big_code').hide();
	event.preventDefault();
})
//复制链接地址---产品详情
$("#copyLink").on("tap",function() {
	$(".copyLink_box").show();
	$.ajax({
		type : "POST",
		url : '/newmedia/mobile/shop/getShortLink.action',
		dataType : "json",
		success : function(data) {
			if(data){
			  var link=data.rows;
			  $(".copyLink_box input").attr("value",link);
			}
		},
	})
});
$(".copyLink_box").on("tap",function(){
	$(".copyLink_box").hide();
})
$(".copyLink_content").on("tap",function(e){
	e.stopPropagation();
})
//商品详情跳转到首页
function ToIndexFun(){
	//如果企业没设置过未来店首页，则不跳转首页并给出提示
	var qrurl="/newmedia/mobile/shop/indexproduct/queryWechatShopIndexProduct.action?cmpyid="+cmpyId;
	$.ajax({
		type : "get",
		url : qrurl,
		dataType : "json",
		success : function(data) {
			if(data){
			  window.location.href="/newmedia/pages/mobile/futureStore/headpage.html?cmpyId="+urlParam.cmpyId+"&openId="+urlParam.openId+"&UID="+urlParam.UID+"&FUID="+urlParam.FUID+"&ShopNumber="+ShopNumber;
			}else{
				mui.toast("请先登录PC端设置微商城首页");
			}
		},
	})
}
/**
 * 插入阅读记录,返回新的recordId
 */
function addReadShopDetailRecord(){
	var level;
	var readLogId;
	var startTime = new Date().getTime();
	var parentOpenId='0'; //父级openId
	if(urlParam.parentOpenId){
		parentOpenId=urlParam.parentOpenId;
	}
	if(urlParam.level){
		level=parseInt(urlParam.level);
	}else{
		level=0;
		recordId = 0;
	}
	if(urlParam.openId!=urlParam.parentOpenId){
		level=level+1;
	}
	var _data={'mediaId':urlParam.ProductID,'companyId':cmpyId,'readOpenId':urlParam.openId,'forwardOpenId':parentOpenId,'level':level,'type':"4"};
	if(urlParam.communicators){
		_data.communicators=urlParam.communicators;
	}
	// 如果传播记录Id不为空，将参数传至接口
	if (urlParam.recordId) {
		_data.recordId=urlParam.recordId;
	}
	if (urlParam.recordid) {
		_data.recordId=urlParam.recordid;
	}
	$.ajax({
			type : "post",
			url:'/newmedia/mobile/media/insertReadLog.action',
			data:_data,
			dataType : "json",
			success : function(Data) {
				 if (Data) {
					var mediaInfo = Data.mediaInfo;
					if(Data.recordId){
						recordId = Data.recordId;
					}else{
						recordId = "0";
					}
					readLogId = Data.readLogId;
					$("#recordId").val(recordId);
					if(urlParam.shopcmpyId && urlParam.shopcmpyId !="undefined"){
						shopcmpyId=urlParam.shopcmpyId;
					}else{
						shopcmpyId='';
					}
					//微信分享
					sysCommon=getSysCommonUrl();
					var _fuid='';
					if(getFuid!=''){
						_fuid = getFuid;
					}else if(urlParam.FUID && urlParam.FUID!=''){
						_fuid=urlParam.FUID 
					}
					if(Data.communicators){
						var currentUrl=getUrlNoParam()+'?FUID='+_fuid+'&ShopNumber='+ShopNumber+'&ProductID='+ProductID+'&UID=&cmpyId='+cmpyId+'&communicators='+Data.communicators+"&shopcmpyId="+shopcmpyId+"&level="+level+"&parentOpenId="+openId+'&recordId='+recordId;
					}else{
						var currentUrl=getUrlNoParam()+'?FUID='+_fuid+'&ShopNumber='+ShopNumber+'&ProductID='+ProductID+'&UID=&cmpyId='+cmpyId+"&shopcmpyId="+shopcmpyId+"&level="+level+"&parentOpenId="+openId+'&recordId='+recordId;
					}
					var redirect_uri_forward=encodeURIComponent(currentUrl);
					var forwardUrl=sysCommon.silentAuthUrl+'?returnUrl='+redirect_uri_forward+'&cmpyId='+cmpyId;
					console.log(forwardUrl);
					//微信分享
					weixinRecord(
						sysCommon,
						forwardUrl,
						cmpyId,
						ProductID,
						ProductName,
						forwardDesc,
						forwardPicUrl,
						'',
						readLogId,
						level,
						openId,
						parentOpenId,
						urlParam.recordId,
						null,
						4
					);
				 }
			},
	});
}
//function addReadShopDetailRecord(){
//	var level;
//	var readLogId;
//	var startTime = new Date().getTime();
//	var parentOpenId='0'; //父级openId
//	if(urlParam.parentOpenId){
//		parentOpenId=urlParam.parentOpenId;
//	}
//	if(urlParam.level){
//		level=parseInt(urlParam.level);
//	}else{
//		level=0;
//		recordId = 0;
//	}
//	if(urlParam.openId!=urlParam.parentOpenId){
//		level=level+1;
//	}
//	var _data={'mediaId':urlParam.ProductID,'companyId':cmpyId,'readOpenId':urlParam.openId,'forwardOpenId':parentOpenId,'level':level,'type':"4"};
//	if(urlParam.communicators){
//		_data.communicators=urlParam.communicators;
//	}
//	// 如果传播记录Id不为空，将参数传至接口
//	if (urlParam.recordId) {
//		_data.recordId=urlParam.recordId;
//	}
//	$.ajax({
//			type : "post",
//			url:'/newmedia/mobile/media/insertReadLog.action',
//			data:_data,
//			dataType : "json",
//			success : function(Data) {
//				 if (Data) {
//					var mediaInfo = Data.mediaInfo;
//					recordId = Data.recordId;
//					readLogId = Data.readLogId;
//					$("#recordId").val(recordId);
//					//微信分享
//					sysCommon=getSysCommonUrl();
//					var userId=ajaxGetData("/newmedia/mobile/wechatAccount/getSoukongAccountId.action?openId="+openId+"&cmpyId="+cmpyId,'get');
//					var _fuid;
//					if(FUID){
//						_fuid=FUID;
//					}else{
//						_fuid='';
//					}
//					soukongUID=userId.soukongAccountId;
//					if(userId.soukongAccountId!="null"){
//						_fuid=userId.soukongAccountId;
//					}else{
//						_fuid=_fuid;
//					}
//					if(urlParam.shopcmpyId && urlParam.shopcmpyId !="undefined"){
//						shopcmpyId=urlParam.shopcmpyId;
//					}else{
//						shopcmpyId='';
//					}
//					if(Data.communicators){
//						var currentUrl=getUrlNoParam()+'?FUID='+_fuid+'&ShopNumber='+ShopNumber+'&ProductID='+ProductID+'&UID=&cmpyId='+cmpyId+'&communicators='+Data.communicators+"&shopcmpyId="+shopcmpyId+"&level="+level+"&parentOpenId="+openId;
//					}else{
//						var currentUrl=getUrlNoParam()+'?FUID='+_fuid+'&ShopNumber='+ShopNumber+'&ProductID='+ProductID+'&UID=&cmpyId='+cmpyId+"&shopcmpyId="+shopcmpyId+"&level="+level+"&parentOpenId="+openId;
//					}
//					var redirect_uri_forward=encodeURIComponent(currentUrl);
//					var forwardUrl=sysCommon.silentAuthUrl+'?returnUrl='+redirect_uri_forward+'&cmpyId='+cmpyId;
//					console.log(forwardUrl);
//					//微信分享
//					weixinRecord(
//						sysCommon,
//						forwardUrl,
//						cmpyId,
//						ProductID,
//						ProductName,
//						forwardDesc,
//						forwardPicUrl,
//						'',
//						readLogId,
//						level,
//						openId,
//						parentOpenId,
//						urlParam.recordId,
//						null,
//						4
//					);
//				 }
//			},
//	});
//}