import React, { useRef, useEffect, useState } from 'react'
import s from "./Canvas.scss"
import ImageUploader from "react-images-upload";


import { Row } from "../row/Row"
import * as PIXI from 'pixi.js'
import mockupSrc from "../../assets/images/mockup/laptop.jpg"
import maskSrc from "../../assets/images/mockup/laptop--mask.png"
import imageSrc from "../../assets/images/share.png"



export default function Canvas(props: any) {


    useEffect(() => {
        const image = new Image()
        image.src = mockupSrc
        const app = new PIXI.Application({ width: 900, height: (image.height / image.width) * 900, antialias: true });
        const canvasDomElement: HTMLCanvasElement = document.querySelector(`.${s.canvas}`) || document.createElement("canvas")
        canvasDomElement.appendChild(app.view);

        
        app.stage.interactive = true;
        
        const bg = PIXI.Sprite.from(mockupSrc);
        
        app.stage.addChild(bg);
        
        const cells = PIXI.Sprite.from('https://pixijs.io/examples/examples/assets/cells.png');
        
        cells.scale.set(1.5);
        
        const mask = PIXI.Sprite.from('https://pixijs.io/examples/examples/assets/flowerTop.png');
        mask.anchor.set(0.5);
        mask.x = 310;
        mask.y = 190;
        
        cells.mask = mask;
        
        app.stage.addChild(mask, cells);
        
        const target = new PIXI.Point();
        
        reset();
        
        function reset() {
            target.x = Math.floor(Math.random() * 550);
            target.y = Math.floor(Math.random() * 300);
        }
        
        app.ticker.add(() => {
            mask.x += (target.x - mask.x) * 0.1;
            mask.y += (target.y - mask.y) * 0.1;
        
            if (Math.abs(mask.x - target.x) < 1) {
                reset();
            }
        });
        
    }, [])



    return (
        <Row>
            <div className={s.canvas__col__left}>
                <div className={s.canvas}></div>

            </div>
            <div className={s.canvas__col__right}>

                <div className={s.canvas__control}>

                    <h1 className={s.canvas__control__title}>Apple Pro Display XDR</h1>


                </div>

            </div>

        </Row>
    )
}


