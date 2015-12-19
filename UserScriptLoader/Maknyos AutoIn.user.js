// ==UserScript==
// @name           Maknyos AutoIn
// @namespace      http://userscripts.org/scripts/show/91629
// @version        3.3
// @description    Auto submit to get link
// @homepageURL    https://greasyfork.org/scripts/97
// @author         Idx
// @include        http://*.fileswap.com/*
// @include        /^https?://(.+\.)2shared.com/*/
// @include        /^https?://(.+\.)zippyshare.com/v/*/
// @include        /^https?://(|www\.)mediafire.com/*/
// @include        /^https?://(|www\.)sendspace.com/file/*/
// @include        /^https?://(|www\.)firedrive.com/*/
// @include        /^https?://(|www\.)uptobox.com/*/
// @include        /^https?://(|www\.)howfile.com/file/*/
// @include        /^https?://(|www\.)uppit.com/*/
// @include        /^https?://(|\w+\.)idup.in/*/
// @include        /^https?://(|www\.)sharebeast.com/*/
// @include        /^https?://(|www\.)imzupload.com/*/
// @include        /^https?://(|www\.)jumbofiles.com/*/
// @include        /^https?://(|www\.)sendmyway.com/*/
// @include        /^https?://(|www\.)tusfiles.net/*/
// @include        /^https?://(|www\.)dropbox.com/s/*/
// @include        /^https?://(|www\.)solidfiles.com/d/*/
// @include        /^https?://(|www\.)yadi.sk/i/*/
// @include        /^https?://app.box.com/s/*/
//
// ==/UserScript==



