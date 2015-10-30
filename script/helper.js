var Base64 = {
    encode: function (s) {
        return btoa(unescape(encodeURIComponent(s)));
    },
    decode: function (s) {
        return decodeURIComponent(escape(atob(s)));
    }
};

var _ = {
	isObjectEmpty: function(obj) {
	  if (obj) {
		for (var prop in obj) {
		  if (obj.hasOwnProperty(prop)) {
			return false;
		  }
		}
	  }
	  return true;
	},
	setLoading: function(b, s){
		$(s || '.list')[b ? 'addClass':'removeClass']('loading');
	},
	activeLabel: function(lb){
		$('.item').removeClass('item-selected');
		$('.item[data-name="'+lb.name+'"]').addClass('item-selected');
	},	
	randId: function(){
		return Math.floor((Math.random() * 0x1000000000)).toString(16);
	},
	decode: function(data){
		return Base64.decode(data.replace(/-/g, '+').replace(/_/g, '/'));
	},
	template: function(name){
		return 'templates/' + name + '_tpl.html';
	},
	modal: function(){
		Popout.apply(null, arguments);		
	},
	notice: function(msg, duration){
		this.modal('notice', msg, duration);
	}	
}