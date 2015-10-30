;(function(md){

	'use strict';

	md._apiLoaded = function(){ return !!window['gapi']; }
	md._getAPI = function(g, str){
		str = str.split('.');
		for(var i = 0; i < str.length; i++){
			g.hasOwnProperty(str[i]) && (g = g[str[i]]);
		}		
		return g;
	};
	md.query = function(type, args, cb){
		if(this._apiLoaded()){
			var CLIENT = this._getAPI(gapi.client.gmail.users, type);
			CLIENT($.extend({
				'userId': 'me'
			}, args)).execute(function (res) {
				if(!!args.unread){
					// mark email as read
					gapi.client.gmail.users.threads.modify($.extend({
						'userId': 'me',
						'removeLabelIds': ['UNREAD']
					}, args)).execute();					
				}			
				cb(res);
			});
		}
	}
	
	window['Model'] = md;
}(window['Model'] || {}));
