define(function(){
    function loadCzml(cesiumWidget, options) { 
        var timer = setInterval(function() {
            var url = options[0];
            var czmlDataSource = new Cesium.CzmlDataSource();
            console.log(url);
            czmlDataSource.loadUrl(url).then(function() {
                cesiumWidget.dataSources.add(czmlDataSource);
            })
            options = options.slice(1, options.length);
            if (options.length<=0) {
                clearInterval(timer);
            }
            require(['CesiumAPI/api.idManager.js'], function(){
                window.idManager.addObject(url, czmlDataSource);
            });
        }, 0);
    }
    return loadCzml;
});
