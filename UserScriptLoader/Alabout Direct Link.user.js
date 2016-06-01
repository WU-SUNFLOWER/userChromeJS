// ==UserScript==
// @name        Alabout Direct Link
// @description Strips jump page.
// @namespace   sandbox
// @include     http://*alabout.com/*
// @version     1
// @grant       none
// ==/UserScript==

(function () {
  'use strict';

  var links = document.querySelectorAll('a');
  Array.prototype.forEach.call(links, function (a) {
    var b = a.href.match(/^http:\/\/(www\.)?alabout\.com\/j\.phtml\?url=(.+)$/);
    if (b) {
      a.href = decodeURIComponent(b[2]).replace("<span class=scolor>", "").replace("</span>", "");
    }
  });
})();
