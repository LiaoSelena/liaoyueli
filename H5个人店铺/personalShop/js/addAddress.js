(function(){
	var provID;
	var cityID;
	var countyID;
	$(function(){
		loading();//加载
		var windowHeight=window.innerHeight;
		var logoHeight=$('#logo_bottom').outerHeight();
		$('#public_center').css({'min-height':windowHeight-window.innerWidth*0.346667});
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
		//如果参数有addressId，则为修改地址页面
		if(urlParam.addressId){
			$.ajax({
				type:'get',
				url:'/newmedia/mobile/shop/address/getAddressById.action',
				timeout:16000,
				data:{'addressId':urlParam.addressId},
				dataType:'json',
				success:function(data){
					if(data){
						$('#name').val(data.DATA.ConName);
						$('#phone').val(data.DATA.Phone);
						$('#choose div').text(data.DATA.ProvName+'-'+data.DATA.CityName+'-'+data.DATA.CountyName);
						provID=data.DATA.ProvID;
						cityID=data.DATA.CityID;
						countyID=data.DATA.CountyID;
						$('#address').val(data.DATA.Address);
					}
					$('#loading').hide();
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
			$('title').text('修改收货地址');
		}else{
			$('title').text('新增收货地址');
			setTimeout(function(){
				$('#loading').hide();
			},200)
		}
		selectCmpyId();  //底部LOGO
		weixinHideMenu(getSysCommonUrl());  //隐藏微信菜单
	}
	//行为
	function doEvent(){
		//选择省市区
		var cityPicker3 = new mui.PopPicker({
			layer: 3
		})
		cityPicker3.setData(cityData3);
		var showCityPickerButton = document.getElementById('choose');
		showCityPickerButton.addEventListener('tap',function(event){
			$('#name,#phone,#address').blur();
			cityPicker3.show(function(items) {
				showCityPickerButton.childNodes[2].innerText = (items[0] || {}).text + "-" + (items[1] || {}).text + "-" + (items[2] || {}).text;
				provID=(items[0] || {}).region_id;
				cityID=(items[1] || {}).region_id;
				countyID=(items[2] || {}).region_id;
			})
		},false)
		//保存
		$('#save').on('tap',function(){
			var name=$('#name').val();
			var phone=$('#phone').val();
			var choose=$('#choose div').text();
			var address=$('#address').val();
			var tel=/^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
			if(name!=''&&name.length<10){
				if(phone!=''&&tel.test(phone)){
					if(choose!='请选择'){
						if(address!=''&&address.length<150){
							var isDefault='False';
							//如果新用户首次新增地址，则设为默认地址
							if(urlParam.toSureOrder){
								isDefault='True';
							}
							//如果修改地址时是选择的默认地址修改，则仍然保存为默认地址
							if(urlParam.flag=='true'){
								isDefault='True';
							}
							var _data={'userId':urlParam.UID,'conName':name,'provID':provID,'cityID':cityID,'countyID':countyID,'address':address,'mobile':phone,'phone':phone,'isDefault':isDefault,'openId':urlParam.openId,'cmpyId':urlParam.cmpyId};
							//如果参数带有addressId，则为修改地址
							var _url;
							if(urlParam.addressId){
								_url='/newmedia/mobile/shop/address/updateAddress.action';
								_data.addressId=urlParam.addressId;
							}else{
								_url='/newmedia/mobile/shop/address/addAddress.action';
							}
							$('#loading').show();
							$.ajax({
								type:'post',
								url:_url,
								data:_data,
								dataType:'json',
								success:function(data){
									if(data){
										var sourceId='';
										if(urlParam.sourceId){
											sourceId='&sourceId='+urlParam.sourceId+'&sourceType='+urlParam.sourceType;
										}
										var shopcmpyId='';
										if(urlParam.shopcmpyId){
											shopcmpyId='&shopcmpyId='+urlParam.shopcmpyId;
										}
										if(urlParam.toSureOrder){
											if(urlParam.FUID){
												window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/sureOrder.html?ShopNumber='+urlParam.ShopNumber+'&UID='+urlParam.UID+'&FUID='+urlParam.FUID+'&openId='+urlParam.openId+'&cmpyId='+urlParam.cmpyId+shopcmpyId+sourceId;
											}else{
												window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/sureOrder.html?ShopNumber='+urlParam.ShopNumber+'&UID='+urlParam.UID+'&openId='+urlParam.openId+'&cmpyId='+urlParam.cmpyId+shopcmpyId+sourceId;
											}
										}else if(urlParam.personelIndex){
											if(urlParam.FUID){
												window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/manageAddress.html?FUID='+urlParam.FUID+'&UID='+urlParam.UID+'&openId='+urlParam.openId+'&cmpyId='+urlParam.cmpyId+'&personelIndex='+urlParam.personelIndex;
											}else{
												window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/manageAddress.html?UID='+urlParam.UID+'&openId='+urlParam.openId+'&cmpyId='+urlParam.cmpyId+'&personelIndex='+urlParam.personelIndex;
											}
										}else{
											if(urlParam.FUID){
												window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/manageAddress.html?ShopNumber='+urlParam.ShopNumber+'&UID='+urlParam.UID+'&FUID='+urlParam.FUID+'&openId='+urlParam.openId+'&cmpyId='+urlParam.cmpyId+shopcmpyId+sourceId;
											}else{
												window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/manageAddress.html?ShopNumber='+urlParam.ShopNumber+'&UID='+urlParam.UID+'&openId='+urlParam.openId+'&cmpyId='+urlParam.cmpyId+shopcmpyId+sourceId;
											}
										}
									}
									$('#loading').hide();
								}
							})
						}else{
							mui.alert('亲，详细地址不能为空且不能大于150个字符！',function(){
								$('#address').focus();
							})
						}
					}else{
						mui.alert('亲，请选择所在地区！');
					}
				}else{
					mui.alert('亲，请输入合法的手机号码！',function(){
						$('#phone').focus();
					})
				}
			}else{
				mui.alert('亲，姓名不能为空且不能大于10个字符！',function(){
					$('#name').focus();
				})
			}
		})
	}
})()