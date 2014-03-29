define(function(){
  function showObject(cesiumWidget, options){
    var scene = cesiumWidget.scene;

    var id = options.id;
    var isShow = options.show || false;

    if(id){
      require(['CesiumAPI/api.idManager.js'], function(){
        var ary = window.idManager.getByID(id);
        for(var i = 0; i < ary.length; i ++){
          ary[i].show = isShow;
        }
      });
    }
  }

  return showObject;
});
