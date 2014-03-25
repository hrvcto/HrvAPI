define(function(){
  function flyToExtent(cesiumWidget, options){
    var scene = cesiumWidget.scene;

    var extent = options.extent;
    var duration = options.duration || 3000;

    /*var west = Cesium.Math.toRadians(extent.west);
    var south = Cesium.Math.toRadians(extent.south);
    var east = Cesium.Math.toRadians(extent.east);
    var north = Cesium.Math.toRadians(extent.north);

    var extent = new Cesium.Extent(west, south, east, north);

    var flight = Cesium.CameraFlightPath.createAnimationExtent(scene, {
      destination : extent,
      duration: duration
    });
    scene.animations.add(flight);*/

    var ellipsoid = Cesium.Ellipsoid.WGS84;
    var west = Cesium.Math.toRadians(extent.west);
    var south = Cesium.Math.toRadians(extent.south);
    var east = Cesium.Math.toRadians(extent.east);
    var north = Cesium.Math.toRadians(extent.north);

    var extent = new Cesium.Extent(west, south, east, north);

    var flight = Cesium.CameraFlightPath.createAnimationExtent(scene, {
      destination : extent
    });
    scene.animations.add(flight);

    // Show the extent.  Not required; just for show.
    var polylines = new Cesium.PolylineCollection();
    polylines.add({
      positions : ellipsoid.cartographicArrayToCartesianArray([
        new Cesium.Cartographic(west, south),
        new Cesium.Cartographic(west, north),
        new Cesium.Cartographic(east, north),
        new Cesium.Cartographic(east, south),
        new Cesium.Cartographic(west, south)
      ])
    });
    scene.primitives.add(polylines);
  }

  return flyToExtent;
});