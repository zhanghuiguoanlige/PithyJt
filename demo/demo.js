/*!
demo
*/
;(function(){

	function __initlize(){
		document.getElementById('nav-list').innerHTML = 
		'<a href="../index.html">在线测试工具</a> '+
		'<a href="index.html">基本示例</a> '+
		'<a href="htmlhelper.html">PjtHtmlhelper</a> '+
		'<a href="extends.html">PjtExtends</a>';
	}
	
	on(window, 'load', __initlize);
})();