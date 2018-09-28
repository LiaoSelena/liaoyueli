(function(){
	var rows=3;
	$(function(){
		//判断url必须带的参数
		if(urlParam.cmpyId&&urlParam.openId){
			loadData();  //加载首页数据
			doEvent();  //行为层
		}else{
			console.info('亲，你少带了参数！');
		}
	})
	//加载首页数据
	function loadData(){
		//准备工作
		loading();  //loading效果
		var windowHeight=window.innerHeight;
		var hdHeight=$('#hd').outerHeight();
		var logoHeight=$('#logo_bottom').outerHeight();
		$('#list').css({'min-height':windowHeight-window.innerWidth*0.474666});
		$('#nothing1').css({'height':windowHeight-window.innerWidth*0.474666});
		setTimeout(function(){
			botHtml();botMenu();  //底部菜单
			honeybeeHtml();  //底部按钮
			/*代码开始*/
			//主要接口数据
			$.ajax({
				type:'get',
				url:'/newmedia/app/get/ptypes.action',
				data:{'cmpyId':urlParam.cmpyId},
				dataType:'json',
				timeout:16000,
				success:function(data){
					if(data){
						if(data.header.code=='000'){
							var html='';
							var firstData='';
							var firstPage=1;
							var htmlSpan='';
							$.ajax({
								type:'get',
								url:'/newmedia/app/get/shops.action',
								data:{'cmpyId':urlParam.cmpyId,'ptypId':data.rows[0].id,'pageNo':firstPage,'pageSize':rows},
								async:false,
								dataType:'json',
								success:function(data1){
									if(data1){
										if(data1.header.code=='000'){
											firstData=data1;
											if(firstData.rows.length<3){
												htmlSpan='<span class="more hide" page="'+firstPage+'" ptypId="'+data.rows[0].id+'" style="display: none;">更多</span>';
											}else{
												htmlSpan='<span class="more show" page="'+firstPage+'" ptypId="'+data.rows[0].id+'">更多</span>';
											}
											html+='<section class="list_large">'
												+	'<div class="list_large_tip" status="show_large" ptypId="'+data.rows[0].id+'" flag="false">'
												+		'<span class="list_large_left">'+data.rows[0].name+'</span>'
												+		'<div class="list_large_right">'
												+			'<span>隐藏全部</span>'
												+			'<i class="turn"></i>'
												+		'</div>'
												+	'</div>'
												+	'<ul class="list_small" style="display: block;">'+htmlLargeList(firstData.rows,data.rows[0].id)+'</ul>'
												+	htmlSpan
												+'</section>';
										}
									}
								}
							})
							for(var i=1,length=data.rows.length;i<length;i++){
								html+='<section class="list_large">'
									+	'<div class="list_large_tip" status="hide_large" ptypId="'+data.rows[i].id+'" flag="true">'
									+		'<span class="list_large_left">'+data.rows[i].name+'</span>'
									+		'<div class="list_large_right">'
									+			'<span>展开全部</span>'
									+			'<i></i>'
									+		'</div>'
									+	'</div>'
									+	'<ul class="list_small"></ul>'
									+	'<span class="more hide" page="1" ptypId="'+data.rows[i].id+'">更多</span>'
									+'</section>';
							}
							$('#list').append(html);
						}else{
							$('#nothing1').css({'display':'flex','display':'-webkit-flex'});
						}
					}
					$('#loading').hide();
					sysCommon=getSysCommonUrl();
					weixinHideMenu(sysCommon);  //隐藏微信菜单
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
			selectCmpyId();  //底部技术支持
		},50)
	}
	
	//行为层
	function doEvent(){
		var _this,ptypId,status,ul,span,i,dl,flag,shopNumber,more,page,pType;
		//点击大分类
		mui('#list').on('tap','#list .list_large_tip',function(){
			_this=this;
			ptypId=_this.getAttribute('ptypId');
			status=_this.getAttribute('status');
			flag=_this.getAttribute('flag');
			ul=_this.nextSibling;
			span=_this.childNodes[1].childNodes[0];
			i=_this.childNodes[1].childNodes[1];
			more=_this.nextSibling.nextSibling;
			if(status=='show_large'){
				ul.style.display='none';
				more.className='more hide';
				_this.setAttribute('status','hide_large');
				span.innerHTML='展开全部';
				i.className='';
			}else{
				ul.style.display='block';
				more.className='more show';
				if(flag=='true'){
					ajaxLargeList(ptypId,ul,more,1);
				}
				_this.setAttribute('flag','false');
				_this.setAttribute('status','show_large');
				span.innerHTML='隐藏全部';
				i.className='turn';
			}
		})
		//点击小分类
		mui('#list').on('tap','#list .list_small_tip',function(){
			_this=this;
			status=_this.getAttribute('status');
			pType=_this.getAttribute('pType');
			shopNumber=_this.getAttribute('shopNumber');
			flag=_this.getAttribute('flag');
			dl=_this.nextSibling;
			span=_this.childNodes[1];
			if(status=='show_small'){
				dl.style.display='none';
				_this.setAttribute('status','hide_small');
				span.innerHTML='展开';
			}else{
				dl.style.display='block';
				if(flag=='true'){
					ajaxSmallList(shopNumber,dl,pType);
				}
				_this.setAttribute('flag','false');
				_this.setAttribute('status','show_small');
				span.innerHTML='隐藏';
			}
		})
		//点击更多
		mui('#list').on('tap','#list .more',function(){
			_this=this;
			ul=_this.parentNode.childNodes[1];
			ptypId=_this.getAttribute('ptypId');
			page=_this.getAttribute('page');
			page++;
			_this.setAttribute('page',page);
			ajaxLargeList(ptypId,ul,_this,page);
		})
		//点击跳转搜索页面
		$('#search').on('tap',function(){
			if(urlParam.FUID){
				window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/search.html?cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&shopcmpyId='+urlParam.shopcmpyId+'&UID=&FUID='+urlParam.FUID;
			}else{
				window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/search.html?cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&shopcmpyId='+urlParam.shopcmpyId;
			}
		})
		//点击跳转产品列表页面
		mui('#list').on('tap','#list .product',function(){
			var _this=this;
			var title = _this.innerText;
			var ShopNumber=_this.getAttribute('ShopNumber');
			var ptype=_this.getAttribute('ptype');
			if(urlParam.FUID){
				window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/classificationList.html?cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&stype='+ptype+'&ShopNumber='+ShopNumber+'&shopcmpyId='+urlParam.shopcmpyId+'&UID=&FUID='+urlParam.FUID+'&title='+title;
			}else{
				window.location='/newmedia/pages/mobile/MicroWebsite/personalShop/classificationList.html?cmpyId='+urlParam.cmpyId+'&openId='+urlParam.openId+'&stype='+ptype+'&ShopNumber='+ShopNumber+'&shopcmpyId='+urlParam.shopcmpyId+'&title='+title;
			}
		})
	}
	/**
	 * 加载大类AJAX
	 * @param ptypId 参数
	 * @param ul 元素
	 * @param more 元素
	 * @param page 页数
	 **/
	function ajaxLargeList(ptypId,ul,more,page){
		$('#loading').show();
		if(page==1){
			more.className='more hide';
		}
		setTimeout(function(){
			$.ajax({
				type:'get',
				url:'/newmedia/app/get/shops.action',
				data:{'cmpyId':urlParam.cmpyId,'ptypId':ptypId,'pageNo':page,'pageSize':rows},
				async:false,
				dataType:'json',
				success:function(data){
					var div=document.createElement('div');
					if(data){
						if(data.header.code=='000'){
							div.innerHTML=htmlLargeList(data.rows,ptypId);
							ul.appendChild(div);
							if(data.rows.length<3){
								more.style.display='none';
							}else{
								more.className='more show';
							}
							if(data.rows.length==0){
								mui.toast('已经没有数据啦！');
								more.style.display='none';
							}
						}else{
							mui.toast('已经没有数据啦！');
							more.style.display='none';
						}
					}
					$('#loading').hide();
				}
			})
		},100)
	}
	/**
	 * 加载大类HTML
	 * @param data 数据数组
	 * @param pType 平台大类ID
	 * @return html
	 **/
	function htmlLargeList(data,pType){
		var html='';
		if(data){
			for(var i=0,length=data.length;i<length;i++){
				html+='<li>'
					+	'<span class="list_small_tip" status="hide_small" shopNumber="'+data[i].id+'" flag="true" pType="'+pType+'">'
					+		'<span class="list_small_left">'+data[i].name+'</span>'
					+		'<span class="list_small_right">展开</span>'
					+	'</span>'
					+	'<dl></dl>'
					+'</li>';
			}
		}
		return html;
	}
	/**
	 * 加载小类AJAX
	 * @param shopNumber 参数
	 * @param dl 元素
	 * @param pType 平台大分类
	 **/
	function ajaxSmallList(shopNumber,dl,pType){
		$('#loading').show();
		setTimeout(function(){
			$.ajax({
				type:'get',
				url:'/newmedia/app/get/styps.action',
				data:{'shopNumber':shopNumber,'pType':pType},
				async:false,
				dataType:'json',
				success:function(data){
					if(data){
						if(data.header.code=='000'){
							dl.innerHTML=htmlSmallList(data.rows);
							if(data.rows.length==0){
								mui.toast('已经没有数据啦！');
							}
						}else{
							mui.toast('已经没有数据啦！');
						}
					}
					$('#loading').hide();
				}
			})
		},100)
	}
	/**
	 * 加载小类HTML
	 * @param data 数据数组
	 * @return html
	 **/
	function htmlSmallList(data){
		var html='';
		if(data){
			for(var i=0,length=data.length;i<length;i++){
				if((i+1)%4==0){
					html+='<dd class="no_border product" ptype="'+data[i].id+'" ShopNumber="'+data[i].pId+'">'+data[i].name+'</dd>';
				}else{
					html+='<dd class="product" ptype="'+data[i].id+'" ShopNumber="'+data[i].pId+'">'+data[i].name+'</dd>';
				}
			}
			//补留白
			var n=(data.length)%4;
			if(n!=0){
				for(var j=0;j<4-n;j++){
					if((j+1)==4-n){
						html+='<dd class="no_border"></dd>';
					}else{
						html+='<dd></dd>';
					}
				}
			}
		}
		return html;
	}
})()