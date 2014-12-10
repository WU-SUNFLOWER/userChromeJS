// ==UserScript==
// @name                 Homebutton.uc.js
// @description       首頁按鈕
// @namespace    
// @author               skofkyo
// @license               MIT License
// @compatibility    Firefox 29+
// @charset              UTF-8
// @version              2014.11.26
// @startup        
// @shutdown       
// @config         
// @homepageURL    
// @ohomepageURL    
// @reviewURL    
// @downloadURL    
// @note                   
// @include              main
// @include              chrome://browser/content/browser.xul
// ==/UserScript==

(function () {
    CustomizableUI.createWidget({
        id : "Home-button",
        defaultArea : CustomizableUI.AREA_NAVBAR,
        label : "新首頁",
        tooltiptext : "左鍵：原始首頁\n中鍵：百度\n右鍵：Google",
        onClick : function (event) {
            switch (event.button) {
            case 0:
               gBrowser.selectedTab = BrowserGoHome(event);
                break;
            case 1:
                gBrowser.selectedTab = gBrowser.addTab("http://www.baidu.com/");
                break;
            case 2:
                gBrowser.selectedTab = gBrowser.addTab("http://www.google.com/"); 
                break;
            }
        }
    });
    
    var btn = document.querySelector("#Home-button");
    btn.setAttribute("context", "_child");

    var cssStr = '@-moz-document url("chrome://browser/content/browser.xul"){'
         +'#Home-button .toolbarbutton-icon {list-style-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACY0lEQVQ4jYWSXUiTYRiG7/f7nfg5/NzcckQFkdKIpZhkVJoWiKx24EEWaXUgFBFiUQR1IJ4EUYRIRGkHmfQLBYWyiDIUBosKbYmkRxWx2Pyb27dN2fyeDtSR8+85eZ/35r6v9+HlYViliMgAIGfhOskYm1nNu1LYSES2guLyjoLi8g4ishGRcSUvt0LY1Ofxmu0lFe2SJDdIktxgL6lo7/N4zURkSveztLD1QedT0822e4+ULGNR2d7S+wDQ7/Ge0SLhgcuNZ082nDo+wRgLLAMQka3pSvMW94f+x6qq5riqD932fhm0A0DprsLhN+73F6empiarD5adaL3R8pMx5k8BiMh27PS5Qt/wSFduriVeW+O89ar7XZ0+N1cMABzPD9Ycqep8/rL70thYMMNhL6h/9vDuIGPMz4jIVnn4qDMwHmrbvGnj6IF9e5687e2/kGEwWI2KAgCIaFHE4rGxqsr9rX2eT7W/fv/Jt5qzG3u7X/Sw3ZWua6FItKVo546eDRbLyNCP0SYlUxGNxixIkgQASCQSCIfD0LRoYnv+1rbg+Pi2gW9DzuyszGZGRA4AeQAmKlx1n61WCxRFgSiKS347mUwiomkIBIL4+LqrBIAJwF+BMeYjou8A8mSDAaqqgud5JJNJxGdmAQAZBhmyLEMQBIRC0wDgB/CVMUbC/68IoghRlgEA0YiGrjvXqwGg/vxVt6pmgxMECGmTLQFwHAee5+cB0RgA+BZ7s9mU8qwB4MHz85Ku6yld1/WUznH8WgCWmoDj2Lr6MkAsPovQdCTVr6cDaasMwIGl5Vs4l+mLq/wPSgHx6qqiTssAAAAASUVORK5CYII=)}'
         +'}';
    var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
    var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    sss.loadAndRegisterSheet(ios.newURI("data:text/css;base64," + btoa(cssStr), null, null), sss.USER_SHEET);

})();

