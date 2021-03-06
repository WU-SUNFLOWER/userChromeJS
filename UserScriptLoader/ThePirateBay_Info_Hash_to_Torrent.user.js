/**
  The MIT License (MIT)

  Copyleft (c) 2013 Dalin <dln@null.net>

  Permission is hereby granted, free of charge, to any person obtaining a copy of
  this software and associated documentation files (the "Software"), to deal in
  the Software without restriction, including without limitation the rights to
  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
  the Software, and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// ==UserScript==
// @id            TPB Hash to Torrent
// @namespace   ee0c910453f39da6e7fab13713d8011a
// @name          ThePirateBay Info Hash to Torrent
// @version       0.1
// @author        Dalin <dln@null.net>
// @description   Converts ThePirateBay's info hash to multiple torrent cache links
// @icon	  https://thepiratebay.org/static/img/icons/dl.gif
// @include	  *://thepiratebay.org/*
// @include	  *://gameofbay.org/*
// @include	  *://unblockedbay.info/*
// @include	  *://tpbunblocked.org/*
// @include	  *://thepiratebay.uk.net/*
// @include	  *://piratebay.red/*
// @include	  *://piratebay.click/*
// @include	  *://pirateproxy.click/*
// @include	  *://thebay.tv/*
// @include	  *://thepiratebay-proxy.com/*
// @include	  *://pirateproxy.yt/*
// @include	  *://piratebays.co.uk/*
// @include	  *://ukpirate.org/*
// @include	  *://piratebays.co/*
// @include	  *://pirateproxy.online/*
// @include	  *://piratebaymirror.eu/*
// @include	  *://piratebay.host/*
// @include	  *://pirateproxy.wf/*
// @include	  *://pirate.trade/*
// @include	  *://fastpiratebay.co.uk/*
// @include	  *://pirateproxy.tf/*
// @include	  *://piratebayproxy.tf/*
// @include	  *://ukpirateproxy.xyz/*
// @include	  *://urbanproxy.eu/*
// @include	  *://thepiratebay.tech/*
// @include	  *://ukpirate.click/*
// @include	  *://tpbmirror.us/*
// @grant	  none
// ==/UserScript==

function runHashToLink(){
	var dlList = document.getElementsByTagName('dl');
	var i = 0;
	var dlElem = dlList[0].innerHTML;
	var start = dlElem.lastIndexOf('</dd>') + 5;
	var hash = dlElem.substring(start);
	hash = hash.replace(/\s+/g, '');
	if(hash == ''){
		dlElem = dlList[1].innerHTML;
		start = dlElem.lastIndexOf('</dd>') + 5;
		hash = dlElem.substring(start);
		hash = hash.replace(/\s+/g, '');	
	}
	var div = document.getElementsByTagName('div');
	for(i = 0; div[i].className != 'download'; i++);
	div = div[i];
	var torrentCache = new Array('itorrents.org');
	for(i = 0; i < torrentCache.length; i++){			
		var a = document.createElement('a');			
		a.href = 'http://' + torrentCache[i] + '/torrent/' + hash + '.torrent';
		a.innerHTML = torrentCache[i];
		div.appendChild(a);
	}
	var style = document.createElement('style');
	style.innerHTML = '.download a {margin-right:10px;}';
	div.appendChild(style);
}
window.addEventListener("load", function(e) {
	runHashToLink();
}, false);
