define(function(){
  function createPolygon(cesiumWidget, options){
    var scene = cesiumWidget.scene;

    var primitives = scene.primitives;
    var ellipsoid = cesiumWidget.centralBody.ellipsoid;

    var positions = options.positions;
    var cators = [];
    for(var i = 0; i < positions.length; i ++){
      cators.push(Cesium.Cartographic.fromDegrees(positions[i].longitude, positions[i].latitude));
    }
    var poses = ellipsoid.cartographicArrayToCartesianArray(cators);
    
    var polygonInstance = new Cesium.GeometryInstance({
        geometry : Cesium.PolygonGeometry.fromPositions({
            positions : poses,
            vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
            extrudedHeight: options.extrudedHeight || 0
        }),
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(options.color))
        }
    });



    var p = primitives.add(new Cesium.Primitive({
        geometryInstances : [polygonInstance],
        appearance : new Cesium.PerInstanceColorAppearance({
            closed : true
        })
    }));

    var ps = [p];

    if(options.outlineColor){
      var polygonOutlineInstance = new Cesium.GeometryInstance({
        geometry : Cesium.PolygonOutlineGeometry.fromPositions({
            positions : poses,
            extrudedHeight: options.extrudedHeight || 0
        }),
        attributes : {
          color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(options.outlineColor))
        }
      });

      var pp = primitives.add(new Cesium.Primitive({
        geometryInstances : [polygonOutlineInstance],
        appearance : new Cesium.PerInstanceColorAppearance({
          flat : true,
          renderState : {
            depthTest : {
              enabled : true
            },
            lineWidth : Math.min(4.0, scene.context.getMaximumAliasedLineWidth())
          }
        })
      }));

      ps.push(pp);
    }

    require(['CesiumAPI/api.idManager.js'], function(){
      window.idManager.addObject(options.id, ps, primitives);
    });

    
    
  }

  return createPolygon;
});