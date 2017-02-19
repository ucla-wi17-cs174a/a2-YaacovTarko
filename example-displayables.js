// UCLA's Graphics Example Code (Javascript and C++ translations available), by Garett Ridge for CS174a.
// example-displayables.js - The subclass definitions here each describe different independent animation processes that you want to fire off each frame, by defining a display
// event and how to react to key and mouse input events.  Make one or two of your own subclasses, and fill them in with all your shape drawing calls and any extra key / mouse controls.

// Now go down to Example_Animation's display() function to see where the sample shapes you see drawn are coded, and a good place to begin filling in your own code.

var control_sensitivity=1; 

Declare_Any_Class( "Debug_Screen",  // Debug_Screen - An example of a displayable object that our class Canvas_Manager can manage.  Displays a text user interface.
  { 'construct': function( context )
      { this.define_data_members( { string_map: context.shared_scratchpad.string_map, start_index: 0, tick: 0, visible: false, graphicsState: new Graphics_State() } );
        shapes_in_use.debug_text = new Text_Line( 35 );
      },
    'init_keys': function( controls )
      { controls.add( "t",    this, function() { this.visible ^= 1;                                                                                                             } );
        controls.add( "up",   this, function() { this.start_index = ( this.start_index + 1 ) % Object.keys( this.string_map ).length;                                           } );
        controls.add( "down", this, function() { this.start_index = ( this.start_index - 1   + Object.keys( this.string_map ).length ) % Object.keys( this.string_map ).length; } );
        this.controls = controls;
      },
    'update_strings': function( debug_screen_object )   // Strings that this displayable object (Debug_Screen) contributes to the UI:
      { debug_screen_object.string_map["tick"]              = "Frame: " + this.tick++;
        debug_screen_object.string_map["text_scroll_index"] = "Text scroll index: " + this.start_index;
      },
    'display': function( time )
      { if( !this.visible ) return;

        shaders_in_use["Default"].activate();
        gl.uniform4fv( g_addrs.shapeColor_loc, Color( .8, .8, .8, 1 ) );

        var font_scale = scale( .02, .04, 1 ),
            model_transform = mult( translation( -.95, -.9, 0 ), font_scale ),
            strings = Object.keys( this.string_map );

        for( var i = 0, idx = this.start_index; i < 4 && i < strings.length; i++, idx = (idx + 1) % strings.length )
        {
          shapes_in_use.debug_text.set_string( this.string_map[ strings[idx] ] );
          shapes_in_use.debug_text.draw( this.graphicsState, model_transform, true, vec4(0,0,0,1) );  // Draw some UI text (strings)
          model_transform = mult( translation( 0, .08, 0 ), model_transform );
        }
        model_transform = mult( translation( .7, .9, 0 ), font_scale );
        shapes_in_use.debug_text.set_string( "Controls:" );
        shapes_in_use.debug_text.draw( this.graphicsState, model_transform, true, vec4(0,0,0,1) );    // Draw some UI text (controls title)

        for( let k of Object.keys( this.controls.all_shortcuts ) )
        {
          model_transform = mult( translation( 0, -0.08, 0 ), model_transform );
          shapes_in_use.debug_text.set_string( k );
          shapes_in_use.debug_text.draw( this.graphicsState, model_transform, true, vec4(0,0,0,1) );  // Draw some UI text (controls)
        }
      }
  }, Animation );

