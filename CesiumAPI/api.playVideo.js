define(function(){
  function showInfo(cesiumWidget, options){

    var position = options.position || {};
    var viewData = (function(){
      var e = 0, l = 0, i = 0, g = 0, f = 0, m = 0;
      var j = window, h = document, k = h.documentElement;
      e = k.clientWidth || h.body.clientWidth || 0;
      l = j.innerHeight || k.clientHeight || h.body.clientHeight || 0;
      g = h.body.scrollTop || k.scrollTop || j.pageYOffset || 0;
      i = h.body.scrollLeft || k.scrollLeft || j.pageXOffset || 0;
      f = Math.max(h.body.scrollWidth, k.scrollWidth || 0);
      m = Math.max(h.body.scrollHeight, k.scrollHeight || 0, l);
      return {scrollTop: g,scrollLeft: i,documentWidth: f,documentHeight: m,viewWidth: e,viewHeight: l};
    })();

    var w = position.width || viewData.viewWidth - 400;
    var h = position.height || viewData.viewHeight - 200;
    var x = position.x || 200;
    var y = position.y || 100;
    var url = options.videoURL;

    var style = [
      '.mask-bg{-webkit-transition:opacity 0.2s ease-out; overflow:hidden;background-color:rgba(0,0,0,0.8); position:absolute; top:0; left:0; right:0; bottom:0; width:100%; height:100%;}',
      '.mask-c{-webkit-transition:top 0.2s ease-out; border-radius:3px; background-color:#ddd; position:absolute; top:' + viewData.viewHeight + 'px; padding:5px; border:1px solid #fff;}'];
    var html = [
        '<div class="mask-c" id="playVideoWindowC" style="width:' + w + 'px; height:' + h + 'px; left:' + x + 'px;">',
          '<video controls height="' + h + '" width="' + w + '" autoplay src="' + url + '">',
        '</div>'];

    var htmlFragment = document.createElement('div');
    htmlFragment.id = 'playVideoWindow';
    htmlFragment.className = 'mask-bg';
    htmlFragment.innerHTML = html.join('');

    var cssFragment = document.createElement('style');
    cssFragment.type = 'text/css';
    cssFragment.rel = 'stylesheet';
    cssFragment.innerHTML = style.join('');

    document.body.appendChild(cssFragment);
    document.body.appendChild(htmlFragment);

    var infoWindow = document.getElementById('playVideoWindow');
    var infoWindowC = document.getElementById('playVideoWindowC');

    infoWindow.addEventListener('click', function(e){
      hide(infoWindow);
    }, false);
    infoWindowC.addEventListener('click', function(e){
      e.stopPropagation();
    }, false);

    show(infoWindowC, y);
  }

  function show(infoWindowC, x){
    window.setTimeout(function(){
      infoWindowC.style.top = x + 'px';
    }, 100);
  }

  function hide(infoWindow){
    infoWindow.style.opacity = '0';

    window.setTimeout(function(){
      document.body.removeChild(infoWindow);
    }, 250);
  }

  return showInfo;
});