// ==UserScript==
// @name                 TabOpenBrowserAutoFocus.uc.js
// @description       ���}�s�����۰ʻE�J�s������
// @author               skofkyo
// @license               MIT License
// @compatibility    Firefox 29+
// @charset              UTF-8
// @version              2016.7.16            
// @include              main
// @include              chrome://browser/content/browser.xul
// ==/UserScript==
gBrowser.tabContainer.addEventListener('TabSelect' /*��ťTabOpen��TabSelect*/ , function() {
    if (/^(about|http|file|chrome)/.test(gBrowser.selectedBrowser.currentURI.spec)) {
        setTimeout(function() {
            gBrowser.selectedBrowser.focus();
        }, 0);
    }
}, false);