Declare_Any_Class( "Example_Camera",     // An example of a displayable object that our class Canvas_Manager can manage.  Adds both first-person and
  { 'construct': function( context )     // third-person style camera matrix controls to the canvas.
      { // 1st parameter below is our starting camera matrix.  2nd is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
        context.shared_scratchpad.graphics_state = new Graphics_State( translation(0, 0,-45), perspective(45, canvas.width/canvas.height, .1, 1000), 0 );
        this.define_data_members( { graphics_state: context.shared_scratchpad.graphics_state, thrust: vec3(), origin: vec3( 0, 5, 0 ), looking: false } );

        // *** Mouse controls: ***
        this.mouse = { "from_center": vec2() };
        var mouse_position = function( e ) { return vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2 ); };   // Measure mouse steering, for rotating the flyaround camera.
        canvas.addEventListener( "mouseup",   ( function(self) { return function(e) { e = e || window.event;    self.mouse.anchor = undefined;              } } ) (this), false );
        canvas.addEventListener( "mousedown", ( function(self) { return function(e) { e = e || window.event;    self.mouse.anchor = mouse_position(e);      } } ) (this), false );
        canvas.addEventListener( "mousemove", ( function(self) { return function(e) { e = e || window.event;    self.mouse.from_center = mouse_position(e); } } ) (this), false );
        canvas.addEventListener( "mouseout",  ( function(self) { return function(e) { self.mouse.from_center = vec2(); }; } ) (this), false );    // Stop steering if the mouse leaves the canvas.
      },
    'init_keys': function( controls )   // init_keys():  Define any extra keyboard shortcuts here
      { controls.add( "Space", this, function() { this.thrust[2] =  1; } );     controls.add( "Space",     this, function() { this.thrust[2] =  0; }, {'type':'keyup'} );
        
        controls.add( "1",     this, function() { control_sensitivity=1});
        controls.add( "2",     this, function() { control_sensitivity=2});
        controls.add( "3",     this, function() { control_sensitivity=3});
        controls.add( "4",     this, function() { control_sensitivity=4});
        controls.add( "5",     this, function() { control_sensitivity=5});
        controls.add( "6",     this, function() { control_sensitivity=6});
        controls.add( "7",     this, function() { control_sensitivity=7});
        controls.add( "8",     this, function() { control_sensitivity=8});
        controls.add( "9",     this, function() { control_sensitivity=9});


        controls.add( "Right", this, function() { this.graphics_state.camera_transform = mult( rotation( control_sensitivity, 0, 1,  0 ), this.graphics_state.camera_transform ); } );
        controls.add( "Left",  this, function() { this.graphics_state.camera_transform = mult( rotation( control_sensitivity, 0, -1, 0 ), this.graphics_state.camera_transform ); } );
        controls.add( "Up",    this, function() { this.graphics_state.camera_transform = mult( rotation( control_sensitivity, -1, 0, 0 ), this.graphics_state.camera_transform ); } );
        controls.add( "Down",  this, function() { this.graphics_state.camera_transform = mult( rotation( control_sensitivity,  1, 0, 0 ), this.graphics_state.camera_transform ); } );
        
        controls.add( "o",     this, function() { this.origin = mult_vec( inverse( this.graphics_state.camera_transform ), vec4(0,0,0,1) ).slice(0,3)         ; } );
        controls.add( "r",     this, function() { this.graphics_state.camera_transform = translation(0, 0, -45);   control_sensitivity=1;                     ; } );
      },
    'update_strings': function( user_interface_string_manager )       // Strings that this displayable object (Animation) contributes to the UI:
      { var C_inv = inverse( this.graphics_state.camera_transform ), pos = mult_vec( C_inv, vec4( 0, 0, 0, 1 ) ),
                                                                  z_axis = mult_vec( C_inv, vec4( 0, 0, 1, 0 ) );                                                                 
        user_interface_string_manager.string_map["origin" ] = "Center of rotation: " + this.origin[0].toFixed(0) + ", " + this.origin[1].toFixed(0) + ", " + this.origin[2].toFixed(0);                                                       
        user_interface_string_manager.string_map["cam_pos"] = "Cam Position: " + pos[0].toFixed(2) + ", " + pos[1].toFixed(2) + ", " + pos[2].toFixed(2);    // The below is affected by left hand rule:
        user_interface_string_manager.string_map["facing" ] = "Facing: "       + ( ( z_axis[0] > 0 ? "West " : "East ") + ( z_axis[1] > 0 ? "Down " : "Up " ) + ( z_axis[2] > 0 ? "North" : "South" ) );
      },
    'display': function( time )
      { var leeway = 70,  degrees_per_frame = .0004 * this.graphics_state.animation_delta_time,
                          meters_per_frame  =   .01 * this.graphics_state.animation_delta_time;
        // Third-person camera mode: Is a mouse drag occurring?
        if( this.mouse.anchor )
        {
          var dragging_vector = subtract( this.mouse.from_center, this.mouse.anchor );            // Arcball camera: Spin the scene around the world origin on a user-determined axis.
          if( length( dragging_vector ) > 0 )
            this.graphics_state.camera_transform = mult( this.graphics_state.camera_transform,    // Post-multiply so we rotate the scene instead of the camera.
                mult( translation( this.origin ),
                mult( rotation( .05 * length( dragging_vector ), dragging_vector[1], dragging_vector[0], 0 ),
                      translation(scale_vec( -1, this.origin ) ) ) ) );
        }
        // First-person flyaround mode:  Determine camera rotation movement when the mouse is past a minimum distance (leeway) from the canvas's center.
        var offset_plus  = [ this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway ];
        var offset_minus = [ this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway ];

        for( var i = 0; this.looking && i < 2; i++ )      // Steer according to "mouse_from_center" vector, but don't start increasing until outside a leeway window from the center.
        {
          var velocity = ( ( offset_minus[i] > 0 && offset_minus[i] ) || ( offset_plus[i] < 0 && offset_plus[i] ) ) * degrees_per_frame;  // Use movement's quantity unless the &&'s zero it out
          this.graphics_state.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), this.graphics_state.camera_transform );     // On X step, rotate around Y axis, and vice versa.
        }     // Now apply translation movement of the camera, in the newest local coordinate frame
        this.graphics_state.camera_transform = mult( translation( scale_vec( meters_per_frame, this.thrust ) ), this.graphics_state.camera_transform );
      }
  }, Animation );

