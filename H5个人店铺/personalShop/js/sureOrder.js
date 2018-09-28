(function(){
	var totalMoney=0;  //商品总价
	var totalNum=0;  //商品总数量
	var deliveryFee=0;  //运费
	var cartData='';  //为清空购物车做准备
	var productParam='';  //产品参数
	var feeParams='';  //获取运费所需参数
	var addressIdNow='';  //收货地址ID
	var standardProductParam='';  //产品全参数
	var payType='';  //支付方式
	var _provId='';  //省份ID
	var flagPay=true;  //产品数量标识
	$(function(){
		if(!urlParam.personal1){
			if(urlParam.shopcmpyId){
				honeybeeHtml();  //底部按钮
			}
		}
		loading();  //加载效果
		setTimeout(function(){
			if(urlParam.cmpyId&&urlParam.openId){
				loadData();  //加载首页数据
				doEvent();  //行为
			}else{
				console.info('亲，你少带了参数！');
			}
		},50)
	})
	//加载首页数据
	function loadData(){
		//春节发货提示//
//		$('head').append('<style>.yx_tip{ background:#ffe8ce; color: #ED7E00; font-size: .26rem; padding:.15rem .3rem ; display:none;}</style>');
//		$('#address').before('<aside class="yx_tip" id="yx_tip">本店铺2/4-2/22停止发货，期间所有订单将于2/23陆续发货，谢谢！</aside>');
//		if(cmpyId=='2751'&&ShopNumber=='D012679') $('#yx_tip').show();
//		if(cmpyId=='46'&&ShopNumber=='D006739') $('#yx_tip').show();
		//春节发货提示//
		//支付方式
		if(isWeiXin()){
			//微信
			payType='1';
		}else{
			//支付宝
			payType='3';
		}
		//底部LOGO位置
		$('#public_center').css({'min-height':window.innerHeight-window.innerWidth*0.346667});
		getAddressList();  //加载地址信息
		getShopInfoByShopNumber();  //获取店铺名称
		selectCmpyId();  //底部菜单跳转
	}
	//加载地址信息
	function getAddressList(){
		//如果参数带有收货地址ID，则用参数里的收货地址ID并且查出收货地址
		//否则通过用户ID查询默认收货地址
		if(urlParam.addressId){
			$.ajax({
				type:'get',
				url:'/newmedia/mobile/shop/address/getAddressById.action',
				timeout:16000,
				data:{'addressId':urlParam.addressId},
				dataType:'json',
				success:function(data){
					if(data){
						if(data.RES=='100'){
							$('#address_name').text(data.DATA.ConName);
							$('#address_phone').text(data.DATA.Phone);
							$('#address_detail').text('收货地址: '+data.DATA.ProvName+data.DATA.CityName+data.DATA.CountyName+data.DATA.Address);
							addressIdNow=urlParam.addressId;
							getShopInfo(fee(data.DATA.ProvID));  //获取商品信息
						}else{
							//如果addressId找不到数据，则再从getAddressList.action接口找出地址数据
							$.ajax({
								type:'get',
								url:'/newmedia/mobile/shop/address/getAddressList.action',
								timeout:16000,
								data:{'userId':urlParam.UID},
								dataType:'json',
								success:function(data){
									if(data){
										if(data.RES!='110'){
											var flag=true;
											$.each(data.DATA.CustAddr,function(i,val){
												if(val.IsDefault=='True'){
													$('#address_name').text(val.ConName);
													$('#address_phone').text(val.Phone);
													$('#address_detail').text('收货地址: '+val.ProvName+val.CityName+val.CountyName+val.Address);
													//返回收货地址ID
													addressIdNow=val.ID;
													flag=false;
													getShopInfo(fee(val.ProvID));  //获取商品信息
													return false;
												}
											})
											if(flag){
												$('#address_name').text(data.DATA.CustAddr[0].ConName);
												$('#address_phone').text(data.DATA.CustAddr[0].Phone);
												$('#address_detail').text('收货地址: '+data.DATA.CustAddr[0].ProvName+data.DATA.CustAddr[0].CityName+data.DATA.CustAddr[0].CountyName+data.DATA.CustAddr[0].Address);
												//返回收货地址ID
												addressIdNow=data.DATA.CustAddr[0].ID;
												getShopInfo(fee(data.DATA.CustAddr[0].ProvID));  //获取商品信息
											}
										}else{
											getShopInfo('');  //获取商品信息
											fee('none');  //获取运费信息
											$('#address_content').hide();
											$('#address_nothing').show();
										}
									}
								}
							})
						}
					}
					$('#loading').hide();
					weixinHideMenu(getSysCommonUrl());  //隐藏微信菜单
				},
				error:function(){
					$('#nothing').text('吖，网页出现错误啦！');
					$('#nothing').css({'display':'flex','display':'-webkit-flex'});
					$('#public_center,#loading,#logo_bottom').hide();
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
		}else{
			$.ajax({
				type:'get',
				url:'/newmedia/mobile/shop/address/getAddressList.action',
				timeout:16000,
				data:{'userId':urlParam.UID},
				dataType:'json',
				success:function(data){
					if(data){
						if(data.RES!='110'){
							var flag=true;
							$.each(data.DATA.CustAddr,function(i,val){
								if(val.IsDefault=='True'){
									$('#address_name').text(val.ConName);
									$('#address_phone').text(val.Phone);
									$('#address_detail').text('收货地址: '+val.ProvName+val.CityName+val.CountyName+val.Address);
									//返回收货地址ID
									addressIdNow=val.ID;
									flag=false;
									getShopInfo(fee(val.ProvID));  //获取商品信息
									$('#loading').hide();
									return false;
								}
							})
							if(flag){
								$('#address_name').text(data.DATA.CustAddr[0].ConName);
								$('#address_phone').text(data.DATA.CustAddr[0].Phone);
								$('#address_detail').text('收货地址: '+data.DATA.CustAddr[0].ProvName+data.DATA.CustAddr[0].CityName+data.DATA.CustAddr[0].CountyName+data.DATA.CustAddr[0].Address);
								//返回收货地址ID
								addressIdNow=data.DATA.CustAddr[0].ID;
								getShopInfo(fee(data.DATA.CustAddr[0].ProvID));  //获取商品信息
							}
						}else{
							getShopInfo('');  //获取商品信息
							fee('none');  //获取运费信息
							$('#address_content').hide();
							$('#address_nothing').show();
						}
					}
					$('#loading').hide();
					weixinHideMenu(getSysCommonUrl());  //隐藏微信菜单
				},
				error:function(){
					$('#nothing').text('吖，网页出现错误啦！');
					$('#nothing').css({'display':'flex','display':'-webkit-flex'});
					$('#public_center,#loading,#logo_bottom').hide();
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
		}
	}
	//获取店铺名称
	function getShopInfoByShopNumber(){
		$.ajax({
			type:'get',
			url:'/newmedia/mobile/wechatAccount/getShopInfoByShopNumber.action',
			data:{'shopNumber':urlParam.ShopNumber},
			dataType:'json',
			success:function(data){
				if(data){
					$('#shop_name').text(data.shopName);
				}
			}
		})
	}
	//获取商品信息
	function getShopInfo(productIds){
		var shopInfoData=localStorage.getItem('shop'+urlParam.ShopNumber+'^'+urlParam.openId);
		var _array=shopInfoData.split(',');
		var html='';
		var htmlSim='';  //sim卡
		var id=[];
		if(productIds){
			if(productIds.indexOf(',')>-1){
				id=productIds.split(',');
			}else{
				id=[productIds];
			};
		};
		for(var i=0;i<_array.length;i++){
			var data=_array[i].split('|');
			var data11='',data12='';
			var htmlMask='';
			var flag=true;
			if(data[11]&&data[11]!='undefined'){
				htmlSim='<span class="sim">主卡 : '+data[11]+'</span>';
				data11=data[11];
			}
			if(data[12]&&data[12]!='undefined'){
				htmlSim='<span class="sim">主卡 : '+data[11]+' &nbsp;副卡 : '+data[12]+'</span>';
				data12=data[12];
			}
			for(var j=0;j<id.length;j++){
				if(data[0]==id[j]){
					flag=false;
				}
			}
			if(!flag){
				htmlMask='<div class="list_mask">该商品不支持配送至收货地址</div>';
			}
			html+='<li class="format">'
				+	'<figure class="center-float-left">'
				+		'<span>'
				+			'<img src="'+data[9]+'">'
				+		'</span>'
				+		'<figcaption class="left-tb-scatter">'
				+			'<h2 class="ellipsis_two">'+data[2]+'</h2>'
				+			'<span class="ellipsis_one">规格 : '+data[3]+'</span>'
				+			htmlSim
				+			'<span class="theme_color top-lr-scatter">'
				+				'<span>￥'+data[4]+'</span>'
				+				'<span>x'+data[5]+'</span>'
				+			'</span>'
				+		'</figcaption>'
				+	'</figure>'
				+	htmlMask
				+'</li>';
			if(flag){
				//计算商品总数量
				totalNum+=parseInt(data[5]);
				//计算商品总价
				totalMoney+=parseFloat((data[4]*data[5]).toFixed(2));
				//为清空购物车做准备
				cartData+=data[10]+'|0'+'#';
				//产品参数
				productParam+=data[0]+'|'+data[1]+'|'+data[2]+'|'+data[3]+'|'+data[4]+'|'+data[5]+'|'+data[6]+'||'+data11+'|'+data12+'#';
				//产品全参数
				standardProductParam+=data[0]+'|'+data[1]+'|'+data[2]+'|'+data[3]+'|'+data[4]+'|'+data[5]+'|'+data[6]+'|'+data[7]+'|'+data[8]+'|'+data[9]+'||'+data11+'|'+data12+'#';
			}
		}
		$('#format').append(html);
		$('#total_num').text(totalNum);
		//计算加上运费后的商品总价
		$('#total_money').text('￥'+(Number(totalMoney+deliveryFee)).toFixed(2));
		$('#total_money_last').text((Number(totalMoney+deliveryFee)).toFixed(2));
		cartData=cartData.substring(0,cartData.length-1);
		productParam=productParam.substring(0,productParam.length-1);
		standardProductParam=standardProductParam.substring(0,standardProductParam.length-1);
		if(totalNum==0){
			$('#submit').css({'background-color':'#ccc'});
			flagPay=false;
		}
	}
	//获取运费信息
	function fee(provId){
		var shopInfoData=localStorage.getItem('shop'+urlParam.ShopNumber+'^'+urlParam.openId);
		var _array=shopInfoData.split(',');
		for(var i=0;i<_array.length;i++){
			var data=_array[i].split('|');
			//运费参数
			feeParams+=urlParam.ShopNumber+'|'+data[0]+'|'+data[5]+'|'+data[1]+'#';
		}
		feeParams=feeParams.substring(0,feeParams.length-1);
		var productIds='';
		_provId=provId;
		if(_provId!='none'){
			$.ajax({
				type:'get',
				url:'/newmedia/mobile/shop/delivery/fees.action',
				data:{'feeParams':feeParams,'provId':provId},
				dataType:'json',
				async:false,
				success:function(data){
					if(data){
						if(data.header.code=='000'){
							$('.fare_price').text(parseFloat(data.rows[0].fee));
							//返回运费
							deliveryFee=parseFloat(data.rows[0].fee);
							productIds=data.rows[0].productIds;
						}else{
							mui.alert(data.header.message);
						}
					}
				}
			})
		}else{
			$('.fare_price').text(0);
			//返回运费
			deliveryFee=0;
		}
		return productIds;
	}
	//行为
	function doEvent(){
		//选择收货地址
		$('#address').on('tap',function(){
			var sourceId='';
			if(urlParam.sourceId){
				sourceId='&sourceId='+urlParam.sourceId+'&sourceType='+urlParam.sourceType;
			}
			var shopcmpyId='';
			if(urlParam.shopcmpyId){
				shopcmpyId='&shopcmpyId='+urlParam.shopcmpyId;
			}
			if(addressIdNow){
				//如果有地址ID则跳转管理地址页面
				if(urlParam.FUID){
					window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/manageAddress.html?openId='+urlParam.openId+'&cmpyId='+urlParam.cmpyId+'&ShopNumber='+urlParam.ShopNumber+shopcmpyId+'&UID='+urlParam.UID+'&FUID='+urlParam.FUID+sourceId;
				}else{
					window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/manageAddress.html?openId='+urlParam.openId+'&cmpyId='+urlParam.cmpyId+'&ShopNumber='+urlParam.ShopNumber+shopcmpyId+'&UID='+urlParam.UID+sourceId;
				}
			}else{
				//如果没有地址ID则跳转新增地址页面
				if(urlParam.FUID){
					window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/addAddress.html?openId='+urlParam.openId+'&cmpyId='+urlParam.cmpyId+'&ShopNumber='+urlParam.ShopNumber+shopcmpyId+'&UID='+urlParam.UID+'&FUID='+urlParam.FUID+'&toSureOrder=toSureOrder'+sourceId;
				}else{
					window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/addAddress.html?openId='+urlParam.openId+'&cmpyId='+urlParam.cmpyId+'&ShopNumber='+urlParam.ShopNumber+shopcmpyId+'&UID='+urlParam.UID+'&toSureOrder=toSureOrder'+sourceId;
				}
			}
		})
		//提交订单
		var flagSubmit=true;
		$('#submit').on('tap',function(){
			if(addressIdNow){
				if(flagPay){
					if(flagSubmit){
						flagSubmit=false;
						$(this).css({'background-color':'#ccc'});
						$('#loading').show();
						var fuid;
						var shopNumber=urlParam.ShopNumber;
						var deliverType='快递';
						var deliverFee=deliveryFee;
						var remarks=$.trim($('#remarks').val());
						if(!remarks){
							remarks='';
						}
						if(urlParam.FUID&&urlParam.FUID!='undefined'){
							fuid=urlParam.FUID;
						}else{
							fuid=urlParam.UID;
						}
						//来源ID，如果有参数则带参数数据，没有则为空
						var sourceId='',sourceType='';
						if(urlParam.sourceId){
							sourceId=urlParam.sourceId;
						}
						if(urlParam.sourceType){
							sourceType=urlParam.sourceType;
						}
						var data={
							'userId':urlParam.UID,
							'productParam':productParam,
							'addressId':addressIdNow,
							'fuid':fuid,
							'cmpyId':urlParam.cmpyId,
							'shopNumber':urlParam.ShopNumber,
							'deliverType':deliverType,
							'deliverFee':'',
							'standardProductParam':standardProductParam,
							'remarks':remarks,
							'sourceType':sourceType,
							'sourceId':sourceId,
							'feeParams':feeParams,
							'provId':_provId
						}
						$.ajax({
							type:'post',
							url:'/newmedia/mobile/shop/order/addOrder.action',
							data:data,
							async:false,
							dataType:'json',
							success:function(data){
								if(data){
									if(data.RES=="100"){
										//清空购物车
						    			if(cartData!=""){
						    				updateCartBatch(cartData);
						    			}
										var orderNo='';
										for(var i=0;i<data.DATA.Order.length;i++){
											orderNo+=data.DATA.Order[i].OrderID+'#';
										}
										orderNo=orderNo.substring(0,orderNo.length-1);
										var amount=$('#total_money_last').text();
										$('#loading').show();
										setTimeout(function(){
											payOrder(urlParam.openId,payType,urlParam.cmpyId,amount,orderNo);
											$('#loading').hide();
										},2000)
									}else{
										mui.toast(data.MSG);
										$('#loading').hide();
									}
								}
							}
						})
					}
					//支付的方法
					function payOrder(openId,payType,cmpyId,amount,orderNo){
						var returnUrlParam = orderNo+","+openId+","+cmpyId+","+fuid+","+urlParam.UID+",personalShop";
						var param2 = {"cuid":urlParam.UID,"openId":openId,"payType":payType,"cmpyId":cmpyId,"amount":amount,"orderNo":orderNo,"returnUrlParam":returnUrlParam};
						var flag = true;
						var shopcmpyId='';
						if(urlParam.shopcmpyId){
							shopcmpyId=urlParam.shopcmpyId;
						}
						if(flag){
							if(payType=="1"){
								//获取支付的openid
								var getPayOpenIdUrl = "/newmedia/mobile/shop/order/getPayOpenId.action?cmpyId="+cmpyId+"&platformOpenId="+openId;
								$.get(getPayOpenIdUrl,null,
									function(rData){
										var code = rData.code;
										if("Y"==code){
											var payOpenId = rData.payOpenId;
											var url = "/newmedia/mobile/shop/order/payOrder.action?"+"cuid="+urlParam.UID+"&payOpenId="
												+payOpenId+"&cmpyId="+cmpyId+"&amount="+amount+"&orderNo="+orderNo
												+"&returnUrlParam="+returnUrlParam+"&payType="+payType+"&shopcmpyId="+shopcmpyId;
											window.location.href= url;
										}else if("R"==code){//微信重新授权
											var varCmpyId = cmpyId;
											var sysCommon=getSysCommonUrl();
											var search =window.location.href.split('#')[0];
											var configUrl = sysCommon.jsticketUrl2;
											var result;
											$.ajax({
												type:'get',
												url:configUrl,
												data:{url:search,cmpyId:varCmpyId},
												async:false,
												dataType:'json',
												success:function(data){
													if(data) result=data;
												}
											})
											var appId = result.appId;
											var oauth2Url = "https://open.weixin.qq.com/connect/oauth2/authorize";
											var returnUrl = sysCommon.serverHostUrl +"/newmedia/mobile/shop/order/payOrder.action?"+"cuid="+urlParam.UID+
											"&cmpyId="+cmpyId+"&amount="+amount+"&orderNo="+orderNo
											+"&returnUrlParam="+returnUrlParam+"&payType="+payType+"&shopcmpyId="+shopcmpyId;
											returnUrl = encodeURIComponent(returnUrl);
											var redirect_uri = sysCommon.payAuthUrl+"?returnUrl="+returnUrl+"&cmpyId="+cmpyId;
											redirect_uri = encodeURIComponent(redirect_uri);
											var forwardUrl = oauth2Url + "?appId="+appId+"&redirect_uri="
											+ redirect_uri + "&cmpyId=" + cmpyId+"&response_type=code&scope=snsapi_base&state=1&connect_redirect=1#wechat_redirect";
											window.location.href= forwardUrl;
										}
									},
									'json');
							}else{
								var url = "/newmedia/mobile/shop/order/payOrder.action?"+"cuid="+urlParam.UID+"&payOpenId="
								+openId+"&cmpyId="+cmpyId+"&amount="+amount+"&orderNo="+orderNo
								+"&returnUrlParam="+returnUrlParam+"&payType="+payType+"&shopcmpyId="+shopcmpyId;
								window.location.href = url;
							}
						}
					}
				}
			}else{
				mui.toast('亲，请选择收货地址！');
			}
		})
	}
	/**
	 * 清空购物车
	 * @param cartData 需要数据
	 **/
	function updateCartBatch(cartData){
		$.ajax({
			type:'post',
			url:'/newmedia/mobile/shop/cart/updateCartBatch.action',
			data:{'param':escape(cartData)},
			dataType:'json',
			success:function(data){}
		})
	}
})()