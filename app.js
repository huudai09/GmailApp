// TRIGGER =====================================================================
;function TRIGGER(){
	$('.loading.full').removeClass('loading full');
	$('.item.item-selected').triggerHandler('click');

	// display personnel information
	$('.profile-img').attr('src', ME.image.url);
	$('.profile-name').text(ME.name.givenName);

	// load labels
	Model.query('labels.list', {}, function(res){
		var scope = angular.element('#wrapper').scope();
		var labels = res.labels;
		var len = labels.length;

		if(len){

			var systemLabels = scope.labels.map(function(l){return l.name;});
			var oldSysLabels = scope.labels;
			var otherLabels = [];
			var newSysLabels = [];

			for(var i = 0; i < len; i++){

				var lb = labels[i], ld;
				if(!~systemLabels.indexOf(lb['id'])){
					ld = {
						name: lb['id'],
						title: lb['name'],
						active:'',
						type: lb['type']
					}

					lb['type'] != 'system' ? otherLabels.push(ld) : newSysLabels.push(ld);								

				}
			}

			scope.$apply(function(){
				scope.labels = oldSysLabels.concat(newSysLabels.concat(otherLabels));
			});
		}
	})
}

// APP =========================================================================

var LIMIT = 10;
var app = angular.module('MailApp', ['ngSanitize']);
