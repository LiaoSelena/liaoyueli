var ProductID=urlParam.ProductID;
$(function(){
	loading();
	$('.product_detail').hide();
	$('.productDetail_img').hide();
	//判断页面是否到纯图产品详情页面
	$.ajax({
		type:'get',
		timeout:8000,  //设置8秒超时
		dataType : "json",
		url:"/newmedia/mobile/product/checkProductImg.action?productId="+ProductID,
		success:function(data){
			if(data){
				if(data.header.code=="000"){
			 	    console.log("普通");
					$(".product_detail").show();
					$(".productDetail_img").remove();
					$("body").append('<script type="text/javascript" src="js/ProductDetail.js"></script>');
			 	}else if(data.header.code=="110"){
			 		mui.alert('暂无此商品',function(){
			 			window.history.go(-1);
			 		})
				}else{
				 	console.log("纯图");
			     	$(".productDetail_img").show();
			     	$(".product_detail").remove();
			     	$("body").append('<script type="text/javascript" src="js/productDetail_img.js"></script>');
			     	if(imglength == '1'){
						$('.leader_float').show();
					}
				}
			}
		},
		complete:function(XMLHttpRequest,status){
			if(status=='timeout'){
				mui.confirm('网络超时了，刷新试试？','提示',['否', '刷新'],function(e){
					if(e.index==1)location.reload();
				})
			}
		}
	})
})
function selectCompanyInFo(){//判断该商品是企业店铺的还是个人店铺的
	$.ajax({
		type:'get',
		timeout:8000,
		url:'/newmedia/mobile/cmpySetting/selectCompanyInFo.action?cmpyId='+cmpyId,
		success:function(data){
			if(data){
				var regIdentify = data.regIdentify;
				var extra1 = data.extra1;
				console.log(regIdentify)
				if (regIdentify) {
					//个人
					$('#jump_index,#jump_index1,#jump_index2').on('tap',function(){
						location.href = '/newmedia/pages/mobile/MicroWebsite/personalShop/index.html?cmpyId='+cmpyId+'&openId='+openId+'&shopcmpyId='+cmpyId
					})
					topFloat('2','自营产品详情页',ProductID,openId,'你也可以打造酷炫的宝贝详情');
				}else{
					if(urlParam.shopcmpyId){
						//个人
						$('#jump_index,#jump_index1,#jump_index2').on('tap',function(){
							location.href = '/newmedia/pages/mobile/MicroWebsite/personalShop/index.html?cmpyId='+urlParam.shopcmpyId+'&openId='+openId+'&shopcmpyId='+urlParam.shopcmpyId
						})
					}else{
						//企业
						$('#jump_index,#jump_index1,#jump_index2').on('tap',function(){
							location.href = '/newmedia/pages/mobile/futureStore/headpage.html?cmpyId='+cmpyId+'&openId='+openId;
						})
					}
				}
				if(extra1){
					if(data.extra1=='1'){
						$('#jump_index,#jump_index1,#jump_index2').hide();
					}
				}
			}
		}
	});
}