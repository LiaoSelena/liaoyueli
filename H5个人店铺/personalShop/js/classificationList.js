var ptype = urlParam.ptype;//首页进来的参数
var stype = urlParam.stype;//发现页进来的参数
var likeName=urlParam.likeName;//从搜索页面进来的关键字
var shopNumber=urlParam.shopNumber;
var pageNo = 1;//第几页
var pageSize = 10;//一次加载数量
var sortBy = 2;//2最新 1销量  3价格
var isDesc = 1;//1高到低  0低到高
var checkName=urlParam.checkName;//本页面搜索值
var FUID=urlParam.FUID;
var UID=urlParam.UID;
var title = urlParam.title;
var imgSrc="image/loding_img.png";
var urlALL='/newmedia/app/own/getproducts.action?cmpyId='+cmpyId+'&pageSize='+pageSize;
$(function(){
	honeybeeHtml();
	loading();//loding效果
	$("title").text(title);
	$(".main").hide();
	$("#loading").show();
	$("#footer_menu").hide();
	var url;
	//判断url必须带的参数
	if(!FUID){
		FUID="";
	}
	if(!UID){
		UID="";
	}
	if(!shopNumber){
		shopNumber=urlParam.ShopNumber;
	}
	if(urlParam.cmpyId&&urlParam.openId){
		if(ptype && !checkName){
			if(title=="自营产品"){
				url=urlALL+'&ptype='+ptype+'&iSelf=1';
			}else{
				url=urlALL+'&ptype='+ptype;
			}
			effectFun(url);
			console.log("首页进来");
		}else if(stype && shopNumber && !checkName){
			url=urlALL+'&stype='+stype+'&shopNumber='+shopNumber;
			effectFun(url);
			console.log("发现进来");
		}else if(likeName){
			url=urlALL+'&likeName='+likeName;
			effectFun(url);
			sortBy = 3;
            isDesc = 1;
			console.log("模糊查询");
		}else if(checkName && ptype){
			url=urlALL+'&ptype='+ptype+'&checkName='+checkName;
			effectFun(url);
			console.log("首页进来， 本页面搜索");
		}else if(stype && shopNumber && checkName){
			url=urlALL+'&stype='+stype+'&shopNumber='+shopNumber+'&checkName='+checkName;
			effectFun(url);
			console.log(urlALL);
			console.log("发现进来 ，本页面搜索");
		}
		loadData(url,pageNo,sortBy,isDesc);  //加载数据
		doEvent(url,pageNo,sortBy,isDesc);  //行为层
		botHtml();botMenu();  //底部菜单
		$('#masked_transparent').css({'height':window.innerHeight-window.innerWidth*0.133333});
		sysCommon=getSysCommonUrl();
	    weixinHideMenu(sysCommon);
	}else{
		console.info('亲，你少带了参数！');
	}
})
//数据
function loadData(url){
	    setTimeout(function(){
		$.ajax({
			type:'get',
			url:url+'&pageNo='+pageNo+'&sortBy='+sortBy+'&isDesc='+isDesc,
			dataType:'json',
			timeout:16000,
			success:function(data){
				$('#list *').remove();
				mui('#content').pullRefresh().refresh(true);
				mui('#content').pullRefresh().enablePullupToRefresh();
				if (data.header.message=='OK') {
					no=data.rows.length;
					$("#list").append(htmlList(data.rows));
//					var box=document.getElementById("list");
//					lazyLoadMui(htmlList(data.rows),box,imgSrc);
//					$("#list>div").addClass("left-float-top-br top-lr-scatter");
					//跳转到产品详情
					$("#list li").on("tap",function(){
						var cmpy=$(this).attr("data-cmpyId");
						var shop=$(this).attr("data-shopNumber");
						var produce=$(this).attr("data-productId");
						if(urlParam.FUID){
							window.location.href='/newmedia/pages/mobile/MicroWebsite/personalShop/productDetail.html?ShopNumber='+shop+'&openId='+openId+'&cmpyId='+cmpy+'&ProductID='+produce+'&shopcmpyId='+urlParam.shopcmpyId+'&UID=&FUID='+urlParam.FUID;
						}else{
							window.location.href='/newmedia/pages/mobile/MicroWebsite/personalShop/productDetail.html?ShopNumber='+shop+'&openId='+openId+'&cmpyId='+cmpy+'&ProductID='+produce+'&shopcmpyId='+urlParam.shopcmpyId+'&UID=';
						}
					})
					$(".mui-pull-caption").show();
					if(data.rows.length<10){
						$('.mui-pull-bottom-pocket').css({'opacity':0,'text-algin':'center'});
					}
				}
				if(data.header.code=='NOTEXIST' || data.header.code=='E999'){
					$("#list").append("<div class='tip'>没有找到相关数据！</div>");
					$(".mui-pull-caption").hide();
				}
				$('#loading').hide();
				$(".main").show();
				$("#footer_menu").show();
				var _height=$('#content').height()-(($('#logo_bottom').height()*2));
				$('#content').css({'min-height':_height});
				$('#nothing1').css({'height':_height});
			},
			error:function(){
				$('#nothing').text('吖，网页出现错误啦！');
				$('#nothing').css({'display':'flex','display':'-webkit-flex'});
				$('#public_center,#loading').hide();
			},
			complete:function(XMLHttpRequest,status){
				if(status=='timeout'){
					$('#nothing').hide();
					mui.confirm('网络超时了，刷新试试？','提示',['否', '刷新'],function(e){
						if(e.index==1)location.reload();
					})
				}
			}
		})
	},50)
}
/**
 * 加载HTML
 * @param data 数据数组
 * @return html
 **/
