// Legacy Three.js TextGeometry (r149)
// https://github.com/mrdoob/three.js/blob/r149/examples/jsm/geometries/TextGeometry.js
// This is a UMD version for global usage
(function(global){
    function TextGeometry( text, parameters ) {
        THREE.BufferGeometry.call( this );
        this.type = 'TextGeometry';
        this.parameters = {
            text: text,
            parameters: parameters
        };
        var font = parameters.font;
        if ( font === undefined ) {
            throw new Error( 'THREE.TextGeometry: font parameter is required.' );
        }
        var shapes = font.generateShapes( text, parameters.size );
        var geometry = new THREE.ShapeGeometry( shapes, parameters.curveSegments );
        geometry.computeBoundingBox();
        if ( parameters.bevelEnabled ) {
            // Bevel not supported in this stub, but you can add full bevel logic from official repo if needed
        }
        this.copy( geometry );
    }
    TextGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
    TextGeometry.prototype.constructor = TextGeometry;
    global.TextGeometry = TextGeometry;
})(window);
