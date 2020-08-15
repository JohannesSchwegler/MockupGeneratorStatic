import React, { useRef, useEffect } from 'react'
import s from "./Canvas.scss"

import * as THREE from 'three';

import imgSrc from "../../assets/images/mockup/laptop.jpg"
import imgMaskSrc from "../../assets/images/mockup/laptop--mask.png"
import display from "../../assets/images/cube.png"

export default function Canvas() {


    const img = new Image();
    img.onload = function () {
       console.log(this.width);
    }
    img.src = imgSrc;
    useEffect(() => {
        var iShoe = new Image, iMask = new Image, iPatt = new Image, count = 3;
        iShoe.onload = iMask.onload = iPatt.onload = loader;
        iShoe.src = imgSrc;
        iMask.src = imgMaskSrc;
        iPatt.src = display;

        function loader() {
            if (--count) return;  // wait until all images has loaded

            const canvasDomElement: any = document.querySelector(`.${s.canvas}`)
            console.log(canvasDomElement);
            canvasDomElement.width = window.innerWidth;
            canvasDomElement.height = window.innerHeight
            var ctx = canvasDomElement.getContext("2d"),
                pattern = ctx.createPattern(iPatt, "repeat");

            // draw in mask
            ctx.drawImage(iMask, 0, 0);

            // change comp mode
            ctx.globalCompositeOperation = "source-atop";

            // fill mask
            ctx.scale(0.5, 0.5);                 // scale: 0.5
            ctx.fillStyle = pattern;             // remember to double the area to fill:
            ctx.fillRect(0, 0, ctx.canvas.width * 2, ctx.canvas.height * 2);
            ctx.setTransform(1, 0, 0, 1, 0, 0);       // reset transform

            // draw shoe behind mask
            ctx.globalCompositeOperation = "destination-atop";
            ctx.drawImage(iShoe, 0, 0);

            // to make it more realistic, add mask in blend mode (does not work in IE):
            ctx.globalCompositeOperation = "multiply";
            if (ctx.globalCompositeOperation === "multiply") {
                ctx.drawImage(iMask, 0, 0);
            }
        }
    }, [])



    return (
        <canvas className={s.canvas}></canvas>
    )
}


function otherway() {

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(1500, 500);

    const canvasDomElement: any = document.querySelector(`.${s.canvas}`)
    canvasDomElement.appendChild(renderer.domElement);

    // camera 
    var camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = -250;
    camera.position.z = 400;
    camera.rotation.x = 45 * (Math.PI / 180);

    // scene 
    var scene = new THREE.Scene();
    scene.add(camera); //ADDED




    const textureImage = require('../../assets/images/step.png');
    console.log(textureImage);
    var texture = new THREE.TextureLoader().load('https://s3.amazonaws.com/duhaime/blog/tsne-webgl/data/100-img-atlas.jpg');
    var material = new THREE.MeshBasicMaterial({ map: texture });

    // plane
    var plane: any = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), material);
    plane.overdraw = true;
    scene.add(plane);

    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x555555);
    scene.add(ambientLight);

    // add directional light source
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // create wrapper object that contains three.js objects
    var three = {
        renderer: renderer,
        camera: camera,
        scene: scene,
        plane: plane
    };
    renderer.render(scene, camera);


}