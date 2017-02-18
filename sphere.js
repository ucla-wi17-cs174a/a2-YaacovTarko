//Generates spheres for WebGL to draw

//a, b, and c are points 
function perFragmentNormals(a, b, c, normalArray){
	var edge1=subtract(b,a);
	var edge2=subtract (c,a);	
	var normal=normalize(cross(edge1, edge2));
	for(var i=0; i<3; i++){
		//for each vertex, push the normals of the associated fragments 
		normalArray.push(normal); 
	}

}

function drawSphere(num_vertices, flat_shading, radius, arrays) {
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
			arrays[0].push(radius * x);
			arrays[0].push(radius * y);
			arrays[0].push(radius * z);

			if (flat_shading) {
				//per-primitive normals will be calculated when primitives are generated, when triangles are indexed
			} else {
				//push per-vertex normals
				arrays[1].push(x);
				arrays[1].push(y);
				arrays[1].push(z);
			}
			//push texture coords 
			arrays[2].push(u);
			arrays[2].push(v);
		}
	}

	//now that we've generated all the data for each vertex along the lat and long lines, we can iterate across the lines to index each triangle
	//if you're flat shading, you're gonna need to calculate per-triangle normals here as well
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

			if(flat_shading){
				//we'll compute the per-primative normals for the two triangles and push them into the normals array
				var vertex1=vec3(arrays[0][3*first], arrays[0][3*first+1], arrays[0][3*first+2]);
				var vertex2=vec3(arrays[0][3*second],arrays[0][3*second+1],arrays[0][3*second+2]);
				var vertex3=vec3(arrays[0][3*first+3], arrays[0][3*first+4], arrays[0][3*first+5]); 
				perFragmentNormals(vertex1, vertex2, vertex3, arrays[1]);

			}
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
	populate: function(num_vertices, shading_type, radius) {

		var arrays = [this.positions, this.normals, this.texture_coords, this.indices];

		drawSphere(num_vertices, !shading_type, radius, arrays);
		//drawSphere(va, vb, vc, vd, num_vertices, !shading_type, arrays);
	}
}, Shape)