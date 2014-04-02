define(['./api.utils.js'],function(utils){

  var handler, labels, label;
  var ellipsoid = Cesium.Ellipsoid.WGS84;

  function showPosition(cesiumWidget, options){
    var scene = cesiumWidget.scene;
    var isShow = options.show || false;
    var isDecimal = options.type === 'decimal';

    if(isShow){
      if(!labels){
        labels = new Cesium.LabelCollection();


        label = labels.add({
          fillColor: Cesium.Color.fromCssColorString('#fff'),
          show: true,
          font: '16px Helvetica'
        });

        scene.primitives.add(labels);

        handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        handler.setInputAction(function(movement) {
          var cartesian = scene.camera.controller.pickEllipsoid(movement.endPosition, ellipsoid);
          if(cartesian) {
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);

            if(isDecimal){
              label.setText('(' + Cesium.Math.toDegrees(cartographic.longitude).toFixed(8) + ', ' + Cesium.Math.toDegrees(cartographic.latitude).toFixed(8) + ')');
            } else {
              label.setText('(' 
                + utils.ConvertDDToDMS(Cesium.Math.toDegrees(cartographic.longitude).toFixed(4))
                + ', ' + utils.ConvertDDToDMS(Cesium.Math.toDegrees(cartographic.latitude).toFixed(4))
                + ')');
            }

            label.setPosition(cartesian);
          } else {
            label.text = '';
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
    } else {
      scene.primitives.remove(labels);
      labels = null;
      handler.destroy();
    }
  }

  return showPosition;
});