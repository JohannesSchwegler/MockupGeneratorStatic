import React, { useRef, useEffect, useState } from 'react'
import s from "./Canvas.scss"
import ImageUploader from "react-images-upload";

import * as THREE from 'three';
import { Row } from "../row/Row"

import mockupSrc from "../../assets/images/mockup/laptop.jpg"
import maskSrc from "../../assets/images/mockup/laptop--mask.png"
import imageSrc from "../../assets/images/share.png"


console.log(maskSrc)

const widthX = 1000
const img = new Image();
img.src = mockupSrc;


let mockup = new Image;
let mask = new Image;
let image = new Image;



mockup.src = mockupSrc;
mask.src = maskSrc;
image.src = imageSrc;

export default function Canvas(props: any) {
    let ctx: any;
    const [pictures, setPictures] = useState([] as any);

    const onDrop = (picture: any) => {


        setPictures([...pictures, picture]);
    };



    useEffect(() => {
        console.log(pictures);
        if (pictures.length) {
            const image = new Image()

            const url = URL.createObjectURL(pictures[0][0]);
            image.src = url;
            mockup.onload = drawMockup(mockup, mask, image);
        } else {
            mockup.onload = drawMockup(mockup, mask, image);
        }

        console.log("gg");


    }, [pictures])



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

function previewFile(file: any) {

    const image = new Image()

    const url = URL.createObjectURL(file[0]);
    image.src = url;
    image.onload = drawMockup(mockup, mask, image);
    console.log(url);
}

/* function loader(ctx:any, mockup:any, mask:any, image:any) {
    ctx = setupMainCanvas(widthX, {
        mockupWidth: img.width,
        mockupHeight: img.height,
    })
    drawMockup(ctx, mockup, mask, image)

}
 */

interface mockupProps {
    mockupWidth: number
    mockupHeight: number
}


function setupMainCanvas(widthX: number, mockup: mockupProps) {
    const canvasDomElement: HTMLCanvasElement = document.querySelector(`.${s.canvas}`) || document.createElement("canvas")


    const { mockupWidth, mockupHeight } = mockup;
    const canvasWidth = canvasDomElement.width = widthX
    const canvasHeight = canvasDomElement.height = (mockupHeight / mockupWidth) * widthX

    var ctx: any = canvasDomElement.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    return ctx
}



function drawMockup(mockup: HTMLImageElement, mask: HTMLImageElement, image: HTMLImageElement) {

    const ctx = setupMainCanvas(900, { mockupWidth: mockup.width, mockupHeight: mockup.height })
    var pattern = ctx.createPattern(image, "no-repeat");

    // draw in mask
    ctx.drawImage(mask, 0, 0, img.width, img.height,     // source rectangle
        0, 0, widthX, (img.height / img.width) * widthX);
    // change comp mode
    ctx.globalCompositeOperation = "source-atop";

    // fill mask
    ctx.scale(.5,.5);                 // scale: 0.5
    ctx.fillStyle = pattern;             // remember to double the area to fill:
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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

