;(function($){
	'use strict';
	var DH = {
		init: function(){
			
			//User Login and register account.
			this.userInit();
		},
		userInit: function(){
            $(document).ready(function () {
                if (window.location.href.indexOf('#userloginModal') != -1) {
                    $('#userloginModal').modal('show');
                }
            });
			$(document).on('click','[data-rel=registerModal]',function(e){
				e.stopPropagation();
				e.preventDefault();
				if($('#userloginModal').length){
					$('#userloginModal').modal('hide');
				}
				if($('#userlostpasswordModal').length){
					$('#userlostpasswordModal').modal('hide');
				}
				if($('#userregisterModal').length){
					$('#userregisterModal').modal('show');
				}
			});
			$(document).on('click','[data-rel=loginModal]',function(e){
				e.stopPropagation();
				e.preventDefault();
				if($('#userregisterModal').length){
					$('#userregisterModal').modal('hide');
				}
				if($('#userlostpasswordModal').length){
					$('#userlostpasswordModal').modal('hide');
				}
				if($('#userloginModal').length){
					$('#userloginModal').modal('show');
				}
			});
		},
	};
	$(document).ready(function(){
		DH.init();
	});
})(jQuery);
