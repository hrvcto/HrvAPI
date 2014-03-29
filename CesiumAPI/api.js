define(function(){
  function _isCommandValid(command){
    var commandObject;
    try{
      commandObject = JSON.parse(command);
    } catch(e) {
      throw new Error('Command: ' + command + ' is not a valid JSON string.');
    }

    if(commandObject.name && commandObject.args){
      return commandObject;
    } else {
      throw new Error('Command: ' + command + ' doesn\'t have name or args.');
    }
  }

  function executeCommand(cesiumWidget, command){
    var commandObject = _isCommandValid(command);
    require(['CesiumAPI/api.' + commandObject.name + '.js'], function(commander){
      commander(cesiumWidget, commandObject.args);
    });
  }

  return {
    executeCommand: executeCommand
  };
});
