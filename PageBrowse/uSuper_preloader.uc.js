// ==UserScript==
// @name             uSuper_preloader.uc.js
// @author           ywzhaiqi
// @namespace        https://github.com/ywzhaiqi
// @include          main
// @charset          UTF-8
// @description      基於 NLF 的 Super_preloader 2.0.22，增加對 noscript 的支持，精簡代碼等。
// ==/UserScript==

(function (){

// super_preloader.db 存放的位置，相對路徑，Chrome 目錄下
var DB_FILE_NAME = "Local\\uSuper_preloader.db.js";

// 1 按鈕, 2 菜單, 0 無
// 按鈕ID: uSuper_preloader-icon
// 菜單ID: uSuper_preloader-menuitem, 可用 rebulid_userChrome 移動統一管理
var append_type = 1;

var APPEND_BUTTON = 1;
var APPEND_MENU_ITEM = 2;
var APPEND_NONE = 0;

var AUTO_START = true;
var DEBUG = false;
var BUTTON_IMG_ENABLE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABVklEQVQ4jZWTzUoCURTHz6t0UkcyiUgdcvyYmgEDadGihRsXLSSjDypyHiFkWsxAQoJtkgpauDEybDFQUcH4AC2jlT2CFJ0WNXHndoX8w29x7vndAwfuBfiJbvTyeqV3rRluXzd6JEIz3L5WcTtze64CbNTth/353ScaBXXn0QAAgPTGbV7duqeR2bz7UNedGGTKzlVmzSEePiInXXbOQSl131KlG2IZFt5TSt1XmF3pEI8XRPzFq3kX5GKbeNgB7Dlfy8U2QbzQIh5RRF680CKYWb4gEaKIPJheOqNhsPt7K/EOTC2eEA8R/am9AbwLk7lGP7pwTCzDgog+L5prPENEr19G9DrxiC4jos+Z0I6aEM7YSSlb+wyrNeJh3wEi+vvZw4GkWBIAAASTdiWUst5DKZv+hWINgoq96vuRmKjGAgnzdFw2XwLyAYn47pnNsVhV8u59Afs2ShHG9IUdAAAAAElFTkSuQmCC";
var BUTTON_IMG_DISABLE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABT0lEQVQ4jZWTz0sCURDH5295Fy/rzYO226EfoCAodczO1tVLHaJrKbjgJoWIddBCkkgIdVuQtgw7mFiB7UpepJP9CVI0Xdx4Tk/IL3wO8+bzBgbeAxjHst6Ctt2/tuz+0O71UcS4p3e7PRn4tDuv++2OhbPR3QYAgJvGU/D2/gVnxWw8f5lmxwNVo1WrGo9IoRE5FaNVhNJl86NUfkCeaaHeebn5Diend0hxwhj7xampC+lsHSn8AP6c1ulsHSGe0pEiisiLp3SE3b0rFCGKyIPYzgVOg9/fWYk6EI0VkYKIf2pnAHVhLZofRjbyyDMtjDEkbg9CkVwlvH6MFNFlxtiEE4rkCrAYPpxbWsl8L69mkMK/A8YY7Y8WQkcuAADw+rUtn1/79AUO8D94A9rI69c2J36kJCc8bkU9k5TkwD2voghJSQ4kWS245ITLufcDB6uwLE1qxtEAAAAASUVORK5CYII=";


if(window.uSuper_preloader){
    window.uSuper_preloader.uninit();
    window.uSuper_preloader = null;
}

let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");


var ns = window.uSuper_preloader = {
    icon: null,
    db: null,
    get prefs() {
        delete this.prefs;
        return this.prefs = Services.prefs.getBranch("uSuper_preloader.");
    },
    get DB_File() {
        var aFile = Services.dirsvc.get('UChrm', Ci.nsILocalFile);
        aFile.appendRelativePath(DB_FILE_NAME);
        return aFile;
    },
    get AUTO_START() AUTO_START,
    set AUTO_START(bool) {
        let m = $("uSuper_preloader-AUTOSTART");
        if (m) m.setAttribute("checked", AUTO_START = !!bool);
        updateIcon();
        return bool;
    },
    get DEBUG() DEBUG,
    set DEBUG(bool) {
        let m = $("uSuper_preloader-DEBUG");
        if (m) m.setAttribute("checked", DEBUG = !!bool);
        return bool;
    },

    init: function(){

        this.load_DB();

        if(!this.db)
            return alerts("uSuper_preloader.db.js", "數據文件有錯誤");

        // 設置初始時間
        this.isModified();

        gBrowser.mPanelContainer.addEventListener('DOMContentLoaded', this, true);

        if(append_type != APPEND_NONE){
            // addon-bar, nav-bar, urlbar-icons
            this.addIconOrMenuitem('urlbar-icons');

            window.addEventListener('unload', this, false);

            ["AUTO_START", "DEBUG"].forEach(function(name) {
                try {
                    ns[name] = ns.prefs.getBoolPref(name);
                } catch (e) {}
            }, ns);
        }
    },
    uninit: function(){
        gBrowser.mPanelContainer.removeEventListener('DOMContentLoaded', this, true);

        if(append_type != APPEND_NONE){
            window.removeEventListener('unload', this, false);

            ["AUTO_START", "DEBUG"].forEach(function(name) {
                try {
                    ns.prefs.setBoolPref(name, ns[name]);
                } catch (e) {}
            }, ns);
        }

        var ids = ["uSuper_preloader-icon", "uSuper_preloader-popup", "uSuper_preloader-menuitem"];
        for (let [, id] in Iterator(ids)) {
            let e = document.getElementById(id);
            if (e) e.parentNode.removeChild(e);
        }
    },
    handleEvent: function(event){
        switch(event.type){
            case "DOMContentLoaded":
                if (this.AUTO_START){
                    var win = event.target.defaultView;
                    win.setTimeout(function(){
                        ns.launch(win);
                    }, 500)
                }
                break;
            case "unload":
                this.uninit(event);
                break;
        }
    },
    addIconOrMenuitem: function(appendBarId){
        if(append_type == APPEND_NONE){
            return;
        }else if(append_type == APPEND_BUTTON){
            ns.icon = $(appendBarId).appendChild($C("toolbarbutton", {
                id: "uSuper_preloader-icon",
                class: "toolbarbutton-1",
                type: "context",
                onclick: "if (event.button != 2) uSuper_preloader.iconClick(event);",
                context: "uSuper_preloader-popup",
                image: BUTTON_IMG_ENABLE
            }));
        }else if(append_type == APPEND_MENU_ITEM){
            let ins = $("webDeveloperMenu");
            let menuitem = $C("menuitem", {
                id: "uSuper_preloader-menuitem",
                label: "uSuper_preloader 開關",
                class: "menuitem-iconic",
                image: BUTTON_IMG_ENABLE
            });
            menuitem.addEventListener("click", function(event){
                if(event.button == 0){
                    uSuper_preloader.iconClick(event);
                }else if(event.button == 2){
                    event.preventDefault();
                    $("uSuper_preloader-popup").openPopup(
                        menuitem, "after_start", -1, -1, false, false);
                }
            }, false);

            ns.icon = ins.parentNode.insertBefore(menuitem, ins);
        }

        var xml = '\
            <menupopup id="uSuper_preloader-popup"\
                       position="after_start"\
                       onpopupshowing="if (this.triggerNode) this.triggerNode.setAttribute(\'open\', \'true\');"\
                       onpopuphiding="if (this.triggerNode) this.triggerNode.removeAttribute(\'open\');">\
                <menuitem label="啟用自動翻頁"\
                          id="uSuper_preloader-AUTOSTART"\
                          type="checkbox"\
                          autoCheck="true"\
                          checked="'+ AUTO_START +'"\
                          oncommand="uSuper_preloader.toggle(event);"/>\
                <menuitem label="調試模式"\
                          id="uSuper_preloader-DEBUG"\
                          type="checkbox"\
                          autoCheck="false"\
                          checked="'+ DEBUG +'"\
                          oncommand="uSuper_preloader.DEBUG = !uSuper_preloader.DEBUG;"/>\
                <menuseparator/>\
                <menuitem label="在線搜索翻頁規則"\
                          id="uSuper_preloader-search"\
                          oncommand="uSuper_preloader.search()"/>\
                <menuitem label="輔助定制翻頁規則"\
                          image="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADAklEQVRYhdVX643iMBCOIOAlIW/nZZGA7TwWQhSogBJSAiVQQkqgBEqgNJcw9+OSuyzHRrC7t6cb6ZOimc8zn2RnPJak/9kYY8Z+vxf7/V78EwFlWR52ux3sdjsoy/LwLwTUVVVBVVVQlmX97QK2221TliWUZQnb7bb56wUZY0ZRFMfNZnMtikIURQE3EG3syBgzvrR4nuen9XotNpsNPIL1ei3yPD99SfEsyy6vr6/QIc9zkef5Oc/zuuerW5/oc7Msu3yqeJqmlyzLIMsySNNUJEnyZq+7WN+XJEmTpqnorfuYCMbYKUkSSJIEOOeCUlrdcrr4rZ9SWnHORRdnjD23HYwxg1IqOOfAGLtbXJIkiXMOnPM/BHQiGGOCcw6UUvHUwVytVkdKKVBKYbVavfuLdZyBPE0vz/FhAcvl8rpcLmG5XA622ZbzroCWI1re9WEBURSJOI4hiqLzEC+OY4jjeFBAFEXnNtfwnREEwYEQUhNCmsViAYvFAgghgy224w1xCCF1L19DCKmDIPh9d1iWZRBCBCEEnkUQBE0QBM1H1hJCxC8BYRiKMAzhWXie13ie13xkbRiGb7cEY3zwfb/2PK/xfR983wfP8xqM8eE9dLwhzm0+3/drjPHw9Y0xFq7rAsZ48BC6rguu6w6eAYzxuc31+ODiOM7VcRywbXtwkeM44DjOoADbtkXLe/w3NE3zaNs22LYNpmm+24g6zkCeppfn8UZkWZZhGIYwTRMMwxCqqt5txaZpgmmadwWoqlr1c1iW9dyMoOv6Sdd1aHFXRBe/V1zXddFb/7HZQNO0i6ZpoGkazOdzoShKcxMHTdPeCFAUpZnP56KLaZr2uZlAUZSLqqrQg1BV9awoSt352u9zG4Oe/3PFO0MInWazmZjNZvAgBELoa0aynhmTyeSIELoihMTLywv0gRASCKHrZDI5SpL0tUPpPZNluZlOpzCdTkGW5b8/lt/aeDyuZVkGWZZhPB5//8NEkqTDaDSC0WgEkiR9/9NM+rnPosX/aT8Akr9qqnAmHOsAAAAASUVORK5CYII="\
                          oncommand="siteinfo_writer.show()"/>\
                <menuitem label="編輯uSuper_preloader.db.js"\
                          id="uSuper_preloader-edit"\
                          oncommand="uSuper_preloader.edit()"/>\
            </menupopup>\
        ';
        var range = document.createRange();
        range.selectNodeContents($('mainPopupSet'));
        range.collapse(false);
        range.insertNode(range.createContextualFragment(xml.replace(/\n|\t/g, '')));
        range.detach();
    },
    iconClick: function(event){
        if (!event || !event.button) {
            ns.toggle();
        }
    },
    toggle: function() {
        if (ns.AUTO_START) {
            ns.AUTO_START = false;
        } else {
            ns.AUTO_START = true;
            if(!content.uSuper_preloader){
                ns.launch(content);
            }else{
                if(content.uSuper_preloader.scroll)
                    content.uSuper_preloader.scroll();
            }
        }
        updateIcon();
    },
    load_DB: function(isAlert){
        var data = loadText(this.DB_File);
        if (!data) return false;
        var sandbox = new Cu.Sandbox( new XPCNativeWrapper(window) );

        // 如果是原版，去除部分內容
        data = data.replace("(function(){", "")
            .replace(/瀏覽器檢測\.開始\.[\s\S]+\.瀏覽器檢測\.結束/, "")
            .replace(/function xToString\(x\)\{\/\/任何轉字符串[\s\S]+/, "");

        try {
            Cu.evalInSandbox(data, sandbox, '1.8');
        } catch (e) {
            alerts('uSuper_preloader.db 有錯誤', e);
            return log('load error.', e);
        }

        this.db = sandbox.superPreloader;

        //轉成正則.
        this.db.prePageKey = this.pageKeyToRE('previous', this.db.prePageKey, this.db);
        this.db.nextPageKey = this.pageKeyToRE('next', this.db.nextPageKey, this.db);

        if (isAlert)
            alerts('uSuper_preloader.db', '載入成功');
        return true;
    },
    _isModified_lastcheck: 0,
    _modified: 0,
    isModified: function() {
        let aFile = this.DB_File;
        if(!aFile.exists() || !aFile.isFile()){
            return false;
        }

        let now = Date.now();
        if (now - this._isModified_lastcheck < 1000) {
            return false;
        }
        this._isModified_lastcheck = now;

        let lmt = aFile.lastModifiedTime;
        if (this._modified != lmt) {
            this._modified = lmt;

            return true;
        }

        return false;
    },
    launch: function(win){
        if(!win) return;

        var doc = win.document;
        var locationHref = win.location.href;

        if (locationHref.indexOf('http') !== 0)
            return;

        if (!/html|xml/i.test(doc.contentType) ||
            doc.body instanceof HTMLFrameSetElement ||
            doc.querySelector('meta[http-equiv="refresh"]'))
            return;

        if(win.name == "MyNovelReader" || doc.body.getAttribute("name") == 'MyNovelReader')
            return;

        // 監測文件是否更新
        if(this.isModified()){
            this.load_DB(true);
        }

        var timer = 0;
        if(/\bgoogle\.com(\.hk)?$/.test(win.location.host)){
            timer = 1000;
            // TODO： 運行2次，有錯誤
            // win.addEventListener("hashchange", function(event) {
            //     win.setTimeout(function(){
            //         win.console.log("Hashchanged", win.location.href);
            //         new Super_preloader(win, win.document, ns.db);
            //     }, timer);
            // }, false);
        }

        win.setTimeout(function(){
            new Super_preloader(win, win.document, ns.db);
        }, timer);
    },
    edit: function () {
        //var file = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties).get("WinD", Components.interfaces.nsILocalFile);file.append("notepad.exe");
        var editor = gPrefService.getCharPref("view_source.editor.path");
        var appfile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);appfile.initWithPath(editor);
        var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
        process.init(appfile);
        process.run(false, [Services.dirsvc.get("UChrm", Ci.nsILocalFile).path + "\\Local\\uSuper_preloader.db.js"], 1);
    },
    search: function(){
        // 如果焦點在 開發工具，則得到的地址錯誤
        // var focusedWindow = ns.getFocusedWindow();
        var focusedWindow = content;

        var keyword = encodeURIComponent(focusedWindow.location.href);
        // openLinkIn('http://ap.teesoft.info/?exp=0&url=' + keyword, 'tab', {});
        gBrowser.selectedTab = gBrowser.addTab('http://ap.teesoft.info/?exp=0&url=' + keyword);
    },
    pageKeyToRE: function(name, pageKey, db) {
        var pageKeyLength = pageKey.length;

        function strMTE(str) {
            return (str.replace(/\\/g, '\\\\')
                    .replace(/\+/g, '\\+')
                    .replace(/\./g, '\\.')
                    .replace(/\?/g, '\\?')
                    .replace(/\{/g, '\\{')
                    .replace(/\}/g, '\\}')
                    .replace(/\[/g, '\\[')
                    .replace(/\]/g, '\\]')
                    .replace(/\^/g, '\\^')
                    .replace(/\$/g, '\\$')
                    .replace(/\*/g, '\\*')
                    .replace(/\(/g, '\\(')
                    .replace(/\)/g, '\\)')
                    .replace(/\|/g, '\\|')
                    .replace(/\//g, '\\/'));
        }

        var pfwordl = db.autoMatch.pfwordl,
            sfwordl = db.autoMatch.sfwordl;

        var RE_enable_a = pfwordl[name].enable,
            RE_maxPrefix = pfwordl[name].maxPrefix,
            RE_character_a = pfwordl[name].character,
            RE_enable_b = sfwordl[name].enable,
            RE_maxSubfix = sfwordl[name].maxSubfix,
            RE_character_b = sfwordl[name].character;
        var plwords,
            slwords,
            rep;

        plwords = RE_maxPrefix > 0 ? ('[' + (RE_enable_a ? strMTE(RE_character_a.join('')) : '.') + ']{0,' + RE_maxPrefix + '}') : '';
        plwords = '^\\s*' + plwords;
        //alert(plwords);
        slwords = RE_maxSubfix > 0 ? ('[' + (RE_enable_b ? strMTE(RE_character_b.join('')) : '.') + ']{0,' + RE_maxSubfix + '}') : '';
        slwords = slwords + '\\s*$';
        //alert(slwords);
        rep = db.prefs.cases ? '' : 'i';

        for (var i = 0; i < pageKeyLength; i++) {
            pageKey[i] = new RegExp(plwords + strMTE(pageKey[i]) + slwords, rep);
            //alert(pageKey[i]);
        };
        return pageKey;
    },
    getFocusedWindow: function() {
        var win = document.commandDispatcher.focusedWindow;
        return (!win || win == window) ? content : win;
    },
};

function Super_preloader(window, document, db){
    this.init.apply(this, arguments);
}
Super_preloader.prototype = {

    init: function(window, document, db){
        this.win = window;
        this.doc = document;
        this.db = db;

        this.run(window, document, db);

        //修正一些網站的自動翻頁..
        this.siteFixd();
    },
    run: function(window, document, db){
        var self = this;

        //引用console對象的部分函數.
        var C = {};
        if(DEBUG){
            C.log = window.console.log;
            C.err = window.console.error;
        }else{
            C.log = function(){};
            C.err = function(){};
        }

        //如果是取出下一頁使用的iframe window
        if (window.name == 'superpreloader-iframe') {
            window.scroll(window.scrollX, 99999);  //滾動到底部,針對,某些使用滾動事件加載圖片的網站.
            window.parent.postMessage('superpreloader-iframe:DOMLoaded', '*');
            C.log("iframe 加載下一頁", window.location.href);
            return;
        }

        var startTime = new Date();

        //從db取出數據.
        var prefs = db.prefs,
            sep_icons = db.sep_icons,
            FWKG_color = db.FWKG_color,
            blackList = db.blackList,
            DIExclude = db.DIExclude,
            SITEINFO_D = db.SITEINFO_D,
            SITEINFO = db.SITEINFO,
            SITEINFO_TP = db.SITEINFO_TP,
            SITEINFO_comp = db.SITEINFO_comp,
            autoMatch = db.autoMatch,
            prePageKey = db.prePageKey,
            nextPageKey = db.nextPageKey;
        ///////////
        // db = null;

        var nullFn = function() {}; //空函數.
        var url = document.location.href.replace(/#.*$/, ''); //url 去掉hash
        var cplink = url; //翻上來的最近的頁面的url;
        var domain = document.domain; //取得域名.
        var domain_port = url.match(/https?:\/\/([^\/]+)/)[1]; //端口和域名,用來驗證是否跨域.


        //重要的變量兩枚.
        var nextlink;
        var prelink;
        //===============


        //初始化..
        C.log('----------------------------------------------------');


        //懸浮窗
        var floatWO = {
            updateColor: nullFn,
            loadedIcon: nullFn,
            CmodeIcon: nullFn,
            style: null,
            div: null
        };

        function floatWindow() {
            floatWO.style = self.addStyle(self.floatWindowStyle);

            var div = document.createElement('div');
            div.id = 'sp-fw-container';
            div.innerHTML = self.floatWindowInnerHTML;
            document.body.appendChild(div);
            floatWO = div;

            //id獲取元素
            function $(id) {
                return document.getElementById(id);
            }

            var rect = $('sp-fw-rect'); //懸浮窗的小正方形,用顏色描述當前的狀態.
            var spanel = $('sp-fw-content'); //設置面板.

            var spanelc = {
                show: function() {
                    spanel.style.display = 'block';
                },
                hide: function() {
                    spanel.style.display = 'none';
                },
            };
            var rectt1, rectt2;
            //設置面板顯隱
            rect.addEventListener('mouseover', function(e) {
                rectt1 = window.setTimeout(spanelc.show, 100);
            }, false);
            rect.addEventListener('mouseout', function(e) {
                window.clearTimeout(rectt1);
            }, false);

            div.addEventListener('mouseover', function(e) {
                // C.log('over:',e.target);
                window.clearTimeout(rectt2);
            }, false);

            div.addEventListener('mouseout', function(e) {
                //C.log('out:',e.target);
                if (e.relatedTarget && e.relatedTarget.disabled) return; //for firefox and chrome
                rectt2 = window.setTimeout(spanelc.hide, 288);
            }, false);

            var dot = $('sp-fw-dot'); //載入完成後,顯示的小點
            dot.style.backgroundColor = FWKG_color.dot;

            var cur_mode = $('sp-fw-cur-mode'); //當載入狀態時,用來描述當前是翻頁模式,還是預讀模式.
            cur_mode.style.backgroundColor = SSS.a_enable ? FWKG_color.autopager : FWKG_color.prefetcher

            var a_enable = $('sp-fw-a_enable'); //啟用翻頁模式
            var autopager_field = $('sp-fw-autopager-field'); //翻頁設置區域

            //預讀設置
            var useiframe = $('sp-fw-useiframe');
            var viewcontent = $('sp-fw-viewcontent');

            //翻頁設置
            var a_useiframe = $('sp-fw-a_useiframe');
            var a_iloaded = $('sp-fw-a_iloaded');
            var a_itimeout = $('sp-fw-a_itimeout');
            var a_manualA = $('sp-fw-a_manualA');
            var a_remain = $('sp-fw-a_remain');
            var a_maxpage = $('sp-fw-a_maxpage');
            var a_separator = $('sp-fw-a_separator');
            var a_ipages_0 = $('sp-fw-a_ipages_0');
            var a_ipages_1 = $('sp-fw-a_ipages_1');
            var a_force = $('sp-fw-a_force');

            var a_starti = $('sp-fw-a_starti'); //開始立即翻頁
            a_starti.addEventListener('click', function() {
                if (this.disabled) return;
                var value = Number(a_ipages_1.value);
                if (isNaN(value) || value <= 0) {
                    value = SSS.a_ipages[1];
                    a_ipages_1.value = value;
                }
                autoPO.startipages(value);
            }, false);

            //總開關
            var enable = $('sp-fw-enable');

            //保存設置按鈕.
            var savebutton = $('sp-fw-savebutton');
            var saveButtonClicked = function(e) {
                var value = {
                    Rurl: SSS.Rurl,
                    useiframe: gl(useiframe),
                    viewcontent: gl(viewcontent),
                    enable: gl(enable)
                };

                function gl(obj) {
                    return (obj.type == 'checkbox' ? obj.checked : obj.value);
                }
                if (SSS.a_enable !== undefined) {
                    value.a_enable = gl(a_enable);
                    value.a_useiframe = gl(a_useiframe);
                    value.a_iloaded = gl(a_iloaded);
                    value.a_manualA = gl(a_manualA);
                    value.a_force = gl(a_force);
                    var t_a_itimeout = Number(gl(a_itimeout));
                    value.a_itimeout = isNaN(t_a_itimeout) ? SSS.a_itimeout : (t_a_itimeout >= 0 ? t_a_itimeout : 0);
                    var t_a_remain = Number(gl(a_remain));
                    value.a_remain = isNaN(t_a_remain) ? SSS.a_remain : Number(t_a_remain.toFixed(2));
                    var t_a_maxpage = Number(gl(a_maxpage));
                    value.a_maxpage = isNaN(t_a_maxpage) ? SSS.a_maxpage : (t_a_maxpage >= 1 ? t_a_maxpage : 1);
                    var t_a_ipages_1 = Number(gl(a_ipages_1));
                    value.a_ipages = [gl(a_ipages_0), (isNaN(t_a_ipages_1) ? SSS.a_ipages[1] : (t_a_ipages_1 >= 1 ? t_a_ipages_1 : 1))];
                    value.a_separator = gl(a_separator);
                }
                // alert(xToString(value));
                SSS.savedValue[SSS.sedValueIndex] = value;

                saveValue('spfwset', xToString(SSS.savedValue));

                if ((e.shiftKey ? !prefs.FW_RAS : prefs.FW_RAS)) { //按住shift鍵,執行反向操作.
                    window.setTimeout(function(){
                        window.location.reload();
                        // loadValueAndRun();
                    }, 1);
                }
            };
            savebutton.addEventListener('click', saveButtonClicked, false);

            function ll(obj, value) {
                if (obj.type == 'checkbox') {
                    obj.checked = value;
                } else {
                    obj.value = value;
                }
            }

            //載入翻頁設置.
            if (SSS.a_enable === undefined) { //未定義翻頁功能.
                a_enable.disabled = true;
                autopager_field.style.display = 'none';
            } else {
                ll(a_enable, SSS.a_enable);
                ll(a_useiframe, SSS.a_useiframe);
                ll(a_iloaded, SSS.a_iloaded);
                ll(a_itimeout, SSS.a_itimeout);
                ll(a_manualA, SSS.a_manualA);
                ll(a_force, SSS.a_force);
                ll(a_remain, SSS.a_remain);
                ll(a_maxpage, SSS.a_maxpage);
                ll(a_separator, SSS.a_separator);
                ll(a_ipages_0, SSS.a_ipages[0]);
                ll(a_ipages_1, SSS.a_ipages[1]);
            }

            if (!SSS.a_enable) { //當前不是翻頁模式,禁用立即翻頁按鈕.
                a_starti.disabled = true;
            }

            if (!SSS.hasRule) { //如果沒有高級規則,那麼此項不允許操作.
                a_force.disabled = true;
            }

            //載入預讀設置.
            ll(useiframe, SSS.useiframe);
            ll(viewcontent, SSS.viewcontent);

            //總開關
            ll(enable, SSS.enable);

            floatWO = {
                updateColor: function(state) {
                    rect.style.backgroundColor = FWKG_color[state];
                },
                loadedIcon: function(command) {
                    dot.style.display = command == 'show' ? 'block' : 'none'
                },
                CmodeIcon: function(command) {
                    cur_mode.style.display = command == 'show' ? 'block' : 'none'
                },
            };

            var vertical = parseInt(prefs.FW_offset[0], 10);
            var horiz = parseInt(prefs.FW_offset[1], 10);
            var FW_position = prefs.FW_position;

            function gss() {
                var scrolly = window.scrollY;
                var scrollx = window.scrollX;
                switch (FW_position) {
                    case 1:
                        div.style.top = vertical + scrolly + 'px';
                        div.style.left = horiz + scrollx + 'px';
                        break;
                    case 2:
                        div.style.top = vertical + scrolly + 'px';
                        div.style.right = horiz - scrollx + 'px';
                        break;
                    case 3:
                        div.style.bottom = vertical - scrolly + 'px';
                        div.style.right = horiz - scrollx + 'px';
                        break;
                    case 4:
                        div.style.bottom = vertical - scrolly + 'px';
                        div.style.left = horiz + scrollx + 'px';
                        break;
                    default:
                        break;
                }
            }

            //非opera用fixed定位.
            div.style.position = 'fixed';
            switch (FW_position) {
                case 1:
                    div.style.top = vertical + 'px';
                    div.style.left = horiz + 'px';
                    break;
                case 2:
                    div.style.top = vertical + 'px';
                    div.style.right = horiz + 'px';
                    break;
                case 3:
                    div.style.bottom = vertical + 'px';
                    div.style.right = horiz + 'px';
                    break;
                case 4:
                    div.style.bottom = vertical + 'px';
                    div.style.left = horiz + 'px';
                    break;
                default:
                    break;
            }
        }

        var Tween = self.Tween,
            TweenM = self.TweenM,
            TweenEase = self.TweenEase;

        function sp_transition(start, end) {
            var TweenF = sp_transition.TweenF;
            if (!TweenF) {
                TweenF = Tween[TweenM[prefs.s_method]];
                TweenF = TweenF[TweenEase[prefs.s_ease]] || TweenF;
                sp_transition.TweenF = TweenF;
            }
            var frameSpeed = 1000 / prefs.s_FPS;
            var t = 0; //次數,開始
            var b = start; //開始
            var c = end - start; //結束
            var d = Math.ceil(prefs.s_duration / frameSpeed); //次數,結束
            //alert(d);
            //alert(c);

            var x = window.scrollX;

            function transition() {
                var y = Math.ceil(TweenF(t, b, c, d));
                //alert(y);
                window.scroll(x, y);
                if (t < d) {
                    t++;
                    window.setTimeout(transition, frameSpeed);
                }
            }
            transition();
        }

        function scrollIt(a, b) {
            //a=a!==undefined? a : window.scrollY;
            prefs.sepT ? sp_transition(a, b) : window.scroll(window.scrollX, b);
        }

        function sepHandler(e) {
            e.stopPropagation();

            var div = this;
            var target = e.target;
            //alert(div);

            function getRelativeDiv(which) {
                var id = div.id;
                id = id.replace(/(sp-separator-)(.+)/, function(a, b, c) {
                    return b + String((Number(c) + (which == 'pre' ? -1 : 1)));
                });
                //alert(id);
                return (id ? document.getElementById(id) : null);
            }

            var o_scrollY, divS;
            switch (target.className) {
                case 'sp-sp-gotop':
                    scrollIt(window.scrollY, 0);
                    break;
                case 'sp-sp-gopre':
                    var prediv = getRelativeDiv('pre');
                    if (!prediv) return;
                    o_scrollY = window.scrollY;
                    var preDS = prediv.getBoundingClientRect().top;
                    if (prefs.sepP) {
                        divS = div.getBoundingClientRect().top;
                        preDS = o_scrollY - (divS - preDS);
                    } else {
                        preDS += o_scrollY - 6;
                    }
                    scrollIt(o_scrollY, preDS);
                    break;
                case 'sp-sp-gonext':
                    var nextdiv = getRelativeDiv('next');
                    if (!nextdiv) return;
                    o_scrollY = window.scrollY;
                    var nextDS = nextdiv.getBoundingClientRect().top;
                    if (prefs.sepP) {
                        divS = div.getBoundingClientRect().top;
                        nextDS = o_scrollY + (-divS + nextDS);
                    } else {
                        nextDS += o_scrollY - 6;
                    }
                    scrollIt(o_scrollY, nextDS);
                    break;
                case 'sp-sp-gobottom':
                    scrollIt(window.scrollY, Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
                    break;
                default:
                    break;
            }
        }

        //autopager
        var autoPO = {
            startipages: nullFn
        };

        function autopager(SSS, floatWO) {
            //return;
            //更新懸浮窗的顏色.
            floatWO.updateColor('autopager');

            //獲取插入位置節點.
            var insertPoint;
            var pageElement;
            var insertMode;
            if (SSS.a_HT_insert) {
                insertPoint = getElement(SSS.a_HT_insert[0]);
                insertMode = SSS.a_HT_insert[1];
            } else {
                pageElement = getAllElements(SSS.a_pageElement);
                if (pageElement.length > 0) {
                    var pELast = pageElement[pageElement.length - 1];
                    insertPoint = pELast.nextSibling ? pELast.nextSibling : pELast.parentNode.appendChild(document.createTextNode(' '));
                }
            }

            if (insertPoint) {
                C.log('驗證是否能找到插入位置節點:成功,', insertPoint);
            } else {
                C.err('驗證是否能找到插入位置節點:失敗', (SSS.a_HT_insert ? SSS.a_HT_insert[0] : ''), 'JS執行終止');
                floatWO.updateColor('Astop');
                return;
            }

            if (pageElement === undefined) {
                pageElement = getAllElements(SSS.a_pageElement);
            }
            if (pageElement.length > 0) {
                C.log('驗證是否能找到主要元素:成功,', pageElement);
            } else {
                C.err('驗證是否能找到主要元素:失敗,', SSS.a_pageElement, 'JS執行終止');
                floatWO.updateColor('Astop');
                return;
            }

            var insertPointP;
            if (insertMode != 2) {
                insertPointP = insertPoint.parentNode;
            }

            var addIntoDoc;
            if (insertMode == 2) {
                addIntoDoc = function(obj) {
                    insertPoint.appendChild(obj);
                };
            } else {
                addIntoDoc = function(obj) {
                    insertPointP.insertBefore(obj, insertPoint);
                };
            }

            var doc, win;

            function XHRLoaded(req) {
                var str = req.responseText;
                doc = win = createDocumentByString(str);
                if (!doc) {
                    C.err('文檔對像創建失敗');
                    removeL();
                    return;
                }
                floatWO.updateColor('autopager');
                floatWO.CmodeIcon('hide');
                floatWO.loadedIcon('show');
                working = false;
                scroll();
            }

            var remove = [];

            function removeL() {
                C.log('移除各種事件監聽');
                floatWO.updateColor('Astop');
                var _remove = remove;
                for (var i = 0, ii = _remove.length; i < ii; i++) {
                    _remove[i]();
                }
            }

            var iframe;
            var messageR;
            var cdomloadedc = nullFn;

            function iframeLoaded() {
                var iframe = this;
                //alert(this.contentDocument.body)
                //alert(iframe.contentDocument.body.innerHTML);
                var body = iframe.contentDocument.body;
                if (body && body.firstChild) {
                    window.setTimeout(function() {
                        doc = iframe.contentDocument;
                        win = iframe.contentWindow || doc;
                        floatWO.updateColor('autopager');
                        floatWO.CmodeIcon('hide');
                        floatWO.loadedIcon('show');
                        working = false;
                        scroll();
                    }, SSS.a_itimeout);
                }
            }

            function iframeRquest(link) {
                if (!iframe) {
                    var i = document.createElement('iframe');
                    iframe = i;
                    i.name = 'superpreloader-iframe';
                    i.width = '100%';
                    i.height = '0';
                    i.frameBorder = "0";
                    i.style.cssText = '\
                        margin:0!important;\
                        padding:0!important;\
                        visibility:hidden!important;\
                    ';
                    i.src = link;
                    if (SSS.a_iloaded) {
                        i.addEventListener('load', iframeLoaded, false);
                        remove.push(function() {
                            i.removeEventListener('load', iframeLoaded, false)
                        });
                    } else {
                        function messagehandler(e) {
                            if (!messageR && e.data == 'superpreloader-iframe:DOMLoaded') {
                                //alert(e.source);
                                messageR = true;
                                iframeLoaded.call(i);
                            }
                        }
                        window.addEventListener('message', messagehandler, false);
                        remove.push(function() {
                            window.removeEventListener('message', messagehandler, false);
                        });
                    };
                    document.body.appendChild(i);
                    C.log("創建 iframe 成功");
                    cdomloadedc();
                } else {
                    messageR = false;
                    iframe.contentDocument.location.replace(link);
                    cdomloadedc();
                };
            }

            var working;

            function doRequest() {
                working = true;
                floatWO.updateColor('loading');
                floatWO.CmodeIcon('show');
                SSS.a_useiframe ? iframeRquest(nextlink) : self.xmlhttpRequest(nextlink, XHRLoaded);
            }

            var ipagesmode = SSS.a_ipages[0];
            var ipagesnumber = SSS.a_ipages[1];
            var scrollDo = nullFn;
            var afterInsertDo = nullFn;
            if (prefs.Aplus) {
                afterInsertDo = doRequest;
                doRequest();
            } else {
                scrollDo = doRequest;
                if (ipagesmode) doRequest();
            }


            var manualDiv;

            function manualAdiv() {
                if (!manualDiv) {
                    self.addStyle(self.manualAdiv_style);

                    var div = document.createElement('div');
                    div.id = 'sp-sp-manualdiv';
                    manualDiv = div;
                    var span = document.createElement('span');
                    span.textContent = '下';
                    span.className = 'sp-sp-md-span'
                    div.appendChild(span);
                    var input = document.createElement('input');
                    input.type = 'number';
                    input.value = 1;
                    input.min = 1;
                    input.title = "輸入你想要拼接的頁數(必須>=1),然後按回車."
                    input.id = 'sp-sp-md-number';

                    function getInputValue() {
                        var value = Number(input.value);
                        if (isNaN(value) || value < 1) {
                            value = 1;
                            input.value = 1;
                        };
                        return value;
                    };

                    function spage() {
                        if (doc) {
                            var value = getInputValue();
                            //alert(value);
                            ipagesmode = true;
                            ipagesnumber = value + paged;
                            insertedIntoDoc();
                        };
                    };
                    input.addEventListener('keyup', function(e) {
                        //alert(e.keyCode);
                        if (e.keyCode == 13) { //回車
                            spage();
                        };
                    }, false);
                    div.appendChild(input);
                    var span2 = document.createElement('span');
                    span2.textContent = '頁';
                    span2.className = 'sp-sp-md-span'
                    div.appendChild(span2);
                    var img = document.createElement('img');
                    img.id = 'sp-sp-md-imgnext';
                    img.src = _sep_icons.next;
                    div.appendChild(img);
                    var span_info = document.createElement('span');
                    span_info.id = 'sp-sp-md-someinfo';
                    span_info.textContent = prefs.someValue;
                    div.appendChild(span_info);
                    document.body.appendChild(div);
                    div.addEventListener('click', function(e) {
                        if (e.target.id == 'sp-sp-md-number') return;
                        spage();
                    }, false);
                };
                addIntoDoc(manualDiv);
                manualDiv.style.display = 'block';
            }

            function beforeInsertIntoDoc() {
                working = true;
                if (SSS.a_manualA && !ipagesmode) { //顯示手動翻頁觸發條.
                    manualAdiv();
                } else { //直接拼接.
                    insertedIntoDoc();
                };
            }


            var sepStyle;
            var goNextImg = [false];
            var sNumber = prefs.sepStartN;
            var _sep_icons = sep_icons;
            var curNumber = sNumber;

            function createSep() {
                var div = document.createElement('div');
                if (SSS.a_separator) {
                    if (!sepStyle) {
                        sepStyle = self.addStyle(self.separator_style);
                    }

                    div.className = 'sp-separator';
                    div.id = 'sp-separator-' + curNumber;
                    div.addEventListener('click', sepHandler, false);
                    var a = document.createElement('a');
                    a.className = 'sp-sp-nextlink';
                    a.innerHTML = '第 <b><span style="color:red!important;">' + curNumber + '</span></b> 頁';
                    a.href = a.title = nextlink;
                    var img = document.createElement('img');
                    var i_top = img.cloneNode(false);
                    i_top.src = _sep_icons.top;
                    i_top.className = 'sp-sp-gotop';
                    i_top.alt = i_top.title = '去到頂部';
                    var i_bottom = img.cloneNode(false);
                    i_bottom.src = _sep_icons.bottom;
                    i_bottom.className = 'sp-sp-gobottom';
                    i_bottom.alt = i_bottom.title = '去到底部';
                    var i_pre = img.cloneNode(false);
                    i_pre.src = curNumber == sNumber ? _sep_icons.pre_gray : _sep_icons.pre;
                    i_pre.title = '上滾一頁';
                    i_pre.className = 'sp-sp-gopre';
                    var i_next = img;
                    i_next.src = _sep_icons.next_gray;
                    i_next.className = 'sp-sp-gonext';
                    i_next.alt = i_next.title = '下滾一頁';
                    if (goNextImg.length == 2) {
                        goNextImg.shift();
                    };
                    goNextImg.push(i_next);
                    var span_info = document.createElement('span');
                    span_info.className = 'sp-span-someinfo';
                    span_info.textContent = prefs.someValue;

                    div.appendChild(a);
                    div.appendChild(i_top);
                    div.appendChild(i_pre);
                    div.appendChild(i_next);
                    div.appendChild(i_bottom);
                    div.appendChild(span_info);
                    curNumber += 1;
                } else {
                    div.style.cssText = '\
                        height:0!important;\
                        width:0!important;\
                        margin:0!important;\
                        padding:0!important;\
                        border:none!important;\
                        clear:both!important;\
                        display:block!important;\
                        visibility:hidden!important;\
                    ';
                };
                return div;
            }

            var paged = 0;

            function insertedIntoDoc() {
                if (!doc) return;
                var fragment = document.createDocumentFragment();
                var pageElement = getAllElements(SSS.a_pageElement, false, doc, win);
                var ii = pageElement.length;
                if (ii <= 0) {
                    C.log('獲取下一頁的主要內容失敗', SSS.a_pageElement);
                    removeL();
                    return;
                }
                var i, pe_x, pe_x_nn;
                for (i = 0; i < ii; i++) {
                    pe_x = pageElement[i];
                    pe_x_nn = pe_x.nodeName;
                    if (pe_x_nn == 'BODY' || pe_x_nn == 'HTML' || pe_x_nn == 'SCRIPT') continue;
                    pe_x = doc.importNode(pe_x, true);
                    fragment.appendChild(pe_x);
                }
                var scripts = getAllElements('css;script', fragment); //移除腳本
                //alert(scripts.length);
                var scripts_x;
                for (i = scripts.length - 1; i >= 0; i--) {
                    scripts_x = scripts[i];
                    scripts_x.parentNode.removeChild(scripts_x);
                }
                if (SSS.filter) { //功能未完善.
                    //alert(SSS.filter);
                    var nodes = []
                    try {
                        nodes = getAllElements(SSS.filter, fragment);
                    } catch (e) {};
                    var nodes_x;
                    for (i = nodes.length - 1; i >= 0; i--) {
                        nodes_x = nodes[i];
                        nodes_x.parentNode.removeChild(nodes_x);
                    };
                }
                var imgs;
                if (SSS.a_useiframe && !SSS.a_iloaded) {
                    imgs = getAllElements('css;img[src]', fragment); //收集所有圖片
                }
                var sepdiv = createSep();
                fragment.insertBefore(sepdiv, fragment.firstChild);
                addIntoDoc(fragment);
                cplink = nextlink;
                C.log('----------');
                if (imgs) { //非opera,在iframeDOM取出數據時需要重載圖片.
                    window.setTimeout(function() {
                        var _imgs = imgs;
                        var i, ii, img;
                        for (i = 0, ii = _imgs.length; i < ii; i++) {
                            img = _imgs[i];
                            var src = img.src;
                            img.src = src;
                        };
                    }, 99);
                }
                if (SSS.a_replaceE) {
                    var oldE = getAllElements(SSS.a_replaceE);
                    var oldE_lt = oldE.length;
                    //alert(oldE_lt);
                    if (oldE_lt > 0) {
                        var newE = getAllElements(SSS.a_replaceE, false, doc, win);
                        var newE_lt = newE.length;
                        //alert(newE_lt);
                        if (newE_lt == oldE_lt) {
                            var oldE_x, newE_x;
                            for (i = 0; i < newE_lt; i++) {
                                oldE_x = oldE[i];
                                newE_x = newE[i];
                                newE_x = doc.importNode(newE_x, true);
                                oldE_x.parentNode.replaceChild(newE_x, oldE_x);
                            };
                        };
                    };
                };
                paged += 1;
                if (ipagesmode && paged >= ipagesnumber) {
                    ipagesmode = false;
                }
                floatWO.loadedIcon('hide');
                if (manualDiv) {
                    manualDiv.style.display = 'none';
                }
                if (goNextImg[0]) goNextImg[0].src = _sep_icons.next;

                //alert(SSS.nextLink)
                var nl = getElement(SSS.nextLink, false, doc, win);
                //alert(nl);
                if (nl) {
                    nl = getFullHref(nl);
                    if (nl == nextlink) {
                        nextlink = null;
                    } else {
                        nextlink = nl;
                    };
                } else {
                    nextlink = null;
                }
                if (paged >= SSS.a_maxpage) {
                    C.log('到達所設定的最大翻頁數', SSS.a_maxpage);
                    self.notice('<b>狀態</b>:' + '到達所設定的最大翻頁數:<b style="color:red">' + SSS.a_maxpage + '</b>');
                    removeL();
                    return;
                }
                var delayiframe = function(fn) {
                    window.setTimeout(fn, 199);
                };
                if (nextlink) {
                    C.log('找到下一頁鏈接:', nextlink);
                    doc = win = null;
                    if (ipagesmode) {
                        if (SSS.a_useiframe) { //延時點,firefox,太急會卡-_-!
                            delayiframe(doRequest);
                        } else {
                            doRequest();
                        };
                    } else {
                        working = false;
                        if (SSS.a_useiframe) {
                            delayiframe(afterInsertDo);
                        } else {
                            afterInsertDo();
                        };
                    };
                } else {
                    C.log('沒有找到下一頁鏈接', SSS.nextLink);
                    removeL();
                    return;
                };
            }

            //返回,剩餘高度是總高度的比值.
            var relatedObj_0, relatedObj_1;
            if (SSS.a_relatedObj) {
                relatedObj_0 = SSS.a_relatedObj[0];
                relatedObj_1 = SSS.a_relatedObj[1];
            }

            function getRemain() {
                var scrolly = window.scrollY;
                var WI = window.innerHeight;
                var obj = getLastElement(relatedObj_0);
                var scrollH = (obj && obj.nodeType == 1) ? (obj.getBoundingClientRect()[relatedObj_1] + scrolly) : Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
                return (scrollH - scrolly - WI) / WI; //剩餘高度於頁面總高度的比例.
            }

            var pause = false;
            if (prefs.pauseA) {
                var Sbutton = ['target', 'shiftKey', 'ctrlKey', 'altKey'];
                var ltype = prefs.mouseA ? 'mousedown' : 'dblclick';
                var button_1 = Sbutton[prefs.Pbutton[0]];
                var button_2 = Sbutton[prefs.Pbutton[1]];
                var button_3 = Sbutton[prefs.Pbutton[2]];

                function pauseIt() {
                    pause = !pause;
                    if (prefs.stop_ipage) ipagesmode = false;
                    if (pause) {
                        floatWO.updateColor('Apause');
                        self.notice('<b>狀態</b>:' + '自動翻頁<span style="color:red!important;"><b>暫停</b></span>.');
                    } else {
                        floatWO.updateColor('autopager');
                        floatWO.CmodeIcon('hide');
                        self.notice('<b>狀態</b>:' + '自動翻頁<span style="color:red!important;"><b>啟用</b></span>.');
                    };
                    scroll();
                };
                var Sctimeout;

                function clearPause() {
                    window.clearTimeout(Sctimeout);
                    document.removeEventListener('mouseup', arguments.callee, false);
                };

                function pausehandler(e) {
                    if (!SSS.a_manualA || ipagesmode || pause) {
                        if (e[button_1] && e[button_2] && e[button_3]) {
                            if (e.type == 'mousedown') {
                                document.addEventListener('mouseup', clearPause, false);
                                Sctimeout = window.setTimeout(pauseIt, prefs.Atimeout);
                            } else {
                                pauseIt();
                            }
                        }
                    }
                }
                document.addEventListener(ltype, pausehandler, false);
                remove.push(function() {
                    document.removeEventListener(ltype, pausehandler, false);
                });
            }

            function scroll() {
                if (AUTO_START && !pause && !working && (getRemain() <= SSS.a_remain || ipagesmode)) {
                    if (doc) { //有的話,就插入到文檔.
                        beforeInsertIntoDoc();
                    } else { //否則就請求文檔.
                        scrollDo();
                    }
                }
            }

            this.scroll = scroll;

            var timeout;

            function timeoutfn() {
                window.clearTimeout(timeout);
                timeout = window.setTimeout(scroll, 100);
            }
            window.addEventListener('scroll', timeoutfn, false);
            remove.push(function() {
                window.removeEventListener('scroll', timeoutfn, false);
            });


            autoPO = {
                startipages: function(value) {
                    if (value > 0) {
                        ipagesmode = true;
                        ipagesnumber = value + paged;
                        self.notice('<b>狀態</b>:' + '當前已翻頁數量:<b>' + paged + '</b>,' + '連續翻頁到第<b style="color:red!important;">' + ipagesnumber + '</b>頁.');
                        if (SSS.a_manualA) insertedIntoDoc();
                        scroll();
                    };
                }
            };
        }

        //prefetcher
        function prefetcher(SSS, floatWO) {
            function cContainer() {
                var div = document.createElement('div');
                var div2 = div.cloneNode(false);
                var hr = document.createElement('hr');
                div.style.cssText = '\
                    margin:3px!important;\
                    padding:5px!important;\
                    border-radius:8px!important;\
                    -moz-border-radius:8px!important;\
                    border-bottom:1px solid #E30005!important;\
                    border-top:1px solid #E30005!important;\
                    background-color:#F5F5F5!important;\
                    float:none!important;\
                ';
                div.title = '預讀的內容';
                div2.style.cssText = '\
                    text-align:left!important;\
                    color:red!important;\
                    font-size:13px!important;\
                    display:block!important;\
                    float:none!important;\
                    position:static!important;\
                ';
                hr.style.cssText = '\
                    display:block!important;\
                    border:1px inset #000!important;\
                ';
                div.appendChild(div2);
                div.appendChild(hr);
                document.body.appendChild(div);
                return {
                    div: div,
                    div2: div2
                };
            }

            floatWO.updateColor('prefetcher');

            floatWO.updateColor('loading');
            floatWO.CmodeIcon('show');
            if (SSS.useiframe) {
                var iframe = document.createElement('iframe');
                iframe.name = 'superpreloader-iframe';
                iframe.src = nextlink;
                iframe.width = '100%';
                iframe.height = '0';
                iframe.frameBorder = "0";
                iframe.style.cssText = '\
                    margin:0!important;\
                    padding:0!important;\
                ';
                iframe.addEventListener('load', function() {
                    var body = this.contentDocument.body;
                    if (body && body.firstChild) {
                        floatWO.updateColor('prefetcher');
                        floatWO.CmodeIcon('hide');
                        floatWO.loadedIcon('show');
                        this.removeEventListener('load', arguments.callee, false);
                    };
                }, false);
                if (SSS.viewcontent) {
                    var container = cContainer();
                    container.div2.innerHTML = 'iframe全預讀: ' + '<br />' + '預讀網址: ' + '<b>' + nextlink + '</b>';
                    iframe.height = '300px';
                    container.div.appendChild(iframe);
                } else {
                    document.body.appendChild(iframe);
                };
            } else {
                self.xmlhttpRequest(nextlink, function(req) {
                    var str = req.responseText;
                    var doc = createDocumentByString(str);
                    if (!doc) {
                        C.err('文檔對像創建失敗!');
                        return;
                    };
                    var images = doc.images;
                    var isl = images.length;
                    var img;
                    var iarray = [];
                    var i;
                    var existSRC = {};
                    var isrc;
                    for (i = isl - 1; i >= 0; i--) {
                        isrc = images[i].getAttribute('src');
                        isrc = img.src;
                        if (!isrc || existSRC[isrc]) {
                            continue;
                        } else {
                            existSRC[isrc] = true;
                        }
                        img = document.createElement('img');
                        img.src = isrc;
                        iarray.push(img);
                    }
                    if (SSS.viewcontent) {
                        var containter = cContainer();
                        var div = containter.div;
                        i = iarray.length;
                        containter.div2.innerHTML = '預讀取圖片張數: ' + '<b>' + i + '</b>' + '<br />' + '預讀網址: ' + '<b>' + nextlink + '</b>';
                        for (i -= 1; i >= 0; i--) {
                            div.appendChild(iarray[i]);
                        };
                    };
                    floatWO.updateColor('prefetcher');
                    floatWO.loadedIcon('show');
                    floatWO.CmodeIcon('hide');
                });
            };
        }

        //執行開始..///////////////////

        //分析黑名單
        var blacklist_x;
        var i;
        var ii;

        for (i = 0, ii = blackList.length; i < ii; i++) {
            blacklist_x = blackList[i];
            if (blacklist_x[1]) {
                if (toRE(blacklist_x[2]).test(url)) {
                    C.log('匹配黑名單', blacklist_x, 'js執行終止');
                    C.log('全部過程耗時', new Date() - startTime, '毫秒');
                    return;
                }
            }
        }

        //是否在frame上加載..
        if (prefs.DisableI && window.self != window.parent) {
            var isreturn = true,
                DIExclude_x;
            for (i = 0, ii = DIExclude.length; i < ii; i++) {
                DIExclude_x = DIExclude[i];
                if (DIExclude_x[1] && DIExclude_x[2].test(url)) {
                    isreturn = false;
                    break;
                }
            }
            if (isreturn) {
                C.log('url為:', url, '的頁面為為非頂層窗口,JS執行終止.');
                return;
            }
        }
        C.log('url為:', url, 'JS加載成功')


        //第一階段..分析高級模式..
        SITEINFO = SITEINFO.concat(SITEINFO_TP, SITEINFO_comp);


        var SSS = {};
        var SII;
        var SIIA;
        var SIIAD = SITEINFO_D.autopager;
        var Rurl;
        var ii = SITEINFO.length;

        C.log('高級規則數量:', ii);

        for (i = 0; i < ii; i++) {
            SII = SITEINFO[i];
            Rurl = toRE(SII.url);
            if (Rurl.test(url)) {
                C.log('找到匹配當前站點的規則:', SII, '是第', i + 1, '規則');
                nextlink = getElement(SII.nextLink || 'auto;');
                if (!nextlink) {
                    C.log('無法找到下一頁鏈接,跳過規則:', SII, '繼續查找其他規則');
                    continue;
                }
                //alert(nextlink);
                if (SII.preLink && SII.preLink != 'auto;') { //如果設定了具體的preLink
                    prelink = getElement(SII.preLink);
                } else {
                    getElement('auto;');
                }
                //alert(prelink);
                SSS.hasRule = true;
                SSS.Rurl = String(Rurl);
                //alert(SSS.Rurl);
                SSS.nextLink = SII.nextLink || 'auto;';
                SSS.viewcontent = SII.viewcontent;
                SSS.enable = (SII.enable === undefined) ? SITEINFO_D.enable : SII.enable;
                SSS.useiframe = (SII.useiframe === undefined) ? SITEINFO_D.useiframe : SII.useiframe;
                if (SII.pageElement) {  //如果是Oautopager的規則..
                    if (!(SII.autopager instanceof Object)) SII.autopager = {};
                    SII.autopager.pageElement = SII.pageElement;
                    if (SII.insertBefore) SII.autopager.HT_insert = [SII.insertBefore, 1];
                }
                //自動翻頁設置.
                SIIA = SII.autopager;
                if (SIIA) {
                    SSS.a_pageElement = SIIA.pageElement;
                    if (!SSS.a_pageElement) break;
                    SSS.a_manualA = (SIIA.manualA === undefined) ? SIIAD.manualA : SIIA.manualA;
                    SSS.filter = SIIA.filter;
                    SSS.a_enable = (SIIA.enable === undefined) ? SIIAD.enable : SIIA.enable;
                    SSS.a_useiframe = (SIIA.useiframe === undefined) ? SIIAD.useiframe : SIIA.useiframe;
                    SSS.a_iloaded = (SIIA.iloaded === undefined) ? SIIAD.iloaded : SIIA.iloaded;
                    SSS.a_itimeout = (SIIA.itimeout === undefined) ? SIIAD.itimeout : SIIA.itimeout;
                    //alert(SSS.a_itimeout);
                    SSS.a_remain = (SIIA.remain === undefined) ? SIIAD.remain : SIIA.remain;
                    SSS.a_maxpage = (SIIA.maxpage === undefined) ? SIIAD.maxpage : SIIA.maxpage;
                    SSS.a_separator = (SIIA.separator === undefined) ? SIIAD.separator : SIIA.separator;
                    SSS.a_replaceE = SIIA.replaceE;
                    SSS.a_HT_insert = SIIA.HT_insert;
                    SSS.a_relatedObj = SIIA.relatedObj;
                    SSS.a_ipages = (SIIA.ipages === undefined) ? SIIAD.ipages : SIIA.ipages;
                }
                break;
            }
        }

        if (!SSS.hasRule) {
            C.log('未找到合適的高級規則,開始自動匹配.');
            //自動搜索.
            if (!autoMatch.keyMatch) {
                C.log('自動匹配功能被禁用了.');
            } else {
                nextlink = autoGetLink();
                //alert(nextlink);
                if (nextlink) { //強制模式.
                    var FA = autoMatch.FA;
                    SSS.Rurl = window.localStorage ? ('am:' + (url.match(/^https?:\/\/[^:]*\//i) || [])[0]) : 'am:automatch';
                    //alert(SSS.Rurl);
                    SSS.enable = true;
                    SSS.nextLink = 'auto;';
                    SSS.viewcontent = autoMatch.viewcontent;
                    SSS.useiframe = autoMatch.useiframe;
                    SSS.a_force = true;
                    SSS.a_manualA = FA.manualA;
                    SSS.a_enable = FA.enable || false; //不能使a_enable的值==undefined...
                    SSS.a_useiframe = FA.useiframe;
                    SSS.a_iloaded = FA.iloaded;
                    SSS.a_itimeout = FA.itimeout;
                    SSS.a_remain = FA.remain;
                    SSS.a_maxpage = FA.maxpage;
                    SSS.a_separator = FA.separator;
                    SSS.a_ipages = FA.ipages;
                };
            }
        }

        C.log('搜索高級規則和自動匹配過程總耗時:', new Date() - startTime, '毫秒');

        //上下頁都沒有找到啊
        if (!nextlink && !prelink) {
            C.log('未找到相關鏈接,JS執行停止.');
            C.log('全部過程耗時', new Date() - startTime, '毫秒');
            return;
        } else {
            C.log('上一頁鏈接:', prelink);
            C.log('下一頁鏈接:', nextlink);
            nextlink = nextlink ? (nextlink.href || nextlink) : undefined;
            prelink = prelink ? (prelink.href || prelink) : undefined;
        }

        var superPreloader = {
            go: function() {
                if (nextlink) window.location.href = nextlink;
            },
            back: function() {
                if (prelink) window.location.href = prelink;
            },
        };

        if (prefs.arrowKeyPage) {
            C.log('添加鍵盤左右方向鍵翻頁監聽.');
            document.addEventListener('keyup', function(e) {
                var tarNN = e.target.nodeName;
                if (tarNN != 'BODY' && tarNN != 'HTML') return;
                switch (e.keyCode) {
                    case 37:
                        superPreloader.back();
                        break;
                    case 39:
                        superPreloader.go();
                        break;
                    default:
                        break;
                }
            }, false);
        }

        //監聽下一頁事件.
        C.log('添加鼠標手勢翻頁監聽.');
        document.addEventListener('superPreloader.go', function() {
            superPreloader.go();
        }, false);

        //監聽下一頁事件.
        document.addEventListener('superPreloader.back', function() {
            superPreloader.back();
        }, false);

        //沒找到下一頁的鏈接
        if (!nextlink) {
            C.log('下一頁鏈接不存在,JS無法繼續.');
            C.log('全部過程耗時:', new Date() - startTime, '毫秒');
            return;
        }

        loadSettingAndRun();

        function loadSettingAndRun(){
            //載入設置..
            //alert(SSS.Rurl);
            C.log('加載設置');
            //saveValue('spfwset','');//清除設置.
            var savedValue = getValue('spfwset');
            // alert(savedValue);
            if (savedValue) {
                try{
                    savedValue = eval(savedValue);
                }catch(e){
                    saveValue('spfwset', '');  //有問題的設置,被手動修改過?,清除掉,不然下次還是要出錯.
                }
            }
            // alert(savedValue instanceof Array);
            if (savedValue) {
                SSS.savedValue = savedValue;
                var savedValue_x;
                for (i = 0, ii = savedValue.length; i < ii; i++) {
                    savedValue_x = savedValue[i];
                    if (savedValue_x.Rurl == SSS.Rurl) {
                        for (var ix in savedValue_x) {
                            if (savedValue_x.hasOwnProperty(ix)) {
                                SSS[ix] = savedValue_x[ix];  //加載鍵值.
                            }
                        }
                        break;
                    }
                }
                //alert(i);
                SSS.sedValueIndex = i;
            } else {
                SSS.savedValue = [];
                SSS.sedValueIndex = 0;
            }


            if (!SSS.hasRule) {
                SSS.a_force = true;
            }

            if (SSS.a_force) {
                SSS.a_pageElement = '//body/*';
                SSS.a_HT_insert = undefined;
                SSS.a_relatedObj = undefined;
            }

            if (prefs.floatWindow) {
                C.log('創建懸浮窗');
                floatWindow(SSS);
            }

            if (!SSS.enable) {
                C.log('本規則被關閉,腳本執行停止');
                C.log('全部過程耗時:', new Date() - startTime, '毫秒');
                return;
            }
            C.log('全部過程耗時:', new Date() - startTime, '毫秒');

            //預讀或者翻頁.
            if (SSS.a_enable) {
                C.log('初始化,翻頁模式.');
                autopager(SSS, floatWO);
            } else {
                C.log('初始化,預讀模式.');
                prefetcher(SSS, floatWO);
            }
        }

        // 調用命令
        window.uSuper_preloader = {
            go: superPreloader.go,  // 下一頁調用函數，結合 nextPage.uc.xul 一起使用
            back: superPreloader.back,
            goTop: function(win){
                win = win || window;
                scrollIt(win.scrollY, 0);
            },
            goBottom: function(win){
                win = win || window;
                var doc = win.document;
                scrollIt(win.scrollY, Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight));
            },
            goPre: function(win){
                win = win || window;

                var [prevSepTop,] = getSeparators(win);
                if(prevSepTop)
                    scrollIt(win.scrollY, prevSepTop + win.scrollY - 6);
                else
                    this.goTop(win);
            },
            goNext: function(win){
                win = win || window;

                var [, nextSepTop] = getSeparators(win);
                if(nextSepTop)
                    scrollIt(win.scrollY, nextSepTop + win.scrollY - 6);
                else
                    this.goBottom(win);
            }
        };

        // 找到窗口視野內 2個分隔條的高度，可能為 undefined
        function getSeparators(win){
            win = win || window;
            var doc = win.document;

            var separators = doc.querySelectorAll(".sp-separator");
            var viewportHeight = win.innerHeight;
            var documentHeight = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);

            // 得到一個數組
            var heightArr = [- win.scrollY];
            for (var i = 0; i < separators.length; i++) {
                heightArr.push(separators[i].getBoundingClientRect().top);
            }
            heightArr.push(documentHeight);

            // 查找
            for (var i = 0; i < heightArr.length; i++) {
                if(heightArr[i] > viewportHeight){
                    if(heightArr[i - 1] > 0){
                        return [heightArr[i - 2], heightArr[i]];
                    }else{
                        return [heightArr[i - 1], heightArr[i]];
                    }
                }
            }

            return [];
        }

        //css 獲取單個元素
        function getElementByCSS(css, contextNode) {
            return (contextNode || document).querySelector(css);
        }

        //css 獲取所有元素
        function getAllElementsByCSS(css, contextNode) {
            return (contextNode || document).querySelectorAll(css);
        }

        //xpath 獲取單個元素
        function getElementByXpath(xpath, contextNode, doc) {
            doc = doc || document;
            contextNode = contextNode || doc;
            return doc.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }

        //xpath 獲取多個元素.
        function getAllElementsByXpath(xpath, contextNode, doc) {
            doc = doc || document;
            contextNode = contextNode || doc;
            return doc.evaluate(xpath, contextNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        }

        //地址欄遞增處理函數.
        function hrefInc(obj, doc, win) {
            var _cplink = cplink;

            function getHref(href) {
                var mFails = obj.mFails;
                if (!mFails) return href;
                var str;
                if (typeof mFails == 'string') {
                    str = mFails;
                } else {
                    var fx;
                    var array = [];
                    var i, ii;
                    var mValue;
                    for (i = 0, ii = mFails.length; i < ii; i++) {
                        fx = mFails[i];
                        if (!fx) continue;
                        if (typeof fx == 'string') {
                            array.push(fx);
                        } else {
                            mValue = href.match(fx);
                            if (!mValue) return href;
                            array.push(mValue);
                        }
                    }
                    str = array.join('');
                }
                return str;
            }
            //alert(getHref(_cplink))

            var sa = obj.startAfter;
            var saType = typeof sa;
            var index;

            if (saType == 'string') {
                index = _cplink.indexOf(sa);
                if (index == -1) {
                    _cplink = getHref(_cplink);
                    index = _cplink.indexOf(sa);
                    if (index == -1) return;
                    //alert(index);
                }
            } else {
                var tsa = _cplink.match(sa);
                //alert(sa);
                if (!tsa) {
                    _cplink = getHref(_cplink);
                    sa = (_cplink.match(sa) || [])[0];
                    if (!sa) return;
                    index = _cplink.indexOf(sa);
                    if (index == -1) return;
                } else {
                    sa = tsa[0];
                    index = _cplink.indexOf(sa);
                    //alert(index)
                    //alert(tsa.index)
                }
            }

            index += sa.length;
            var max = obj.max === undefined ? 9999 : obj.max;
            var min = obj.min === undefined ? 1 : obj.min;
            var aStr = _cplink.slice(0, index);
            var bStr = _cplink.slice(index);
            var nbStr = bStr.replace(/^(\d+)(.*)$/, function(a, b, c) {
                b = Number(b) + obj.inc;
                if (b >= max || b < min) return a;
                return b + c;
            });
            //alert(aStr+nbStr);
            if (nbStr !== bStr) {
                var ilresult;
                try {
                    ilresult = obj.isLast(doc, win, _cplink);
                } catch (e) {}
                if (ilresult) return;
                return aStr + nbStr;
            }
        }

        function autoGetLink(doc, win) {
            if (!autoMatch.keyMatch) return;

            var startTime = new Date();
            doc = doc || document;
            win = win || window;

            if (doc == document) { //當前文檔,只檢查一次.
                //alert(nextlink);
                if (autoGetLink.docChecked) return nextlink;
                autoGetLink.docChecked = true;
            }

            var _prePageKey = prePageKey;
            var _nextPageKey = nextPageKey;
            var _nPKL = nextPageKey.length;
            var _pPKL = prePageKey.length;
            var _getFullHref = getFullHref;
            var _getAllElementsByXpath = getAllElementsByXpath;
            var _Number = Number;
            var _domain_port = domain_port;
            var alllinks = doc.links;
            var alllinksl = alllinks.length;


            var curLHref = cplink;
            var _nextlink;
            var _prelink;
            if (!autoGetLink.checked) { //第一次檢查
                _nextlink = nextlink;
                _prelink = prelink;
            } else {
                _prelink = true;
            };

            var DCEnable = autoMatch.digitalCheck;
            var DCRE = /^\s*\D{0,1}(\d+)\D{0,1}\s*$/;

            var i, a, ahref, atext, numtext;
            var aP, initSD, searchD = 1,
                preS1, preS2, searchedD, pSNText, preSS, nodeType;
            var nextS1, nextS2, nSNText, nextSS;
            var aimgs, j, jj, aimg_x, xbreak, k, keytext;

            function finalCheck(a, type) {
                //C.log(a);
                var ahref = a.getAttribute('href'); //在chrome上當是非當前頁面文檔對象的時候直接用a.href訪問,不返回href
                ahref = _getFullHref(ahref); //從相對路徑獲取完全的href;

                //3個條件:http協議鏈接,非跳到當前頁面的鏈接,非跨域
                if (/^https?:/i.test(ahref) && ahref.replace(/#.*$/, '') != curLHref && ahref.match(/https?:\/\/([^\/]+)/)[1] == _domain_port) {
                    C.log((type == 'pre' ? '上一頁' : '下一頁') + '匹配到的關鍵字為:', atext);
                    return a; //返回對像A
                    //return ahref;
                };
            };

            C.log('全文檔鏈接數量:', alllinksl)

            for (i = 0; i < alllinksl; i++) {
                if (_nextlink && _prelink) break;
                a = alllinks[i];
                if (!a) continue; //undefined跳過
                //links集合返回的本來就是包含href的a元素..所以不用檢測
                //if(!a.hasAttribute("href"))continue;
                atext = a.textContent;
                if (atext) {
                    if (DCEnable) {
                        numtext = atext.match(DCRE);
                        if (numtext) { //是不是純數字
                            //C.log(numtext);
                            numtext = numtext[1];
                            //alert(numtext);
                            aP = a;
                            initSD = 0;

                            if (!_nextlink) {
                                preS1 = a.previousSibling;
                                preS2 = a.previousElementSibling;


                                while (!(preS1 || preS2) && initSD < searchD) {
                                    aP = aP.parentNode;
                                    if (aP) {
                                        preS1 = aP.previousSibling;
                                        preS2 = aP.previousElementSibling;
                                    };
                                    initSD++;
                                    //alert('initSD: '+initSD);
                                };
                                searchedD = initSD > 0 ? true : false;

                                if (preS1 || preS2) {
                                    pSNText = preS1 ? preS1.textContent.match(DCRE) : '';
                                    if (pSNText) {
                                        preSS = preS1;
                                    } else {
                                        pSNText = preS2 ? preS2.textContent.match(DCRE) : '';
                                        preSS = preS2;
                                    };
                                    //alert(previousS);
                                    if (pSNText) {
                                        pSNText = pSNText[1];
                                        //C.log(pSNText)
                                        //alert(pSNText)
                                        if (_Number(pSNText) == _Number(numtext) - 1) {
                                            //alert(searchedD);
                                            nodeType = preSS.nodeType;
                                            //alert(nodeType);
                                            if (nodeType == 3 || (nodeType == 1 && (searchedD ? _getAllElementsByXpath('./descendant-or-self::a[@href]', preSS, doc).snapshotLength == 0 : (!preSS.hasAttribute('href') || _getFullHref(preSS.getAttribute('href')) == curLHref)))) {
                                                _nextlink = finalCheck(a, 'next');
                                                //alert(_nextlink);
                                            };
                                            continue;
                                        };
                                    };
                                };
                            };

                            if (!_prelink) {
                                nextS1 = a.nextSibling;
                                nextS2 = a.nextElementSibling;

                                while (!(nextS1 || nextS2) && initSD < searchD) {
                                    aP = aP.parentNode;
                                    if (aP) {
                                        nextS1 = a.nextSibling;
                                        nextS2 = a.nextElementSibling;
                                    };
                                    initSD++;
                                    //alert('initSD: '+initSD);
                                };
                                searchedD = initSD > 0 ? true : false;

                                if (nextS1 || nextS2) {
                                    nSNText = nextS1 ? nextS1.textContent.match(DCRE) : '';
                                    if (nSNText) {
                                        nextSS = nextS1;
                                    } else {
                                        nSNText = nextS2 ? nextS2.textContent.match(DCRE) : '';
                                        nextSS = nextS2;
                                    };
                                    //alert(nextS);
                                    if (nSNText) {
                                        nSNText = nSNText[1];
                                        //alert(pSNText)
                                        if (_Number(nSNText) == _Number(numtext) + 1) {
                                            //alert(searchedD);
                                            nodeType = nextSS.nodeType;
                                            //alert(nodeType);
                                            if (nodeType == 3 || (nodeType == 1 && (searchedD ? _getAllElementsByXpath('./descendant-or-self::a[@href]', nextSS, doc).snapshotLength == 0 : (!nextSS.hasAttribute("href") || _getFullHref(nextSS.getAttribute('href')) == curLHref)))) {
                                                _prelink == finalCheck(a, 'pre');
                                                //alert(_prelink);
                                            };
                                        };
                                    };
                                };
                            };
                            continue;
                        };
                    };
                } else {
                    atext = a.title;
                };
                if (!atext) {
                    aimgs = a.getElementsByTagName('img');
                    for (j = 0, jj = aimgs.length; j < jj; j++) {
                        aimg_x = aimgs[j];
                        atext = aimg_x.alt || aimg_x.title;
                        if (atext) break;
                    };
                };
                if (!atext) continue;
                if (!_nextlink) {
                    xbreak = false;
                    for (k = 0; k < _nPKL; k++) {
                        keytext = _nextPageKey[k];
                        if (!(keytext.test(atext))) continue;
                        _nextlink = finalCheck(a, 'next');
                        xbreak = true;
                        break;
                    };
                    if (xbreak || _nextlink) continue;
                };
                if (!_prelink) {
                    for (k = 0; k < _pPKL; k++) {
                        keytext = _prePageKey[k];
                        if (!(keytext.test(atext))) continue;
                        _prelink = finalCheck(a, 'pre');
                        break;
                    };
                };
            };

            C.log('搜索鏈接數量:', i, '耗時:', new Date() - startTime, '毫秒')

            if (!autoGetLink.checked) { //只在第一次檢測的時候,拋出上一頁鏈接.
                prelink = _prelink;
                autoGetLink.checked = true;
            };

            //alert(_nextlink);
            return _nextlink;
        }

        //從相對路徑的a.href獲取完全的href值.
        function getFullHref(href) {
            if (typeof href != 'string') href = href.getAttribute('href');
            //alert(href);
            //if(href.search(/^https?:/)==0)return href;//http打頭,不一定就是完整的href;
            var a = getFullHref.a;
            if (!a) {
                getFullHref.a = a = document.createElement('a');
            }
            a.href = href;
            return a.href;
        }

        //獲取單個元素,混合
        function getElement(selector, contextNode, doc, win) {
            var ret;
            if (!selector) return ret;
            doc = doc || document;
            win = win || window;
            contextNode = contextNode || doc;
            var type = typeof selector;
            if (type == 'string') {
                if (selector.search(/^css;/i) === 0) {
                    ret = getElementByCSS(selector.slice(4), contextNode);
                } else if (selector.toLowerCase() == 'auto;') {
                    ret = autoGetLink(doc, win);
                } else {
                    ret = getElementByXpath(selector, contextNode, doc);
                }
            } else if (type == 'function') {
                ret = selector(doc, win, cplink);
            } else {
                ret = hrefInc(selector, doc, win);
            }
            return ret;
        }

        //獲取最後一個元素.
        function getLastElement(selector, contextNode, doc, win) {
            var eles = getAllElements(selector, contextNode, doc, win);
            var l = eles.length;
            if (l > 0) {
                return eles[l - 1];
            }
        }

        //獲取多個元素
        function getAllElements(selector, contextNode, doc, win) {
            var ret = [];
            if (!selector) return ret;
            var Eles;
            doc = doc || document;
            win = win || window;
            contextNode = contextNode || doc;
            if (typeof selector == 'string') {
                if (selector.search(/^css;/i) === 0) {
                    Eles = getAllElementsByCSS(selector.slice(4), contextNode);
                } else {
                    Eles = getAllElementsByXpath(selector, contextNode, doc);
                }
            } else {
                Eles = selector(doc, win);
                if (!Eles) return ret;
                if (Eles.nodeType) { //單個元素.
                    ret[0] = Eles;
                    return ret;
                }
            }

            function unique(array) { //數組去重並且保持數組順序.
                var i, ca, ca2, j;
                for (i = 0; i < array.length; i++) {
                    ca = array[i];
                    for (j = i + 1; j < array.length; j++) {
                        ca2 = array[j];
                        if (ca2 == ca) {
                            array.splice(j, 1);
                            j--;
                        }
                    }
                }
                return array;
            }

            function makeArray(x) {
                var ret = [];
                var i, ii;
                var x_x;
                if (x.pop) { //普通的 array
                    for (i = 0, ii = x.length; i < ii; i++) {
                        x_x = x[i];
                        if (x_x) {
                            if (x_x.nodeType) { //普通類型,直接放進去.
                                ret.push(x_x);
                            } else {
                                ret = ret.concat(makeArray(x_x)); //嵌套的.
                            }
                        }
                    }
                    //alert(ret)
                    return unique(ret);
                } else if (x.item) { //nodelist or HTMLcollection
                    i = x.length;
                    while (i) {
                        ret[--i] = x[i];
                    }
                    /*
                    for(i=0,ii=x.length;i<ii;i++){
                        ret.push(x[i]);
                    };
                    */
                    return ret;
                } else if (x.iterateNext) { //XPathResult
                    i = x.snapshotLength;
                    while (i) {
                        ret[--i] = x.snapshotItem(i);
                    }
                    /*
                    for(i=0,ii=x.snapshotLength;i<ii;i++){
                        ret.push(x.snapshotItem(i));
                    };
                    */
                    return ret;
                }
            }

            return makeArray(Eles);
        }

        //string轉為DOM
        function createDocumentByString(str) {
            if (!str) {
                C.err('沒有找到要轉成DOM的字符串');
                return;
            }

            if (document.documentElement.nodeName != 'HTML') {
                return new DOMParser().parseFromString(str, 'application/xhtml+xml');
            }
            var doc;
            if (document.implementation.createHTMLDocument) {
                doc = document.implementation.createHTMLDocument('superPreloader');
            } else {
                try {
                    doc = document.cloneNode(false);
                    doc.appendChild(doc.importNode(document.documentElement, false));
                    doc.documentElement.appendChild(doc.createElement('head'));
                    doc.documentElement.appendChild(doc.createElement('body'));
                } catch (e) {}
            }
            if (!doc) return;
            var range = document.createRange();
            range.selectNodeContents(document.body);
            var fragment = range.createContextualFragment(str);
            doc.body.appendChild(fragment);
            var headChildNames = {
                TITLE: true,
                META: true,
                LINK: true,
                STYLE: true,
                BASE: true
            };
            var child;
            var body = doc.body;
            var bchilds = body.childNodes;
            for (var i = bchilds.length - 1; i >= 0; i--) { //移除head的子元素
                child = bchilds[i];
                if (headChildNames[child.nodeName]) body.removeChild(child);
            }
            //C.log(doc);
            //C.log(doc.documentElement.innerHTML);
            return doc;
        }

        function saveValue(key, value) {
            window.localStorage.setItem(key, encodeURIComponent(value));
        }

        function getValue(key) {
            var value = window.localStorage.getItem(key);
            return value ? decodeURIComponent(value) : undefined;
        }
    },
    siteFixd: function(){
        var URL = this.win.location.href;

        //修正天涯帖子內容頁面的使用.強制拼接.的問題.
        if (/http:\/\/www\.tianya\.cn\/.+\/content\/.+/i.test(URL)) {
            this.addStyle('\
                div.wrapper{\
                    height:auto!important;\
                }\
            ');
        } else if (/http:\/\/manhua\.178\.com\/.+\/.+\/.+/i.test(URL)) {
            this.addStyle('\
                img.bigimgborder{\
                    display:inline-block!important;\
                }\
            ');
        }
    },
    scroll: function(){},
    log: function(){
        if(DEBUG) {
            var console = this.win.console;
            var log = Function.prototype.bind.call(console.log, console);
            log.apply(console, arguments);
        }
    },
    addStyle: function(css) {
        var heads = this.doc.getElementsByTagName('head');
        if (heads.length > 0) {
            var node = this.doc.createElement('style');
            node.type = 'text/css';
            node.innerHTML = css;
            return heads[0].appendChild(node);
        }
    },
    xmlhttpRequest: function (link, callback) {
        this.log("GM_xmlhttpRequest: " + link);
        var charset = this.doc.characterSet;
        GM_xmlhttpRequest({
            menth: "GET",
            url: link,
            overrideMimeType: 'text/html; charset=' + charset,
            onload: callback
        }, this.win);
    },
    noticeDiv: null,
    noticeDivto: null,
    noticeDivto2: null,
    notice: function(html_txt) {
        var self = this;

        if (!self.noticeDiv) {
            var div = self.doc.createElement('div');
            self.noticeDiv = div;
            div.style.cssText = self.noticeDiv_style;
            self.doc.body.appendChild(div);
        }
        self.win.clearTimeout(self.noticeDivto);
        self.win.clearTimeout(self.noticeDivto2);
        self.noticeDiv.innerHTML = html_txt;
        self.noticeDiv.style.display = 'block';
        self.noticeDiv.style.opacity = '0.96';
        self.noticeDivto2 = self.win.setTimeout(function() {
            self.noticeDiv.style.opacity = '0';
        }, 1666);
        self.noticeDivto = self.win.setTimeout(function() {
            self.noticeDiv.style.display = 'none';
        }, 2000);
    },
    floatWindowStyle: '\
        #sp-fw-container {\
            z-index:999999!important;\
            text-align:left!important;\
        }\
        #sp-fw-container * {\
            font-size:13px!important;\
            color:black!important;\
            float:none!important;\
        }\
        #sp-fw-main-head{\
            position:relative!important;\
            top:0!important;\
            left:0!important;\
        }\
        #sp-fw-span-info{\
            position:absolute!important;\
            right:1px!important;\
            top:0!important;\
            font-size:10px!important;\
            line-height:10px!important;\
            background:none!important;\
            font-style:italic!important;\
            color:#5a5a5a!important;\
            text-shadow:white 0px 1px 1px!important;\
        }\
        #sp-fw-container input {\
            vertical-align:middle!important;\
            display:inline-block!important;\
            outline:none!important;\
        }\
        #sp-fw-container input[type="number"] {\
            width:50px!important;\
            text-align:left!important;\
        }\
        #sp-fw-container input[type="checkbox"] {\
            border:1px solid #B4B4B4!important;\
            padding:1px!important;\
            margin:3px!important;\
            width:13px!important;\
            height:13px!important;\
            background:none!important;\
            cursor:pointer!important;\
        }\
        #sp-fw-container input[type="button"] {\
            border:1px solid #ccc!important;\
            cursor:pointer!important;\
            background:none!important;\
            width:auto!important;\
            height:auto!important;\
        }\
        #sp-fw-container li {\
            list-style:none!important;\
            margin:3px 0!important;\
            border:none!important;\
            float:none!important;\
        }\
        #sp-fw-container fieldset {\
            border:2px groove #ccc!important;\
            -moz-border-radius:3px!important;\
            border-radius:3px!important;\
            padding:4px 9px 6px 9px!important;\
            margin:2px!important;\
            display:block!important;\
            width:auto!important;\
            height:auto!important;\
        }\
        #sp-fw-container fieldset>ul {\
            padding:0!important;\
            margin:0!important;\
        }\
        #sp-fw-container ul#sp-fw-a_useiframe-extend{\
            padding-left:40px!important;\
        }\
        #sp-fw-rect {\
            position:relative!important;\
            top:0!important;\
            left:0!important;\
            float:right!important;\
            height:10px!important;\
            width:10px!important;\
            padding:0!important;\
            margin:0!important;\
            -moz-border-radius:3px!important;\
            border-radius:3px!important;\
            border:1px solid white!important;\
            -webkit-box-shadow:inset 0 5px 0 rgba(255,255,255,0.3), 0 0 3px rgba(0,0,0,0.8)!important;\
            -moz-box-shadow:inset 0 5px 0 rgba(255,255,255,0.3), 0 0 3px rgba(0,0,0,0.8)!important;\
            box-shadow:inset 0 5px 0 rgba(255,255,255,0.3), 0 0 3px rgba(0,0,0,0.8)!important;\
            opacity:0.8!important;\
        }\
        #sp-fw-dot,\
        #sp-fw-cur-mode {\
            position:absolute!important;\
            z-index:9999999!important;\
            width:5px!important;\
            height:5px!important;\
            padding:0!important;\
            -moz-border-radius:3px!important;\
            border-radius:3px!important;\
            border:1px solid white!important;\
            opacity:1!important;\
            -webkit-box-shadow:inset 0 -2px 1px rgba(0,0,0,0.3),inset 0 2px 1px rgba(255,255,255,0.3), 0px 1px 2px rgba(0,0,0,0.9)!important;\
            -moz-box-shadow:inset 0 -2px 1px rgba(0,0,0,0.3),inset 0 2px 1px rgba(255,255,255,0.3), 0px 1px 2px rgba(0,0,0,0.9)!important;\
            box-shadow:inset 0 -2px 1px rgba(0,0,0,0.3),inset 0 2px 1px rgba(255,255,255,0.3), 0px 1px 2px rgba(0,0,0,0.9)!important;\
        }\
        #sp-fw-dot{\
            right:-3px!important;\
            top:-3px!important;\
        }\
        #sp-fw-cur-mode{\
            left:-3px!important;\
            top:-3px!important;\
            width:6px!important;\
            height:6px!important;\
        }\
        #sp-fw-content{\
            padding:0!important;\
            margin:5px 5px 0 0!important;\
            -moz-border-radius:3px!important;\
            border-radius:3px!important;\
            border:1px solid #A0A0A0!important;\
            -webkit-box-shadow:-2px 2px 5px rgba(0,0,0,0.3)!important;\
            -moz-box-shadow:-2px 2px 5px rgba(0,0,0,0.3)!important;\
            box-shadow:-2px 2px 5px rgba(0,0,0,0.3)!important;\
        }\
        #sp-fw-main {\
            padding:5px!important;\
            border:1px solid white!important;\
            -moz-border-radius:3px!important;\
            border-radius:3px!important;\
            background-color:#F2F2F7!important;\
            background: -moz-linear-gradient(top, #FCFCFC, #F2F2F7 100%)!important;\
            background: -webkit-gradient(linear, 0 0, 0 100%, from(#FCFCFC), to(#F2F2F7))!important;\
        }\
        #sp-fw-foot{\
         position:relative!important;\
         left:0!important;\
         right:0!important;\
         min-height:20px!important;\
        }\
        #sp-fw-savebutton{\
            position:absolute!important;\
            top:0!important;\
            right:2px!important;\
        }\
        #sp-fw-container .sp-fw-spanbutton{\
            border:1px solid #ccc!important;\
            -moz-border-radius:3px!important;\
            border-radius:3px!important;\
            padding:2px 3px!important;\
            cursor:pointer!important;\
            background-color:#F9F9F9!important;\
            -webkit-box-shadow:inset 0 10px 5px white!important;\
            -moz-box-shadow:inset 0 10px 5px white!important;\
            box-shadow:inset 0 10px 5px white!important;\
        }\
    ',
    floatWindowInnerHTML: '\
        <div id="sp-fw-rect" style="background-color:#000;">\
            <div id="sp-fw-dot" style="display:none;"></div>\
            <div id="sp-fw-cur-mode" style="display:none;"></div>\
        </div>\
        <div id="sp-fw-content" style="display:none;">\
            <div id="sp-fw-main">\
                <div id="sp-fw-main-head">\
                    <input type="checkbox" title="使用翻頁模式,否則使用預讀模式" id="sp-fw-a_enable" name="sp-fw-a_enable"/>使用翻頁模式\
                    <span id="sp-fw-span-info">Super_preloader</span>\
                </div>\
                <fieldset>\
                    <legend title="預讀模式的相關設置" >預讀設置</legend>\
                <ul>\
                        <li>\
                            <input type="checkbox" title="使用iframe預先載入好下一頁到緩存,否則使用xhr請求下一頁源碼,取出所有的圖片進行預讀" id="sp-fw-useiframe" name="sp-fw-useiframe"/>使用iframe方式\
                        </li>\
                        <li>\
                            <input type="checkbox" title="查看預讀的內容,將其顯示在頁面的底部,看看預讀了些什麼." id="sp-fw-viewcontent" name="sp-fw-viewcontent"/>查看預讀的內容\
                        </li>\
                    </ul>\
                </fieldset>\
                <fieldset id="sp-fw-autopager-field" style="display:block;">\
                    <legend title="自動翻頁模式的相關設置">翻頁設置</legend>\
                    <ul>\
                        <li>\
                            <input type="checkbox" title="使用iframe方式進行翻頁,否則使用xhr方式翻頁,可以解決某些網頁xhr方式無法翻頁的問題,如果xhr翻頁正常的話,就不要勾這項吧." id="sp-fw-a_useiframe" name="sp-fw-a_useiframe"/>使用iframe方式\
                            <ul id="sp-fw-a_useiframe-extend">\
                                <li>\
                                    <input type="checkbox" title="等待iframe完全載入後(發生load事件),將內容取出,否則在DOM完成後,就直接取出來..(勾上後,會比較慢,但是可能會解決一些問題.)" id="sp-fw-a_iloaded" name="sp-fw-a_iloaded" />等待iframe完全載入\
                                </li>\
                                <li>\
                                    <input type="number"  min="0" title="在可以從iframe取數據的時候,繼續等待設定的毫秒才開始取出數據(此項為特殊網頁準備,如果正常,請設置為0)" id="sp-fw-a_itimeout" name="sp-fw-a_itimeout"/>ms延時取出\
                                </li>\
                            </ul>\
                        </li>\
                        <li>\
                            <input type="checkbox" id="sp-fw-a_manualA" name="sp-fw-a_manualA" title="不會自動拼接上來,會出現一個類似翻頁導航的的圖形,點擊翻頁(在論壇的帖子內容頁面,可以考慮勾選此項,從而不影響你的回帖)"/>手動模式\
                        </li>\
                        <li>\
                             剩餘<input type="number" min="0" id="sp-fw-a_remain" name="sp-fw-a_remain" title="當剩餘的頁面的高度是瀏覽器可見窗口高度的幾倍開始翻頁"/>倍頁面高度觸發\
                        </li>\
                        <li>\
                             最多翻<input type="number" min="0" id="sp-fw-a_maxpage" name="sp-fw-a_maxpage" title="最多翻頁數量,當達到這個翻頁數量的時候,自動翻頁停止." />頁\
                        </li>\
                        <li>\
                            <input type="checkbox" id="sp-fw-a_separator" name="sp-fw-a_separator" title="分割頁面主要內容的導航條,可以進行頁面主要內容之間的快速跳轉定位等."/>顯示翻頁導航\
                        </li>\
                        <li>\
                            <input type="checkbox" title="將下一頁的body部分內容整個拼接上來.(當需翻頁的網站沒有高級規則時,該項強制勾選,無法取消.)" id="sp-fw-a_force" name="sp-fw-a_force"/>強制拼接\
                        </li>\
                        <li>\
                            <input type="checkbox" id="sp-fw-a_ipages_0" name="sp-fw-a_ipages_0" title="在JS加載後,立即連續翻後面設定的頁數"/>啟用 \
                            立即翻<input type="number" min="1" id="sp-fw-a_ipages_1" name="sp-fw-a_ipages_1" title="連續翻頁的數量" />頁\
                            <input type="button" value="開始" title="現在立即開始連續翻頁" id="sp-fw-a_starti" />\
                        </li>\
                    </ul>\
                </fieldset>\
                <div id="sp-fw-foot">\
                 <input type="checkbox" id="sp-fw-enable" title="總開關,啟用js,否則禁用." name="sp-fw-enable"/>啟用\
                 <span id="sp-fw-savebutton" class="sp-fw-spanbutton" title="保存設置">保存</span>\
                </div>\
            </div>\
        </div>\
    ',
    noticeDiv_style: '\
        position:fixed!important;\
        z-index:2147483647!important;\
        float:none!important;\
        width:auto!important;\
        height:auto!important;\
        font-size:13px!important;\
        padding:3px 20px 2px 5px!important;\
        background-color:#7f8f9c!important;\
        border:none!important;\
        color:#000!important;\
        text-align:left!important;\
        left:0!important;\
        bottom:0!important;\
        opacity:0;\
        -moz-border-radius:0 6px 0 0!important;\
        border-radius:0 6px 0 0!important;\
        -o-transition:opacity 0.3s ease-in-out;\
        -webkit-transition:opacity 0.3s ease-in-out;\
        -moz-transition:opacity 0.3s ease-in-out;\
    ',
    separator_style: '\
        div.sp-separator{\
            line-height:1.6!important;\
            opacity:1!important;\
            position:relative!important;\
            float:none!important;\
            top:0!important;\
            left:0!important;\
            /*z-index:1000!important;*/\
            min-width:366px!important;\
            width:auto!important;\
            text-align:center!important;\
            font-size:14px!important;\
            display:block!important;\
            padding:3px 0!important;\
            margin:5px 10px 8px!important;\
            clear:both!important;\
            border-top:1px solid #ccc!important;\
            border-bottom:1px solid #ccc!important;\
            -moz-border-radius:30px!important;\
            border-radius:30px!important;\
            background-color:#F5F5F5!important;\
            -moz-box-shadow:inset 0 16px 20px #fff,0 2px 3px rgba(0,0,0,0.1);\
            -webkit-box-shadow:inset 0 16px 20px #fff,0 2px 3px rgba(0,0,0,0.1);\
            box-shadow:inset 0 16px 20px #fff,0 2px 3px rgba(0,0,0,0.1);\
        }\
        div.sp-separator img{\
            vertical-align:middle!important;\
            cursor:pointer!important;\
            padding:0!important;\
            margin:0 5px!important;\
            border:none!important;\
            display:inline-block!important;\
            float:none!important;\
        }\
        div.sp-separator a.sp-sp-nextlink{\
            margin:0 20px 0 -6px!important;\
            display:inline!important;\
            text-shadow:#fff 0 1px 0!important;\
            background:none!important;\
        }\
        div.sp-separator span.sp-span-someinfo{\
            position:absolute!important;\
            right:16px!important;\
            bottom:1px!important;\
            font-size:10px!important;\
            text-shadow:white 0 1px 0!important;\
            color:#5A5A5A!important;\
            font-style:italic!important;\
            z-index:-1!important;\
            background:none!important;\
        }\
    ',
    manualAdiv_style:'\
        #sp-sp-manualdiv{\
            line-height:1.6!important;\
            opacity:1!important;\
            position:relative!important;\
            float:none!important;\
            top:0!important;\
            left:0!important;\
            z-index:1000!important;\
            min-width:366px!important;\
            width:auto!important;\
            text-align:center!important;\
            font-size:14px!important;\
            padding:3px 0!important;\
            margin:5px 10px 8px!important;\
            clear:both!important;\
            border-top:1px solid #ccc!important;\
            border-bottom:1px solid #ccc!important;\
            -moz-border-radius:30px!important;\
            border-radius:30px!important;\
            background-color:#F5F5F5!important;\
            -moz-box-shadow:inset 0 10px 16px #fff,0 2px 3px rgba(0,0,0,0.1);\
            -webkit-box-shadow:inset 0 10px 16px #fff,0 2px 3px rgba(0,0,0,0.1);\
            box-shadow:inset 0 10px 16px #fff,0 2px 3px rgba(0,0,0,0.1);\
        }\
        .sp-sp-md-span{\
            font-weight:bold!important;\
            margin:0 5px!important;\
        }\
        #sp-sp-md-number{\
            width:50px!important;\
            vertical-align:middle!important;\
            display:inline-block!important;\
            text-align:left!important;\
        }\
        #sp-sp-md-imgnext{\
            padding:0!important;\
            margin:0 0 0 5px!important;\
            vertical-align:middle!important;\
            display:inline-block!important;\
        }\
        #sp-sp-manualdiv:hover{\
            cursor:pointer;\
        }\
        #sp-sp-md-someinfo{\
            position:absolute!important;\
            right:16px!important;\
            bottom:1px!important;\
            font-size:10px!important;\
            text-shadow:white 0 1px 0!important;\
            color:#5A5A5A!important;\
            font-style:italic!important;\
            z-index:-1!important;\
            background:none!important;\
        }\
    ',
    //動畫庫
    Tween: {
        Linear: function(t, b, c, d) {
            return c * t / d + b;
        },
        Quad: {
            easeIn: function(t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            easeOut: function(t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            easeInOut: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t + b;
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            }
        },
        Cubic: {
            easeIn: function(t, b, c, d) {
                return c * (t /= d) * t * t + b;
            },
            easeOut: function(t, b, c, d) {
                return c * ((t = t / d - 1) * t * t + 1) + b;
            },
            easeInOut: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
                return c / 2 * ((t -= 2) * t * t + 2) + b;
            }
        },
        Quart: {
            easeIn: function(t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            },
            easeOut: function(t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            },
            easeInOut: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
                return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
            }
        },
        Quint: {
            easeIn: function(t, b, c, d) {
                return c * (t /= d) * t * t * t * t + b;
            },
            easeOut: function(t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            },
            easeInOut: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
                return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
            }
        },
        Sine: {
            easeIn: function(t, b, c, d) {
                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
            },
            easeOut: function(t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            },
            easeInOut: function(t, b, c, d) {
                return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
            }
        },
        Expo: {
            easeIn: function(t, b, c, d) {
                return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
            },
            easeOut: function(t, b, c, d) {
                return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
            },
            easeInOut: function(t, b, c, d) {
                if (t == 0) return b;
                if (t == d) return b + c;
                if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
            }
        },
        Circ: {
            easeIn: function(t, b, c, d) {
                return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
            },
            easeOut: function(t, b, c, d) {
                return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
            },
            easeInOut: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
            }
        },
        Elastic: {
            easeIn: function(t, b, c, d, a, p) {
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (!a || a < Math.abs(c)) {
                    a = c;
                    var s = p / 4;
                } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            },
            easeOut: function(t, b, c, d, a, p) {
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (!a || a < Math.abs(c)) {
                    a = c;
                    var s = p / 4;
                } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
            },
            easeInOut: function(t, b, c, d, a, p) {
                if (t == 0) return b;
                if ((t /= d / 2) == 2) return b + c;
                if (!p) p = d * (.3 * 1.5);
                if (!a || a < Math.abs(c)) {
                    a = c;
                    var s = p / 4;
                } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
            }
        },
        Back: {
            easeIn: function(t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * (t /= d) * t * ((s + 1) * t - s) + b;
            },
            easeOut: function(t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },
            easeInOut: function(t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
            }
        },
        Bounce: {
            easeIn: function(t, b, c, d) {
                return c - this.Tween.Bounce.easeOut(d - t, 0, c, d) + b;
            },
            easeOut: function(t, b, c, d) {
                if ((t /= d) < (1 / 2.75)) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                } else if (t < (2.5 / 2.75)) {
                    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                } else {
                    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                }
            },
            easeInOut: function(t, b, c, d) {
                if (t < d / 2) return this.Tween.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
                else return this.Tween.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
            }
        }
    },
    TweenM: [
        'Linear',
        'Quad',
        'Cubic',
        'Quart',
        'Quint',
        'Sine',
        'Expo',
        'Circ',
        'Elastic',
        'Back',
        'Bounce'
    ],
    TweenEase: [
        'easeIn',
        'easeOut',
        'easeInOut'
    ]
};


function updateIcon(){
    var tooltiptext = "";
    var button_image = "";
    if (ns.AUTO_START == false) {
        newState = "off";
        tooltiptext = "自動翻頁已關閉";
        button_image = BUTTON_IMG_DISABLE;
    } else {
        tooltiptext = "自動翻頁已啟用";
        button_image = BUTTON_IMG_ENABLE;
    }
    ns.icon.setAttribute('tooltiptext', tooltiptext);
    ns.icon.setAttribute("image", button_image);
}


function log(){ Application.console.log('[uSuper_preloader] ' + $A(arguments)); }
function $(id, doc) (doc || document).getElementById(id);
function $A(arr) Array.slice(arr);
function $C(name, attr) {
    var el = document.createElement(name);
    if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
    return el;
}

function alerts(title, info){
    Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService)
        .showAlertNotification(null, title, info, false, "", null, "");
}

function checkDoc(doc) {
    if (!(doc instanceof HTMLDocument)) return false;
    if (!window.mimeTypeIsTextBased(doc.contentType)) return false;
    if (!doc.body || !doc.body.hasChildNodes()) return false;
    if (doc.body instanceof HTMLFrameSetElement) return false;
    return true;
}

function GM_xmlhttpRequest(obj, win) {
    if(typeof(obj) != 'object' || (typeof(obj.url) != 'string' && !(obj.url instanceof String))) return;

    if(win){
        var baseURI = Services.io.newURI(win.location.href, null, null);
        obj.url = Services.io.newURI(obj.url, null, baseURI).spec;
    }

    var req = new XMLHttpRequest();
    req.open(obj.method || 'GET',obj.url,true);
    if(typeof(obj.headers) == 'object') for(var i in obj.headers) req.setRequestHeader(i,obj.headers[i]);
    ['onload','onerror','onreadystatechange'].forEach(function(k) {
        if(obj[k] && (typeof(obj[k]) == 'function' || obj[k] instanceof Function)) req[k] = function() {
            obj[k]({
                __exposedProps__: {
                    status: "r",
                    statusText: "r",
                    responseHeaders: "r",
                    responseText: "rw",
                    readyState: "r",
                    finalUrl: "r"
                },
                status          : (req.readyState == 4) ? req.status : 0,
                statusText      : (req.readyState == 4) ? req.statusText : '',
                responseHeaders : (req.readyState == 4) ? req.getAllResponseHeaders() : '',
                responseText    : req.responseText,
                readyState      : req.readyState,
                finalUrl        : (req.readyState == 4) ? req.channel.URI.spec : '' });
        };
    });

    if(obj.overrideMimeType) req.overrideMimeType(obj.overrideMimeType);

    var c = 0;
    var timer = setInterval(function() { if(req.readyState == 1 || ++c > 100) { clearInterval(timer); req.send(obj.data || null); } },10);
}

function loadText(aFile) {
    if (!aFile.exists() || !aFile.isFile()) return null;
    var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
    var sstream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
    fstream.init(aFile, -1, 0, 0);
    sstream.init(fstream);
    var data = sstream.read(sstream.available());
    try { data = decodeURIComponent(escape(data)); } catch(e) {}
    sstream.close();
    fstream.close();
    return data;
}

function toRE(obj) {
    if (obj instanceof RegExp) {
        return obj;
    } else if (obj instanceof Array) {
        return new RegExp(obj[0], obj[1]);
    } else {
        if (typeof(obj) == 'string' && obj.search(/^wildc;/i) == 0) {
            obj = '^' + ((obj.slice(6))
                .replace(/\\/g, '\\\\')
                .replace(/\+/g, '\\+')
                .replace(/\./g, '\\.')
                .replace(/\?/g, '\\?')
                .replace(/\{/g, '\\{')
                .replace(/\}/g, '\\}')
                .replace(/\[/g, '\\[')
                .replace(/\]/g, '\\]')
                .replace(/\^/g, '\\^')
                .replace(/\$/g, '\\$')
                .replace(/\*/g, '.*')
                .replace(/\(/g, '\\(')
                .replace(/\)/g, '\\)')
                .replace(/\|/g, '\\|')
                .replace(/\//g, '\\/')) + '$';
        }
        //alert(obj);
        return new RegExp(obj);
    };
}

//任何轉成字符串,存儲
function xToString(x){
    function toStr(x){
        //alert(typeof x);
        switch(typeof x){
            case 'undefined':{
                return Str(x);
            }break;
            case 'boolean':{
                return Str(x);
            }break;
            case 'number':{
                return Str(x);
            }break;
            case 'string':{
                return ('"'+
                    (x.replace(/(?:\r\n|\n|\r|\t|\\|")/g,function(a){
                        var ret;
                        switch(a){//轉成字面量
                            case '\r\n':{
                                ret='\\r\\n'
                            }break;
                            case '\n':{
                                ret='\\n';
                            }break;
                            case '\r':{
                                ret='\\r'
                            }break;
                            case '\t':{
                                ret='\\t'
                            }break;
                            case '\\':{
                                ret='\\\\'
                            }break;
                            case '"':{
                                ret='\\"'
                            }break;
                            default:{
                            }break;
                        };
                        return ret;
                    }))+'"');
                //'"'+x.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"';
            }break;
            case 'function':{
                /*
                var fnName=x.name;
                if(fnName && fnName!='anonymous'){
                    return x.name;
                }else{
                    var fnStr=Str(x);
                    return fnStr.indexOf('native code')==-1? fnStr : 'function(){}';
                };
                */
                var fnStr=Str(x);
                return fnStr.indexOf('native code')==-1? fnStr : 'function(){}';
            }break;
            case 'object':{//注,object的除了單純{},其他的對象的屬性會造成丟失..
                if(x===null){
                    return Str(x);
                };
                //alert(x.constructor);
                switch(x.constructor){
                    case Object:{
                        var i;
                        var rStr='';
                        for(i in x){
                            //alert(i);
                            if(!x.hasOwnProperty(i)){//去掉原型鏈上的屬性.
                                //alert(i);
                                continue;
                            };
                            rStr+=toStr(i)+':'+toStr(x[i])+',';
                        };
                        return ('{'+rStr.replace(/,$/i,'')+'}');
                    }break;
                    case Array:{
                        var i;
                        var rStr='';
                        for(i in x){
                            //alert(i);
                            if(!x.hasOwnProperty(i)){//去掉原型鏈上的屬性.
                                //alert(i);
                                continue;
                            };
                            rStr+=toStr(x[i])+',';
                        };
                        return '['+rStr.replace(/,$/i,'')+']';
                    }break;
                    case String:{
                        return toStr(Str(x));
                    }break;
                    case RegExp:{
                        return Str(x);
                    }break;
                    case Number:{
                        return Str(x);
                    }break;
                    case Boolean:{
                        return Str(x);
                    }break;
                    default:{
                        //alert(x.constructor);//漏了什麼類型麼?
                    }break;
                };
            }break;
            default:break;
        };
    };
    var Str=String;
    return toStr(x);
}

})();


window.uSuper_preloader.init();
