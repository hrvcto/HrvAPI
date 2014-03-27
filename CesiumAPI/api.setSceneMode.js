define(function(){
  function setSceneMode(cesiumWidget, options){
    var mode = options.mode;
    
    var funKey = 'to3D';
    switch(mode){
      case '3D':
      funKey = 'morphTo3D';
      break;
      case '2D':
      funKey = 'morphTo2D';
      break;
      case 'columbus':
      funKey = 'morphToColumbusView';
      break;
    }

    cesiumWidget.sceneTransitioner[funKey]();
  }

  return setSceneMode;
});