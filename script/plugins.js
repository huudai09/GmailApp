// PLUGINS =====================================================================
;(function(){

	'use strict';
	
	var text = 'Do you really want to do this action ?';
	var binded = false;

	window['Popout'] = function(){
		var args = arguments,
			type = args[0],
			data = args[1],
			duration = args[2] || 1500;

		var txt_tmp = text + '<div class="pop-action"> <div class="btn inline pop-confirm">Confirm</div> </div>';

		var the_pop = $('.pop').length 
			? $('.pop') 
			: $('<div class="pop pop-hide"><div class="pop-content"></div></div>').appendTo('body');		

		// Bind common event
		!binded && 		
		the_pop
			.on('click.popClose', function(){
				$(this).hasClass('pop') && $(this).addClass('pop-hide');			
			})
			.on('click.popPrevent', '.pop-content', function(ev){ ev.stopPropagation(); })

		&& (binded = true);

		// Show the pop => remove none and some classes
		the_pop.removeClass('pop-hide alert confirm notice')
			   .addClass(type);

		switch(type){
     
			case 'notice':
				setTimeout(function(){
					the_pop.addClass('pop-hide');
				}, duration);

			case 'alert':
				the_pop.find('.pop-content').html(data);
				break;

			case 'confirm':
				the_pop.find('.pop-content').html(txt_tmp);
				// Apply new handler every time the pop confirm called
				the_pop.off('click.popConfirm').on('click.popConfirm', '.pop-confirm', function(){			
						(typeof data === 'function') && the_pop.addClass('pop-hide') && data();
					})				
				break;
		}
	};

}());