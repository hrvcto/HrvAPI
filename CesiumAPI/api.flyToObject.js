define(function(){
  var DefaultDuration = 3000;

  function flyToObject(cesiumWidget, options){
    var scene = cesiumWidget.scene;

    var ellipsoid = cesiumWidget.centralBody.ellipsoid;
    
    var id = options.id;

    if(id){
      require(['/CesiumAPI/api.idManager.js'], function(){
        var ary = window.idManager.getByID(id);
        if(ary.length > 0){
          var obj = ary[0];
          doFly(scene, obj, ellipsoid);
        }
      });
    }
  }

  function doFly(scene, obj, ellipsoid){
    var d = getDesitionOfGeometry(obj, ellipsoid);
    if(d){
      var flight = Cesium.CameraFlightPath.createAnimation(scene, {
        destination : d,
        duration: DefaultDuration
      });
      scene.animations.add(flight);
    }
  }

  function getDesitionOfGeometry(geometry, ellipsoid){
    var pos, destination;

    if(geometry instanceof Cesium.BillboardCollection){
      var billboard = geometry._billboards[0];
      pos = billboard._position;
    } else if(geometry instanceof Cesium.LabelCollection){
      var label = geometry._labels[0];
      pos = label._position;
    }

    if(pos){
      destination = Cesium.Cartesian3.fromElements(pos.x, pos.y, pos.z);
    }

    return destination;
  }

  return flyToObject;
});