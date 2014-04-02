define(function(){

  var ellipsoid = Cesium.Ellipsoid.WGS84;

  function clone(from, to) {
      console.log(from);
        if (from == null || typeof from != "object") return from;
        if (from.constructor != Object && from.constructor != Array) return from;
        if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
            from.constructor == String || from.constructor == Number || from.constructor == Boolean)
            return new from.constructor(from);

        to = to || new from.constructor();

        for (var name in from) {
            to[name] = typeof to[name] == "undefined" ? clone(from[name], null) : to[name];
        }

        return to;
    }


  function copyOptions(options, defaultOptions) {
    var newOptions = clone(options), option;
    console.log(newOptions);
    for(option in defaultOptions) {
      if(newOptions[option] === undefined) {
        newOptions[option] = clone(defaultOptions[option]);
      }
    }
    return newOptions;
  }


  var material = Cesium.Material.fromType(Cesium.Material.ColorType);
  material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);

  var defaultShapeOptions = {
    ellipsoid: Cesium.Ellipsoid.WGS84,
    textureRotationAngle: 0.0,
    height: 0.0,
    asynchronous: true,
    show: true,
    debugShowBoundingVolume: false
  };

  var defaultPolylineOptions = copyOptions(defaultShapeOptions, {
    width: 5,
    geodesic: true,
    granularity: 10000,
    appearance: new Cesium.PolylineMaterialAppearance({
      aboveGround : false
    }),
    material : material
  });

  function DrawHelper(cesiumWidget){
    var that = this;

    that._scene = cesiumWidget.scene;

    that.initHandlers();

  }

  DrawHelper.prototype.initHandlers = function(){
    var that = this;
    
    var scene = that._scene;

    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

    function callPrimitiveCallback(name, data){
      if(that._handlersMuted == true) return;
      var pickedObject = scene.pick(data);
    }

    handler.setInputAction(function(data){
      callPrimitiveCallback('leftClick', data.position);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(function(data){
      
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    handler.setInputAction(function(data){
      
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(function(data){
      
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    handler.setInputAction(function(data){

    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  };

  DrawHelper.prototype.muteHandlers = function(muted){
    this._handlersMuted = muted;
  };

  DrawHelper.prototype.startDrawingPolyline = function(options){
    var options = copyOptions(options, defaultPolylineOptions);
    console.log(options);
  };

  return DrawHelper;
});