define(function(){
  var utils = {};

  utils.ConvertDDToDMS = function(dd){
    var deg = dd | 0; // truncate dd to get degrees
    var frac = Math.abs(dd - deg); // get fractional part
    var min = (frac * 60) | 0; // multiply fraction by 60 and truncate
    var sec = frac * 3600 - min * 60;
    return deg + " " + min + "' " + sec + "\"";
  };

  utils.ConvertDMStoDD = function(dms){
    var ary = dms.split(' ');
    if(ary && ary.length === 3){
      var d = window.parseInt(ary[0], 10);
      var m = window.parseInt(ary[1], 10);
      var s = window.parseFloat(ary[2]);

      return (d + m/60 + s/3600).toFixed(8);
    } else {
      return Number.NaN;
    }
  };

  return utils;
});