function htmlList(data){
	var html='';
	if(data){
		for(var i=0,length=data.length;i<length;i++){
			html+='<li data-cmpyId="'+data[i].cmpyId+'" data-productId="'+data[i].productId+'" data-shopNumber="'+data[i].shopNumber+'">'
				+	'<img src="'+data[i].productImg+'" >'
				+	'<h2 class="ellipsis_two">'+data[i].productName+'</h2>'
				+	'<p class="top-lr-scatter"><strong class="mui-ellipsis">￥'+data[i].price+'</strong><span>月销'+data[i].sales+'</span></p>'
				+'</li>';
		}
	}
	return html;
}
//上拉加载
function doEvent(url){
	mui.init({
		pullRefresh:{
			container:'#content',
			up:{
				contentrefresh:'正在加载...',
				contentnomore:'没有更多数据了',
				callback:pullupRefresh
			}
		}
	})
	function pullupRefresh(){
		setTimeout(function(){
			pageNo++;
			$.ajax({
				type:'get',
				url:url+'&pageNo='+pageNo+'&sortBy='+sortBy+'&isDesc='+isDesc,
				dataType:'json',
				success:function(data){
					if(data){
						$("#list").append(htmlList(data.rows));
						$("#list li").on("tap",function(){
							var cmpy=$(this).attr("data-cmpyId");
							var shop=$(this).attr("data-shopNumber");
							var produce=$(this).attr("data-productId");
							if(urlParam.FUID){
								window.location.href='/newmedia/pages/mobile/MicroWebsite/personalShop/productDetail.html?ShopNumber='+shop+'&openId='+openId+'&cmpyId='+cmpy+'&ProductID='+produce+'&shopcmpyId='+urlParam.shopcmpyId+'&UID=&FUID='+urlParam.FUID;
							}else{
								window.location.href='/newmedia/pages/mobile/MicroWebsite/personalShop/productDetail.html?ShopNumber='+shop+'&openId='+openId+'&cmpyId='+cmpy+'&ProductID='+produce+'&shopcmpyId='+urlParam.shopcmpyId+'&UID=';
							}
						})
						mui('#content').pullRefresh().endPullupToRefresh(data.header.code=="NOTEXIST" || data.header.code=='E999');
					}
				}
			})
		},500)
	}
}
//url判断
function effectFun(url){
	var flagSales=true;
	var flagPrice=true;
	//最新
	$("#new").on("tap",function(){
		$(".main").hide();
	    $("#loading").show();
		$("#sales").find("img").attr("src","image/pro_gray.png");
		$("#price").find("img").attr("src","image/pro_gray.png");
		$(".classification_header a").removeClass("on");
		$(this).addClass("on");
		pageNo=1;
		sortBy=2;
		isDesc=1;
		loadData(url,pageNo,sortBy,sortBy);  //加载首页数据
	    doEvent(url,pageNo,sortBy,sortBy);  //行为层
	    flagSales=true;
	    flagPrice=true;
	    console.log('最新');
	    return;
	})
	//销量排序
	$("#sales").on("tap",function(){
		$(".main").hide();
	    $("#loading").show();
		flagPrice=true;
		$("#price").find("img").attr("src","image/pro_gray.png");
		$(".classification_header a").removeClass("on");
		$(this).addClass("on");
		pageNo=1;
		sortBy=1;
		if(flagSales){
			//销量从高到低
			isDesc=1;
			flagSales=false;
			$(this).find("img").attr("src","image/pro_down.png");
			loadData(url,pageNo,sortBy,sortBy);  //加载首页数据
		    doEvent(url,pageNo,sortBy,sortBy);  //行为层
		    console.log('销量从高到低');
		}else{
			//销量从低到高
			isDesc=0;
			flagSales=true;
			$(this).find("img").attr("src","image/pro_up.png");
			loadData(url,pageNo,sortBy,sortBy);  //加载首页数据
		    doEvent(url,pageNo,sortBy,sortBy);  //行为层
		    console.log('销量从低到高');
		}
	})
	//价格排序
	$("#price").on("tap",function(){
		$(".main").hide();
	    $("#loading").show();
		flagSales=true;
		$("#sales").find("img").attr("src","image/pro_gray.png");
		$(".classification_header a").removeClass("on");
		$(this).addClass("on");
		pageNo=1;
		sortBy=3;
		if(flagPrice){
			//价格从高到低
			isDesc=1;
			flagPrice=false;
			$(this).find("img").attr("src","image/pro_down.png");
			loadData(url,pageNo,sortBy,sortBy);  //加载首页数据
		    doEvent(url,pageNo,sortBy,sortBy);  //行为层
		    console.log('价格从高到低');
		}else{
			//价格从低到高
			isDesc=0;
			flagPrice=true;
			$(this).find("img").attr("src","image/pro_up.png");
			loadData(url,pageNo,sortBy,sortBy);  //加载首页数据
		    doEvent(url,pageNo,sortBy,sortBy);  //行为层
		    console.log('价格从低到高');
		}
	})
	//本页面搜索
	$(".classification_header .search_btn").on("tap",function(){
		$(".search_box").removeClass("transform");
		$(".classification_header").addClass("transform");
	})
	$(".search_box span").on("tap",function(){
		$(".classification_header").removeClass("transform");
		$(".search_box").addClass("transform");
	})
	document.onkeydown=keyDownSearch; //电脑键盘enter搜索
	//手机键盘搜索
	$('#searchInput').on('search',function(){
		var searchVal=$("#searchInput").val();
		searchFun(searchVal);
	});
}
/*
 *搜索fun
 * searchVal搜索词
 */  
