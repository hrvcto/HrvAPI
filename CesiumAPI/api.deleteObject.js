define(function(){
  function deleteObject(cesiumWidget, options){
    var scene = cesiumWidget.scene;

    var id = options.id;
    if(id){
      require(['CesiumAPI/api.idManager.js'], function(){
        var ary = window.idManager.getByID(id);
        for(var i = 0; i < ary.length; i ++){
          scene.primitives.remove(ary[i]);
        }
      });
    }
  }

  return deleteObject;
});
