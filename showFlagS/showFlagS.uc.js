// ==UserScript==
// @name 			showFlagS.uc.js
// @description		显示国旗与IP
// @author			ywzhaiqi、feiruo
// @compatibility	Firefox 16
// @charset			UTF-8
// @include			chrome://browser/content/browser.xul
// @id 				[FE89584D]
// @startup         window.showFlagS.init();
// @shutdown        window.showFlagS.onDestroy(true);
// @optionsURL		about:config?filter=showFlagS.
// @reviewURL		http://bbs.kafan.cn/thread-1666483-1-1.html
// @homepageURL		https://github.com/feiruo/userChromeJS/tree/master/showFlagS
// @note            Begin 2013-12-16
// @note            左键点击复制，中间刷新，右键弹出菜单
// @note            支持菜单和脚本设置重载
// @note            需要 _showFlagS.js 配置文件
// @version         1.6.0 		2014.08.07 17:00	ReBuilding。
// @version         1.6.0 		ReBuild。
// @version         1.5.8.3.4 	将存入perfs的选项移至脚本内，便于配置文件的理解,其他修复。
// @version         1.5.8.3.3 	修复因临时删除文件导致的错误。
// @version         1.5.8.3.2 	identity-box时错误页面智能隐藏，已查询到便显示，每查询到便隐藏。
// @version         1.5.8.3.1 	配置文件增加图标高度设置，identity-box时错误页面自动隐藏。
// @version         1.5.8.3 	修复图标切换错误的问题。
// @version         1.5.8.2 	修复FlagFox图标下，找不到图标就消失的问题，其他修改。
// @version         1.5.8.1 	配置文件加入一个图标大小的参数。
// @version         1.5.8 		修复菜单重复创建的BUG，查询源外置;可以丢弃旧版lib（不推荐）。
// @version         1.5.7		修改菜单和图标的创建方式，避免各种不显示，不弹出问题。
// @version         1.5.6 		将脚本设置也移到配置文件中，配置文件可以设置TIP显示条目，改变数据库文件等。
// @version         1.5.5 		增加flagfox扩展国旗图标库，相对路径profile\chrome\lib\isLocalFlags下，直接存放图标,支持实时切换。
// @version         1.5 		增体加右键菜单外部配置，配置方式和anoBtn一样，具请参考配置文件。
// @version         1.4 		增加几个详细信息；服务器没给出的就不显示。
// @version         1.3 		增加淘宝查询源，修复不显示图标，刷新、切换查询源时可能出现的图标提示消失等BUG
// @version         1.2.1 		修复identity-box时page-proxy-favicon的问题
// @version         1.2 		位置为identity-box时自动隐藏page-proxy-favicon，https显示
// @version         1.1 		设置延迟，增加本地文件图标。
// ==/UserScript==

/**
 * 参考 Show Location 扩展、Flagfox 扩展、http://files.cnblogs.com/ziyunfei/showFlag.uc.js
 */