function searchFun(searchVal){
	$(".main").hide();
	$("#loading").show();
	if(ptype){
		window.location.href='/newmedia/pages/mobile/MicroWebsite/personalShop/classificationList.html?cmpyId='+cmpyId+'&openId='+openId+'&ptype='+ptype+"&checkName="+searchVal+"&shopcmpyId="+urlParam.shopcmpyId;
//		url=urlALL+'&ptype='+ptype+"&checkName="+searchVal;
		console.log("首页进来--搜索");
	}else if(stype && shopNumber){
//		url=urlALL+'&stype='+stype+'&shopNumber='+shopNumber+"&checkName="+searchVal;
        window.location.href='/newmedia/pages/mobile/MicroWebsite/personalShop/classificationList.html?cmpyId='+cmpyId+'&shopcmpyId='+urlParam.shopcmpyId+'&openId='+openId+"&shopNumber="+shopNumber+'&stype='+stype+'&checkName='+searchVal;
		console.log("发现进来--搜索");
	}else if(likeName){
		//url=urlALL+'&likeName='+searchVal;
		window.location.href='/newmedia/pages/mobile/MicroWebsite/personalShop/classificationList.html?cmpyId='+cmpyId+'&openId='+openId+"&likeName="+searchVal+"&shopcmpyId="+urlParam.shopcmpyId;
		console.log("模糊搜索--全搜索");
//		sortBy = 3;
//      isDesc = 1;
	}
	//effectFun(url);
//	loadData(url,pageNo,sortBy,isDesc);  //加载首页数据
//	doEvent(url,pageNo,sortBy,isDesc);  //行为层
}
 function keyDownSearch(e) {  
    var theEvent = e || window.event;  
    var code = theEvent.keyCode || theEvent.which || theEvent.charCode;  
    if (code == 13) {   
        var searchVal=$("#searchInput").val();
        searchFun(searchVal);
        return false;  
    }  
    return true;  
}