Declare_Any_Class( "Example_Animation",  // An example of a displayable object that our class Canvas_Manager can manage.  This one draws the scene's 3D shapes.
  { 'construct': function( context )
      { this.shared_scratchpad    = context.shared_scratchpad;
      
        //Sphere constructor arguments: first is num_vertices, second is shading type, third is radius
        shapes_in_use.sun            = new Sphere(200, 1.5); 
        shapes_in_use.planet1 = Sphere.prototype.auto_flat_shaded_version(17, 0.6);   
        shapes_in_use.planet2 = new Sphere(50, 0.8);
        shapes_in_use.planet3 = new Sphere(200, 0.7); 
        shapes_in_use.planet4 = new Sphere(100, 0.5); 
        shapes_in_use.moon    = new Sphere(100, 0.3);

        //animate by default, so you don't have to press a key to start
        this.shared_scratchpad.animate ^= 1;
      },
    'init_keys': function( controls )   // init_keys():  Define any extra keyboard shortcuts here
      {
        controls.add( "ALT+g", this, function() { this.shared_scratchpad.graphics_state.gouraud       ^= 1; } );   // Make the keyboard toggle some
        controls.add( "ALT+n", this, function() { this.shared_scratchpad.graphics_state.color_normals ^= 1; } );   // GPU flags on and off.
        controls.add( "ALT+a", this, function() { this.shared_scratchpad.animate                      ^= 1; } );
      },
    'update_strings': function( user_interface_string_manager )       // Strings that this displayable object (Animation) contributes to the UI:
      {
        user_interface_string_manager.string_map["time"]    = "Animation Time: " + Math.round( this.shared_scratchpad.graphics_state.animation_time )/1000 + "s";
        user_interface_string_manager.string_map["animate"] = "Animation " + (this.shared_scratchpad.animate ? "on" : "off") ;
      },
    'display': function(time)
      {
        var graphics_state  = this.shared_scratchpad.graphics_state,
            model_transform = mat4();             // We have to reset model_transform every frame, so that as each begins, our basis starts as the identity.
        shaders_in_use[ "Default" ].activate();

        // *** Lights: *** Values of vector or point lights over time.  Arguments to construct a Light(): position or vector (homogeneous coordinates), color, size
        // If you want more than two lights, you're going to need to increase a number in the vertex shader file (index.html).  For some reason this won't work in Firefox.
        graphics_state.lights = [];                    // First clear the light list each frame so we can replace & update lights.

        var blueSunColor = Color(0.1, 0.8,0.98, 1);

        var t = graphics_state.animation_time/1000, light_orbit = [ Math.cos(t), Math.sin(t) ];

        //I'm gonna have to fix the location of this light, and make sure it's actually working
        graphics_state.lights.push( new Light( vec4( 0, 2, 0, 1 ), blueSunColor, 50) );
        //graphics_state.lights.push( new Light( vec4(  30*light_orbit[0],  30*light_orbit[1],  34*light_orbit[0], 1 ), Color( 0, .4, 0, 1 ), 100000 ) );


        // *** Materials: *** Declare new ones as temps when needed; they're just cheap wrappers for some numbers.
        // 1st parameter:  Color (4 floats in RGBA format), 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Texture image.
        var   blueSun         = new Material( blueSunColor,            .9, 0, 0, 100),
              greyPlanet      = new Material( Color( .85,.85,.9,1 ),   .4, .1, .2, 50 ),
              blueGreenPlanet = new Material( Color(0.07,0.34,0.27),   .5, .6, 1, 10),
              calmBluePlanet  = new Material( Color(0.3, 0.6, 1) ,     .7, 1, 2,  10),
              orangePlanet    = new Material( Color(0.51, 0.31, .2), .6, .6, 1,  10), 
              moon            = new Material( Color(0.88, 0.37, 0.14), .5, 1, 1.5,  10),
              placeHolder     = new Material( Color(0,0,0,0), 0,0,0,0, "Blank" );

        /**********************************
        Start coding down here!!!!
        **********************************/                                  // From here on down it's just some example shapes drawn for you -- replace them with your own!


        this.shared_scratchpad.graphics_state.gouraud =true;  //planet 1 should be flat shaded (in the fragment shader)

        var sun_transform = mult( model_transform, translation (0, 2, 0));
        shapes_in_use.sun         .draw( graphics_state, sun_transform, blueSun ); 


        var planet1_transform = mult (sun_transform, rotation(107*t, vec3(0, 0, 1)));
        planet1_transform = mult (planet1_transform, translation(-5, 0, 0));
        shapes_in_use.planet1.draw(graphics_state, planet1_transform, greyPlanet);

        this.shared_scratchpad.graphics_state.gouraud =true; //planet 2 is supposed to be Gouraud shaded

        var planet2_transform = mult(sun_transform, rotation(74*t, vec3(0, 0, 1)));
        planet2_transform = mult (planet2_transform, translation(-8, 0, 0));
        shapes_in_use.planet2.draw(graphics_state, planet2_transform, blueGreenPlanet); 

        this.shared_scratchpad.graphics_state.gouraud =false;  //Planets 3 and 4 and the moon will be phong shaded

        var planet3_transform = mult(sun_transform, rotation(53*t, vec3(0, 0, 1)));
        planet3_transform = mult (planet3_transform, translation(-11, 0, 0));
        shapes_in_use.planet3.draw(graphics_state, planet3_transform, calmBluePlanet); 

        var planet4_transform = mult(sun_transform, rotation(45*t, vec3(0, 0, 1)));
        planet4_transform = mult (planet4_transform, translation(-15, 0, 0));
        shapes_in_use.planet4.draw(graphics_state, planet4_transform, orangePlanet); 

        var moon_transform = mult(planet4_transform, rotation(110*t, vec3(0, 0, 1)));
        moon_transform = mult(moon_transform, translation(-2, 0, 0));
        shapes_in_use.moon.draw(graphics_state, moon_transform, moon); 

        /*

        
        model_transform = mult( model_transform, translation( 0, 5, 0 ) );
        shapes_in_use.triangle       .draw( graphics_state, model_transform, purplePlastic );
        */
       }
  }, Animation );