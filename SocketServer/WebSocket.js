var WebSocketHelper = (function(){
  var webSocket = null;

  var helper = {};
  var listeners = {};

  function _onOpen(e){
    var callbacks = listeners.open;
    if(callbacks){
      for(var i = 0; i < callbacks.length; i ++){
        callbacks[i](e);
      }
    }
  }

  function _onClose(e){
    var callbacks = listeners.close;
    if(callbacks){
      for(var i = 0; i < callbacks.length; i ++){
        callbacks[i](e);
      }
    }
  }

  function _onMessage(e){
    var callbacks = listeners.message;
    if(callbacks){
      for(var i = 0; i < callbacks.length; i ++){
        callbacks[i](e, e.data);
      }
    }
  }

  function _onError(e){
    var callbacks = listeners.error;
    if(callbacks){
      for(var i = 0; i < callbacks.length; i ++){
        callbacks[i](e);
      }
    }
  }

  helper.connect = function(url){
    webSocket = new WebSocket(url);
    webSocket.onopen = function(e){_onOpen(e);};
    webSocket.onclose = function(e){_onClose(e);};
    webSocket.onmessage = function(e){_onMessage(e);};
    webSocket.onerror = function(e){_onError(e);};
    return helper;
  };

  helper.disConnect = function(){
    if(webSocket){
      webSocket.close();
      webSocket = null;
    }
  };

  helper.on = function(type, callback){
    if(webSocket == null){
      throw new Error('the web socket object is not initialized');
    }
    if(!listeners[type]){
      listeners[type] = [];
    }
    listeners[type].push(callback);

    return helper;
  };

  helper.sendMessage = function(message){
    if(webSocket == null){
      throw new Error('the web socket object is not initialized');
    }
    webSocket.send(message);
  };

  return helper;
})();
