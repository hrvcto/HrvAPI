define(function(){
    function loadCzml(cesiumWidget, options) { 
        var timer = setInterval(function() {
            var czmlItem = options[0];
            console.log("czmlItem:"+JSON.stringify(czmlItem));
            var czmlDataSource = new Cesium.CzmlDataSource();
            console.log(czmlItem.url);
            czmlDataSource.loadUrl(czmlItem.url).then(function() {
                cesiumWidget.dataSources.add(czmlDataSource);
            })
            options = options.slice(1, options.length);
            console.log("options:"+JSON.stringify(options));
            if (options.length<=0) {
                clearInterval(timer);
            }
            require(['CesiumAPI/api.idManager.js'], function(){
                window.idManager.addObject(czmlItem.id, czmlDataSource);
            });
        }, 0);
    }
    return loadCzml;
});
