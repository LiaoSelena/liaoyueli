var ProductID=urlParam.ProductID;
var ShopNumber=urlParam.ShopNumber;
var FUID=urlParam.FUID;
var UID=urlParam.UID;
var shopid;
var logoUrl = "image/sureOrder_shop.png";//店铺默认logo
var forwardPicUrl="image/noimg.png";
var ProductName;
var ShopName;
var forwardDesc;//分享描述
var recordId = urlParam.recordId;
var dataLocal=0;//本地储存数值
var uid;
var isdeleted;//是否下架
var soukongUID;//判断是否为蜂商
var getSoukongUID;//基础用户
var shopcmpyId=urlParam.shopcmpyId;//个人店铺id
var flagSim=false;  //sim卡逻辑标识
var flagSimPass=false;  //是否选择了sim卡标识
var pageIndex=1;
var pageSize=18;
var simNumTotal='';  //号码总数
var getFuid;

//$(function(){
//	$('.product_detail').hide();
//	if(urlParam.shopcmpyId && urlParam.shopcmpyId !="undefined"){
//		honeybeeHtml();  //底部按钮
//		shopcmpyId=urlParam.shopcmpyId;
//	}else{
//		shopcmpyId=''
//	}
//	if(FUID=="undefined" || FUID=='' || !FUID){
//		FUID="";
//	}else{
//		FUID= urlParam.FUID;
//	}
//	loadMainFun();//主接口
//	//跳转到首页
//	$(".header_box .btn_index").on("tap",function(){
//		ToIndexFun();
//	})
//	//返回上一步到首页
//	$('#go_back').on('tap',function(){
//		ToIndexFun();
//	})
//})
function loadMainFun(){
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
	if(getSoukongUID != "null" && getSoukongUID !="undefined" && getSoukongUID!=''){
		uid=getSoukongUID;
		console.log("1基础用户"+uid);
		getShopCartCount(ShopNumber,uid);//获取购物车的数量
	}else{
		if(UID!='' && UID!='undefined' && UID!='null'&& typeof(UID)!="undefined"){
			uid=UID;
			getShopCartCount(ShopNumber,uid);//获取购物车的数量
			console.log("2URL取的"+uid);
		}else{
			uid='';
			console.log("3未注册用户");
			//当没有uid的时候 ,购物车的数量从本地存储中获取购物车的数量
			if(window.localStorage){
				var count=0;
				$(".cartSum").show();
				for(var i=localStorage.length - 1 ; i >=0; i--){
					  var array_=localStorage.key(i).split("^");
				      if(array_[2]==openId){
				      	  count++;
				      }
		       }
				$(".cartSum").html(count);
		    }
		}
	}
	if("" != cmpyId && cmpyId){
		$.ajax({
			type:"get",
			url:'/newmedia/app/get/shopinfo.action',
			data:{'cmpyId':cmpyId},
			success:function(data){
				if(data.header.code=="000"){
					if (typeof(data.rows.logo) != "undefined" && data.rows.logo!=""){
						logoUrl = data.rows.logo;
					}
				}
			}
		});		
	}
	$.ajax({
			type:'get',
			url:"/newmedia/mobile/shop/indexproduct/getCommodityDetails.action?ShopNumber="+ShopNumber+"&ProductID="+ProductID+"&openId="+openId,
			success:function(data){
				if(data){
					if(data.RES==100){
						//打开sim卡逻辑
						if(data.DATA.Product.IsLoadMoblies=='True'){
							flagSim=true;
							sim();  //sim卡逻辑
						}
						$('.product_detail').show();
						$(".logo_bottom").show();
						shopid=data.DATA.Product.ProductID;
						var imgList=data.DATA.Product.ImgList;
						var bannerHTML='';
						if(imgList.length>0){
							forwardPicUrl=unescape(imgList[0].ImgUrl);
							if(imgList.length <= 1 ){
								bannerHTML+='<a href="javaScript:void(0)"><img src="'+unescape(imgList[0].ImgUrl)+'" /></a>';
								$("#bannerImg").append(bannerHTML);
							}else{
								for(var i=0;i<imgList.length;i++){
								    bannerHTML+='<div class="mui-slider-item banner_item"><a href="javaScript:void(0)"><img src="'+unescape(imgList[i].ImgUrl)+'" /></a></div>';	
								}
								$("#bannerImg").append('<div class="mui-slider-group mui-slider-loop">'+
		  	'<div class="mui-slider-item mui-slider-item-duplicate"><a href="javaScript:void(0)"><img src="'+unescape(imgList[imgList.length-1].ImgUrl)+'" /></a></div>'+
		                         bannerHTML+'<div class="mui-slider-item mui-slider-item-duplicate"><a href="javaScript:void(0)"><img src="'+unescape(imgList[0].ImgUrl)+'" /></a></div></div>');
							}
						}else{
							forwardPicUrl="img/noimg.png";
							bannerHTML+='<a href="javaScript:void(0)"><img src="'+forwardPicUrl+'" /></a>';
							$("#bannerImg").append(bannerHTML);
						}
						$(".product_pic dt").html('<img src="'+forwardPicUrl+'" />');//获取商品详情：商品规格里面的图片
						ProductName=unescape(data.DATA.Product.ProductName);
						$(".product_name dl dt").html(ProductName);//商品名称
						var priceall=new Array();//商品价格
						//标题
						$(".head_name").html(unescape(data.DATA.Product.ProductName));
//						$(".head_name").attr("title",unescape(data.DATA.Product.ProductName));
//						if($('.head_name').html().length>12){  //限制名字长度
//							$('.head_name').html($('.head_name').html().substring(0,10)+"...");
//						}
						var slectguigeHTML='';
						var guigeHTML='';
						for(var i=0;i<data.DATA.Product.SkuList.length;i++){
							//下架的和删除不显示
							if(data.DATA.Product.SkuList[i].ApproveStatus == "2" || data.DATA.Product.SkuList[i].ApproveStatus == "0"){
								continue;
							}else{
								priceall.push(data.DATA.Product.SkuList[i].Price);
							}
							if(data.DATA.Product.SkuList.length==1){
								slectguigeHTML='<a class="on" data-name="'+unescape(data.DATA.Product.SkuList[i].SkuName)+'" data-price="'+data.DATA.Product.SkuList[i].Price+'" data-skuid="'+data.DATA.Product.SkuList[i].SkuID+'" data-kd="'+data.DATA.Product.SkuList[i].Kdyj+'" data-zt="'+data.DATA.Product.SkuList[i].ztyj+'">'+unescape(data.DATA.Product.SkuList[i].SkuName)+'</a>';
							    Kdyj=data.DATA.Product.SkuList[i].Kdyj;
						    	ztyj=data.DATA.Product.SkuList[i].ztyj;
						    	Price=data.DATA.Product.SkuList[i].Price;//单价
						    	SkuName=unescape(data.DATA.Product.SkuList[i].SkuName);//规格名称
						    	skuID=data.DATA.Product.SkuList[i].SkuID;//规格
					    		if(soukongUID!=""){
									 $(".select_guige_moren").hide();
							    	 $(".product_pic dd ul").show();
							    	 $("#kd").html(Kdyj);//快递佣金
							    	 $("#zt").html(ztyj);//自提佣金
								}else{
									console.log('okokoko');
									 $(".select_guige_moren").show();
									 $(".select_guige_moren").html("已选择 '"+SkuName+"'");
							    	 $(".product_pic dd ul").hide();
							    	 $(".product_pic dd ul").removeClass('hide');
								}
							}else{
								slectguigeHTML+='<a href="javsScript:void(0)" data-name="'+unescape(data.DATA.Product.SkuList[i].SkuName)+'" data-price="'+data.DATA.Product.SkuList[i].Price+'" data-skuid="'+data.DATA.Product.SkuList[i].SkuID+'" data-kd="'+data.DATA.Product.SkuList[i].Kdyj+'" data-zt="'+data.DATA.Product.SkuList[i].ztyj+'">'+unescape(data.DATA.Product.SkuList[i].SkuName)+'</a>';
							}
							guigeHTML+='<dd class="left-float-top">'+
											'<span class="arial">'+data.DATA.Product.SkuList[i].SkuID+'</span>'+
											'<span>'+unescape(data.DATA.Product.SkuList[i].SkuName)+'</span>'+
											'<span class="arial">￥'+data.DATA.Product.SkuList[i].Price+'</span>'+
										'</dd>';
						}
						$(".format_btn").append(slectguigeHTML);//弹窗规格名称的选择
						$(".info dt").after(guigeHTML);//规格说明
						var pricemax=Math.max.apply(null, priceall);//价格最高
						var pricemin=Math.min.apply(null, priceall);//价格最低
						if(pricemax==pricemin||pricemax==""||pricemin==""){
							$(".product_name dd").html("￥"+pricemin);
							$(".format_price em").append(pricemin);
						}else{
							$(".product_name dd").html("￥"+pricemin+"-"+pricemax);
							$(".format_price em").append(pricemin+"-"+pricemax);
						}
						ShopName=unescape(data.DATA.Product.ShopName);
						$(".shop_name p span").html(ShopName);//店铺名称
						$("title").html(ShopName);
						forwardDesc="欢迎光临"+document.title;
						$(".shop_name p em").html("<img src='"+logoUrl+"' />");//店铺logo
						var redirectUrl = '/newmedia/pages/mobile/futureStore/headpage.html?ShopNumber='+ShopNumber+'&openId='+openId+'&cmpyId='+cmpyId+'&FUID='+FUID+'&UID='+uid;
//						$(".shop_name a").attr("href",redirectUrl);//店铺链接
						//图文详情
						var html=unescape(data.DATA.Product.FullDesc);
						//图片懒加载
						var createFragment=function() {
							var fragment=document.createDocumentFragment();
							var div=document.createElement('div');
							div.innerHTML=html;
							fragment.appendChild(div);
							return fragment;
						}
						var article=document.getElementById("pic_text");
					    article.appendChild(createFragment());
						mui(document).imageLazyload({
							placeholder:'image/img_nothing.jpg'
						})
					    isdeleted=data.DATA.Product.deleted;//下架商品
					}else if(data.RES==110){
						$(".product_detail").hide();
						mui.alert("该商品不存在！",function(){
							history.back(-1);
						});
					}
				}
				$('#loading').hide();
				selectCompanyInFo()//判断该商品是个人还是企业的
				selectCmpyId();//底部logo
				effectFun();//页面效果
				//从接口获取fuid
				getFuid=ajaxGetData("/newmedia/mobile/wechatAccount/getSoukongAccountId.action?openId="+openId+"&cmpyId="+cmpyId+"&shopcmpyId="+shopcmpyId,'get').soukongAccountId;
				addReadShopDetailRecord();//插入阅读记录
			},
			error:function(){
				if(confirm('网络出错啦，刷新试试？'))location.reload();
			},
		});
}
var formatNameTip=$(".select_detail .format_name").text();
function effectFun(){
	//轮播图
	mui('.banner').slider({
	  interval:3000
	});
	//滑动
	mui('.format_btn_scroll').scroll({
		deceleration: 0.0005
	});
	var itemLen=$(".banner").find(".banner_item").length;
    var spanHTML="";
    if(itemLen>1){
    	for(var i=0;i<itemLen;i++){
  	        spanHTML+='<span></span>';
	    }
	    $(".banner .icon_dot").append(spanHTML);
    }
    $(".banner .icon_dot span").eq(0).addClass("on");
	document.querySelector('.banner').addEventListener('slide', function(event) {
	  var spanIndex=event.detail.slideNumber;
	  $(".banner .icon_dot span").removeClass("on");
	  $(".banner .icon_dot span").eq(spanIndex).addClass("on");
	});
	//距离顶部的距离 windowHeigth
	var mui_sliderH=$(".mui-slider").height();//banner高
	var product_nameH=$(".product_name").outerHeight(true);//产品名称的高
	var specificationsH=$(".specifications").outerHeight(true);//选择规格
	var shop_nameH=$(".shop_name").outerHeight(true);//店铺名称
	var headerH=$(".header_box").height();//头部的高
	var logo_bottomH=$(".logo_bottom").outerHeight(true);//底部logo的高
	var footerH=$("footer").outerHeight(true);//导航的高
	var detailNavH=$(".detail nav").outerHeight(true);
	var allH=Number(mui_sliderH+product_nameH+specificationsH+shop_nameH);
	$(".detail ul").css("min-height",Number(windowHeigth-headerH-detailNavH-logo_bottomH));
	$(".detail ul li").hide().eq(0).show();
	//切换
	var flag=true;
	$(".detail nav a").on("tap",function() {
	      $("html,body").animate({scrollTop:allH}, 500);
	      var this_=$(this).index();
	      $(".detail nav a").removeClass("on");
	      $(this).addClass("on");
	      $(".detail ul li").hide();
	      $(".detail ul li").eq(this_).show();
	      //推荐产品
	      if(flag){
	      	recommendFun();	
			flag=false;
	      }
	      
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
    	 console.log(soukongUID);
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
    		//$(this).css({"background":"#ddd","color":"#999"});
    		mui.toast("不能少于1");
        } 
    	$("#buyNum").text(buyNum);
    })
    $(".num #addBtn").on("tap",function(){
    	if(!flagSim){
    		buyNum++;
	    	if(buyNum>1){
	    		$(".num #reduceBtn").css({"background":"#fff","color":"#000"});
	        } 
	    	$("#buyNum").text(buyNum);
    	}else{
    		mui.toast('此类商品限购一张哦！');
    	}
    })
    //弹窗显示与消失
    $("#closeLayer").on("tap",function(){
    	$("body").removeClass("fixed");
    	$(this).parents(".choose_format").addClass("transform");
    	$(".black_bg").hide();
    })
    $(".specifications").on("tap",function(){
    	$("body").addClass("fixed");
	    $(".choose_format").removeClass("transform");
	    $(".black_bg").show();
    	$(".choose_format").find(".sure_btn").hide();
    	$(".choose_format").find(".footerLayer").removeClass("hide");
    })
    $("#goCartLayer").on("tap",function(){
		type="1";
		if($(".format_btn a").hasClass("on")){
			//没选择sim号码给出提示
			if(flagSim){
				if(flagSimPass){
					sureFun(type);
				}else{
					mui.toast('请选择主卡号码');
				}
			}else{
				sureFun(type);
			}
		}else{
			mui.toast("请选择"+formatNameTip+"!");
		}
	})
	$("#buyNowLayer").on("tap",function(){
		var flagSett=true;
		if(localStorage.getItem("uidHidden_"+ShopNumber)){
			uid=localStorage.getItem("uidHidden_"+ShopNumber);
		}
		if(uid=="" || typeof(uid)=='undefined'){
			console.log(localStorage.getItem("uidHidden_"+ShopNumber));
			if($("#uidHidden").length!="0" && $("#uidHidden").val()!=''){
				uid=$("#uidHidden").val();
			}else{
				if(!openId || openId=="undefined" || openId=="" || openId=="null"){
					if(localStorage.getItem("uidHidden_"+ShopNumber)){
						uid=localStorage.getItem("uidHidden_"+ShopNumber);
						flagSett=true
						return;
					}else{
						loginHTML();
					}
			    }else{
			    	registerHTML();
			    	console.log("yes openid");
			    }
			    flagSett=false;
			}
		}
		if(flagSett){
			type="2";
			if($(".format_btn a").hasClass("on")){
				//没选择sim号码给出提示
				if(flagSim){
					if(flagSimPass){
						sureFun(type);
					}else{
						mui.toast('请选择主卡号码');
					}
				}else{
					sureFun(type);
				}
			}else{
				mui.toast("请选择"+formatNameTip+"!");
			}
		}
	})
    var type;
    $("#buyNow").on("tap",function(){
    	$("body").addClass("fixed");
		$(".choose_format").removeClass("transform");
		$(".black_bg").show();
        type="2";
    	$(".choose_format").find(".sure_btn").show();
    	$(".choose_format").find(".sure_btn").attr("data-type",type);
    	$(".choose_format").find(".footerLayer").addClass("hide");
    })
    $("#goCart").on("tap",function(){
    	if(!flagSim){
    		$("body").addClass("fixed");
			$(".choose_format").removeClass("transform");
			$(".black_bg").show();
	    	type="1";
	    	$(".choose_format").find(".sure_btn").show();
	    	$(".choose_format").find(".sure_btn").attr("data-type",type);
	    	$(".choose_format").find(".footerLayer").addClass("hide");
    	}else{
    		mui.toast('此类产品不支持加入购物车，请直接购买');
    	}
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
    if(isdeleted == 1){
		$(".main").append("<div class='no_tip'>此商品已下架</div>");
		$("#goCart").off('tap');
		$("#buyNow").off('tap');
		$(".specifications").off('tap');
		$("#goCart").css('background','#9b9b9b');
		$("#buyNow").css('background','#9b9b9b');
		$(".logo_bottom").css("margin-bottom",'.5rem');
	}
    var aOn=true;
	$(".sure_btn").on("tap",function(){
		var type=$(this).attr("data-type");
		console.log("type:"+type);
		if($(".format_btn a").hasClass("on")){
			//没选择sim号码给出提示
			if(flagSim){
				if(flagSimPass){
					sureFun(type);
				}else{
					mui.toast('请选择主卡号码');
				}
			}else{
				sureFun(type);
			}
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
//客服显示
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
		var proname=ProductName.trim();
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
		     //如有有sim卡逻辑则加上|主卡|副卡
		    if(flagSim){
		    	var simMain=$('#sim_main_num').text();
	        	var simSecond=$('#sim_second_num').text();
	        	if(simSecond){
	        		simMain=simMain+'|'+simSecond;
	        	}
		    	data=data+"|"+simMain;
		    }
			if(b){
				localStorage.setItem(key,data);
			}else{
				localStorage.setItem(dataLocal+"^"+ShopNumber+"^"+openId,data);
			}
		}
		}
		
}
function sureInFun(type,uid){
	var buyNum=$("#buyNum").text();
	if(type=='2'){
		str = ProductID+"|"+skuID+"|"+ProductName+"|"+SkuName+"|"+Price +"|"+buyNum+"|"+ShopNumber+"|"+ShopName+"|"+logoUrl+"|"+forwardPicUrl+"|";
	 	//如有有sim卡逻辑则加上|主卡|副卡
		if(flagSim){
	    	var simMain=$('#sim_main_num').text();
        	var simSecond=$('#sim_second_num').text();
        	if(simMain==simSecond){
        		mui.toast('亲，主卡和副卡不能一样哦！');
        		return false;
        	}
        	if(simSecond){
        		simMain=simMain+'|'+simSecond;
        	}
	    	str=str+"|"+simMain;
	    }
		var sourceId='';
		if(urlParam.sourceId){
			sourceId='&sourceId='+urlParam.sourceId+'&sourceType='+urlParam.sourceType;
		}
		var shopcmpyId='';
		if(urlParam.shopcmpyId){
			shopcmpyId='&shopcmpyId='+urlParam.shopcmpyId;
		}
        var fuid='';
        if(urlParam.FUID && urlParam.FUID!=''){
        	fuid=urlParam.FUID;
        }else{
        	fuid=getFuid;
        }
		var Url = "sureOrder.html?ShopNumber="+ShopNumber+ "&UID="+uid+"&openId="+openId+"&cmpyId="+cmpyId+shopcmpyId+sourceId+"&FUID="+fuid;
		//不用授权、直接跳转到确认订单页面
		localStorage.setItem("shop"+ShopNumber+"^"+openId,str);
		window.location.href = Url;
	}else{
		if(!flagSim){
			var url ="/newmedia/mobile/shop/cart/addShopCart.action?shopNumber="+ShopNumber+"&skuID="+skuID+"&uid="+uid + "&productID=" + ProductID + "&cmpyId=" + cmpyId + "&quantity=" + buyNum;
			// 增加fuid参数，记录用户添加购物车时对应的分享人uid
	        if(urlParam.FUID && urlParam.FUID!=''){
	        	url = url + "&fuid="+urlParam.FUID;
	        }else{
	        	url = url + "&fuid="+getFuid;
	        }
			fun(openId,cmpyId,url,uid);
		}else{
			mui.toast('此类产品不支持加入购物车，请直接购买!');
		}
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
			}else if(data.RES==102){
				mui.toast(data.ERR);
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
		var returnUrl ="shoppingCart.html?ShopNumber="+ShopNumber+"&openId="+ openId +"&cmpyId=" + cmpyId+shopcmpyId+'&UID=&FUID='+FUID;
	}else{
		var returnUrl ="shoppingCart.html?ShopNumber="+ShopNumber+"&openId="+ openId +"&cmpyId=" + cmpyId+shopcmpyId+'&UID=';
	}
    window.location.href=returnUrl+"&botMenu=1";
}
//推荐产品
function recommendFun(){
	$.ajax({
		type : "GET",
		url : "/newmedia/mobile/shop/indexproduct/getDiscoverProductList.action?ShopNumber="+ShopNumber+"&PageSize=10&PageIndex=1&Integral=0",
		dataType : "json",
		success : function(recommendData) {
			if (recommendData) {
				var recommendHTML='';
				var produceImg="img/noimg.png";
				var detailUrl='';
				var count=0;
				if(recommendData.RES==100){
					for(var j=0;j<recommendData.DATA.ProductList.length;j++){
						if(recommendData.DATA.ProductList[j].ProductID!=ProductID){
							var newSkuPrice;
							if(!isNumber(recommendData.DATA.ProductList[j].SkuPrice)){
								newSkuPrice=parseInt(recommendData.DATA.ProductList[j].SkuList[0].SkuPrice);
							}else{
								newSkuPrice=recommendData.DATA.ProductList[j].SkuPrice
							}
							if(recommendData.DATA.ProductList[j].IndexImgSrc && recommendData.DATA.ProductList[j].IndexImgSrc != "[object Object]"){
								produceImg = recommendData.DATA.ProductList[j].IndexImgSrc;
							}
//							if(recommendData.DATA.ProductList[j].IsIntegral=="1"){
	                        detailUrl = "/newmedia/pages/mobile/MicroWebsite/personalShop/productDetail.html?cmpyId="+cmpyId+"&openId="+openId+"&ShopNumber="+ShopNumber+"&ProductID="+recommendData.DATA.ProductList[j].ProductID+"&shopcmpyId="+urlParam.shopcmpyId+"&UID="+UID;
//							}else{
//								detailUrl = "/newmedia/pages/mobile/futureStore/ProductDetailjf.html?FUID="+urlParam.FUID+"&ShopNumber="+ShopNumber+"&ProductID="+recommendData.DATA.ProductList[j].ProductID+"&UID="+UID+"&cmpyId="+cmpyId+"&openId="+openId;
//							}
							count++;
							if(count == recommendData.DATA.ProductList.length){
								break;
							}
						    recommendHTML+='<dl><a href="'+detailUrl+'">'+
				    			'<p><img src="'+produceImg+'" /></p>'+
				    			'<dt class="ellipsis_two">'+unescape(recommendData.DATA.ProductList[j].ProductName)+'</dt>'+
				    			'<dd>￥'+newSkuPrice+'</dd></a>'+
				    		'</dl>';
						}else if(recommendData.DATA.ProductList[j].ProductID==ProductID && recommendData.DATA.ProductList.length==1){
							recommendHTML="<p style='color:#fff; width: 100%;text-align:center;font-size:0.28rem; padding-top: 1rem;'>暂无相关产品推荐</p>";
						}else if(recommendData.DATA.ProductList[j].ProductID==ProductID && recommendData.DATA.ProductList.length>1){
							count++;
						}
					}
			        $(".detail .recommend").append(recommendHTML);
				}else if(recommendData.RES==110){
					$(".detail .recommend").append("<p style='color:#fff; width: 100%;text-align:center;font-size:0.28rem; padding-top: 1rem;'>暂无相关产品推荐</p>");
				}			
			}
		},
		error : function(recommendData) {
			mui.confirm('刷新失败啦，刷新试试？','提示',['否', '刷新'],function(e){
			   if(e.index==1)location.reload();
			})
		}
	});
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
					//var shop=data.DATA.Shop;
					cartSum=data.DATA.COUNT;
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
	setTimeout(function(){
		var imgHeight=$('#big_code img').height();
		$('#big_code img').css({'margin-top':-imgHeight/2});
	},30)
}
$('#big_code').on('touchend',function(){
	$('#big_code').hide();
	event.preventDefault();
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
//复制链接地址---产品详情
var copyLinkFlag=true;
$("#copyLink").on("tap",function() {
    $(".copyLink_box").show();
    var fuid='';
	if(soukongUID!='null'){
		fuid=soukongUID;
	}else{
		if(urlParam.FUID && urlParam.FUID!="undefined" && urlParam.FUID!=''){
			fuid=urlParam.FUID;
		}
	}
	var _url=window.location.href;
	_url=_url.replace('?UID='+urlParam.UID,'?UID=');
	_url=_url.replace('&UID='+urlParam.UID,'&UID=');
	_url=_url.replace('&openId='+urlParam.openId,'');
	_url=_url.replace('?openId='+urlParam.openId,'');
	if(urlParam.FUID){
		_url=_url.replace('&FUID='+urlParam.FUID,'&FUID='+fuid);
	    _url=_url.replace('?FUID='+urlParam.FUID,'?FUID='+fuid);
	}else{
		_url=_url+'&FUID='+fuid;
	}
	var forwardUrl=sysCommon.serverHostUrl+'/newmedia/pages/mobile/futureStore/jump.html?cmpyId='+cmpyId+'&FUID='+fuid+'&returnUrl='+encodeURIComponent(_url);
	if(copyLinkFlag){
		$.ajax({
			type : "POST",
			url : '/newmedia/mobile/shop/getShortLink.action',
			dataType : "json",
			data:{'longUrl':forwardUrl},
			success : function(data) {
				if(data){
				  var link=data.rows;
				  setTimeout(function(){
				  	 $(".copyLink_box input").attr("value",link);
				     copyLinkFlag=false;
				  },50)
				  
				}
			},
		})
	}
	
});
$(".copyLink_box").on("tap",function(){
	$(".copyLink_box").hide();
})
$(".copyLink_content").on("tap",function(e){
	e.stopPropagation();
})
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
					var _fuid;
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

//判断上下滑动
//topFloatScroll();

//sim卡逻辑
function sim(){
	var flagSimMain=false;  //主卡逻辑标识
	var flagSimSecond=false;  //副卡逻辑标识
	var phoneType=0;  //卡类型
	var scrollPX=0;  //记录滚动位置
	var keyWord='';  //关键字
	$('#sim').show();
	//选择主卡
	$('#sim_main_choose').on('click',function(){
		keyWord=$('#sim_choose_search').val();
		scrollPX=$('body').scrollTop();
		$('#product_detail').css({'height':window.innerHeight});
		phoneType=1;
		htmlSimList(phoneType,keyWord,pageIndex);
		$('#sim_choose').show();
		flagSimMain=true;
	})
	$('#sim_main').on('click',function(){
		$('#sim_choose_search').val('');
		keyWord=$('#sim_choose_search').val();
		$('#sim_choose_list ul *').remove();
		pageIndex=1;
		scrollPX=$('body').scrollTop();
		$('#product_detail').css({'height':window.innerHeight});
		phoneType=1;
		htmlSimList(phoneType,keyWord,pageIndex);
		$('#sim_choose').show();
		flagSimMain=true;
	})
	//选择副卡
	$('#sim_second_choose').on('click',function(){
		if(flagSimPass){
			$('#sim_choose_search').val('');
			keyWord=$('#sim_choose_search').val();
			$('#sim_choose_list ul *').remove();
			pageIndex=1;
			scrollPX=$('body').scrollTop();
			$('#product_detail').css({'height':window.innerHeight});
			phoneType=2;
			htmlSimList(phoneType,keyWord,pageIndex);
			$('#sim_choose').show();
			flagSimSecond=true;
		}else{
			mui.toast('请先选择主卡号码！');
		}
	})
	$('#sim_second').on('click',function(){
		$('#sim_choose_search').val('');
		keyWord=$('#sim_choose_search').val();
		$('#sim_choose_list ul *').remove();
		pageIndex=1;
		scrollPX=$('body').scrollTop();
		$('#product_detail').css({'height':window.innerHeight});
		phoneType=2;
		htmlSimList(phoneType,keyWord,pageIndex);
		$('#sim_choose').show();
		flagSimSecond=true;
	})
	//选择号码
	mui('#sim_choose_list').on('click','#sim_choose_list li',function(){
		var simNum=this.innerHTML;
		//选择主卡号码
		if(flagSimMain){
			$('#sim_main_choose').hide();
			$('#sim_main_num').text(simNum);
			$('#sim_main').show();
			flagSimPass=true;  //打开购买通道
		}
		//选择副卡号码
		if(flagSimSecond){
			$('#sim_second_choose').hide();
			$('#sim_second_num').text(simNum);
			$('#sim_second').show();
		}
		//善后处理
		$('#sim_choose').hide();
		$('#product_detail').css({'height':'auto'});
		$('body').scrollTop(scrollPX);
		flagSimMain=false;flagSimSecond=false;
	})
	//搜索
	$('#sim_choose_btn').on('click',function(){
		pageIndex=1;
		$('#sim_choose_list ul *').remove();
		keyWord=$('#sim_choose_search').val();
		htmlSimList(phoneType,keyWord,pageIndex);
		$('#sim_choose_search').blur();
	})
	//换一批
	$('#sim_choose_change').on('click',function(){
		$('#sim_choose_list ul *').remove();
		if(pageIndex<Math.ceil(simNumTotal/pageSize)){
			pageIndex++;
		}else{
			pageIndex=1;
		}
		htmlSimList(phoneType,keyWord,pageIndex);
	})
	//关闭选择号码模态框
	$('#sim_choose_close').on('click',function(){
		$('#sim_choose_search').val('');
		$('#sim_choose_list ul *').remove();
		$('#sim_choose').hide();
		$('#product_detail').css({'height':'auto'});
		$('body').scrollTop(scrollPX);
		flagSimMain=false;flagSimSecond=false;
	})
	//点击x清空并调取全部数据
	$('#sim_choose_x').on('click',function(){
		$('#sim_choose_x').hide();
		$('#sim_choose_list ul *').remove();
		$('#sim_choose_search').val('');
		$('#sim_choose_search').focus();
		keyWord='';
		pageIndex=1;
		htmlSimList(phoneType,keyWord,pageIndex);
	})
	$('#sim_choose_search').on('keyup',function(){
		$('#sim_choose_x').show();
	})
}

/**
 * 获取sim卡html
 * @param phoneType 1->主卡 2->副卡
 * @param keyWord 关键字
 * @param pageIndex 页数
 **/
function htmlSimList(phoneType,keyWord,pageIndex){
	$('#loading').show();
	$.ajax({
		type:'get',
		url:'/newmedia/mobile/shop/order/queryPhone.action',
		data:{'productId':ProductID,'phone':keyWord,'phoneType':phoneType,'pageIndex':pageIndex,'pageSize':pageSize},
		success:function(data){
			if(data){
				if(data.statuc=='SUCCESS'){
					simNumTotal=data.count;  //记录号码总数
					var html='';
					for(var i=0;i<data.data.length;i++){
						html+='<li>'+data.data[i].mobile+'</li>';
					}
					if(data.data.length==0){
						mui.toast('暂时查不到数据哦！');
					}
					$('#sim_choose_list ul').append(html);
				}
			}
		}
	})
	$('#loading').hide();
}