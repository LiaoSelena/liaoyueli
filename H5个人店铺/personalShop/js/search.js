(function(){
	$(function(){
		//判断url必须带的参数
		if(urlParam.cmpyId&&urlParam.openId){
			honeybeeHtml();
			sysCommon=getSysCommonUrl();
			weixinHideMenu(sysCommon);
			search();
			$("input").focus();
		}else{
			console.info('亲，你少带了参数！');
		}
	})
	function search(){
		$("#remove").on('tap',function(){
			localStorage.removeItem("historicalRecord");//删除
			window.location.reload();
		})
		
		var weekArray = JSON.parse(localStorage.getItem('historicalRecord'));//取
		if (weekArray==null) {
			var namearry = [];
			 $(".panel2").hide();
		} else{
			var namearry = weekArray;
			var html='';
			for(var i=0; i<weekArray.length;i++){
				html+='<li>'+weekArray[i]+'</li>'
			}
			$("#panel2-ul").append(html);
			$(".panel2").show();
		}
		
		var inputText='';
		var weekArray='';
		$('#search-btn').on('tap',function(){
			inputText = $('#input-text').val();
			if(inputText!=''){
				if(namearry==''){
					namearry.push(inputText);
				}else{
					for (var i=0; i<namearry.length; i++) {
						if (namearry.indexOf(inputText)==-1) {
							namearry.push(inputText);
							break;
						}
					}
				}
			localStorage.setItem('historicalRecord',JSON.stringify(namearry));//存
			location.href = 'classificationList.html?cmpyId='+cmpyId+'&openId='+openId+'&likeName='+inputText+'&shopcmpyId='+urlParam.shopcmpyId;
			}
		})
		
		$("#panel2-ul li").on('tap',function(){
			var thistext = $(this).text();
			location.href = 'classificationList.html?cmpyId='+cmpyId+'&openId='+openId+'&likeName='+thistext+'&shopcmpyId='+urlParam.shopcmpyId;
		});
	}
})()