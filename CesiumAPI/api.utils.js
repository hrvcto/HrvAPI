define(function(){
  var utils = {};

  utils.ConvertDDToDMS = function(dd){
    var deg = dd | 0; // truncate dd to get degrees
    var frac = Math.abs(dd - deg); // get fractional part
    var min = (frac * 60) | 0; // multiply fraction by 60 and truncate
    var sec = frac * 3600 - min * 60;
    return deg + " " + min + "' " + sec + "\"";
  };

  return utils;
});