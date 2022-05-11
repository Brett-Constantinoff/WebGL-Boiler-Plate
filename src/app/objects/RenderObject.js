class RenderObject{
    constructor(gl, shader, max){
        //context
        this.gl = gl;
        //shader program
        this.shader = shader;
        //max amount to render
        this.max = max;
        //holds all instances
        this.instances = []
        //buffer data for instances
        this.instanceBufferData = {
            transform: [],
            colour: [],
            normal: [],
        };
    }

    //initializes the objects buffer data
    initBuffers(vertexPositions, vertexNormals, indices){
        //create and bind the current vao
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);

        //create our position buffer
        var vertexPositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexPositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexPositions), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            this.shader.info.attribs.vertexPositions, 
            3, 
            this.gl.FLOAT, 
            false, 
            0, 
            0
        );
        this.gl.enableVertexAttribArray(this.shader.info.attribs.vertexPositions);

        //create our normal buffer
        var vertexNormalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexNormalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexNormals), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            this.shader.info.attribs.vertexNormals,
            3, 
            this.gl.FLOAT, 
            false, 
            0, 
            0
        );
        this.gl.enableVertexAttribArray(this.shader.info.attribs.vertexNormals);
        
        
        //buffer for indexed drawing
        let ibo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW)

        //make these attributes incase we need to modify this buffer data later
        this.transformBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.transformBuffer);
        //create buffer big enough for max transforms
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(16 * 4 * this.max), this.gl.DYNAMIC_DRAW);
        
        //each matrix is 4 attributes
        for(var i = 0; i < 4; i++){
            var location = this.shader.info.attribs.transformMatrix + i;
            this.gl.enableVertexAttribArray(location);
            //offset per row
            var offset = i * 16;
            this.gl.vertexAttribPointer(
                location, 
                4, 
                this.gl.FLOAT, 
                false, 
                4 * 16, 
                offset
            );
            //tells webgl this attribute is per instance
            this.gl.vertexAttribDivisor(location, 1);
        }

        //do the normal matrix instanced buffer
        this.normalMatBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalMatBuffer);
        //create bufffer big enough
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(16 * 4 * this.max), this.gl.DYNAMIC_DRAW);
        
        //setup attribs
        for(var i = 0; i < 4; i++){
            var location = this.shader.info.attribs.normalMatrix + i;
            this.gl.enableVertexAttribArray(location);
            var offset = i * 16;
            this.gl.vertexAttribPointer(
                location, 
                4, 
                this.gl.FLOAT, 
                false, 
                4 * 16, 
                offset
            );
            this.gl.vertexAttribDivisor(location, 1);
        }
        
        
        //do our instanced colour buffer
        this.colourBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
         //create buffer big enough for max colours
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(3 * 4 * this.max), this.gl.DYNAMIC_DRAW);

        this.gl.vertexAttribPointer(
            this.shader.info.attribs.vertexColours, 
            3, 
            this.gl.FLOAT, 
            false, 
            0, 
            0
        );
        this.gl.enableVertexAttribArray(this.shader.info.attribs.vertexColours);
        this.gl.vertexAttribDivisor(this.shader.info.attribs.vertexColours, 1);
        
        //good practice to unbind the vao once done
        this.gl.bindVertexArray(null);
    }

    //rotates an instance around the rotation axis by the given angle
    rotate(rotationAxis, angle, instance){
        var rotation = this.instances[instance].rotation;
        mat4.rotate(rotation, rotation, degToRad(angle), rotationAxis);
    }

    //moves an instance around
    translate(translationVector, instance){
        var position = this.instances[instance].position;
        vec3.add(position, position, translationVector);
    }

    //changes the instance size along the specified axis
    scale(scaleAxis, scaleFactor, instance){
        var scale = this.instances[instance].scale;
        if(scaleAxis[0] === 1){
            scale[0] *= scaleFactor;
        }
        if(scaleAxis[1] === 1){
            scale[1] *= scaleFactor;
        }
        if(scaleAxis[2] === 1){
            scale[2] *= scaleFactor;
        }
    }

    //adds new instance to render
    addInstance(instance){
        if(this.instances.length < this.max){
            this.instances.push(instance)
        }
    }

    //calculate the centroid of an objects vertex positions
    getCentroid(){  
        var centroid = vec3.fromValues(0, 0, 0);
        var average = 1.0 / (this.vertexPositions.length / 3.0);
        for(var i = 0; i < this.vertexPositions; i += 3){
            var vertexPosition = vec3.fromValues(this.vertexPositions[i], this.vertexPositions[i + 1], this.vertexPositions[i + 2]);
            vec3.add(centroid, centroid, vertexPosition);
        }
        vec3.scale(centroid, centroid, average);
        return centroid;
    }
}