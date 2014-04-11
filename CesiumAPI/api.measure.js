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

  function readableNum(d){
    var dd = Math.floor(d);
    var dx = d - dd;
    var retAry = [];
    
    while(dd > 0){
      retAry.push(dd % 1000 + '');
      dd = (dd - dd % 1000) / 1000;
    }

    return retAry.reverse().join(',') + (dx.toFixed(2) + '').substring(1,4);
  }

  function calDistance(x1,y1,x2,y2,unit){
    var d = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2,2));
    if(unit == 'm'){
      return readableNum(d) + 'm';
    } else if(unit == 'km') {
      return readableNum(d / 1000) + 'km';
    } else {
      return d;
    }
  }

  utils.clone = clone;
  utils.copyOptions = copyOptions;
  utils.fillOptions = fillOptions;


  var material = Cesium.Material.fromType(Cesium.Material.ColorType);
  material.uniforms.color = new Cesium.Color(1.0, 0.0, 0.0, 0.5);

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
    if(measureEndCallback){
      measureEndCallback();
    }

    measureEndCallback = function(){
      if(!mouseHandler.isDestroyed()){
        mouseHandler.destroy();
      }

      primitives.remove(poly);
      poly = null;
      primitives.remove(labels);
      labels = null;
    };

    var poly = new PolylinePrimitive(options);

    var labelObj = createLabel();
    var labels = labelObj.labels;
    var label = labelObj.label;

    // 异步模式
    poly.asynchronous = false;
    primitives.add(poly);

    var positions = [];

    var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    mouseHandler.setInputAction(function(data){
      if(data.position != null){
        // 从鼠标位置转换成笛卡尔坐标
        var cartesian = scene.camera.controller.pickEllipsoid(data.position, ellipsoid);
        if(cartesian){
          positions.push(cartesian);

          if(positions.length >= 2){
            poly.setPositions(positions);

            var p = positions[positions.length - 2];

            var theLabel = labels.add({
              fillColor: Cesium.Color.fromCssColorString('#fff'),
              show: true,
              font: '16px Helvetica'
            });
            // var dxdy = Math.sqrt(Math.pow(cartesian.x - p.x, 2) + Math.pow(cartesian.y - p.y, 2));

            // theLabel.setText(dxdy.toFixed(2) + ' m');
            theLabel.setText(calDistance(cartesian.x, cartesian.y, p.x, p.y, options.unit));
            theLabel.setPosition(cartesian);

          } else {
            var theLabel = labels.add({
              fillColor: Cesium.Color.fromCssColorString('#fff'),
              show: true,
              font: '16px Helvetica'
            });
            theLabel.setText('起点');
            theLabel.setPosition(cartesian);
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    mouseHandler.setInputAction(function(data){
      var position = data.endPosition;
      if(position != null){
        if(positions.length > 0){
          var cartesian = scene.camera.controller.pickEllipsoid(position, ellipsoid);
          if(cartesian){
            var p1 = positions[positions.length - 1];

            // var dxdy = Math.sqrt(Math.pow(cartesian.x - p1.x, 2) + Math.pow(cartesian.y - p1.y, 2));

            // label.setText(dxdy.toFixed(2) + ' m');
            label.setText(calDistance(cartesian.x, cartesian.y, p1.x, p1.y, options.unit));
            label.setPosition(cartesian);

            cartesian.y += (1 + Math.random());
            if(positions.length >= 1){
              poly.setPositions(positions.concat(cartesian));
            }
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    mouseHandler.setInputAction(function(data){
      labels.remove(label);
      labels.remove(labels._labels[labels._labels.length - 1]);
      mouseHandler.destroy();

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
    createStopMeasureBtn(cesiumWidget);
    startMeasure(options);
  }

  function createStopMeasureBtn(cesiumWidget){
    var button = document.createElement('button');
    button.innerHTML = '清除测距';
    button.style.position = 'absolute';
    button.style.top = '0px';
    button.style.left = '0px';
    button.id = 'cancel-measure-button';
    button.onclick = function(){
      cesiumWidget._container.parentNode.removeChild(button);
      stopMeasure();
    };
    cesiumWidget._container.parentNode.appendChild(button);
  }

  return measure;
});
