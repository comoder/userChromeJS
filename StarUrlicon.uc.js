// ==UserScript==
// @name           StarUrlicon.uc.js
// @description    Australis 收藏按钮移动到地址栏
// @homepage       https://github.com/feiruo/userchromejs/
// @author         feiruo
// @include         chrome://browser/content/browser.xul
// @charset      utf-8
// @version      1.0
// @note        参考黒仪大螃蟹的BMStar.uc.js（http://pan.baidu.com/share/link?uk=2467242534&shareid=545029）
// @note        收藏按钮移动到地址栏，左键添加书签并弹出编辑窗口，右键删除当前页面书签
// @note        仅Australis 适用
// ==/UserScript== 
(function() {
	var urlIcon = document.getElementById('urlbar-icons');
	var starbutton = document.getElementById('bookmarks-menu-button');
	if (!starbutton) return;
	urlIcon.appendChild(starbutton);
	var menupopup = starbutton.firstChild;
	var cssStr = ('\
				#bookmarks-menu-button {\
  				list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAtCAYAAABxsjF3AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjZBNDg1MTEzOUU3QjExREY4RTNGQTY4REEwRDA4Mjk4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjZBNDg1MTE0OUU3QjExREY4RTNGQTY4REEwRDA4Mjk4Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NkE0ODUxMTE5RTdCMTFERjhFM0ZBNjhEQTBEMDgyOTgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NkE0ODUxMTI5RTdCMTFERjhFM0ZBNjhEQTBEMDgyOTgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5XGR7dAAAHOUlEQVR42oxWe2xT5xU/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") !important;\
  				-moz-image-region: rect(0, 15px, 15px, 0) !important;  margin-bottom: 1px !important;\
				}\
				#bookmarks-menu-button:not([starred]):hover {-moz-image-region: rect(15px, 15px, 30px, 0) !important;}\
				#bookmarks-menu-button[starred] {-moz-image-region: rect(30px, 15px, 45px, 0) !important;}\
				#bookmarks-menu-button >toolbarbutton,\
				#bookmarks-menu-button >toolbarbutton .toolbarbutton-icon{\
				-moz-appearance:none!important;\
				border:none!important;\
				box-shadow:none!important;\
				background:none!important;\
				margin:0!important;\
				}\
				#bookmarks-menu-button > dropmarker > image{\
				list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABASURBVDhPY6AKCI7P+g/CUC6cTwhDlVPBgIEH6E5CdiY+DFU+GgYggC6ArAgfhiofDADdScjOxIehygc0DBgYAC8oyiFzn8OSAAAAAElFTkSuQmCC") !important;\
				-moz-image-region: rect(0px, 16px, 16px, 0px) !important;\
				}\
				');
	var style = document.createProcessingInstruction('xml-stylesheet', 'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(cssStr) + '"');
	document.insertBefore(style, document.documentElement);

	starbutton.addEventListener("click", function(e) {
		if (e.button == 0) {
			PlacesCommandHook.bookmarkCurrentPage(true);
		}
		if (e.button == 2) {
			var uri = gBrowser.selectedBrowser.currentURI;
			var itemId = PlacesUtils.getMostRecentBookmarkForURI(uri);
			var navBookmarksService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
			navBookmarksService.removeItem(itemId);
		}
		e.preventDefault();
		e.stopPropagation()
	}, false);
})();