//Generates spheres for WebGL to draw

//this function is adapted from tutorial 11 on learningwebgl.com
function drawSphere(num_vertices, radius, arrays) {
	//this function is adapted from tutorial #11 on learningWebGL.com

	var latitudeBands = Math.ceil(Math.sqrt(num_vertices));
	var longitudeBands = latitudeBands;

	//first, generate all the data for each vertex (if you're flat shading, normals will be per-primitive instead of per-vertex)
	for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
		var theta = latNumber * Math.PI / latitudeBands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);

		for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
			var phi = longNumber * 2 * Math.PI / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);

			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			var u = 1 - (longNumber / longitudeBands);
			var v = 1 - (latNumber / latitudeBands);

			//push vertex position data 
			arrays[0].push(vec3(radius*x, radius*y, radius*z));
			
			//push per-vertex normals
			arrays[1].push(vec3(x, y, z));
			
			//push texture coords 
			arrays[2].push(vec2(u, v));
			
		}
	}

	//now that we've generated all the data for each vertex along the lat and long lines, we can iterate across the lines to index each triangle
	for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
		for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
			//for each iteration, we'll generate 2 triangles by pushing their vertices into the indices array
			var first = (latNumber * (longitudeBands + 1)) + longNumber;
			var second = first + longitudeBands + 1;
			arrays[3].push(first);
			arrays[3].push(second);
			arrays[3].push(first + 1);

			arrays[3].push(second);
			arrays[3].push(second + 1);
			arrays[3].push(first + 1);

		}
	}

}
// *********** SHAPE SUPERCLASS ***********
// Each shape manages lists of its own vertex positions, vertex normals, and texture coordinates per vertex, and can copy them into a buffer in the graphics card's memory.
// IMPORTANT: When you extend the Shape class, you must supply a populate() function that fills in four arrays: One list enumerating all the vertices' (vec3) positions,
// one for their (vec3) normal vectors pointing away from the surface, one for their (vec2) texture coordinates (the vertex's position in an image's coordinate space,
// where the whole picture spans x and y in the range 0.0 to 1.0), and usually one for indices, a list of index triples defining which three vertices
// belong to each triangle.  Call new on a Shape and add it to the shapes_in_use array; it will populate its arrays and the GPU buffers will recieve them.

//sphere is a subclass of Shape, declared and implemented in tinywebgl-ucla.js
Declare_Any_Class("Sphere", {
	//num_vertices is self explanatory.
	//shading_type determines whether flat, Gourard or Phong shading will be used. 0=flat, 1=Gourard, 2=Phong 
	populate: function(num_vertices, radius) {

		var arrays = [this.positions, this.normals, this.texture_coords, this.indices];

		drawSphere(num_vertices, radius, arrays);
	}
}, Shape)