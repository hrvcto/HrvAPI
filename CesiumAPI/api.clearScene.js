define(function(){
  function clearScene(cesiumWidget, options){
    var scene = cesiumWidget.scene;
    scene.primitives.removeAll();
  }

  return clearScene;
});