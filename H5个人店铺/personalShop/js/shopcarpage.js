var total=0;//总价
var uid;
var ProductID=urlParam.ProductID;
var FUID=urlParam.FUID;
var UID=urlParam.UID;
var ShopNumber=urlParam.ShopNumber;
var shopcmpyId=urlParam.shopcmpyId;
var goodsNumber=0;//选择商品数量
var Count;
var newShopNumber;
var flagSim=false;
(function(){
	if(!urlParam.personal1){
		if(urlParam.shopcmpyId){
			honeybeeHtml();  //底部按钮
		}
	}
	$("#loading").show();
	$("#public_center").hide();
	if(FUID){
		FUID=FUID;
	}else{
		FUID="";
	}
	loading();//加载
	loadMainFun();//主接口的加载
})()
function loadMainFun(){
	uid=getUid();
	if(uid && uid!="null"){
		console.log(uid);
		$.ajax({
			type:"get",
			url:"/newmedia/mobile/shop/cart/getShopCartList.action?uid="+uid,
			dataType : "json",
			success:function(data){
				 if(data){
					if(data.RES=="100"){
					$("#noRecord").hide();
					$(".settlement button").removeClass("on");
					$("#goodsNumber").hide();
			         var shop = data.DATA.Shop;
			         for(var i=0;i<shop.length;i++){
			         	if(shop[i].ShopCart.length>0){
			         		var shopOne=shop[i];
			         		goodsInfohtml(shopOne);//获取购物车的信息
			         	}
			         }
					}else{
						$(".settlement button").removeClass("on");
			            onRecordFun();//没有商品记录展示
			            $("#goodsNumber").hide();
					}
					$("#public_center").show();
			        $("#loading").hide();
				    selectCmpyId();//底部logo
			        effectsFun();
			        botHtml();//底部菜单HTML
				    botMenu();//底部菜单FUN
			        sysCommon=getSysCommonUrl();
			        weixinHideMenu(sysCommon);//隐藏微信分享
				}else{
				     mui.confirm('网络超时了，刷新试试？','提示',['否', '刷新'],function(e){
						if(e.index==1)location.reload();
					})
				}
			}
		})
	}else{
		uid="";
		console.log(uid);
		getShopCartListLocal();//当uid不存在的时候，从本地存储获取数据
	}
}
//获取购物车的信息
function goodsInfohtml(shop){
	var ShopName = shop.ShopName;
	var shopCart = shop.ShopCart;
	var ShopNumber = shop.ShopNumber;
	logoUrl=shop.ShopLogo;
	var shopCart=shop.ShopCart;
	var shopHtml='<dl class="center-float-left shop_info"><dt class="center-float-left chooseShop" data-all="'+shop.TotalMoney+'" onclick="chooseShopNumber(this)"><i ></i></dt>'+
		   	   	 '<dd class="flex-1 center-float-left">'+
		   	   	 	'<em><img src="'+logoUrl+'"/></em>'+
		   	   	    '<p class="flex-1">'+ShopName+'</p>'+
		   	   	 '</dd></dl>'
    var shopCart=shop.ShopCart;
    var html='';
    var isShow='hide';
    var isCheck='';
    var htmlSim='';
    var htmlProductName='';
	for(var j=0;j<shopCart.length;j++){
		var ShopCartID = shopCart[j].ShopCartID;//购物车编号
		var ProductID = shopCart[j].ProductID;//商品编号  1
		var SkuID = shopCart[j].SkuID;//规格编号  2
		var ProductName = shopCart[j].ProductName;//商品名称 3
		var SkuName = shopCart[j].SkuName;//规格名称 4
		var Units = shopCart[j].Units;//规格单位
		var Price = shopCart[j].Price;//规格价格  5
		var ImgUrl = unescape(shopCart[j].ImgUrl?shopCart[j].ImgUrl:"img/noimg.png");//商品图片
		Count = shopCart[j].Count;//购买数量 6
		var TotalPr = shopCart[j].TotalMoney;//总价
		var isDeleted = shopCart[j].deleted;//是否下架
		var isApproveStatus=shopCart[j].ApproveStatus;//规格是否下架
		if(isDeleted=="1"){
			isShow='showFlex';
			isCheck='noCheck';
		}else{
			if(isApproveStatus=="2"){
				isShow='showFlex';
				isCheck='noCheck';
			}else{
				isShow='hide';
				isCheck='check';
			}
		}
		
		if(shopCart[j].FMoblies){
			htmlSim='<p>主卡 : '+shopCart[j].ZMoblies+'<br>副卡 : '+shopCart[j].FMoblies+'</p>';
			htmlProductName='<p class="two_line ellipsis_one" style="max-height: .8rem;">'+ProductName+'</p>';
			flagSim=true;
		}else if(shopCart[j].ZMoblies){
			htmlSim='<p>主卡 : '+shopCart[j].ZMoblies+'</p>';
			htmlProductName='<p class="two_line ellipsis_one" style="max-height: .8rem;">'+ProductName+'</p>';
			flagSim=true;
		}else{
			htmlSim='';
			htmlProductName='<p class="two_line ellipsis_two" style="height: .8rem;">'+ProductName+'</p>';
		}
		
		var str = ProductID+"|"+SkuID+"|"+ProductName+"|"+SkuName+"|"+Price+"|"+Count+"|"+ShopNumber+"|"+ShopName+"|"+logoUrl+"|"+ImgUrl+"|"+ShopCartID;
		if(shopCart[j].FMoblies){
			str=str+'|'+shopCart[j].ZMoblies+'|'+shopCart[j].FMoblies;
		}else if(shopCart[j].ZMoblies){
			str=str+'|'+shopCart[j].ZMoblies;
		}
		html+='<dl class="left-float-top goods_info">'+
	   	   	 '<dt class="center-float-left '+isCheck+'"><i  data-str="'+str+'"></i></dt>'+
	   	   	 '<dd class="flex-1 left-float-top">'+
	   	   	 	'<em><img src="'+ImgUrl+'"/></em>'+
	   	   	 	'<div class="flex-1 detail">'+
	   	   	 		htmlProductName+
	   	   	 		htmlSim+
	   	   	        '<p class="on_line ">规格:<span>'+shopCart[j].SkuName+'</span></p>'+
	   	   	        '<div class="number_box top-lr-scatter">'+
	   	   	        	'<span class="orange price">￥'+Price+'</span>'+
	   	   	        	'<div class="add_reduce right-float-top">'+
	   	   	        		'<span class="reduceBtn" onclick="reduceCount(this,\''+ShopCartID+'\')"><img src="image/p_reduce.png"/></span>'+
	   	   	        		'<div class="buyNum">'+Count+'</div>'+
	   	   	        		'<span class="addBtn" onclick="addCount(this,\''+ShopCartID+'\',\''+shopCart[j].ZMoblies+'\')"><img src="image/p_add.png"></span>'+
	   	   	        	'</div></div></div></dd>'+
	   	   	 '<div class="del center-float-left" data-id="'+ShopCartID+'"><img src="image/delete_orange@2x.png"/></div>'+
	   	   '<div class="over center-float-center '+isShow+'">已下架</div></dl>';
	}
	//图片懒加载
	var allHTML=shopHtml+html;
	var createFragment=function() {
		var fragment=document.createDocumentFragment();
		var div=document.createElement('div');
		div.className="shop_list";
		div.innerHTML=allHTML;
		fragment.appendChild(div);
		return fragment;
	}
	var article=document.getElementById("goods_list");
    article.appendChild(createFragment());
	mui(document).imageLazyload({
		placeholder:'image/img_nothing.jpg'
	})
	//$(".goods_list").append('<div class="shop_list">'+shopHtml+html+'</div>');
	$("#TotalMoney").html(total);//总价
	$("#goodsNumber").html("("+goodsNumber+")");//选择的商品数量
}
function effectsFun(){
	//计算最小高
	var tipH=$(".shaoppingCart_tip").outerHeight(true);
	var settlementH=$(".settlement").outerHeight(true);
	var logoH=$("#logo_bottom").outerHeight(true);
	var minHeight=Number(windowHeigth-logoH-tipH).toFixed(2);
	$(".goods_list").css({"min-height":window.innerHeight-window.innerWidth*0.52});
	//判断单个商品是否选中,只允许选择一家店铺的商品
	$(".shop_list .goods_info dt.check").on("tap",function(){
		var _thisParent=$(this).parents(".shop_list");
		_thisParent.siblings().find("dt i").removeClass("on");//移除其他店铺的选择
		if($(this).find("i").hasClass("on")){
			$(this).find("i").removeClass("on");
			$(".chooseShop").find("i").removeClass("on");
		}else{
			$(this).find("i").addClass("on");
			var f=true;
			_thisParent.find(".goods_info dt").find("i").each(function(){
				if(!$(this).hasClass("on")){
					f=false;
					return false;
				}else{
				}
			});
			if(!f){
				_thisParent.find(".chooseShop").find("i").removeClass("on");
			}else{
				_thisParent.find(".chooseShop").find("i").addClass("on");
			}
		}
		goodsNumber=$(".goods_list .goods_info").find(".on").length;
		if(goodsNumber<=0){
			$("#goodsNumber").hide();
		}else{
			$("#goodsNumber").show();
			$("#goodsNumber").html("("+goodsNumber+")");
		}
		total=0;
		$(".goods_list .goods_info").find(".on").each(function(){
			var num=$(this).parents(".goods_info").find(".buyNum").text();//数量
		    var pice = $(this).parents(".goods_info").find(".price").text().substring(1);//单价
		    console.log(pice);
		    total+=Number(num*pice);
		})
		$("#TotalMoney").text(Number(total).toFixed(2));
		if(total==0 || goodsNumber==0){
			$(".settlement button").removeClass("on");
			$("#goodsNumber").hide();
		}else{
			$(".settlement button").addClass("on");
			$("#goodsNumber").show();
		}
	})
	//删除单个商品
	$(".del").on("tap",function(){
		var self=$(this);
		var LocalID=self.attr("data-localID");
		var ShopCartID=self.attr("data-id");
		if(ShopCartID){
			    mui.confirm('确认要删除？','提示',['取消', '确定'],function(e){
			    if(e.index==1){
					deletegoods(self,ShopCartID);
				}
			})
		}else{
			mui.confirm('确认要删除？','提示',['取消', '确定'],function(e){
			if(e.index==1){
				  localStorage.getItem("")
				  localStorage.removeItem(LocalID);
				  location.reload();
				}
			})
		}
	})
	//结算
	$(".settlement button").on("tap",function(){
		if($(this).hasClass("on")){
			$("#goodsNumber").show();
			console.log("有选择");
			var flagSett=true;
			if(localStorage.getItem("uidHidden_"+ShopNumber)){
			    uid=localStorage.getItem("uidHidden_"+ShopNumber);
		    }
			if(uid=="" || typeof(uid)=='undefined'){
				if($("#uidHidden").length!="0" && $("#uidHidden").val()!=''){
					uid=$("#uidHidden").val();
				}else{
					if(!openId || openId=="undefined" || openId=="" || openId=="null"){
						console.log("no openid");
						loginHTML();
				    }else{
				    	registerHTML();
				    	console.log("yes openid");
				    }
				    flagSett=false;
				}
			}
			if(flagSett){
				var ProductParam=new Array();
				var j = 0;
				$(".goods_info").each(function(){
					console.log($(this).find("dt i").attr("class"));
				    if($(this).find("dt i").hasClass("on")){
						var count = $(this).find(".buyNum").text();
						console.log(count);
						var count_=$(this).find("dt i").attr("data-Str").split("|");
						count_[5]=count; //最新购买数量
						var str;
						newShopNumber=count_[6];//获取不同店铺的shopNumber
						str=count_[0]+'|'+count_[1]+'|'+count_[2]+'|'+count_[3]+"|"+count_[4]+'|'+count+'|'+count_[6]+'|'+count_[7]+'|'+count_[8]+'|'+count_[9]+'|'+count_[10]+'|'+count_[11]+'|'+count_[12];
						ProductParam[j]=str;
						j++;
					}
				});
				localStorage.setItem("shop"+newShopNumber+"^"+openId,ProductParam);
				var shopcmpyId='';
				if(urlParam.shopcmpyId){
					shopcmpyId='&shopcmpyId='+urlParam.shopcmpyId;
				}
				if(urlParam.FUID){
					var url = "sureOrder.html?ShopNumber="+newShopNumber+ "&UID="+uid+"&FUID="+FUID+ '&cmpyId='+cmpyId + "&openId=" + openId+"&refresh=yes"+shopcmpyId;
				}else{
					var url = "sureOrder.html?ShopNumber="+newShopNumber+ "&UID="+uid+ '&cmpyId='+cmpyId + "&openId=" + openId+"&refresh=yes"+shopcmpyId;
				}
				//var redirectUrl = getAuthorizeUrl(sysCommon, url, cmpyId, openId);
				window.location.href = url;
			}
		}else{
			mui.toast("您还未选择任何商品！");
			$("#goodsNumber").hide();
		}
	})
}
//从本地存储获取数据
function getShopCartListLocal(){
	$("#loading").hide();
    $("#public_center").show();
    var html="";
    total=0;//总价
    var shopNumberLocal;
    var arrayList = {};
    var list=[];
	for(var i= 0 ; i <localStorage.length; i++){
		 list=[];
		 var array_=localStorage.key(i).split("^");
		 if(array_[2]==openId){
		 	shopNumberLocal=array_[1];
		 	if(arrayList[shopNumberLocal]){
		 		list=arrayList[shopNumberLocal];
		 		list.push(localStorage.getItem(localStorage.key(i))+"#"+localStorage.key(i));
		 	}else{
		 		list.push(localStorage.getItem(localStorage.key(i))+"#"+localStorage.key(i));
		 		arrayList[shopNumberLocal]=list;
		 	}
        }
	}
	$.each(arrayList, function(index,value) {  
		console.log(arrayList);
		var html='';
		var resShopNumber=value[0].split("|");
		var shopHtml='<dl class="center-float-left shop_info"><dt class="center-float-left chooseShop" onclick="chooseShopNumber(this)"><i class=""></i></dt>'+
			   	   	 '<dd class="flex-1 center-float-left">'+
			   	   	 	'<em><img src="'+resShopNumber[8]+'"/></em>'+
			   	   	     '<p class="flex-1">'+resShopNumber[7]+'</p>'+
			   	   	 '</dd></dl>';
	    $.each(value,function(index,val){
	    	console.log(value[index]);
	    	  var res=val.split("|");
	    	  var keyLocal=val.split("#")[1];
		      total=Number(parseFloat(total)+parseFloat(res[4]*res[5])).toFixed(2);
		      html+='<dl class="left-float-top goods_info">'+
			   	   	 '<dt class="center-float-left check"><i class="" data-strname="'+keyLocal+'" data-str="'+value[index]+'"></i></dt>'+
			   	   	 '<dd class="flex-1 left-float-top">'+
			   	   	 	'<em><img src="'+res[9]+'"/></em>'+
			   	   	 	'<div class="flex-1 detail">'+
			   	   	 		'<p class="two_line ellipsis_two">'+res[2]+'</p>'+
			   	   	        '<p class="on_line">规格:<span>'+res[3]+'</span></p>'+
			   	   	        '<div class="number_box top-lr-scatter">'+
			   	   	        	'<span class="orange price">￥'+res[4]+'</span>'+
			   	   	        	'<div class="add_reduce right-float-top">'+
			   	   	        		'<span class="reduceBtn" onclick="reduceCountLocal(this,\''+res[1]+'\')"><img src="image/p_reduce.png"/></span>'+
			   	   	        		'<div class="buyNum">'+res[5]+'</div>'+
			   	   	        		'<span class="addBtn" onclick="addCountLoacl(this,\''+res[1]+'\')"><img src="image/p_add.png"></span>'+
			   	   	        	'</div></div></div></dd>'+
			   	   	 '<div class="del center-float-left" data-localID="'+keyLocal+'"><img src="image/delete_orange@2x.png"/></div>'+
			   	   '</dl>'; 
	    })
		$(".goods_list").append('<div class="shop_list">'+shopHtml+html+'</div>');
	});
	$(".settlement button").removeClass("on");
	$("#goodsNumber").hide();
	$("#TotalMoney").text("0");
	$("#goodsNumber").text("("+goodsNumber+")");
	if(!$(".goods_list .goods_info").length){
		$(".goods_list .shop_info").hide();
		onRecordFun();//没有商品记录展示
	}else{
		$(".goods_list .shop_info").show();
		$("#noRecord").hide();
	}
	botHtml();//底部菜单HTML
	botMenu();//底部菜单FUN
	effectsFun();//页面效果
	sysCommon=getSysCommonUrl();
	weixinHideMenu(sysCommon);//隐藏微信分享
	selectCmpyId();//底部logo
}
//删除单个商品
var deletegoodsFlag=true;
function deletegoods(self,ShopCartID){
	if(total<=0){
    	$(".settlement button").removeClass("on");
    	$("#goodsNumber").hide();
	}else{
		$(".settlement button").addClass("on");
		$("#goodsNumber").show();
	}
	var param = ShopCartID + "|0";
	var data = {"param":escape(param)};
	if(deletegoodsFlag){
		deletegoodsFlag=false;
		$.ajax({
    	type:"post",
		url:"/newmedia/mobile/shop/cart/updateCartBatch.action?",
		dataType : "json",
		data:data,
		success:function(data){
		         if(data.RES=="100"){
		         	//判断是选中状态，总金额减去商品的金额
					if(self.parents(".goods_info").find("dt").find("i").hasClass("on")){
						var num = self.parents(".goods_info").find(".buyNum").text();
						var price=self.parents(".goods_info").find(".price").text().substring(1);
						var totalSingel = $("#TotalMoney").text();
						total = Number(totalSingel)-Number(price)*Number(num);
						$("#TotalMoney").html(total.toFixed(2));
					}
					//删除此记录后是否还有此店铺的记录，如果还有，则直接删除此记录，如果没有，则移除整个店铺记录
					console.log(self.parents(".shop_list").find(".goods_info").length);
					if(self.parents(".shop_list").find(".goods_info").length<=1){
						//移除整个店铺记录    
						self.parents(".goods_info").parent(".shop_list").remove();
						if(!$(".shop_list").length){
							//没有任何记录时，提醒用户没有记录存在
							onRecordFun();
							$(".settlement button").removeClass("on");
							$("#goodsNumber").hide();
							
						}
					}else{
						self.parents(".goods_info").remove();
					}
	                getShopCartCount();//重新获取购物车的数量
					mui.toast("删除成功！");
					goodsNumber=$(".goods_list .goods_info").find(".on").length;
			        $("#goodsNumber").html(goodsNumber);
			        
				}else{
						mui.toast("删除失败！");
				}
				deletegoodsFlag=true;
			}
	   })
	}
}
// 没有商品记录
function onRecordFun(){
	$("#noRecord").show();
    if(urlParam.shopcmpyId){
    	$("#noRecord_btn").show();
		shopcmpyId='&shopcmpyId='+urlParam.shopcmpyId;
		$("#noRecord_btn").on("tap",function(){
		  window.location.href='/newmedia/pages/mobile/MicroWebsite/personalShop/index.html?cmpyId='+urlParam.shopcmpyId+'&shopcmpyId='+urlParam.shopcmpyId+'&openId='+openId;
	    })
	}else{
		$("#noRecord_btn").hide();
	}
}
//减少商品数量
var reduceCountFlag=true;
function reduceCount(e,ShopCartID){
	var this_=$(e);
	var buyNumBox=this_.siblings(".buyNum");
	var count = buyNumBox.text();
	if(parseInt(count)<=1){
 		mui.toast("宝贝不能再少！");
 		num=1;
 		return;
    }
	var num = parseInt(count)-1;
	var param = ShopCartID + "|" + num;
	var data = {"param":escape(param)};
	var updateCartBatchUrl="/newmedia/mobile/shop/cart/updateCartBatch.action?"
	if(reduceCountFlag){
		reduceCountFlag=false;
		$.ajax({
	    	type:"post",
			url:updateCartBatchUrl,
			dataType : "json",
			data:data,
			success:function(data){
		         if(data.RES == "100"){
					buyNumBox.text(num);//更改显示的数量
					var price;
					var tatolSingel=$("#TotalMoney").text();
					console.log($("#TotalMoney").text()+"嘎嘎"+count);
					if(this_.parents(".goods_info").find("dt i").hasClass("on")){
						price = this_.parents(".goods_info").find(".price").text().substring(1);
					}else{
						price=0;
					}
					total=Number(tatolSingel)-Number(price);
	                $("#TotalMoney").text(Number(total).toFixed(2));
				}else{
					mui.toast("修改购物车失败");
				}
				reduceCountFlag=true;
			}
      })
	}
	
}
//本地存储减少商品数量
function reduceCountLocal(e,ShopCartID){
	var this_=$(e);
	var buyNumBox=this_.siblings(".buyNum");
	var count = buyNumBox.text();
	if(parseInt(count)<=1){
 		mui.toast("宝贝不能再少！");
 		num=1;
 		return;
    }
	var num = parseInt(count)-1;
	buyNumBox.text(num);//更改显示的数量
	var keyName=this_.parents(".goods_info").find("dt i").attr("data-strname");
    var res=localStorage.getItem(keyName).split("|");
    res[5]=num;
    var changeData=res[0]+"|"+res[1]+"|"+res[2]+"|"+res[3]+"|"+res[4]+"|"+res[5]+"|"+res[6]+"|"+res[7]+"|"+res[8]+"|"+res[9];
    localStorage.setItem(keyName,changeData);
	var price;
	var tatolSingel=$("#TotalMoney").text();
	console.log($("#TotalMoney").text()+"嘎嘎"+count);
	if(this_.parents(".goods_info").find("dt i").hasClass("on")){
		price = this_.parents(".goods_info").find(".price").text().substring(1);
	}else{
		price=0;
	}
	total=Number(tatolSingel)-Number(price);
    $("#TotalMoney").text(Number(total).toFixed(2));
}
//增加商品数量
var addCountFlag=true;
function addCount(e,ShopCartID,flagSim){
	if(!flagSim){
		var this_=$(e);
		var buyNumBox=this_.siblings(".buyNum");
		var count = buyNumBox.text();
		var num = parseInt(count)+1;
		var param = ShopCartID + "|" + num;
		var data = {"param":escape(param)};
		if(addCountFlag){
			addCountFlag=false;
			var updateCartBatchUrl="/newmedia/mobile/shop/cart/updateCartBatch.action?"
			$.ajax({
		    	type:"post",
				url:updateCartBatchUrl,
				dataType : "json",
				data:data,
				success:function(data){
			         if(data.RES == "100"){
						buyNumBox.text(num);//更改显示的数量
						//var price = this_.parents(".goods_info").find(".price").text().substring(1);//单价
						var price;
		                var tatolSingel=$("#TotalMoney").text();
		                console.log($("#TotalMoney").text()+"嘎嘎"+count);
		                if(this_.parents(".goods_info").find("dt i").hasClass("on")){
							price = this_.parents(".goods_info").find(".price").text().substring(1)
						}else{
							price=0;
						}
						total=Number(tatolSingel)+Number(price);
		                $("#TotalMoney").text(Number(total).toFixed(2));
					}else{
						mui.toast("修改购物车失败");
					}
					addCountFlag=true;
				}
		  })
		}
	}else{
		mui.toast('此类商品只能选择一张哦！');
	}
}
//本地存储的增加商品
function addCountLoacl(e,ShopCartID){
	var this_=$(e);
	var buyNumBox=this_.siblings(".buyNum");
	var count = buyNumBox.text();
	var num = parseInt(count)+1;
	buyNumBox.text(num);//更改显示的数量
	var price;
    var tatolSingel=$("#TotalMoney").text();
    var keyName=this_.parents(".goods_info").find("dt i").attr("data-strname");
    var res=localStorage.getItem(keyName).split("|");
    res[5]=num;
    var changeData=res[0]+"|"+res[1]+"|"+res[2]+"|"+res[3]+"|"+res[4]+"|"+res[5]+"|"+res[6]+"|"+res[7]+"|"+res[8]+"|"+res[9];
    localStorage.setItem(keyName,changeData);
    if(this_.parents(".goods_info").find("dt i").hasClass("on")){
		price = this_.parents(".goods_info").find(".price").text().substring(1)
	}else{
		price=0;
	}
	total=Number(tatolSingel)+Number(price);
    $("#TotalMoney").text(Number(total).toFixed(2));
}
//全选一个店铺的商品
function chooseShopNumber(e){
	var thisParent=$(e).parents(".shop_list");
	console.log(thisParent.find(".goods_info").find(".check").length);
	if($(e).find("i").hasClass("on")){
			$(e).find("i").removeClass("on")
			thisParent.find(".goods_info dt.check i").removeClass("on");
			thisParent.find(".settlement button").removeClass("on");
			$("#goodsNumber").hide();
			thisParent.find(".chooseShop i").removeClass("on");
			$("#TotalMoney").text("0");
		}else{
			var total=0;
			$(e).find("i").addClass("on");
			thisParent.siblings().find(".shop_info dt i").removeClass("on");
			thisParent.siblings().find(".goods_info dt.check i").removeClass("on");
		    thisParent.find(".goods_info dt.check i").addClass("on");
		    thisParent.find(".settlement button").addClass("on");
		    $("#goodsNumber").show();
		    thisParent.find(".chooseShop i").addClass("on");
		    thisParent.find(".goods_info").find("dt i").each(function(){
				if($(this).hasClass("on")){
					var num=$(this).parents(".goods_info").find(".buyNum").text();
					var oneprice=$(this).parents(".goods_info").find(".price").text().substring(1);
					total = Number(total) + Number(num)*Number(oneprice);
				}
			 });
			$("#TotalMoney").text(Number(total).toFixed(2));
		}
		if(thisParent.find(".goods_info").find(".check").length){
			$(e).removeClass("on");
		}
		goodsNumber=$(".goods_list .goods_info").find(".on").length;
		$("#goodsNumber").html("("+goodsNumber+")");//结算的数量
		if(total==0 || goodsNumber==0){
			$(".settlement button").removeClass("on");
			$("#goodsNumber").hide();
		}else{
			$(".settlement button").addClass("on");
			$("#goodsNumber").show();
		}
}
//重新获取购物车的数量
function getShopCartCount(){
	if(uid != "null"){
		var url = "/newmedia/mobile/shop/cart/getShopCartList.action?&uid="+uid;
		$.ajax({
			type:"get",
			url:url,
			dataType : "json",
			success:function(data){
		        //处理返回的数量
				var count = 0;
				if(data.RES=="100"){
					$(".cartnumbox").show();
					$(".cartnumbox").text(data.DATA.Shop[0].ShopCart.length);
					$(".cartSum").show();
					$(".cartSum").text(data.DATA.Shop[0].ShopCart.length);
				}else{
					$(".cartnumbox").hide();
					$(".cartSum").hide();
				}
			}
		  })
	}else{
		$(".cartnumbox").hide();
		$(".cartSum").hide();
	}
}
//获取授权的url
function getAuthorizeUrl(sysCommon, url, cmpyId, openId){
	var href;
	url = removeOpenIdParameter(url);
	url = removeCmpyIdParameter(url);
	if(url.indexOf("/newmedia")<0){
		href = window.location.href.split("?")[0] ;
		href = "/newmedia"+href.split("/newmedia")[1];
		var hrefArr = href.split("/");
		href = href.replace(hrefArr[hrefArr.length-1],"");
		if(url.indexOf("../")!=-1)
		{
			href = href.substring(0, href.length-1);
			href = href.replace(hrefArr[hrefArr.length-2],"");
			url = url.replace("../","");
		}
	}
	if(isWeiXin()){
		//修改为静默授权 2016-10-26 qimaoshen
		return sysCommon.silentAuthUrl + "?returnUrl=" + encodeURIComponent(href+url)+ '&cmpyId='+cmpyId;
	}else{
		return href + url + '&cmpyId='+cmpyId + "&openId=" + openId;
	}
}
function removeOpenIdParameter(str) {
    return str.replace(/(^\?|&)openId=[^&]*(&)?/g, function(p0, p1, p2) {
        return p1 === '?' || p2 ? p1 : '';
    });
}
function removeCmpyIdParameter(str) {
    return str.replace(/(^\?|&)cmpyId=[^&]*(&)?/g, function(p0, p1, p2) {
        return p1 === '?' || p2 ? p1 : '';
    });
}



