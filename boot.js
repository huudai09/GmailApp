;function APP(){
	var CLIENT_ID = '534739843252-ql3cuo9jgmot1e7lhsk7omfa1aibq4qk.apps.googleusercontent.com';
	var SCOPES = [
		'https://www.googleapis.com/auth/gmail.readonly',
		'https://mail.google.com/',
		'https://www.googleapis.com/auth/userinfo.email',
		'https://www.googleapis.com/auth/userinfo.profile',
		];		
	
	var App = function(){
		this.CLIENT_ID = CLIENT_ID;
		this.SCOPES = SCOPES;		
		
		this.checkAuth();	
		this.load();
	};
	
	App.prototype.load = function(){		
		var self = this;
		var timer = setInterval(function(){
			if(window.APP.verify){
				clearInterval(timer);
				gapi.client.load('gmail', 'v1');		
				gapi.client.load('plus', 'v1', function() {
				  gapi.client.plus.people.get( {'userId' : 'me'} ).execute(function(resp) {	
					if(resp.hasOwnProperty('emails')){
						window['ME'] = resp;
						window['EMAIL'] = resp.emails[0]['value'];
						TRIGGER();
					}
				  })
				});
			}			
		}, 400);
	};
	
	App.prototype.handleAuthResult = function(authResult){
        var authorizeDiv = $('#authorize');
        var authBtn = $('#authorize-button');
        var self = this;

        if (authResult && !authResult.error) {
          authorizeDiv.hide();
		  window.APP.verify = true;
        } else {          
          authorizeDiv.show();
		  authBtn.click(function() {
			gapi.auth.authorize({
				client_id: CLIENT_ID, 
				scope: SCOPES, 
				immediate: false}
			,self.handleAuthResult);
			  
			return;
		  });
        }		
	};
	
	App.prototype.checkAuth = function(){		
		gapi.auth.authorize({
		  'client_id': this.CLIENT_ID,
		  'scope': this.SCOPES.join(' '),
		  'immediate': true
		}, $.proxy(this.handleAuthResult, this));		
	};	

	window['AUTH'] = new App();	
};

function LoadScript(path){
	var path = !Array.isArray(path) ? [path] : path,
		frags = document.createDocumentFragment();	
	for(var i = 0; i < path.length; i++){
		var script = document.createElement('script');
		script.src = path[i];
		frags.appendChild(script);		
	}
	document.head.appendChild(frags);
}

LoadScript("https://apis.google.com/js/client.js?onload=APP");