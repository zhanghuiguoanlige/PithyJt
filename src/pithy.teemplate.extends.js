/*!
pithy.teemplate.js
teemplate, not template
javascript template parse engine;
by anlige @ 2017-07-23
*/

;(function(_pjt){
	if(!_pjt){
		throw 'Exception: Pjt is not found!';
	}
	var empty_chars = {'\t' : true, ' ' : true};
	
	var push = Array.prototype.push;
	
	var chr = '';

	
	//map something
	var token_chars = '0123456789qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM_-/';
	var token_chars_map = {};

	for(var i=0; i< token_chars.length; i++){
		chr = token_chars.substr(i, 1);
		token_chars_map[chr] = true;
	}
	
	var TOKEN = {
		LAYOUT : 'layout',
		EXTENDS : 'extends',
		SECTION : 'section',
		ENDSECTION : 'endsection',
		VIEW : 'view',
		LINE : 'line',
		COMMENT : 'comment'
	};
	function next_token(_token, words){
		var token = '',
			chr = '',
			start = _token.start,
			end = _token.end;
		
		while(start < end){
			chr = words[start];
			if(empty_chars[chr] && token == ''){
				start++;
				continue;
			}
			if(!token_chars_map[chr]){
				break;
			}
			token += words[start];
			start++;
		}
		switch(token){
			case 'layout' :
			case 'extends' :
			case 'view' :
			case 'section' :
			case 'endsection' :
				_token.start = start;
				_token.type = token;
				break;
		}
	}
	function token(start, end, words){
		var chr = words[start];
		var _token = {
			start : start,
			end : end,
			type : '',
			html_tag : ''
		};
		if(chr == '@'){
			if(start + 1 == end){
				throw 'syntax error \'' + words.slice(start, end).join('') + '\'';
			}
			_token.start++;
			if(words[_token.start] == '*'){
				_token.start++;
				_token.type = TOKEN.COMMENT;
				return _token;
			};
			
			next_token(_token, words);
			if(_token.type == ''){
				_token.type = TOKEN.LINE;
				_token.start = start;
			}
		}else{
			_token.type = TOKEN.LINE;
		}
		return _token;
	}

	/*
	* @description	__view
	* @param	name	: view name
	* @param	clone	: is clone?
	*/
	function __view(name, clone){
		this.sections = {};
		this.name = name;
		this.layout = '';
		this.is_view = true;
		this.is_clone = clone === true;
		(clone !== true) && (__LAYOUTS__[name] = this);
	}

	__view.prototype.push = function(contents){
		this.sections[contents.name] = contents;
	};
	
	__view.prototype.compile = function(){
		var _layout = __LAYOUTS__[this.layout];
		if(!_layout){
			throw 'can not find layout or view \'' + this.layout + '\'';
		}
		if(_layout.is_view){
			return _layout.extend(this).compile();
		}
		return _layout.compile(this);
	};

	__view.prototype.extend = function(view){
		if(view.is_clone){
			view.name = this.name;
			view.layout = this.layout;
			var sections = this.sections;
			for(var name in sections){
				if(!sections.hasOwnProperty(name) || view.sections.hasOwnProperty(name)){
					continue;
				}
				view.push(sections[name]);
			}
			return view;
		}
		var __clone = new __view(this.name, true);
		__clone.layout = this.layout;

		var sections = this.sections;
		for(var name in sections){
			if(!sections.hasOwnProperty(name)){
				continue;
			}
			__clone.push(sections[name]);
		}
		sections = view.sections;
		for(var name in sections){
			if(!sections.hasOwnProperty(name)){
				continue;
			}
			__clone.push(sections[name]);
		}
		return __clone;
	};


	var __LAYOUTS__ = {};
	/*
	* @description	__layout
	* @param	name	: layout name
	*/
	function __layout(name){
		this.name = name;
		this.layout = [];
		this.is_layout = true;
		__LAYOUTS__[name] = this;
	}
	
	__layout.prototype.push = function(contents){
		this.layout.push(contents);
	};

	__layout.prototype.compile = function(view){
		var layout = this.layout;
		var sections = (view && view.is_view) ? view.sections : null;
		var result = [],
			length = layout.length,
			item;
		for(var i = 0; i < length; i++){
			item = layout[i];
			if(item.is_section){
				push.apply(result, (sections && sections[item.name]) ? sections[item.name].lines : item.lines);
				continue;
			}
			result.push(item);
		}
		return _pjt.compile(result.join('\n'));
	};

	/*
	* @description	__section
	* @param	name	: section name
	*/
	function __section(name){
		this.name = name;
		this.lines = [];
		this.is_section = true;
	}
	
	__section.prototype.push = function(line){
		this.lines.push(line);
	};

	function parse_view(line){
		var parts = line.split(/\s+/);
		var length = parts.length;
		var result = [];
		for(var i = 0; i < length; i++){
			if(!parts[i]){
				continue;
			}
			result.push(parts[i]);
		}
		if(result.length != 3 || result[1] != 'extends'){
			throw 'command \'view\' error, sub command \'extends\' is missing ?';
		}
		return result;
	}
	var __CACHE__ = {};

	function __initlize(){
		
	}
	
	__initlize.layout = function(name){
		return __LAYOUTS__[name];
	};
	__initlize.render = function(layout, data, callback){
		var codes = __initlize.compile(layout);
		var result = _pjt.render(codes, data);
		
		var type = typeof callback;
		if(type == 'function'){
			callback(result, layout, data);
			return;
		}
		if(type == 'string'){
			var ele = document.getElementById(callback);
			if(ele){
				ele.innerHTML = result;
			}
			return;
		}
		return result;
	};
	__initlize.compile = function(name){
		if(__CACHE__.hasOwnProperty(name)){
			return __CACHE__[name];
		}
		var layout = __LAYOUTS__[name];
		if(!layout){
			return '';
		}
		return __CACHE__[name] = layout.compile();
	};
	__initlize.compileas = function(content){
		
		var __LINE__ =  0;

		content = content.replace(/^([\r\n]+)/, '');
		
		
		function exception(e, start, fullline){
			return 'Exception : ' + e + '\nLine: ' + __LINE__ + '\nCode: ' + fullline;
		}
		var _container = null;
		var _section = null;
		_pjt.scanline(content, function(start, end, words, line_num, emptys){
			__LINE__ = line_num;
			var _token = null;
			var fullline = content.slice(start, end);
			try{
				_token = token(start, end, words);
			}catch(e){
				throw exception(e, start, fullline);
			}
			var linetext = content.slice(_token.start, _token.end);
			switch(_token.type){
				case TOKEN.COMMENT:
					break;
				case TOKEN.LAYOUT:
					_container = new __layout(linetext.replace(/\s/g, ''));
					break;
				case TOKEN.VIEW:
					var names = parse_view(linetext);
					if(names[2] == names[0]){
						throw exception('view can not extend itself', _token.start, fullline);
					}
					_container = new __view(names[0]);
					_container.layout = names[2];
					break;
				case TOKEN.SECTION:
					if(_section != null){
						throw exception('command \'@endsection\' is missing', _token.start, fullline);
					}
					if(_container != null){
						_section = new __section(linetext.replace(/\s/g, ''));
						break;
					}
				case TOKEN.ENDSECTION:
					if(_container != null){
						_container.push(_section);
						_section = null;
						break;
					}
				case TOKEN.LINE: 
					if(_container == null){
						throw exception('first line must be \'@layout\' or \'@extends\' command', _token.start, fullline);
					}
					if(_section != null){
						_section.push(linetext);
						break;
					}
					if(_container.is_view){
						throw exception('only command \'@section\' can be in view', _token.start, fullline);
					}
					_container.push(linetext);
			}
			
		});
		if(_section != null){
			throw exception('command \'@endsection\' is missing');
		}
		return _container;
	};

	
	window.PjtExtends = __initlize;
	if(typeof module != 'undefined' && module){
		module.exports = __initlize;
		return;
	}
	return __initlize;
})(window.Pjt);