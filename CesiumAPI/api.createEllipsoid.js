define(function(){
  function createEllipsoid(cesiumWidget, options){
    var scene = cesiumWidget.scene;
    var primitives = scene.primitives;
    var ellipsoid = cesiumWidget.centralBody.ellipsoid;

    var radii = new Cesium.Cartesian3(options.semiMajorAxis, options.semiMinorAxis, options.extrudedHeight);
    var positionOnEllipsoid = ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(options.center.longitude, options.center.latitude, options.center.height));
    var modelMatrix = Cesium.Matrix4.multiplyByTranslation(
      Cesium.Transforms.eastNorthUpToFixedFrame(positionOnEllipsoid),
      new Cesium.Cartesian3(0.0, 0.0, radii.z)
    );

    var ellipsoidGeometry = new Cesium.EllipsoidGeometry({
      vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
      radii : radii
    });
    var ellipsoidInstance = new Cesium.GeometryInstance({
      geometry : ellipsoidGeometry,
      modelMatrix : modelMatrix,
      attributes : {
          color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(options.color))
      }
    });

    var ps = []
    var p = primitives.add(new Cesium.Primitive({
      geometryInstances : ellipsoidInstance,
      appearance : new Cesium.PerInstanceColorAppearance({
        translucent : false,
        closed : true
      })
    }));
    ps.push(p);

    if(options.outlineColor){
      var ellipsoidOutlineGeometry = new Cesium.EllipsoidOutlineGeometry({
        radii : radii,
        stackPartitions : 16,
        slicePartitions : 8
      });
      var ellipseOutlineInstance = new Cesium.GeometryInstance({
        geometry : ellipsoidOutlineGeometry,
        modelMatrix : modelMatrix,
        attributes : {
          color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(options.outlineColor))
        }
      });
      var pp = primitives.add(new Cesium.Primitive({
        geometryInstances : ellipseOutlineInstance,
        appearance : new Cesium.PerInstanceColorAppearance({
          flat : true,
          renderState : {
            depthTest : {
              enabled : true
            },
            lineWidth : Math.min(3.0, scene.context.getMaximumAliasedLineWidth())
          }
        })
      }));
      ps.push(pp);
    }

    require(['CesiumAPI/api.idManager.js'], function(){
      var id = options.id || window.idManager.nextID();
      window.idManager.addObject(id, ps, scene.primitives);
    });
    
  }

  return createEllipsoid;
});
