define(function(){

  function addBillboard(cesiumWidget, options){
    var scene = cesiumWidget.scene;
    var ellipsoid = cesiumWidget.centralBody.ellipsoid;
    
    var position = options.position;

    var image = new Image();
    image.onload = function() {
      var billboards = new Cesium.BillboardCollection();
      var textureAtlas = scene.context.createTextureAtlas({
        image : image
      });
      billboards.textureAtlas = textureAtlas;

      var b = billboards.add({
        position : ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(position.longitude, position.latitude, position.height || 0)),
        imageIndex : 0
      });

      b.setScale(options.scale || 1.0);

      scene.primitives.add(billboards);

      require(['CesiumAPI/api.idManager.js'], function(){
        var id = options.id || window.idManager.nextID();
        window.idManager.addObject(id, billboards, scene.primitives);
      });
    };

    image.src = options.url;
  }

  return addBillboard;
});
