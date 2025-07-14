// Moved from src/assets/three/FontLoader.js
// Legacy Three.js FontLoader (r149)
// UMD version for global usage
(function(global){
  function FontLoader(manager){
    this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
  }
  FontLoader.prototype = {
    constructor: FontLoader,
    load: function(url, onLoad, onProgress, onError){
      var loader = new THREE.FileLoader(this.manager);
      loader.load(url, function(text){
        onLoad(JSON.parse(text));
      }, onProgress, onError);
    }
  };
  global.FontLoader = FontLoader;
})(window);
