define(function(){
  var utils = {};

  function clone(from, to) {
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
    
  function fillOptions(options, defaultOptions) {
    options = options || {};
    var option;
    for(option in defaultOptions) {
      if(options[option] === undefined) {
        options[option] = clone(defaultOptions[option]);
      }
    }
  }

  // shallow copy
  function copyOptions(options, defaultOptions) {
    var newOptions = clone(options), option;
    for(option in defaultOptions) {
      if(newOptions[option] === undefined) {
        newOptions[option] = clone(defaultOptions[option]);
      }
    }
    return newOptions;
  }

  utils.clone = clone;
  utils.copyOptions = copyOptions;
  utils.fillOptions = fillOptions;


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

  var defaultPolylineOptions = utils.copyOptions(defaultShapeOptions, {
    width: 2,
    geodesic: true,
    granularity: 10000,
    appearance: new Cesium.PolylineMaterialAppearance({
      aboveGround : false
    }),
    material : material
  });

  var ChangeablePrimitive = (function(){
    function _(){};

    _.prototype.initOptions = function(options){
      utils.fillOptions(this, options);

      this._ellipsoid = undefined;
      // 粒度
      this._granularity = undefined;
      this._height = undefined;
      this._textureRotationAngle = undefined;
      this._id = undefined;

      // 用来判断是不是第一次创建; 如果有更新属性，则设置为true，重新绘制
      this._createPrimitive = true;
      this._primitive = undefined;
      this._outlinePolygon = undefined;
    };

    _.prototype.setAttribute = function(name, value){
      this[name] = value;
      this._createPrimitive = true;
    };

    _.prototype.getAttribute = function(name){
      return this[name];
    };

    _.prototype.update = function(context, frameState, commandList){
      var that = this;
      if(!Cesium.defined(this.ellipsoid)){
        throw new Cesium.DeveloperError('this.ellipsoid must be defined.');
      }
      if(!Cesium.defined(this.appearance)) {
        throw new Cesium.DeveloperError('this.material must be defined.');
      }

      if(this.granularity < 0.0) {
        throw new Cesium.DeveloperError('this.granularity and scene2D/scene3D overrides must be greater than zero.');
      }

      if (!this.show) {
        return;
      }

      if(!this._createPrimitive && (!Cesium.defined(this._primitive))){
        return;
      }

      if(this._createPrimitive ||
          (this._ellipsoid !== this.ellipsoid) ||
          (this._granularity !== this.granularity) ||
          (this._height !== this.height) ||
          (this._textureRotationAngle !== this.textureRotationAngle) ||
          (this._id !== this.id)){
        var geometry = this.getGeometry();
        if(!geometry){
          return;
        }

        this._createPrimitive = false;
        this._ellipsoid = this.ellipsoid;
        this._granularity = this.granularity;
        this._height = this.height;
        this._textureRotationAngle = this.textureRotationAngle;
        this._id = this.id;

        this._primitive = this._primitive && this._primitive.destroy();

        this._primitive = new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: geometry,
            id: this.id,
            pickPrimitive: this
          }),
          appearance: this.appearance,
          asynchronous: this.asynchronous
        });
      }

      var primitive = this._primitive;
      primitive.appearance.material = this.material;
      primitive.debugShowBoundingVolume = this.debugShowBoundingVolume;
      primitive.update(context, frameState, commandList);
    };

    _.prototype.destroy = function(){
      this._primitive = this._primitive && this._primitive.destroy();
      return Cesium.destroyObject(this);
    };

    return _;
  })();

  var PolylinePrimitive = (function(){
    function _(options){
      options = utils.copyOptions(options, defaultPolylineOptions);

      this.initOptions(options);
    };

    _.prototype = new ChangeablePrimitive();

    _.prototype.setPositions = function(positions){
      this.setAttribute('positions', positions);
    };

    _.prototype.getGeometry = function(){
      if(!Cesium.defined(this.positions) || this.positions.length < 2){
        return;
      }

      return new Cesium.PolylineGeometry({
        positions: this.positions,
        height: this.height,
        width: this.width < 1 ? 1 : this.width,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        ellipsoid: this.ellipsoid
      });
    };

    return _;
  })();

  var isMeasuring = false;
  var measureEndCallback;
  var scene;
  var primitives;
  var ellipsoid = Cesium.Ellipsoid.WGS84;

  function createLabel(){
    var labels = new Cesium.LabelCollection();

    var label = labels.add({
      fillColor: Cesium.Color.fromCssColorString('#fff'),
      show: true,
      font: '16px Helvetica'
    });

    primitives.add(labels);

    return {
      labels: labels,
      label: label
    };
  }

  function startMeasure(options){
    if(isMeasuring){
      return;
    }

    measureEndCallback = function(){
      mouseHandler.destroy();
      primitives.remove(poly);
      poly = null;
      primitives.remove(labels);
      labels = null;
      firstPosition = null;
    };

    var poly = new PolylinePrimitive(options);

    var labelObj = createLabel();
    var labels = labelObj.labels;
    var label = labelObj.label;

    // 异步模式
    poly.asynchronous = false;
    primitives.add(poly);

    var firstPosition;

    var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    mouseHandler.setInputAction(function(data){
      if(data.position != null){
        // 从鼠标位置转换成笛卡尔坐标
        var cartesian = scene.camera.controller.pickEllipsoid(data.position, ellipsoid);
        if(cartesian && !firstPosition){
          firstPosition = cartesian;
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    mouseHandler.setInputAction(function(data){
      var position = data.endPosition;
      if(position != null){
        var cartesian = scene.camera.controller.pickEllipsoid(position, ellipsoid);
        if(cartesian){
          cartesian.y += (1 + Math.random());
          if(firstPosition){
            poly.setPositions([firstPosition, cartesian]);
            
            var dxdy = Math.sqrt(Math.pow(cartesian.x - firstPosition.x, 2) + Math.pow(cartesian.y - firstPosition.y, 2));

            label.setText(dxdy.toFixed(2) + ' m');
            label.setPosition(cartesian);
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    mouseHandler.setInputAction(function(data){
      var position = data.position;
      if(position != null){
        var cartesian = scene.camera.controller.pickEllipsoid(position, ellipsoid);
        if(cartesian){
          var dxdy = Math.sqrt(Math.pow(cartesian.x - firstPosition.x, 2) + Math.pow(cartesian.y - firstPosition.y, 2));
          if(typeof options.callback == 'function'){
            options.callback(dxdy);
          }
        }
      }

      stopMeasure();
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }

  function stopMeasure(){
    if(measureEndCallback){
      measureEndCallback();
      measureEndCallback = null;
    }
  }

  function measure(cesiumWidget, options){
    scene = cesiumWidget.scene;
    primitives = scene.primitives;

    startMeasure(options);
  }

  return measure;
});
