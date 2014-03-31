define(function(){

  function IDManager(){
    var that = this;
    that.idCache = [];
    that.objMap = {};
  };

  IDManager.prototype = {
    addObject: function(id, object, primitives){
      var that = this;

      if(primitives && that.idCache.indexOf(id) >= 0){
        var obj = that.objMap[id];
        if(Array.isArray(obj)){
          for(var i = 0; i < obj.length; i ++){
            primitives.remove(obj[i]);
          }
        } else {
          primitives.remove(obj);
        }
      }

      that.idCache.push(id);
      this.objMap[id] = object;
    },
    nextID: function(){
      var that = this;
      var id = '_clientID_' + (new Date()).getTime();
      if(that.idCache.indexOf(id) >= 0){
        return that.nextID();
      }
      return id;
    },
    getByID: function(id){
      var that = this;
      if(that.idCache.indexOf(id) >= 0){
        var obj = that.objMap[id];
        if(Array.isArray(obj)){
          return obj;
        }
        return [obj];
      }
      return [];
    }
  };

  if(!window.idManager){
    window.idManager = new IDManager();
  }

  return window.idManager;
});
