define(['./api.utils.js'], function(utils){

  function addBillboard(cesiumWidget, options){
    var scene = cesiumWidget.scene;
    var ellipsoid = cesiumWidget.centralBody.ellipsoid;
    
    var position = options.position;
    var tips = options.tips;

    if(typeof position.longitude == 'string'){
      position.longitude = utils.ConvertDMStoDD(position.longitude);
      position.latitude = utils.ConvertDMStoDD(position.latitude);
    }

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


      if(tips){
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

        var label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.backgroundColor = 'rgba(255,255,255,0.8)';
        label.style.color = 'rgba(0,0,0,1)';
        label.style.fontSize = '14px';
        label.style.padding = '3px';
        label.style.lineHeight = '24px';
        label.innerHTML = tips;

        mouseHandler.setInputAction(function(data){
          var pickedObject = scene.pick(data.endPosition);
          
          if(pickedObject && pickedObject.primitive == b){
            label.style.top = data.endPosition.y + 10 + 'px';
            label.style.left = data.endPosition.x + 10 + 'px';
            scene.canvas.parentNode.insertBefore(label);
          } else {
            try{
              scene.canvas.parentNode.removeChild(label);
            }catch(e){}
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
    };

    image.src = options.url;
  }

  return addBillboard;
});
