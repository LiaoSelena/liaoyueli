var sourceId='';
if(urlParam.sourceId){
	sourceId='&sourceId='+urlParam.sourceId+'&sourceType='+urlParam.sourceType;
}
var shopcmpyId='';
if(urlParam.shopcmpyId){
	shopcmpyId='&shopcmpyId='+urlParam.shopcmpyId;
}
(function(){
	$(function(){
		loading();  //加载
		setTimeout(function(){
			if(urlParam.openId&&urlParam.cmpyId){
				loadData();  //加载首页数据
				doEvent();  //行为
			}else{
				console.info('亲，你少带了参数！');
			}
		},50)
	})
	//加载首页数据
	function loadData(){
		$.ajax({
			type:'get',
			url:'/newmedia/mobile/shop/address/getAddressList.action',
			timeout:16000,
			data:{'userId':urlParam.UID},
			dataType:'json',
			success:function(data){
				if(data){
					if(data.RES=='100'){
						var flag=true;
						var html='';
						var htmlSpan='';
						var htmlI='';
						var _data=data.DATA.CustAddr;
						if(_data.length>0){
							for(var i=0;i<_data.length;i++){
								if(_data[i].IsDefault=='True'){
									flag=false;
									htmlSpan='<span class="theme_color default_address">设为默认地址</span>';
									htmlI='<i class="current icon_default_address"></i>';
								}else{
									htmlSpan='<span class="default_address">设为默认地址</span>';
									htmlI='<i class="default icon_default_address"></i>';
								}
								html+='<li class="address">'
										+	'<div onclick="linkToOrder('+_data[i].ID+')">'
										+		'<span class="name ellipsis_one">'+_data[i].ConName+'</span>'
										+		'<span>'+_data[i].Phone+'</span>'
										+	'</div>'
										+	'<address onclick="linkToOrder('+_data[i].ID+')">'+_data[i].ProvName+_data[i].CityName+_data[i].CountyName+_data[i].Address+'</address>'
										+	'<div class="control">'
										+		'<div onclick="defaultAddress(this,'+_data[i].ID+')">'
										+			htmlI
										+			htmlSpan
										+		'</div>'
										+		'<div>'
										+			'<i onclick="linkToEditorAddress(this,'+_data[i].ID+')" class="editor"></i>'
										+			'<i onclick="deleteAddress(this,'+_data[i].ID+')" class="delete"></i>'
										+		'</div>'
										+	'</div>'
										+	'<input type="hidden" value="'+_data[i].ID+'">'
										+'</li>';
							}
						}else{
							$('#nothing').show();
						}
						$('#address_list').append(html);
						//如果没有默认地址，则设置第一条数据为默认地址
						if(flag){
							if($('#address_list li').length>0){
								var firstAddressId=$('#address_list li:first input').val();
								$.ajax({
									type:'post',
									url:'/newmedia/mobile/shop/address/setAddressDefault.action',
									data:{'addressId':firstAddressId},
									dataType:'json',
									async:false,
									success:function(data){
										if(data){
											if(data.RES=='100'){
												$('#address_list li:first').find('.default_address').addClass('theme_color');
												$('#address_list li:first').find('.icon_default_address').addClass('current');
											}else{
												mui.toast('设置默认地址失败！');
											}
										}
									}
								})
							}
						}
					}else{
						$('#nothing').show();
					}
				}
				$('#loading').hide();
				$('#logo_bottom').css({'display':'block'});
			},
			error:function(){
				$('#nothing').text('吖，网页出现错误啦！');
				$('#nothing').css({'display':'flex'});
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
		//底部LOGO位置
		var logoBottom=$('#logo_bottom').outerHeight();
		var publicCenterMinHeight=windowHeigth-logoBottom;
		$('#public_center').css({'min-height':window.innerHeight-window.innerWidth*0.346667});
		$('#nothing').css({'height':window.innerHeight-window.innerWidth*0.346667,'line-height':(window.innerHeight-window.innerWidth*0.346667)+'px'});
		selectCmpyId();
		weixinHideMenu(getSysCommonUrl());  //隐藏微信菜单
	}
	//行为
	function doEvent(){
		//跳转新增地址
		//如果参数有personal，则表示是个人中心的流程，需要带personal参数
		//如果参数有ShopNumber，则表示是支付的流程，需要带ShopNumber参数
		$('#add_btn').on('tap',function(){
			if(urlParam.personelIndex){
				if(urlParam.FUID){
					window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/addAddress.html?FUID='+urlParam.FUID+'&UID='+urlParam.UID+'&cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&personelIndex='+urlParam.personelIndex;
				}else{
					window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/addAddress.html?&UID='+urlParam.UID+'&cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&personelIndex='+urlParam.personelIndex;
				}
			}else{
				if(urlParam.FUID){
					window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/addAddress.html?FUID='+urlParam.FUID+'&UID='+urlParam.UID+'&cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&ShopNumber='+urlParam.ShopNumber+shopcmpyId+sourceId;
				}else{
					window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/addAddress.html?UID='+urlParam.UID+'&cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&ShopNumber='+urlParam.ShopNumber+shopcmpyId+sourceId;
				}
			}
		})
		
	}
})()
/**
 * 设置默认地址
 * @param _obj this
 * @param addressId 地址ID
 **/
function defaultAddress(_obj,addressId){
	if(!$(_obj).children('.icon_default_address').is('.current')){
		$('#loading').show();
		$.ajax({
			type:'post',
			url:'/newmedia/mobile/shop/address/setAddressDefault.action',
			data:{'addressId':addressId},
			dataType:'json',
			success:function(data){
				if(data){
					if(data.RES=='100'){
						mui.toast('设置默认地址成功！');
						$('.address .default_address').removeClass('theme_color');
						$('.control .icon_default_address').removeClass('current');
						$('.control .icon_default_address').addClass('default');
						$(_obj).find('.default_address').addClass('theme_color');
						$(_obj).children('.icon_default_address').addClass('current');
					}else{
						mui.toast('设置默认地址失败！');
					}
				}
				$('#loading').hide();
			}
		})
	}
}
/**
 * 跳转订单页面
 * @param addressId 地址ID
 **/
function linkToOrder(addressId){
	//如果有personal则表示为个人中心的单纯管理地址页面，不需要跳转到订单页面
	if(!urlParam.personelIndex){
		if(urlParam.FUID){
			window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/sureOrder.html?ShopNumber='+urlParam.ShopNumber+"&openId="+urlParam.openId+"&cmpyId="+urlParam.cmpyId+"&UID="+urlParam.UID+"&FUID="+urlParam.FUID+"&addressId="+addressId+shopcmpyId+sourceId;
		}else{
			window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/sureOrder.html?ShopNumber='+urlParam.ShopNumber+"&openId="+urlParam.openId+"&cmpyId="+urlParam.cmpyId+"&UID="+urlParam.UID+"&addressId="+addressId+shopcmpyId+sourceId;
		}
	}
}
/**
 * 跳转修改收货地址页面
 * @param _obj this
 * @param addressId 地址ID
 **/
function linkToEditorAddress(_obj,addressId){
	var flag;
	if($(_obj).parent().siblings().children('i').is('.current')){
		flag='true';
	}else{
		flag='false';
	}
	//如果参数有personal，则表示是个人中心的流程，需要带personal参数
	if(urlParam.personelIndex){
		if(urlParam.FUID){
			window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/addAddress.html?FUID='+urlParam.FUID+'&UID='+urlParam.UID+'&cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&addressId='+addressId+'&flag='+flag+'&personelIndex='+urlParam.personelIndex;
		}else{
			window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/addAddress.html?UID='+urlParam.UID+'&cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&addressId='+addressId+'&flag='+flag+'&personelIndex='+urlParam.personelIndex;
		}
	}else{
		if(urlParam.FUID){
			window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/addAddress.html?FUID='+urlParam.FUID+'&UID='+urlParam.UID+'&cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&addressId='+addressId+'&flag='+flag+'&ShopNumber='+urlParam.ShopNumber+shopcmpyId+sourceId;
		}else{
			window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/addAddress.html?UID='+urlParam.UID+'&cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&addressId='+addressId+'&flag='+flag+'&ShopNumber='+urlParam.ShopNumber+shopcmpyId+sourceId;
		}
	}
}
/**
 * 删除地址
 * @param _obj this
 * @param addressId 地址ID
 **/
function deleteAddress(_obj,addressId){
	mui.confirm('确定删除？','提示',['否', '是'],function(e){
		if(e.index==1){
			$('#loading').show();
			//删除地址
			$.ajax({
				type:'post',
				url:'/newmedia/mobile/shop/address/deleteAddress.action',
				data:{'addressId':addressId},
				async:false,
				dataType:'json',
				success:function(data){
					if(data){
						if(data.RES=='100'){
							mui.toast('删除地址成功！');
							$(_obj).parent().parent().parent('.address').remove();
							if($('#address_list li').length==0){
								$('#nothing').show();
							}
						}else{
							mui.toast('删除地址失败！');
						}
					}
					$('#loading').hide();
				}
			})
			$('#loading').show();
			//如果删除默认地址，则第一条数据变为默认地址
			if($(_obj).parent().siblings().children('i').is('.current')){
				if($('#address_list li').length>0){
					var firstAddressId=$('#address_list li:first input').val();
					$.ajax({
						type:'post',
						url:'/newmedia/mobile/shop/address/setAddressDefault.action',
						data:{'addressId':firstAddressId},
						dataType:'json',
						success:function(data){
							if(data){
								if(data.RES=='100'){
									$('#address_list li:first').find('.default_address').addClass('theme_color');
									$('#address_list li:first').find('.icon_default_address').addClass('current');
								}else{
									mui.toast('设置默认地址失败！');
								}
							}
							$('#loading').hide();
						}
					})
				}else{
					$('#loading').hide();
				}
			}else{
				$('#loading').hide();
			}
		}
	})
}