define(function(){
  function flyTo(cesiumWidget, options){
    var DefaultDuration = 3000;

    var scene = cesiumWidget.scene;

    var position = options.position;
    var ellipsoid = Cesium.Ellipsoid.WGS84;

    var destination = Cesium.Cartographic.fromDegrees(
      position.longitude, position.latitude, position.height);

    destination = ellipsoid.cartographicToCartesian(destination);

    var flight = Cesium.CameraFlightPath.createAnimation(scene, {
      destination : destination,
      duration: options.duration || DefaultDuration
    });
    scene.animations.add(flight);
  }

  //TODO rotate when animation done

  return flyTo;
});