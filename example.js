Ractive.components['example'] = Ractive.extend({
	template: `
		<nav class="tabs" style="width:50%;">
			<a class-active="view == 'result'" href="#result" on-click="set('view', 'result')">Result</a>
			<a class-active="view == 'template'" href="#template" on-click="set('view', 'template')">Template</a>
			<a class-active="view == 'script'" href="#script" on-click="set('view', 'script')">Script</a>
			<a class-active="view == 'headers'" href="#headers" on-click="set('view', 'headers')">Headers</a>
		</nav>
		<div style="border: 5px solid #92bd54; height:310px;">
			{{#if view == 'result'}}
				<iframe style="width:100%;height:100%"></iframe>
			{{elseif view == 'template'}}
				<ace value="{{template}}"></ace>
			{{elseif view == 'script'}}
				<ace value="{{script}}" mode="javascript"></ace>
			{{elseif view == 'headers'}}
				<ace value="{{headers}}"></ace>
			{{/if}}
		</div>
	`,
	attributes: {
		required: ['url']
	},
	data: {
		view: 'result',
		script: '',
		template: '',
		headers: ''
	},
	observe: {
		url: function(newUrl) {
			var self = this;
			self.set({
				headers: '',
				template: '',
				script: ''
			})
			
			if(!newUrl)
				return;
			
			$.ajax({
				url: newUrl, // let's load itself in the example!
				dataType: 'text', // otherwise fails to parse as invalid HTML
				success: function(html) {
					console.log(html)
					function extract(pattern) {
						var matches = pattern.exec(html)
						if( !matches )
							return ''
						else
							return matches[1].replace(/^\t\t?/gm, '')
					}
					self.set({
						headers: extract(/<head>([^]+?)<\/head>/),
						template: extract(/<script +id=.template.*?>([^]+?)<\/script>/),
						script: extract(/<script>([^]+?)<\/script>/)
					})
				},
				error: function(xhr,msg) {
					console.warn(msg)
				}
			});
		},
		view: function(value) {
			if( value != 'result' )
				return;
			
			var html = '<!DOCTYPE html>\n<html><head>' + this.get('headers') + '\n</head>\n<body>\n'
			html += '\t<div id="target"></div>\n'
			html += '\t<' + 'script id="template" type="ractive">' + this.get('template') + '\n\t<' + '/script>\n'
			html += '\t<' + 'script>' + this.get('script') + '\n\t<' + '/script>\n'
			html += '</body></html>'
			
			var self = this;
			window.setTimeout(function() {
				var iframe = self.find('iframe')
				iframe = iframe.contentWindow || ( iframe.contentDocument.document || iframe.contentDocument);
				iframe.document.open();
				iframe.document.write(html);
				iframe.document.close();
			}, 100)
		}
	}
});