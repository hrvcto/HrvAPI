define(function(){
  function createPolyline(cesiumWidget, options){
    
    var Cartographic = Cesium.Cartographic;
    var Primitive = Cesium.Primitive;
    var GeometryInstance = Cesium.GeometryInstance;
    var PolylineGeometry = Cesium.PolylineGeometry;
    var PolylineMaterialAppearance = Cesium.PolylineMaterialAppearance;
    var Material = Cesium.Material;
  
    
    var scene = cesiumWidget.scene;
    var centralBody = cesiumWidget.centralBody;

    var primitives = scene.primitives;
    var ellipsoid = centralBody.ellipsoid;

    var poses = [];
    for(var i = 0; i < options.positions.length; i ++){
      poses.push(
        ellipsoid.cartographicToCartesian(
          Cartographic.fromDegrees(options.positions[i].longitude, options.positions[i].latitude, options.positions[i].height || 0)
          )
        );
    }

    var w = options.width ? options.width : 1.0;

    var p = new Primitive({
      geometryInstances: new GeometryInstance({
        geometry: new PolylineGeometry({
          positions: poses,
          width: w
        })
      }),
      appearance : new PolylineMaterialAppearance({
        material : Material.fromType('Color', {
          color: Cesium.Color.fromCssColorString(options.color)
        })
      })
    });

    primitives.add(p);
  }

  return createPolyline;
});