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

    var material = null;
    if(options.arrow === 'head'){
      material = Cesium.Material.fromType(Cesium.Material.PolylineArrowType, {
        color: Cesium.Color.fromCssColorString(options.color)
      });
    } else if(options.arrow === 'tail'){
      material = Cesium.Material.fromType(Cesium.Material.PolylineArrowType, {
        color: Cesium.Color.fromCssColorString(options.color)
      });
      poses.reverse();
    } else {
      material = Cesium.Material.fromType(Cesium.Material.PolylineOutlineType, {
        width: w,
        outlineWidth: 1.0,
        color: Cesium.Color.fromCssColorString(options.color),
        outlineColor: Cesium.Color.fromCssColorString(options.outlineColor)
      });
    }

    var localPolylines = new Cesium.PolylineCollection();

    var localPolyline = localPolylines.add({
      positions : poses,
      width : w,
      material : material
    });
    primitives.add(localPolylines);
  }

  return createPolyline;
});