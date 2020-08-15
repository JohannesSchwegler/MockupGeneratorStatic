import React, { useRef, useEffect, useState } from 'react'
import s from "./Canvas.scss"
import ImageUploader from "react-images-upload";

import * as THREE from 'three';
import { Row } from "../row/Row"

import imgSrc from "../../assets/images/mockup/laptop.jpg"
import imgMaskSrc from "../../assets/images/mockup/laptop--mask.png"
import display from "../../assets/images/cube.png"


const widthX = 1000
const img = new Image();
img.src = imgSrc;
export default function Canvas(props: any) {
    let ctx: any;
    const [pictures, setPictures] = useState([] as any);

    const onDrop = (picture: any) => {
    
        updateCanvas(picture, ctx)
        setPictures([...pictures, picture]);
    };



    useEffect(() => {

        var iShoe = new Image, iMask = new Image, iPatt = new Image, count = 3;
        iShoe.onload = iMask.onload = iPatt.onload = loader;
        iShoe.src = imgSrc;
        iMask.src = imgMaskSrc;
        iPatt.src = display;

        function loader() {
            if (--count) return;  // wait until all images has loaded

            ctx = setupMainCanvas(widthX, {
                mockupWidth: img.width,
                mockupHeight: img.height,
            })
            drawMockup(ctx, iShoe, iMask, iPatt)
        }
    }, [])



    return (
        <Row>
            <div className={s.canvas__col__left}>
                <canvas className={s.canvas}></canvas>

            </div>
            <div className={s.canvas__col__right}>

                <div className={s.canvas__control}>

                    <h1 className={s.canvas__control__title}>Apple Pro Display XDR</h1>
                    <ImageUploader
                        className={s.uploader}
                        {...props}
                        withIcon={true}
                        onChange={onDrop}
                        withPreview={true}
                        imgExtension={[".jpg", ".gif", ".png", ".gif"]}
                        maxFileSize={5242880}
                    />

                </div>

            </div>

        </Row>
    )
}





interface mockupProps {
    mockupWidth: number
    mockupHeight: number
}



function updateCanvas(image: any, ctx: any) {
    const iMask = new Image

    iMask.src = image;
    iMask.onload = function () {
        ctx.drawImage(image, 0, 0);
    };


}

function setupMainCanvas(widthX: number, mockup: mockupProps) {
    const canvasDomElement: HTMLCanvasElement = document.querySelector(`.${s.canvas}`) || document.createElement("canvas")
    console.log(canvasDomElement);
    const { mockupWidth, mockupHeight } = mockup;
    const canvasWidth = canvasDomElement.width = widthX
    const canvasHeight = canvasDomElement.height = (mockupHeight / mockupWidth) * widthX

    var ctx: any = canvasDomElement.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    return ctx
}



function drawMockup(ctx: any, mockup: HTMLImageElement, mask: HTMLImageElement, image: HTMLImageElement) {
    var pattern = ctx.createPattern(image, "repeat");

    // draw in mask
    ctx.drawImage(mask, 0, 0, img.width, img.height,     // source rectangle
        0, 0, widthX, (img.height / img.width) * widthX);
    // change comp mode
    ctx.globalCompositeOperation = "source-atop";

    // fill mask
    ctx.scale(0.5, 0.5);                 // scale: 0.5
    ctx.fillStyle = pattern;             // remember to double the area to fill:
    ctx.fillRect(0, 0, ctx.canvas.width * 2, ctx.canvas.height * 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);       // reset transform

    // draw shoe behind mask
    ctx.globalCompositeOperation = "destination-atop";

    ctx.drawImage(mockup, 0, 0, img.width, img.height,     // source rectangle
        0, 0, widthX, (img.height / img.width) * widthX); // destination rectangle

    // to make it more realistic, add mask in blend mode (does not work in IE):
    ctx.globalCompositeOperation = "multiply";
    if (ctx.globalCompositeOperation === "multiply") {
        /*   ctx.drawImage(iMask, 0, 0); */
    }

}