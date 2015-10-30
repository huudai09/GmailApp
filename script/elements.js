;(function(app){

	'use strict';	

	[
	
	// g-mail element       	
	['gMail', function(){
		return {
			link: function($scope, el, att){
				el.click(function(){
					$scope.addComposeBox();
				});
			}
		};
	}],

	// g-compose element
	['gCompose', function(){
		return {
			templateUrl: _.template('composebox'),
			link: function($scope, el, att){
				// close the composebox
				el.on('click', '.compose-btn-close', function(){
					el.addClass('removing');
					setTimeout(function(){
						el.remove();
					}, 400);
				});

				el.on('click', '.compose-send', function(ev){

					if(this.sending)
						return;

					this.sending = true;

					$scope.send($.proxy(function(){
						this.sending = false;
						el.find('.compose-btn-close').trigger('click');						
					}, this));
				})
			}
		};
	}]

	].forEach(function(item){
		app.directive.apply(null, item);
	});

})(window.app);