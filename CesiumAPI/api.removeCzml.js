define(function(){
  function removeCzml(cesiumWidget, options){
    var scene = cesiumWidget.scene;

    var id = options.id;
    if(id){
        console.log(id);
      require(['CesiumAPI/api.idManager.js'], function(){
        var ary = window.idManager.getByID(id);
        console.log(ary);
        for(var i = 0; i < ary.length; i ++){
          cesiumWidget.dataSources.remove(ary[i]);
        }
      });
    }
  }

  return removeCzml;
});
