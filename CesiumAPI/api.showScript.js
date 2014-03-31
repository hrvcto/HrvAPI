define(function(){

  function showScript(cesiumWidget, options){

    var position = options.position || {width: 300, height:200, x:100, y:50};
    var fontSize = options.fontSize || 12;
    var fontColor = options.fontColor || 'black';
    var backgroundColor = options.backgroundColor || 'white';

    var style = [
      '.alert-script{position:absolute; padding:10px 25px 10px 10px;}',
      '.alert-script .close{width:20px; height:20px; display:block; background:url(assets/images/windowClose.png) no-repeat; background-size:20px auto; opacity:0.7;',
      'position:absolute; right:0px; top:0px; text-indent:-9999em;}',
      '.alert-script .close:hover{opacity:0.8;}'];

    var closeButton = [
    '<a href="javascript:;" class="close" id="showScript-closeBtn">Close</a>'];

    if(document.getElementById('showScriptDIV')){
      document.body.removeChild(document.getElementById('showScriptDIV'));
    }

    var div = document.createElement('div');
    div.id = 'showScriptDIV';
    div.className = 'alert-script'
    div.style.width = position.width + 'px';
    div.style.height = position.height + 'px';
    div.style.top = position.y + 'px';
    div.style.left = position.x + 'px';
    div.style.backgroundColor = backgroundColor;
    div.style.color = fontColor;
    div.style.fontSize = fontSize + 'px';
    div.innerHTML = closeButton.join('') + '<div>' + options.script + '</div>';

    var cssFragment = document.createElement('style');
    cssFragment.type = 'text/css';
    cssFragment.rel = 'stylesheet';
    cssFragment.innerHTML = style.join('');

    document.body.appendChild(cssFragment);
    document.body.appendChild(div);

    document.getElementById('showScript-closeBtn').addEventListener('click', function(e){
      document.body.removeChild(document.getElementById('showScriptDIV'));
    }, false);
  }

  return showScript;
});