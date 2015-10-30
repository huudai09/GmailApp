;(function(app){

	'use strict';

	app.controller('Controller', function($scope) {
		
		$scope.labels = [
			{name: 'INBOX',
				title: 'Inbox',
				active: 'item-selected',
				type: 'system'
			},
			{name: 'UNREAD',
				title: 'New',
				active: '',
				type: 'system'
			},
			{name: 'IMPORTANT',
				title: 'Important',
				active: '',
				type: 'system'
			},
			{name: 'SENT',
				title: 'Sent',
				active: '',
				type: 'system'
			},			
			{name: 'STARRED',
				title: 'Starred',
				active: '',
				type: 'system'
			},
			{name: 'DRAFT',
				title: 'Draft',
				active: '',
				type: 'system'
			}			 
		];
		
		$scope.title = 'Inbox';
		$scope.viewer = '';	
		$scope.composeForms = [{
			id: _.randId(),
			formID: _.randId()
		}];
		$scope.threads = [{
			clss: '',
			id: '',
			from: 'Noone@people.com',
			subject: 'No Subject',
			snippet: 'No snippet'
		}];		
		
		$scope.labels.forEach(function(label){ 
			!!label.active && ($scope.title = label.title); 
		});	
		
		var date = new Date(),			
			pageTokens = [],
			logoutUrl = 'https://accounts.google.com/logout',
			d = date.getFullYear() + '/' + date.getMonth() + 1 + '/' + date.getDate();	

		// Define: Action ------------------------------------------------------------------------------	
		
		$scope.toggleMenu = function(ev){
			var side = $('#side');
			side.hasClass('show') ? side.removeClass('show') : side.addClass('show');			
		};

		$scope.logout = function(){
			_.modal('confirm', function(){
				$('#wrapper')
					.append('<iframe id="logoutframe" src="https://accounts.google.com/logout" style="display: none"></iframe>')
					.addClass('loggedout');
			});
		}

		$scope.addComposeBox = function(){
			var cbox = $('.composebox');
			var phase = this.$root.$$phase;
			var fn = function(){
				$scope.composeForms.push({
					id: _.randId(),
					formID: _.randId()
				});
			};
			if(!cbox.hasClass('none')){
				if(phase == '$apply' || phase == '$digest') {				
					fn();				
				} else {
					this.$apply(fn);
				}			
			}else{
				$('.composebox.none').removeClass('none');
			}			
		};

		$scope.closeView = function(){
			$('#wrapper').on('click', '.mail-closebtn', function(){
				$('.view.show').removeClass('show');
			});
		};
		$scope.closeView();
		
		$scope.next = function(){_navigate('next');};
		$scope.prev = function(){_navigate('prev');};
		
		$scope.load = function(){
			var lb = this.l;
			_params = lb;
			_pageToken = [] // clear token everytime labels loaded
			_updateNavStt('clear'); // update nav's status (disabled/ enable)
			_loadHandler(lb);
		};			
		
		$scope.view = function(elem){
			var prop = elem.thread,
				item = $('#'+prop.randID);
						
			$('.tbl .selected').removeClass('selected');
			item.addClass('selected');			
			
			Model.query('threads.get', {
				'id': prop.id,
				'unread': item.hasClass('label-unread')
			}, _view);
			
			item.removeClass('label-unread');
		};
		
		$scope.send = function(cb){
			var data = $('#'+this.c.formID).serializeArray(),
				content = '';
			if (data.length >= 3) {	
				content += 'From: ' + EMAIL + ' <' + EMAIL + '>\r\n';
				content += 'Date: ' + (new Date()).toUTCString() + '\r\n';	
				data.forEach(function (d) {
					if (d.name != 'content') {
						var name = d.name[0].toUpperCase() + d.name.slice(1, d.name.length);
						if (!!~['from', 'to'].indexOf(d.name)) {
							d.value = d.value + ' <' + d.value + '>';
						}
						content += [name, ':', d.value, '\r\n'].join('');
					} else {
						content += ['\r\n\r\n', d.value].join('');
					}
				});
				var base64EncodedEmail = (btoa(content)).replace(/\+/g, '-').replace(/\//g, '_');				
				
				Model.query('messages.send', {
					resource: {
						raw: base64EncodedEmail
					}
				},function (res) {
					if(!!~res.labelIds.indexOf('SENT') && !!res.id){
						!!cb && cb();
					}
				})
			}
		};
		
		// Define: Action Handler and config variable --------------------------------------------------------	
		var _pageToken = [];
		var _params = null;
		var _navigate = function(dir){
			var disabled = $((dir == 'next' ? '.list-next' : '.list-prev')).hasClass('disabled');				
			if(_pageToken.length && !disabled){
				(dir == 'next') && _pageToken.splice(-2); // splice -2, cuz _loadHandler will push a new token when request success
				_params.pageToken = _pageToken[_pageToken.length - 1];			
				_loadHandler(_params);					
			}			
		};
		var _updateNavStt = function(type){
			if(type == 'clear'){
				$('.list-prev, .list-next').addClass('disabled');						
			}else if(type == 'end'){
				$('.list-prev').addClass('disabled');				
			}else{			
				var n = _pageToken.length;
				if(n == 1){
					$('.list-prev').removeClass('disabled');
					$('.list-next').addClass('disabled');
				}			
				if(n > 1){
					$('.list-prev, .list-next').removeClass('disabled');						
				}								
			}
		}
		var _updatePageToken = function(token){
			_pageToken.push(token);			
			_updateNavStt(token);
		};
		
		var _loadHandler = function(lb){
			_.setLoading(true);
			_.activeLabel(lb);	

			Model.query('threads.list', {
				'maxResults': LIMIT,
				'pageToken': lb.pageToken || null,
				'q': ['in:' + lb.name + '', 'older:' + d].join(' ')				
			}, function(res){

				// save pageToken
				!!res.nextPageToken && _updatePageToken(res.nextPageToken);
				// mark when reached the last page
				!res.nextPageToken 
					&& !!res.resultSizeEstimate && _pageToken.length 
					&& res.resultSizeEstimate < LIMIT && _updatePageToken('end')
					
				if (!!res.threads) {
					var threads = res.threads;
					// using batch request, cuz `gapi.threads.list` doesn't return full resouces
					var batch = gapi.client.newBatch();
					for (var i = 0; i < threads.length; i++) {
						batch.add(gapi.client.request({
							'path': 'gmail/v1/users/me/threads/' + threads[i]['id']
						}), {'id': threads[i]['id']});
					}

					batch.execute(function (res) {
						if (!!res) {
							var data = [];
							for (var x in res) {
								if (res[x]['result']['messages'][0]) {
									var index = res[x]['result']['messages'].length - 1,
											lastest_thread = res[x]['result']['messages'][index],
											result = res[x]['result']['messages'][0];
									result['headers'] = lastest_thread['payload']['headers'];
									data.push(result);
								}
							}
							if (data.length) {							
								_buildList({'threads': data,
									'resultSizeEstimate': data.length,
									'label':lb});								
							}
						}
						_.setLoading(false);
					})

				} else {
					_buildList({'threads': [],
						'resultSizeEstimate': 0,
						'label':lb});
					_.setLoading(false);
				}			
			});		
		};
		var _buildList = function(data){
			var item = [];
			if (data.resultSizeEstimate > 0) {
				var threads = data.threads;
				for (var i = 0; i < threads.length; i++) {
					var thread = threads[i],
							headers = thread.headers,
							h = {'subject': '', 'from': '', 'to': '', 'date': ''},
							clss = thread.labelIds.map(function (e) {
								return 'label-' + e.toLowerCase()
							}).join(' ');
					if (headers) {
						for (var j = 0; j < headers.length; j++) {
							var head = headers[j],
									name = head['name'].toLowerCase();
							if (!!~Object.keys(h).indexOf(name)) {
								h[name] = head.value;
							}
						}
					}
							
					item.push({
						clss: clss,
						id: thread['id'],
						randID: _.randId(),
						from: h.from,
						subject: h['subject'],
						snippet: thread['snippet']
					});
				}
			}else{
				_.notice('You have no message :D');
			}
			
			$('#side').hasClass('show') && $('#side').removeClass('show');
			
			// update threads, title
			$scope.$apply(function() {
				$scope.threads = item;	
				$scope.title = data.label.title;
			});			
		};
		var _view = function(resp){
			var html = '';
			!!resp.error && alert(resp.message);
            if (!!resp.messages.length) {
                
                var bool = false, messlen = resp.messages.length,
                        lastID = null, lastHeader = null;
                for (var i = 0; i < resp.messages.length; i++) {
                    var parts = resp.messages[i].payload.parts,
                            body = resp.messages[i].payload.body,
                            headers = resp.messages[i].payload.headers,
                            h = {
                                'subject': '',
                                'from': '',
                                'to': '',
                                'date': ''
                            };
                    lastID = resp.messages[i].threadId;
                    lastHeader = headers;
                    // email pattern
                    var patt = /([A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum|vn)\b)/g;
                    for (var k = 0; k < headers.length; k++) {
                        var head = headers[k],
                            name = head.name.toLowerCase();
                        if (!!~Object.keys(h).indexOf(name)) {
                            h[name] = head.value.replace(/<|>/g, function (v) {
                                return {
                                    '<': '&lt;',
                                    '>': '&gt;',
                                }[v];
                            });
                            if (!!~['from', 'to'].indexOf(name)) {                            	
                                h[name] = h[name].replace(patt, '<a title="$1">$1</a>');                               
                            }
                        }
                    }

                    var date = '';
                    if (!bool) {
                        html += "<div class='mail-subject'>"
                                + h.subject
                                + "<div class='mail-date'>" + h.date + "</div></div>"
                                + "<div class='mail-address'>"
                                + "<div class='mail-from'>" + h.from + "</div>"
                                + "<div class='mail-to'>" + h.to + "</div>"
                                + "</div>";
                        bool = true;

                    // create the section
                    } else {
                        if (h.date) {
                            var d = new Date(h.date),
                                    dd = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('/'),
                                    tt = [d.getHours(), d.getMinutes()].join(':');
                            date = "<div title='" + h.from + "' class='mail-content-date'>" + [tt, dd].join(' ') + "</div>";
                        }
                    }

                    var marked = i < (messlen - 1) ? 'old' : '';

                    if (!!parts) {
                        for (var j = 0; j < parts.length; j++) {
                            var part = parts[j],
                                    mtype = part.mimeType;
                            switch (mtype) {
                                case 'multipart/alternative':
                                    if (part.parts) {
                                        part.parts.forEach(function (p) {
                                            if (p.mimeType == 'text/html') {
                                                part.body.data = p.body.data;
                                            }
                                        })
                                    }
									// no break here, reuse the below case
                                case 'text/html':
                                    html += '<div class="mail-content ' + marked + '">' + date + _.decode(part.body.data) + '</div>';
                                    break;
                            }
                        }
                    } else {
                        if (!!body.data) {
                            html += '<div class="mail-content ' + marked + '">' + date + _.decode(body.data) + '</div>';
                        }
                    }
                }
            }
			html = '<span class="mail-closebtn">×</span>' + html;			
			$scope.$apply(function(){
				$scope.viewer = html;
				$('#mailinglist .view').addClass('show')
			})            
		};		
				
	});

})(window.app);
