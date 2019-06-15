var header = document.getElementById('header');
var size = document.documentElement.clientHeight;
window.onscroll = function() {
	var count = window.pageYoffset || document.documentElement.scrollTop;
	if (count > size) {
		header.className = 'fixnav';
	} else {
		header.className = '';
	}
}