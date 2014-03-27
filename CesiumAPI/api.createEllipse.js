define(function(){
  function createEllipse(cesiumWidget, options){
    var scene = cesiumWidget.scene;
    
    var centralBody = cesiumWidget.centralBody;

    var primitives = scene.primitives;
    var ellipsoid = centralBody.ellipsoid;
    
    // Blue extruded ellipse with height
    ellipseGeometry = new Cesium.EllipseGeometry({
        center : ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(options.center.lonitude, options.center.latitude)),
        semiMinorAxis : options.semiMinorAxis,
        semiMajorAxis : options.semiMajorAxis,
        height : options.height,
        extrudedHeight : options.extrudedHeight,
        rotation : Cesium.Math.toRadians(90),
        vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
    });
    
    var blueEllipseInstance = new Cesium.GeometryInstance({
        geometry : ellipseGeometry,
        attributes : {
            color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(options.color))
        }
    });
    
    // Add ellipse instances to primitives
    var p = primitives.add(new Cesium.Primitive({
        geometryInstances : [blueEllipseInstance],
        appearance : new Cesium.PerInstanceColorAppearance({
            translucent : false,
            closed : true
        })
    }));

    require(['/CesiumAPI/api.idManager.js'], function(){
      var id = options.id || window.idManager.nextID();
      window.idManager.addObject(id, p, scene.primitives);
    });
  }

  return createEllipse;
});