location == "chrome://browser/content/browser.xul" && (function() {
	if (window.showFlagS) {
		window.showFlagS.onDestroy();
		delete window.showFlagS;
	}
	var showFlagS = {
		debug: true,
		configFile: "lib\\_showFlagS.js", // 菜单配置文件，相对路径： profile\chrome\lib\_showFlagS.js
		libIconPath: "lib\\countryflags.js", // 旧版国旗图标库
		isFirstRun: true,
		sMyInfo: false,
		apiSite: null,
		siteQueue: null,
		siteApi: null,
		siteThx: null,
		MyInfoThx: null,
		dnsCache: [],
		isReqHash: [],
		isReqHash_tooltip: [],
		showFlagHash: [],
		showFlagTooltipHash: [],
		//等待时国旗图标
		DEFAULT_Flag: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACG0lEQVQ4ja2TwW7aQBRF+ZDku0q/qChds5mxkDG2iY3H9jyTBFAWLAgRG7CwCawQi6BEQhgEFkiAuF3VaVXaSlWvdBazuGfx5r1c7n/H9/1rIvpCAUWS5E6S3FFAkU9+wff967+VP1FA6fPzMwaDAcbjMQaDAabTKSggEFEqpcxfLEvp5huNxnmxWGC73SIMQ9Tv6gjqAbrdLqT0Ub+rg4jOUro/S4QQV57nbZMkwel0wvF4xGazQafTgeu5GY1GA8PhEMITqRDiKhM4jnPTbrdxOBxwOByQJAlcz4UQ4heiKILruXAc52smsGzrpd/v4/X1FcPhEBQQ7Jp9kVarhdlsBsu2Xj4E1u3x/v4eRATLuv0tQT3AdDrFcrmEZd2eMoFZNXdm1cSP2DUbZtUEEYECglk1MRqNkKYp3t/fYZjGPhPohh7rhg7d0PH09IQ4jjGbzdBsNtHr9SBcAd3QMZlMMJ/PEYYhdEOPM0G5Ur7RKhoeHx+xWq2wXq+xXq/x9vaGVqsFraJBq2jQDT17l8vljyFyzq9UVd2qqoooirBarTLCMIRds6GqKgzTgOPUoKpqyjn/+MZcLpdTFCVfKpXOlm1huVwiSRIkSYLFYgGzauLh4QHNZhNaRTsrinJ5GxljeUVRUil99Ho9dLtduJ4LKX0QERRFSTnnny+Wv6dYLF4zxgqMsZhzvuec7xljMWOsUCwW/3xM/5JvTakQArDW8fcAAAAASUVORK5CYII=",
		get dns() {
			return Cc["@mozilla.org/network/dns-service;1"]
				.getService(Components.interfaces.nsIDNSService);
		},
		get eventqueue() {
			return Cc["@mozilla.org/thread-manager;1"].getService().mainThread;
		},
		get contentDoc() {
			return window.content.document;
		},
	};

	showFlagS.init = function() {
		this.makePopup();
		this.reload();
		this.onLocationChange();
		if (this.isFirstRun) {
			this.importLib(this.libIconPath);
			this.isFirstRun = !this.isFirstRun;
			window.addEventListener("unload", function() {
				showFlagS.onDestroy();
			}, false);
		}
		showFlagS.progressListener = {
			onLocationChange: function() {
				showFlagS.onLocationChange();
			},
			onProgressChange: function() {},
			onSecurityChange: function() {},
			onStateChange: function() {},
			onStatusChange: function() {}
		};
		window.getBrowser().addProgressListener(showFlagS.progressListener);
	};

	showFlagS.uninit = function() {
		this.removeMenu(this.Menus);
		$("showFlagS-popup").parentNode.removeChild($("showFlagS-popup"));
		if (this.Perfs.showLocationPos == "identity-box")
			$("page-proxy-favicon").style.visibility = "";
	};

	showFlagS.onDestroy = function(isAlert) {
		if (isAlert) this.uninit();
		window.getBrowser().removeProgressListener(showFlagS.progressListener);
	};

	showFlagS.makePopup = function() {
		let xml = '\
				<menupopup id="showFlagS-popup">\
				<menuitem label="复制信息" id="showFlagS-copy" oncommand="showFlagS.command(\'Copy\');" />\
				<menuitem label="刷新信息" id="showFlagS-reload" oncommand="showFlagS.onLocationChange(true);"/>\
				<menu label="脚本设置" id="showFlagS-set-config" class="showFlagS menu-iconic" image="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAABlElEQVQ4jaXUSWtUQRQF4M9hYTuEuDAmGl0Yp0QkcQBFRFEXQhB3ATf+gKziwrU/wr8RcK04EY04JuBSQXQRhziEhEDAdDe6qKqkuuiHAQsOvHte3Vv3nlPvwRLqaKCZofEP/jOGxKCJb5jJ8BW/2/BfYs4sjokVv+MS9mU4gze4XPCn8BE/UoFmPG2/1rULkzhc8F14167AwWJjbywwUPDdeL+WDnoqOthRdtCIwTCOZLiIaVwt+PP4lBeoC2q/xpMML7EgCJnzLwTrW1yYxdnYdsJxvIon5vwgPrTT4EAxa3Khv+C7qkT8bxf6io09eIpDBd/WhZ8YEW5ZwhW8xbWCHxau9Jyg04oLz/EQjyKeYV5QPecfC+LeT90lF05ie4aBmHw6xp3Zu050YEOuQenCbqsurENNxVqLCxtxC6PYWVWgdKFbq403BL2m4vNerE8a/MJ1XMgwEjeni3RU+G8sYgK3cQ7+RNSxnKEeE9LXuAl3cQfbsBVb4B4eVGAce7KxxnCz1KCGzRWopTnj6seJPPkvhrmYqehLVdcAAAAASUVORK5CYII=">\
				<menupopup  id="showFlagS-set-popup">\
					<menuseparator id="showFlagS-sepalator1"/>\
					<menuitem label="查询本地信息" id="showFlagS-set-MyInfo" tooltiptext="会加大开销" onclick="showFlagS.setPerfs(\'MyInfo\')"/>\
					<menuitem label="脚本菜单配置" id="showFlagS-set-setMenu" tooltiptext="左键：重载配置|右键：编辑配置" onclick="if(event.button == 0){showFlagS.reload(true);}else if (event.button == 2) {showFlagS.command(\'Edit\');}" class="showFlagS menuitem-iconic" image="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABYElEQVQ4jY3TO0/VQRAF8F9yTUB6QMCCZ6KJBq4JNIQKCkoopAWMsabhC1ho5SOYaO2j0AQ+gYKPS/BeaDD0kPhJLP7nbzZA0ElOsjvnzOzOziyX2yjO8Ds4i++/bRgdzAUdjFwVMIkNDASP8QuDwXF8Nb+RGHAdb3GC72jhIxZxLViMbx/fon2XWKv4inHcx6OaQH8A3eFWot3DmmT8jImipF48y21aeI6+gp9IzA+Ywmu0k7mBF9jBDKaxjZfhxqN9k1hULepgLI90gHvFic34BqJtR6tM0D6XYKrgJ/FT1ZFa+3cu7mALR6mtkf2n3KKZ9auihMPs79aPuIvbxYn9SbIfbOFGwd/CF1XbPVC1ZARL2XdFOIihrLuwjuVod/EQevBeNXmt1P8BC6ohamA+moNojqPpqa/UxCZuBk8iKkf5abihaMsuXbBh1UvPBm3/+EznbRSnqm9c49Lv/AcsoU6W+qo3pgAAAABJRU5ErkJggg=="/>\
				</menupopup>\
				</menu>\
				<menuseparator id="showFlagS-sepalator2"/>\
				</menupopup>\
				';
		let range = document.createRange();
		range.selectNodeContents(document.getElementById("mainPopupSet"));
		range.collapse(false);
		range.insertNode(range.createContextualFragment(xml.replace(/\n|\t/g, "")));
		range.detach();
	};

	showFlagS.reload = function(isAlert) {
		var aFile = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIDirectoryService).QueryInterface(Ci.nsIProperties).get('UChrm', Ci.nsILocalFile);
		aFile.appendRelativePath(this.configFile);
		if (!aFile.exists() || !aFile.isFile()) return null;
		var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
		var sstream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
		fstream.init(aFile, -1, 0, 0);
		sstream.init(fstream);
		var data = sstream.read(sstream.available());
		try {
			data = decodeURIComponent(escape(data));
		} catch (e) {}
		sstream.close();
		fstream.close();
		if (!data) return;
		var sandbox = new Cu.Sandbox(new XPCNativeWrapper(window));
		sandbox.Components = Components;
		sandbox.Cc = Cc;
		sandbox.Ci = Ci;
		sandbox.Cr = Cr;
		sandbox.Cu = Cu;
		sandbox.Services = Services;
		sandbox.locale = Services.prefs.getCharPref("general.useragent.locale");
		try {
			Cu.evalInSandbox(data, sandbox, "1.8");
		} catch (e) {
			this.alert('Error: ' + e + '\n请重新检查配置文件');
			return;
		}

		this.removeMenu(this.Menus);

		this.Perfs = sandbox.Perfs;
		this.Menus = sandbox.Menus;
		this.ServerInfo = sandbox.ServerInfo;
		this.SourceAPI = sandbox.SourceAPI;
		this.MyInfo = sandbox.MyInfo;

		this.Perfs.showLocationPos = sandbox.Perfs.showLocationPos ? sandbox.Perfs.showLocationPos : 'identity-box';
		this.Perfs.Inquiry_Delay = sandbox.Perfs.Inquiry_Delay ? sandbox.Perfs.Inquiry_Delay : 3500;
		this.LocalFlags = sandbox.Perfs.LocalFlags ? sandbox.Perfs.LocalFlags : "/lib/LocalFlags/";
		this.BAK_FLAG_PATH = sandbox.Perfs.BAK_FLAG_PATH ? sandbox.Perfs.BAK_FLAG_PATH : 'http://www.razerzone.com/asset/images/icons/flags/';
		this.DEFAULT_Flag = sandbox.Perfs.DEFAULT_Flag ? sandbox.Perfs.DEFAULT_Flag : this.DEFAULT_Flag;

		this.getPrefs();
		this.buildSiteMenu(this.SourceAPI);
		this.addIcon(this.Perfs);
		this.buildFreedomMenu(this.Menus);
		this.setPerfs();
		if (isAlert) this.alert('配置已经重新载入');
	};

	showFlagS.removeMenu = function(menu) {
		try {
			for (i in menu) {
				$("main-menubar").insertBefore($(menu[i].id), $("main-menubar").childNodes[7]);
			}
		} catch (e) {}

		let sites = document.querySelectorAll("menuitem[id^='showFlagS-apiSite-']");
		for (let i = 0; i < sites.length; i++) {
			sites[i].parentNode.removeChild(sites[i]);
		}

		let menuitems = document.querySelectorAll("menuitem[id^='showFlagS-item-']");
		let menus = document.querySelectorAll("menu[id^='showFlagS-menu-']");

		if (!menuitems || !menus) return;
		for (let i = 0; i < menuitems.length; i++) {
			menuitems[i].parentNode.removeChild(menuitems[i]);
		}
		for (let i = 0; i < menus.length; i++) {
			menus[i].parentNode.removeChild(menus[i]);
		}
		try {
			$("showFlagS-icon").parentNode.removeChild($("showFlagS-icon"));
		} catch (e) {}
	};

	showFlagS.getPrefs = function() {
		this._prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("userChromeJS.showFlagS.");
		this._prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);

		if (!this._prefs.prefHasUserValue("SourceSite") || this._prefs.getPrefType("SourceSite") != Ci.nsIPrefBranch.PREF_STRING)
			this._prefs.setCharPref("SourceSite", (this.SourceAPI ? (this.SourceAPI[0] ? this.SourceAPI[0].id : "taobao") : "taobao"));

		if (!this._prefs.prefHasUserValue("MyInfo") || this._prefs.getPrefType("MyInfo") != Ci.nsIPrefBranch.PREF_BOOL)
			this._prefs.setBoolPref("MyInfo", this.sMyInfo);

		this.sMyInfo = this._prefs.getBoolPref("MyInfo");
		this.apiSite = this._prefs.getCharPref("SourceSite");
	};

	showFlagS.setPerfs = function(tyep, val) {
		if (tyep == "apiSite") {
			this.apiSite = val;
			this._prefs.setCharPref("SourceSite", this.apiSite);
			$("showFlagS-apiSite-" + this.apiSite).setAttribute('checked', true);
		}
		if (tyep == "MyInfo") {
			this.sMyInfo = !this.sMyInfo;
			this._prefs.setBoolPref("MyInfo", this.sMyInfo);
			$("showFlagS-set-MyInfo").setAttribute('checked', this.sMyInfo);
		}
		for (var i = 0; i < this.SourceAPI.length; i++) {
			if (this.SourceAPI[i].id == this.apiSite) {
				this.siteQueue = i;
				this.siteApi = this.SourceAPI[i].inquireAPI;
			}
		}
		this.onLocationChange(true);
	};

	/*****************************************************************************************/
	showFlagS.onLocationChange = function(forceRefresh) {
		if (forceRefresh) {
			this.forceRefresh = true;
		}
		try {
			var aLocation = this.contentDoc.location;
			if (this.Perfs.showLocationPos == 'identity-box') {
				if ((aLocation.protocol !== "about:") && (aLocation.protocol !== "chrome:"))
					$('page-proxy-favicon').style.visibility = 'collapse';
				else
					$('page-proxy-favicon').style.visibility = 'visible';
				this.icon.hidden = ((aLocation.protocol == "about:") || (aLocation.protocol == "chrome:"));
			}
			if (aLocation && /file/.test(aLocation.protocol)) {
				this.icon.src = this.icon.image = this.Perfs.File_Flag;
				this.icon.tooltipText = '本地文件' + "\n" + aLocation;
				return;
			}
			if (aLocation && /data/.test(aLocation.protocol)) {
				this.icon.src = this.icon.image = this.Perfs.File_Flag;
				this.icon.tooltipText = 'Base64编码文件';
				return;
			}
			if (aLocation && aLocation.host && /tp/.test(aLocation.protocol)) {
				this.updateState(aLocation);
				return;
			}
			this.resetState();

		} catch (e) {
			this.resetState();
		}
	};

	showFlagS.updateState = function(aLocation) {
		var host = aLocation.host;
		if (!this.forceRefresh && this.dnsCache[host]) {
			this.lookupIP(this.dnsCache[host], host);
			return;
		}
		if (aLocation.hostname == "127.0.0.1" || aLocation.hostname == "localhost") {
			var obj = {};
			showFlagS.serverInfoTip(function(inifo) {
				obj.ServerInfo = inifo;
				obj.SiteInfo = '回送地址:本机服务器';
				showFlagS.updateTooltipText("127.0.0.1", host, obj);
			});
			showFlagS.icon.src = showFlagS.icon.image = showFlagS.Perfs.LocahHost_Flag;
			showFlagS.icon.hidden = false;
			if (showFlagS.Perfs.showLocationPos == 'identity-box') {
				if (aLocation.protocol !== 'https:')
					$('page-proxy-favicon').style.visibility = 'collapse';
				else
					$('page-proxy-favicon').style.visibility = 'visible';
			}
			return;
		}
		var dns_listener = {
			onLookupComplete: function(request, nsrecord, status) {
				var s_ip;
				if (status != 0 || !nsrecord.hasMore())
					s_ip = "0";
				else
					s_ip = nsrecord.getNextAddrAsString();
				showFlagS.dnsCache[host] = s_ip;
				showFlagS.lookupIP(s_ip, host);
			}
		};
		try {
			this.dns.asyncResolve(host, 0, dns_listener, this.eventqueue);
		} catch (e) {}

		this.resetState();
	};

	showFlagS.resetState = function() {
		this.icon.src = this.icon.image = this.DEFAULT_Flag;
		this.icon.tooltipText = '';
		if (this.Perfs.showLocationPos == 'identity-box') {
			this.icon.hidden = true;
			$('page-proxy-favicon').style.visibility = 'visible';
		}
	};

	showFlagS.lookupIP = function(ip, host) {
		var self = showFlagS;
		if (ip == "0") {
			self.resetState();
			return;
		}
		if (/^192.168.|169.254./.test(ip) || ip == "127.0.0.1" || ip == "::1") {
			var src;
			if (/^192.168.|169.254./.test(ip))
				src = self.Perfs.LAN_Flag;
			else
				src = self.Perfs.LocahHost_Flag;
			self.icon.src = self.icon.image = src;
			self.icon.hidden = false;
			if (self.Perfs.showLocationPos == 'identity-box') {
				if (self.contentDoc.location.protocol !== 'https:')
					$('page-proxy-favicon').style.visibility = 'collapse';
				else
					$('page-proxy-favicon').style.visibility = 'visible';
			}
		}

		function flagFunc(checkCache, ip, host) {

			if (/^192.168.|169.254./.test(ip) || ip == "127.0.0.1" || ip == "::1") return;
			if (checkCache && self.showFlagHash[host]) {
				self.updateIcon(host, self.showFlagHash[host]);
				return;
			}
			if (checkCache && self.isReqHash[host]) return;
			self.isReqHash[host] = true;
			if (self.apiSite == 'taobao')
				return;
			else
				self.lookupIP_taobao(ip, host);
		}

		function tooltipFunc(checkCache, ip, host) {
			if (checkCache && self.showFlagTooltipHash[host]) {
				self.updateTooltipText(ip, host, self.showFlagTooltipHash[host]);
				return;
			}
			if (checkCache && self.isReqHash_tooltip[host]) return;
			self.isReqHash_tooltip[host] = true;
			var obj = {};
			self.serverInfoTip(function(info) {
				obj.ServerInfo = info;
				if (/^192.168.|169.254./.test(ip) || ip == "127.0.0.1" || ip == "::1") {
					if (/^192.168.|169.254./.test(ip))
						obj.SiteInfo = '本地局域网服务器';
					else
						obj.SiteInfo = '回送地址：本机[服务器或Hosts修改]';
					self.showFlagTooltipHash[host] = obj;
					self.updateTooltipText(ip, host, self.showFlagTooltipHash[host]);
					return;
				}
				if (self.MyInfo && self.sMyInfo)
					self.lookup_Myinfo(self.MyInfo.inquireAPI, host, function(myinfo, myInfoThx) {
						obj.MyInfo = myinfo;
						if (myInfoThx)
							obj.MyInfoThx = myInfoThx;
						self.showFlagTooltipHash[host] = obj;
						if (self.apiSite == 'taobao')
							self.lookupIP_taobao(ip, host);
						else {
							if (self.Thx(self.siteApi) !== self.Thx(self.MyInfo.inquireAPI))
								self.lookupIP_Info(ip, host, self.siteApi, self.siteQueue);
							else
								setTimeout(function() {
									self.lookupIP_Info(ip, host, self.siteApi, self.siteQueue);
								}, 500);
						}
					});
				else {
					self.showFlagTooltipHash[host] = obj;
					if (self.apiSite == 'taobao')
						self.lookupIP_taobao(ip, host);
					else {
						if (self.Thx(self.siteApi) !== self.Thx(self.MyInfo.inquireAPI))
							self.lookupIP_Info(ip, host, self.siteApi, self.siteQueue);
						else
							setTimeout(function() {
								self.lookupIP_Info(ip, host, self.siteApi, self.siteQueue);
							}, 500);
					}
				}
			});
		}
		flagFunc(!self.forceRefresh, ip, host);
		tooltipFunc(!self.forceRefresh, ip, host);
		self.forceRefresh = false;
	};

	showFlagS.updateIcon = function(host, countryCode, countryName) {
		if (host == this.contentDoc.location.host) {
			this.icon.hidden = false;
			var src;
			if (countryCode === 'iana') {
				src = this.Perfs.Unknown_Flag;
			} else {
				src = window.CountryFlags ? (this.getFlagFoxIconPath(countryCode) || CountryFlags[countryCode]) : this.getFlagFoxIconPath(countryCode);
				if (!src && window.CountryFlags && countryName) {
					contryCode = window.CountryNames && CountryNames[countryName];
					if (contryCode in CountryFlags) {
						src = CountryFlags[contryCode];
						this.showFlagHash[host] = contryCode;
					}
				}
				src = src || (this.BAK_FLAG_PATH + countryCode + ".gif") || this.Perfs.Unknown_Flag;

				if (this.Perfs.showLocationPos == 'identity-box') {
					if (this.contentDoc.location.protocol !== 'https:')
						$('page-proxy-favicon').style.visibility = 'collapse';
					else
						$('page-proxy-favicon').style.visibility = 'visible';
					if (!src) this.icon.hidden = true;
				}
			}
			this.icon.src = this.icon.image = src;

		}
	};

	showFlagS.updateTooltipText = function(ip, host, obj) {
		if (host != this.contentDoc.location.host) return;

		var tooltipArr = [];
		obj || (obj = {});
		if (this.showFlagHash[host])
			obj.FlagThx = this.Thx('http://ip.taobao.com/service/getIpInfo.php?ip=')

		tooltipArr.push("域名：" + host);
		tooltipArr.push("网站IP：" + ip);

		if (obj.ServerInfo !== "")
			tooltipArr.push(obj.ServerInfo);

		if (obj.SiteInfo)
			tooltipArr.push(obj.SiteInfo);

		if (this.MyInfo && this.sMyInfo && obj.MyInfo && obj.MyInfo !== "查询失败") {
			tooltipArr.push("--------------------------------");
			tooltipArr.push(obj.MyInfo);
		}

		var thx = [];
		if (obj.SiteInfoThx)
			thx.push(obj.SiteInfoThx)
		if (obj.MyInfoThx && obj.MyInfoThx !== obj.SiteInfoThx)
			thx.push(obj.MyInfoThx)
		if (obj.FlagThx && obj.FlagThx !== obj.SiteInfoThx)
			thx.push(obj.FlagThx)
		if (thx.join('\n') !== "") {
			tooltipArr.push("--------------------------------");
			tooltipArr.push('感谢：' + new String(thx));
		}

		this.icon.tooltipText = tooltipArr.join('\n');
	};

	showFlagS.lookup_Myinfo = function(api, host, callback) {
		var self = showFlagS;
		var myinfo;
		var req = new XMLHttpRequest();
		req.open("GET", api, true);
		req.send(null);
		var onerror = function() {
			myinfo = "查询失败";
			callback(myinfo);
		};
		req.onerror = onerror;
		req.timeout = self.Perfs.Inquiry_Delay;
		req.ontimeout = onerror;
		req.onload = function() {
			if (req.status == 200) {
				myinfo = self.MyInfo.regulation(req.responseText);
				if (myinfo) {
					var myInfoThx = self.Thx(api);
					callback(myinfo, myInfoThx);
				} else {
					onerror();
				}
			} else {
				onerror();
			}
		};
	};

	showFlagS.lookupIP_Info = function(ip, host, api, i) {
		var req = new XMLHttpRequest();
		req.open("GET", api + ip, true);
		req.send(null);
		var self = showFlagS;
		var onerror = function() {
			self.lookupIP_taobao(ip, host, "other");
		};
		req.onerror = onerror;
		req.timeout = self.Perfs.Inquiry_Delay;
		req.ontimeout = onerror;
		req.onload = function() {
			if (req.status == 200) {
				var info = self.SourceAPI[i].regulation(req.responseText);
				if (info) {
					self.showFlagTooltipHash[host].SiteInfo = info;
					self.showFlagTooltipHash[host].SiteInfoThx = self.Thx(api);
					self.updateTooltipText(ip, host, self.showFlagTooltipHash[host]);
				} else {
					onerror();
				}
			} else {
				onerror();
			}
		};
	};

	showFlagS.lookupIP_taobao = function(ip, host, other) {
		var self = showFlagS;
		var api = 'http://ip.taobao.com/service/getIpInfo.php?ip=';
		var req = new XMLHttpRequest();
		req.open("GET", api + ip, true);
		req.send(null);
		var onerror = function() {
			self.icon.src = self.Perfs.Unknown_Flag;
			if (other || self.apiSite == 'taobao')
				self.icon.tooltipText = '无法查询，请刷新！';
		};
		req.onerror = onerror;
		req.timeout = self.Perfs.Inquiry_Delay;
		req.ontimeout = onerror;
		req.onload = function() {
			if (req.status == 200) {
				var responseObj = JSON.parse(req.responseText);
				if (responseObj.code == 0) {
					var country_id = responseObj.data.country_id.toLocaleLowerCase();
					var addr = responseObj.data.country + responseObj.data.area;
					if (responseObj.data.region || responseObj.data.city || responseObj.data.county || responseObj.data.isp)
						addr = addr + '\n' + responseObj.data.region + responseObj.data.city + responseObj.data.county + responseObj.data.isp;
					if (other || self.apiSite == 'taobao') {
						self.showFlagTooltipHash[host].SiteInfo = addr;
						self.showFlagTooltipHash[host].SiteInfoThx = self.Thx(api);
						self.updateTooltipText(ip, host, self.showFlagTooltipHash[host]);
					}
					self.showFlagHash[host] = country_id;
					self.updateIcon(host, country_id, responseObj.data.country);
				} else {
					onerror();
				}
			}
		};
	};

	showFlagS.serverInfoTip = function(callback) {
		var sTip = [];
		for (var i = 0; i < this.ServerInfo.length; i++) {
			var tip = this.getServInformation(this.ServerInfo[i].words);
			if (this.ServerInfo[i].regx) tip = this.ServerInfo[i].regx(tip);

			if (tip !== '未知类型')
				sTip.push(this.ServerInfo[i].label + tip);
		}
		callback(sTip.join('\n'));
	};

	showFlagS.getServInformation = function(words) {
		var word;
		try {
			word = gBrowser.mCurrentBrowser.webNavigation.currentDocumentChannel.QueryInterface(Ci.nsIHttpChannel).getResponseHeader(words).split("\n", 1)[0];
		} catch (e) {}
		return word || '未知类型';
	};

	showFlagS.getFlagFoxIconPath = function(filename) {
		var localFlagPath = (this.LocalFlags + filename + ".png").replace(/\//g, '\\');
		var fullPath = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties)
			.get("UChrm", Ci.nsILocalFile).path;
		if (/^(\\)/.test(localFlagPath)) {
			fullPath = fullPath + localFlagPath;
		} else {
			fullPath = fullPath + "\\" + localFlagPath;
		}
		var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
		file.initWithPath(fullPath);
		if (file.exists()) {
			return "file:///" + fullPath;
		}
	};

	showFlagS.Thx = function(api) {
		var Service = Cc["@mozilla.org/network/effective-tld-service;1"].getService(Ci.nsIEffectiveTLDService);
		var uri = makeURI(api);
		var thx = Service.getBaseDomain(uri).replace(Service.getPublicSuffix(uri), "").replace('.', "");
		return thx;
	};

	/*****************************************************************************************/
	showFlagS.command = function(type, url, arg0, arg1, arg2, arg3, arg4) {
		if (type == "Post")
			this.postData(url, arg0, arg1);
		else if (type == "Action")
			this.openAction(url, arg0, arg1, arg2, arg3, arg4);
		else if (type == "Copy")
			this.copy(url);
		else if (type == "Edit")
			this.editFile(url);
		else
			this.openTab(type, url, arg0, arg1, arg2, arg3, arg4);
	};

	showFlagS.copy = function(str) {
		str || (str = this.icon.tooltipText)
		Cc['@mozilla.org/widget/clipboardhelper;1'].createInstance(Ci.nsIClipboardHelper)
			.copyString(str);
	};

	showFlagS.openTab = function(url, urlt, arg0, arg1, arg2, arg3, arg4) {
		if (url)
			url = this.readOpenArg(url);
		else
			return;
		if (urlt = this.readOpenArg(urlt))
			url += urlt;

		if (arg0 = this.readOpenArg(arg0))
			url += arg0;

		if (arg1 = this.readOpenArg(arg1))
			url += arg1;

		if (arg2 = this.readOpenArg(arg2))
			url += arg2;

		if (arg3 = this.readOpenArg(arg3))
			url += arg3;

		if (arg4 = this.readOpenArg(arg4))
			url += arg4;

		gBrowser.selectedTab = gBrowser.addTab(url);
	};

	showFlagS.postData = function(aURI, aPostData) {

		var stringStream = Cc["@mozilla.org/io/string-input-stream;1"].
		createInstance(Ci.nsIStringInputStream);
		if ("data" in stringStream)
			stringStream.data = aPostData;
		else
			stringStream.setData(aPostData, aPostData.length);

		var postData = Cc["@mozilla.org/network/mime-input-stream;1"].
		createInstance(Ci.nsIMIMEInputStream);
		postData.addHeader("Content-Type", "application/x-www-form-urlencoded");
		postData.addContentLength = true;
		postData.setData(stringStream);

		gBrowser.loadOneTab(aURI, null, null, postData, false);
	};

	showFlagS.openAction = function(url, fId, val, bId, bClass) {
		var wrap = {
			try: function(js) {
				return "try{" + js + "}catch(e){}";
			},
			delay: function(js) {
				return wrap.try("content.window.setTimeout(function(){" + wrap.try(js) + "},100);");
			},
			doOnLoad: function(js) {
				return wrap.try("let onLoad = function(){" +
					"removeEventListener('load',onLoad,true);" +
					wrap.try(js) +
					"};" +
					"addEventListener('load',onLoad,true);");
			},
			quotes: function(str) {
				return "\"" + str + "\"";
			},
			getElement: function(id) {
				const selector = "form #" + id;
				return "content.window.document.querySelector(" + wrap.quotes(selector) + ")";
			},
			getElementC: function(id) {
				const selector = "form ." + id;
				return "content.window.document.querySelector(" + wrap.quotes(selector) + ")";
			}
		};

		function openURL(url) {
			var browser = window.getBrowser();
			try {
				window.TreeStyleTabService.readyToOpenChildTab(browser.selectedTab);
			} catch (e) {}
			var newTab = browser.addTab(url, {
				ownerTab: browser.selectedTab,
				relatedToCurrent: true
			});
			browser.selectedTab = newTab;
			return browser.getBrowserForTab(newTab);
		}

		var contentScript = wrap.getElement(fId) + ".value = " + wrap.quotes(this.readOpenArg(val)) + ";";
		if (bId)
			contentScript += wrap.delay(wrap.getElement(bId) + ".click();")
		else if (bClass)
			contentScript += wrap.delay(wrap.getElementC(bClass) + ".click();")
		contentScript = "data:text/javascript," + encodeURIComponent(wrap.doOnLoad(contentScript));

		var targetBrowser = openURL(url);
		targetBrowser.messageManager.loadFrameScript(contentScript, false);
	};

	showFlagS.readOpenArg = function(str) {
		var uri = this.contentDoc.location,
			ip = this.dnsCache[uri.host];

		if (str == 'host')
			str = uri.host;

		if (str == 'ip' && ip)
			str = ip;

		if (str == "basedomain") {
			var eTLDService = Components.classes["@mozilla.org/network/effective-tld-service;1"].
			getService(Components.interfaces.nsIEffectiveTLDService);
			var basedomain = eTLDService.getBaseDomain(makeURI(uri.href));
			str = basedomain;
		}

		if (str == 'url')
			str = uri.href;

		return str;
	};

	showFlagS.editFile = function(file) {
		var file = file || this.configFile;
		var aFile = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIDirectoryService).QueryInterface(Ci.nsIProperties).get('UChrm', Ci.nsILocalFile);
		aFile.appendRelativePath(file);
		if (!aFile || !aFile.exists() || !aFile.isFile()) return;
		var editor;
		try {
			editor = Services.prefs.getComplexValue("view_source.editor.path", Ci.nsILocalFile);
		} catch (e) {
			this.alert("请设置编辑器的路径。\nview_source.editor.path");
			toOpenWindowByType('pref:pref', 'about:config?filter=view_source.editor.path');
			return;
		}
		var UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
		UI.charset = window.navigator.platform.toLowerCase().indexOf("win") >= 0 ? "gbk" : "UTF-8";
		var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);

		try {
			var path = UI.ConvertFromUnicode(aFile.path);
			var args = [path];
			process.init(editor);
			process.run(false, args, args.length);
		} catch (e) {
			this.alert("编辑器不正确！")
		}
	};

	/*****************************************************************************************/
	showFlagS.addIcon = function(iconPref) {
		if (iconPref.showLocationPos == 'identity-box' || iconPref.showLocationPos == 'urlbar-icons') {
			this.icon = $(iconPref.showLocationPos).appendChild($C('image', {
				id: 'showFlagS-icon',
				context: 'showFlagS-popup'
			}));
		} else {
			this.icon = $(iconPref.showLocationPos).appendChild($C("toolbarbutton", {
				id: "showFlagS-icon",
				class: "toolbarbutton-1 chromeclass-toolbar-additional", //statusbarpanel-iconic
				removable: true,
				context: "showFlagS-popup",
			}));
		}

		if (iconPref.showLocationPos == "identity-box") {
			this.icon.style.marginLeft = "4px";
			this.icon.style.marginRight = "2px";
		}

		this.icon.src = this.icon.image = this.DEFAULT_Flag;

		this.icon.addEventListener("click", function(event) {
			if (event.button == 0) {
				showFlagS.command('Copy');
			} else if (event.button == 1) {
				showFlagS.onLocationChange(true);
			}
		}, false);

		//$("showFlagS-popup").setAttribute('position', iconPref.iconMenuPosition);
		$("showFlagS-set-MyInfo").setAttribute('checked', this.sMyInfo);
		$("showFlagS-apiSite-" + this.apiSite).setAttribute('checked', true);
	};

	showFlagS.buildSiteMenu = function(siteSource) {
		var menu = $("showFlagS-set-popup");
		var separator = $("showFlagS-sepalator1");
		var defmenuitem = menu.appendChild($C("menuitem", {
			label: "淘宝 查询源",
			id: "showFlagS-apiSite-taobao",
			class: "showFlagS-apiSite-item",
			type: "radio",
			oncommand: "showFlagS.setPerfs('apiSite','taobao');"
		}));
		menu.insertBefore(defmenuitem, separator);

		for (var i = 0; i < siteSource.length; i++) {
			var menuitem = menu.appendChild($C("menuitem", {
				label: siteSource[i].label,
				id: "showFlagS-apiSite-" + siteSource[i].id,
				class: "showFlagS-apiSite-item",
				type: "radio",
				oncommand: "showFlagS.setPerfs('apiSite','" + siteSource[i].id + "');"
			}));
			menu.insertBefore(menuitem, defmenuitem);
		};
	};

	showFlagS.buildFreedomMenu = function(menu) {
		var popup = $("showFlagS-popup");
		var obj, menuitem;
		for (var i = 0; i < menu.length; i++) {
			obj = menu[i];
			menuitem = $(obj.id);
			if (menuitem) {
				for (let [key, val] in Iterator(obj)) {
					if (typeof val == "function") obj[key] = val = "(" + val.toSource() + ").call(this, event);";
					menuitem.setAttribute(key, val);
				}
				menuitem.classList.add("showFlagS");
				menuitem.classList.add("menu-iconic");
			} else {
				menuitem = obj.child ? this.newMenu(obj, i) : this.newMenuitem(obj, i);
			}
			popup.appendChild(menuitem);
		}
	};

	showFlagS.newMenu = function(menuObj, i) {
		var menu = document.createElement("menu");
		var popup = menu.appendChild(document.createElement("menupopup"));
		for (let [key, val] in Iterator(menuObj)) {
			if (key === "child") continue;
			if (typeof val == "function") menuObj[key] = val = "(" + val.toSource() + ").call(this, event);"
			menu.setAttribute(key, val);
			menu.setAttribute("id", "showFlagS-menu-" + i);
		}

		menuObj.child.forEach(function(obj) {
			popup.appendChild(this.newMenuitem(obj));
		}, this);
		let cls = menu.classList;
		cls.add("showFlagS");
		cls.add("menu-iconic");
		return menu;
	};

	showFlagS.newMenuitem = function(obj, i) {
		var menuitem;
		if (obj.label === "separator" || (!obj.label && !obj.text && !obj.oncommand && !obj.command))
			menuitem = document.createElement("menuseparator");
		else
			menuitem = document.createElement("menuitem");

		for (let [key, val] in Iterator(obj)) {
			if (typeof val == "function") obj[key] = val = "(" + val.toSource() + ").call(this, event);";
			menuitem.setAttribute(key, val);
			menuitem.setAttribute("id", "showFlagS-item-" + i);
		}
		var cls = menuitem.classList;
		cls.add("showFlagS");
		cls.add("menuitem-iconic");

		if (obj.oncommand || obj.command) return menuitem;

		if (obj.exec) {
			obj.exec = this.handleRelativePath(obj.exec);
		}

		menuitem.setAttribute("oncommand", "showFlagS.onCommand(event);");
		this.setIcon(menuitem, obj);
		return menuitem;
	};

	showFlagS.setIcon = function(menu, obj) {
		if (menu.hasAttribute("src") || menu.hasAttribute("image") || menu.hasAttribute("icon")) return;

		if (obj.exec) {
			var aFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
			try {
				aFile.initWithPath(obj.exec);
			} catch (e) {
				return;
			}
			if (!aFile.exists()) {
				menu.setAttribute("disabled", "true");
			} else {
				let fileURL = Services.io.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler).getURLSpecFromFile(aFile);
				menu.setAttribute("image", "moz-icon://" + fileURL + "?size=16");
			}
			return;
		}
	};

	showFlagS.onCommand = function(event) {
		var menuitem = event.target;
		var text = menuitem.getAttribute("text") || "";
		var exec = menuitem.getAttribute("exec") || "";
		if (exec) this.exec(exec, this.convertText(text));
	};

	showFlagS.exec = function(path, arg) {
		var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
		var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
		try {
			var a = (typeof arg == 'string' || arg instanceof String) ? arg.split(/\s+/) : [arg];
			file.initWithPath(path);

			if (!file.exists()) {
				Cu.reportError('File Not Found: ' + path);
				return;
			}

			if (file.isExecutable()) {
				process.init(file);
				process.run(false, a, a.length);
			} else {
				file.launch();
			}

		} catch (e) {}
	};

	showFlagS.convertText = function(text) {
		text = text.toLocaleLowerCase().replace("%u", content.location.href);
		return text;
	};

	showFlagS.handleRelativePath = function(path) {
		if (path) {
			path = path.replace(/\//g, '\\').toLocaleLowerCase();
			var profD = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get("ProfD", Ci.nsILocalFile);
			if (/^(\\)/.test(path)) {
				if (path.startsWith('\\..\\')) {
					return profD.parent.path + path.replace('\\..', '');
				}
				return profD.path + path;
			} else {
				return path;
			}
		}
	};

	/*****************************************************************************************/
	showFlagS.alert = function(aString, aTitle) {
		Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService).showAlertNotification("", aTitle || "showFlagS", aString, false, "", null);
	};

	showFlagS.importLib = function(localFlagPath) {
		localFlagPath = localFlagPath.replace(/\//g, '\\');
		var fullPath = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties)
			.get("UChrm", Ci.nsILocalFile).path;
		if (/^(\\)/.test(localFlagPath)) {
			fullPath = fullPath + localFlagPath;
		} else {
			fullPath = fullPath + "\\" + localFlagPath;
		}

		var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
		file.initWithPath(fullPath);
		if (file.exists()) {
			userChrome.import(localFlagPath, "UChrm");
		}
	};

	function log(str) {
		if (showFlagS.debug) Application.console.log("[showFlagS] " + Array.slice(arguments));
	}

	function $(id) document.getElementById(id);

	function $C(name, attr) {
		var el = document.createElement(name);
		if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
		return el;
	}

	showFlagS.init();
	window.showFlagS = showFlagS;
})()