(function() {
  var gvar=function(){};
  gvar.__DEBUG__ = !1;

  function MaknyosHelper(baseURI){
    this.baseURI=baseURI;
    this.domain=null;
    this.action=new Actions();
  }
  MaknyosHelper.prototype = {
    matchDomain: function(){
      var domain = this.baseURI.match(/^https?:\/\/([^\/]+)\//);
      if(domain)
        this.domain=domain[1];
      return this;
    },

    matchAction: function(){
      if(this.domain)
        this.action.find(this.domain);
      return this;
    },

    invokeAction: function(){
      if(this.action.invoked)
        this.action.invoked();
      return this;
    },
  };


  function Actions(){
    this.invoked=null;
  }
  Actions.prototype = {
    find: function(domain){
      this.clog('Actions:find, domain='+domain);

      var isMatch;
      var pattern;
      for(var key in this.patterns){
        pattern = this.patterns[key];
        this.clog('pattern-check: '+pattern.rule+' vs '+domain);
        isMatch = typeof pattern.rule === 'string' ? pattern.rule == domain : pattern.rule.test(domain);
        if(isMatch){
          this.invoked = pattern.run;
          return;
        }
      }
    },

    get_href: function(){
      return location.href;
    },
    set_href: function(x){
      location.href = x;
    },

    // do waitwhat -> thenwhat
    waitforit: function(waitwhat, thenwhat, delay){
      var stoWait,
        itry = 0,
        maxtry = 100,
        thenwhatwrap = function(){
          ('function' == typeof thenwhat ) &&
            thenwhat();
        };
      
      if( !delay )
        delay = 0;

      if('function' == typeof waitwhat){
        var waitwrap = function(){
          itry++;
          if( waitwhat() ){
            stoWait && clearTimeout( stoWait )
            thenwhatwrap();
          }
          else{
            if( itry < maxtry )
              waitwrap()
          }
        },
        stoWait = setTimeout(waitwrap, delay+1000);
      }
      else
        thenwhatwrap();
    },

    // load url to an iframe
    frameload: function(url){
      var body, cb_fn, idfrm = 'xMNyFrame';
      var iframe = document.createElement('iframe');
      
      if( g('#'+idfrm) )
        g('#'+idfrm).removeChild()
      iframe.setAttribute('id', idfrm);
      iframe.setAttribute('title', "iFrame of "+idfrm+"; src="+url);
      iframe.setAttribute('style', 'position:absolute; z-index:999999; '+(gvar.__DEBUG__ ? 'border:1px solid #000; width:100%;' : 'border:0; height:0; width:0; left:-9999; bottom:9999'));
      iframe.setAttribute('src', url);

      body = g('body');
      if( gvar.__DEBUG__ )
        body.insertBefore(iframe, body.firstChild);
        else
        g('body').appendChild(iframe);

      if( g('#idfrm') )
        this.clog("iframe created, src="+url);
      else
        this.clog("error while creating iframe");
    },
    // resize capcay
    rezCapcay: function(target, dims){
      if(!target) return;
      if(dims.length){
        var styleStr='';
        dims[0] && (styleStr += 'width:'+dims[0]+'px;');
        dims[1] && (styleStr += 'height:'+dims[1]+'px;');
        target.setAttribute('style', styleStr);
      }
    },

    disableWindowOpen: function(){
      if(unsafeWindow){
        unsafeWindow.open = function(){};
      }

      if(window){
        window.open = function(){};
      }
    },

    // brutaly kill frames
    killframes: function(par){
      !par && (par = document);
      var o = par.getElementsByTagName('iframe');
      for(var i=o.length-1;i>=0;i--)
        o[i].parentNode.removeChild(o[i]);

      this.clog("killframes done");
    },

    show_alert: function(msg, force) {
      if(arguments.callee.counter) {
        arguments.callee.counter++
      }else {
        arguments.callee.counter = 1
      }
      if("function" == typeof GM_log)
        GM_log("(" + arguments.callee.counter + ") " + msg);
      else
        console && console.log && console.log(msg);
      if( force == 0 )
        return
    },
    clog: function(x){
      if( !gvar.__DEBUG__ )
        return
      x && this.show_alert(["string","number"].indexOf(typeof x) != -1 ? x : JSON.stringify(x))
    }
  };
  Actions.prototype.patterns = {
    sendspace: {
      rule: /sendspace\.com/,
      run: function(){
        this.clog('inside sendspace');
        g('#download_button') && SimulateMouse(g('#download_button'), "click", true);
      }
    },

    zippyshare: {
      rule: /zippyshare\.com/,
      run: function(){
        this.clog('inside zippyshare');
        var btn = g("[alt*=Download]");
        if( btn ) {
          btn = btn.parentNode;

          this.waitforit(function(){

            return /(?:\.zippyshare\.com)?\/d\/.+/.test( btn.getAttribute("href") );
          }, function(){

            btn && SimulateMouse(btn, "click", true);
          });
        }
      }
    },

    mediafire: {
      rule: /mediafire\.com/,
      run: function(){

        var dcg, selector, that, is_match_path = /mediafire\.com\/(view|download)\b/;
        that = this;

        if( !is_match_path.test(that.get_href()) ) return;
        that.clog('inside mediafire, '+that.get_href());

        setTimeout(function(){ that.killframes() }, 123);

        if( dcg = g("#docControlGroup") ){
          selector = './/a[contains(@target,"_blank")]';
          selector = xp(selector, dcg, true);
          selector && that.set_href(selector.getAttribute('href'))
        }
        else {
          that.waitforit(function(){
            return g('.download_link a');
          }, function(){
            SimulateMouse(g('.download_link a'), "click", true);
          }, 100);
        }
      }
    },

    fileswap: {
      rule: /\.fileswap\.com/,
      run: function(){
        this.clog('inside fileswap');
        var tgtBtn = null;
        if( g("#share_index_dlslowbutton") )
          tgtBtn = g("#share_index_dlslowbutton");
        else if( g('[value="DOWNLOAD ALL"]') ){
          tgtBtn = g('[value="DOWNLOAD ALL"]');
        }
        tgtBtn && SimulateMouse(tgtBtn, "click", true);
      }
    },

    '2shared': {
      rule: /\b2shared\.com/,
      run: function(){
        this.clog('inside 2shared;');

        var that = this;
        this.waitforit(function(){

          return g("#dlBtn");
        }, function(){
          that.frameload(g("#dlBtn").getAttribute('href'))
        }, 234);
      }
    },

    firedrive: {
      rule: /firedrive\.com/,
      run: function(){

        var sTryWait, that = this;
        var is_login = g('#profile_top_btn');
        var btnDownload = ( is_login ? g('.external_download_button') : g('#prepare_continue_btn') );
        var wait_for_it = function(btn){
          if( btn.className.indexOf('prepare_btn_done') !== -1 ){
            sTryWait && clearInterval( sTryWait );
            SimulateMouse(btn, "click", true);
          }
          else
            return false;
        };
        if( btnDownload ){
          if( !is_login )
            sTryWait = setInterval(function(){
              wait_for_it(btnDownload);
            }, 100);
          else
            SimulateMouse(btnDownload, "click", true);
        }
        else{
          if( !is_login ){
            setTimeout(function(){
              btnDownload = g('a[href*="dl.firedrive.com"]');
              that.frameload( btnDownload.getAttribute("href") );
            }, 567)
          }
          else{
              // step-1
              if(btnDownload = g('#archive_download_button'))
                SimulateMouse(btnDownload, "click", true);
          }
        }
      }
    },

    uptobox: {
      rule: /uptobox\.com/,
      run: function(){

        this.clog('inside uptobox');

        var btnDownload = g('[type=submit][value*="ownload"]');
        if( btnDownload ){
          SimulateMouse(btnDownload, "click", true);
        }
        else{
          btnDownload = g('#countdown_str');
          if( btnDownload ){
            this.clog('disabled='+btnDownload.getAttribute('disabled'));
            if( btnDownload.getAttribute('disabled') ){

              // do downoad
            }
            else{
              var waitstr = String(g('#countdown_str').textContent).replace(/[\s\W]/g,'').toLowerCase();
              this.clog(waitstr);
              if( cucok = /(?:[a-zA-Z]+)?(\d+)(?:[a-zA-Z]+)?/.exec(waitstr) ){
                this.clog(cucok);

                this.waitforit(function(){
                  return g('#btn_download');
                }, function(){
                  SimulateMouse(g('#btn_download'), "click", true);
                }, parseInt(cucok[1] * 1000));

              }
            }
          }
          else if( g('.button_upload') ){
            SimulateMouse(g('.button_upload'), "click", true);
          }else{
            this.clog('tpl-changed, mismatch element');
          }
        }
      }
    },

    howfile: { // defect
      rule: /howfile\.com/,
      run: function(){
        this.clog('inside howfile');
        var selector = '//a[contains(.,"Download")]';
        this.waitforit(function(){

          return xp(selector, null, true);
        }, function(){
          btnDownload = xp(selector, null, true);
          btnDownload && SimulateMouse(btnDownload, "click", true);

          var dtable = g("#downloadtable");

          btnDownload = xp('//a[contains(@href, "/downfile/")]', dtable, true);
          btnDownload && SimulateMouse(btnDownload, "click", true);
        }, 234);
      }
    },

    uppit: {
      rule: /uppit\.com/,
      run: function(){
        this.clog('inside uppit');
        var countdown = g('#countdown');
        var cucok, waitFor, scripts;
        if( countdown ){
          scripts = document.getElementsByTagName( 'script' );
          for( var i = 0; i < scripts.length; ++i ) {
            if( cucok = /\bcount\s*=\s*(\d+)/.exec(scripts[i].innerHTML)) {
              waitFor = parseInt(cucok[1]);
              break;
            }
          }

          if( waitFor ){

            this.waitforit(function(){
              return !g('#countdown');
            }, function(){
              SimulateMouse(g('#btn_download'), "click", true);
            }, waitFor * 1000);
          }
        }
        else{
          SimulateMouse(g('.m-btn'), "click", true);
        }
      }
    },

    idup: {
      rule: /idup\.in|download\.idup\.in/,
      run: function(){
        this.clog('inside idup');
        var btnDownload;

        if( btnDownload = g("#btn_download") ){
          this.waitforit(function(){

            return g("#btn_download");
          }, function(){
            btnDownload = g("#btn_download");
            btnDownload && SimulateMouse(btnDownload, "click", true);
          }, 10);
        }
        else{
          btnDownload = xp('//a[contains(.,"Download:")]',null,true)
          btnDownload && SimulateMouse(btnDownload, "click", true);
        }
      }
    },

    sharebeast: {
      rule: /sharebeast\.com/,
      run: function(){
        this.clog('inside sharebeast');
        g(".download-file1") && SimulateMouse(g(".download-file1"), "click", true);
      }
    },

    imzupload: {
      rule: /imzupload\.com/,
      run: function(){
        this.clog('inside imzupload');

        var btnDownload = g('[type="submit"][name="method_free"]',null,true);
        this.clog('method_free='+btnDownload);
        if( btnDownload ){
          SimulateMouse(btnDownload, "click", true);
        }
        else{
          g('.tbl1') &&
            g('.tbl1').setAttribute('style','display:none;');
          var imgcapcay, tbcacay = g('.captcha');
          if( tbcacay )
            imgcapcay = g('img', tbcacay);

          if( imgcapcay ){
            this.rezCapcay(imgcapcay, [null, 100]);
            g('[type=text]',tbcacay).focus();
          }
          else{
            var main = g('[role=main]');
            var btnDownload = xp('//a[contains(@href,"imzupload.com/files")]',main,true);
            btnDownload && this.frameload(btnDownload.getAttribute('href'))
          }
        }
      }
    },


    tusfiles: {
      rule: /tusfiles\.net/,
      run: function(){

        // prevent page to load, submission
        var maxTry = 3, iTry=0, sTryStop;
        var cb_pagestop = function(){
          var el = g('[name=quick]');
          if( el ){
            el.removeAttribute('checked');
            el.parentNode.removeChild(el);
          }

          el = g('[name=F1]');
          el && el.submit();
        };

        sTryStop = setInterval(function(){
          window.stop();
          iTry++;

          if( iTry > maxTry ){
            sTryStop && clearInterval( sTryStop );
            if("function" == typeof cb_pagestop)
              cb_pagestop()
          }
        }, 10);
      }
    },

    jumbofiles: {
      rule: /jumbofiles\.com/,
      run: function(){
        this.clog('inside jumbofiles, method not found');
      }
    },

    sendmyway: {
      rule: /sendmyway\.com/,
      run: function(){
        this.clog('inside sendmyway');
        var adcopy = g('#adcopy_response');
        var btnDownload = g('#download_link');
        if( !adcopy && !btnDownload ){
          this.clog('adad adcopy');
          g(".down-link") && SimulateMouse(g(".down-link"), "click", true);
        }
        else{
          if( !btnDownload ){
            adcopy.focus();
          }
          else{
            var dd = g('#direct_download');
            btnDownload = g('#download_link', dd);
            this.frameload(btnDownload.getAttribute('href'))
          }
        }
      }
    },

    box: {
      rule: /app\.box\.com/,
      run: function(){
        var that = this;
        this.waitforit(function(){
          return xp('//button[contains(@data-type, "download-btn")]', null, true);
        }, function(){
          btnDownload = xp('//button[contains(@data-type, "download-btn")]', null, true);
          btnDownload && SimulateMouse(btnDownload, "click", true);
        }, 100);
      }
    },
    dropbox: {
      rule: /dropbox\.com/,
      run: function(){
        var btnDownload = g('*[id*=download_button]');
        btnDownload && setTimeout(function(){
          SimulateMouse(btnDownload, "click", true);
        }, 123);
      }
    },
    solidfiles: {
      rule: /solidfiles\.com/,
      run: function(){
        var href, that, btnDownload;
        that = this;

        that.clog('inside solidfiles, '+that.get_href());
        setTimeout(function(){ that.killframes() }, 123);

        // pick selector dat relevant and exist on several browsers
        if( btnDownload = g('a[class*=direct-download]') )
          setTimeout(function(){
            SimulateMouse(btnDownload, "click", true)
          }, 125);
      }
    },
    yadi: {
      rule: /yadi\.sk/,
      run: function(){
        var btnDownload;

        if( btnDownload = g('*[data-click-action="resource.download"]') ){

          // proper content ready is required, since button used some ajax on it.
          document.addEventListener('DOMContentLoaded', function() {

            setTimeout(function(){
              SimulateMouse(btnDownload, "click", true)
            }, 125);
          }, false);
        }
      }
    }
  };
  // end of patterns


  var MNy = new MaknyosHelper(document.baseURI);
  MNy.matchDomain().matchAction().invokeAction();

  // lil-helpers
  function isDefined(x) { return!(x == null && x !== null) }
  function isUndefined(x) { return x == null && x !== null }
  function SimulateMouse(elem, event, preventDef) {
    if(typeof elem != "object") 
      return;

    // is it an a element? try with iframe loader
    var is_error = null,
      href = elem.getAttribute("href");

    // make sure it's link, not some sumthin like: "javascript:;"
    if( href && /^((?:(?:ht|f)tp(?:s?)\:\/\/){1}\S+)/.test(href) ){
      try{
        MNy.action.clog("SimulateMouse trying href");
        MNy.action.frameload(href);

        is_error = false;
      }catch(e){ is_error = true }
    }
    

    // failover, just click dat button
    if( is_error || is_error === null ){
      MNy.action.clog("SimulateMouse-click with MouseEvents");
      var evObj = document.createEvent("MouseEvents");
      preventDef = isDefined(preventDef) && preventDef ? true : false;
      evObj.initEvent(event, preventDef, true);
      try {
        elem.dispatchEvent(evObj)
      }catch(e) {}
    }
  }
  function g(x, par){
    !par && (par = document);
    return ('string' == typeof x ? par.querySelector(x) : x);
  }
  function xp(q, root, single) {
    if(root && typeof root == "string") {
      root = $D(root, null, true);
      if(!root) {
        return null
      }
    }
    if(!q) {
      return false
    }
    if(typeof q == "object") {
      return q
    }
    root = root || document;
    if(q[0] == "#") {
      return root.getElementById(q.substr(1));
    }else {
      if(q[0] == "/" || q[0] == "." && q[1] == "/") {
        if(single) {
          return document.evaluate(q, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
        }
        return document.evaluate(q, root, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
      }else {
        if(q[0] == ".") {
          return root.getElementsByClassName(q.substr(1))
        }
      }
    }
    return root.getElementsByTagName(q)
  };  
})();
/* eof. */