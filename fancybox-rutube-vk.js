;(function(){
  try {
    var F = (typeof window !== 'undefined' && (window.Fancybox || (window.window && window.window.Fancybox))) || null;
    if (!F || !F.Plugins || !F.Plugins.Html) return;

    // Inject provider-specific styles into <head> once
    try {
      var STYLE_ID = 'fancybox-rutube-vk-styles';
      if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
        var css = ''+
          '.has-rutube .fancybox__content,\n'+
          '.has-vk .fancybox__content {\n'+
          '  width: 960px;\n'+
          '  height: 540px;\n'+
          '  max-width: 100%;\n'+
          '  max-height: 100%;\n'+
          '  padding: 0;\n'+
          '  background: rgba(24,24,27,.9);\n'+
          '  color: #fff;\n'+
          '}\n';
        var styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.type = 'text/css';
        styleEl.appendChild(document.createTextNode(css));
        document.head && document.head.appendChild(styleEl);
      }
    } catch(_s) {}

    var Html = F.Plugins.Html;
    var TYPE_RUTUBE = 'rutube';
    var TYPE_VK = 'vk';

    var rxRutubeEmbed = /(?:^|\/)rutube\.ru\/play\/embed\/([a-z0-9\-]+)/i;
    var rxRutube = /(?:^|\/)rutube\.ru\/(?:video|shorts)\/([a-z0-9\-]+)/i;
    var rxVkExt = /(?:^|\/)(?:player\.)?vk\.com\/video_ext\.php/i;
    var rxVkPage = /(?:^|\/)vk\.com\/video(-?\d+)_(\d+)/i;
    var rxVkVideoHost = /(?:^|\/)vkvideo\.ru\/video(-?\d+)_(\d+)/i;

    function buildRutube(id){ return 'https://rutube.ru/play/embed/' + id; }
    function buildVk(oid,id){ return 'https://vk.com/video_ext.php?oid=' + oid + '&id=' + id + '&hd=2'; }

    var _processType = Html.prototype.processType;
    Html.prototype.processType = function(slide){
      try { _processType.call(this, slide); } catch(e) {}
      var inst = this.instance;
      var src = inst && inst.optionFor ? inst.optionFor(slide, 'src', '') : (slide && slide.src) || '';
      if (!src || typeof src !== 'string') return;

      var m;
      if ((m = src.match(rxRutubeEmbed)) || (m = src.match(rxRutube))) {
        var rid = m[1];
        slide.videoId = rid;
        slide.type = TYPE_RUTUBE;
        slide.src = buildRutube(rid);
        slide.preload = false;
        return;
      }

      if (rxVkExt.test(src)) {
        slide.type = TYPE_VK;
        slide.src = src;
        slide.preload = false;
        return;
      }

      if ((m = src.match(rxVkPage)) || (m = src.match(rxVkVideoHost))) {
        slide.type = TYPE_VK;
        slide.src = buildVk(m[1], m[2]);
        slide.preload = false;
        return;
      }
    };

    var _setContent = Html.prototype.setContent;
    Html.prototype.setContent = function(slide){
      if (slide && (slide.type === TYPE_RUTUBE || slide.type === TYPE_VK)) {
        slide.preload = false;
        this.setIframeContent(slide);
        this.setAspectRatio(slide);
        if (slide.el) {
          var cls = slide.type === TYPE_RUTUBE ? 'has-rutube' : 'has-vk';
          slide.el.classList.add(cls);
        }
        return;
      }
      return _setContent.call(this, slide);
    };

    var _setAspectRatio = Html.prototype.setAspectRatio;
    Html.prototype.setAspectRatio = function(slide){
      if (slide && (slide.type === TYPE_RUTUBE || slide.type === TYPE_VK)) {
        var el = slide.contentEl;
        if (!(slide.el && el)) return;
        var ratio, w = slide.width || 'auto', h = slide.height || 'auto';
        if (w === 'auto' || h === 'auto') {
          ratio = this.optionFor(slide, 'videoRatio');
          var mm = (ratio + '').match(/(\d+)\s*\/\s?(\d+)/);
          ratio = mm && mm.length > 2 ? parseFloat(mm[1]) / parseFloat(mm[2]) : parseFloat(ratio + '');
        } else if (w && h) {
          ratio = w / h;
        }
        if (!ratio) return;
        el.style.aspectRatio = '';
        el.style.width = '';
        el.style.height = '';
        el.offsetHeight;
        var rect = el.getBoundingClientRect(), a = rect.width || 1, r = rect.height || 1;
        el.style.aspectRatio = ratio + '';
        if (ratio < a / r) {
          h = h === 'auto' ? r : Math.min(r, h);
          el.style.width = 'auto';
          el.style.height = h + 'px';
        } else {
          w = w === 'auto' ? a : Math.min(a, w);
          el.style.width = w + 'px';
          el.style.height = 'auto';
        }
        return;
      }
      return _setAspectRatio.call(this, slide);
    };

  } catch(_e) {}
})();


