import React, { useRef, useEffect, useState } from 'react'
import s from "./Canvas.scss"
import ImageUploader from "react-images-upload";


import { Row } from "../row/Row"
import * as PIXI from "pixi.js";
//@ts-ignore
global.PIXI = PIXI;
require("pixi-projection");
import mockupSrc from "../../assets/images/mockup/laptop.jpg"
import maskSrc from "../../assets/images/mockup/laptop--mask.png"
import imageSrc from "../../assets/images/share.png"



export default function Canvas(props: any) {
    const img = new Image()
    img.src = mockupSrc

    const canvasWidth = 1000;
    const canvasHeight = (img.height / img.width) * canvasWidth
    console.log(img.height);

    useEffect(() => {
        const app = new PIXI.Application({ width: canvasWidth, height: canvasHeight, backgroundColor: 0x1099bb });
        //@ts-ignore
        document.getElementById("canvas").appendChild(app.view);

        const w = canvasWidth /2,
            h = app.screen.height / 2;
        //@ts-ignore
        function createSquare(x, y) {
            const square = new PIXI.Sprite(PIXI.Texture.WHITE);
            square.tint = 0xff0000;
            //@ts-ignore
            square.factor = 1;
            square.anchor.set(0.5);
            square.position.set(x, y);
            return square;
        }


        // create a new Sprite from an image path
        const backgroundImage = PIXI.Sprite.from(mockupSrc);
        backgroundImage.width = canvasWidth;
        backgroundImage.height= canvasHeight;
        // center the sprite's anchor point
        backgroundImage.anchor.set(0, 0);



        app.stage.addChild(backgroundImage);

        const squares = [
            createSquare(w - 150, h - 150),
            createSquare(w + 150, h - 150),
            createSquare(w + 150, h + 150),
            createSquare(w - 150, h + 150),
        ];

        const quad = squares.map((s) => s.position);

        // add sprite itself
        //@ts-ignore
        const containerSprite = new PIXI.projection.Sprite2s(PIXI.Texture.from(imageSrc));
        containerSprite.anchor.set(0.5);

        app.stage.addChild(containerSprite);
        squares.forEach((s) => { app.stage.addChild(s); });

        //@ts-ignore
        const point1 = new PIXI.ObservablePoint(null, null, 250, 150)
        //@ts-ignore
        const point2 = new PIXI.ObservablePoint(null, null, 550, 150)
        //@ts-ignore
        const point3 = new PIXI.ObservablePoint(null, null, 500, 494)
        //@ts-ignore
        const point4 = new PIXI.ObservablePoint(null, null, 250, 450)

        const points = [point1, point2, point3, point4]
        // Listen for animate update
        app.ticker.add((delta) => {
        /*     containerSprite.proj.mapBilinearSprite(containerSprite, points); */
            containerSprite.proj.mapBilinearSprite(containerSprite, quad);
        });

        squares.forEach((s) => { addInteraction(s); });

        // let us add sprite to make it more funny
        //@ts-ignore
        const bunny = new PIXI.projection.Sprite2s(PIXI.Texture.from(mockupSrc));
        bunny.anchor.set(0.5);
        /*   containerSprite.addChild(bunny);
           */
        addInteraction(bunny);

        // === INTERACTION CODE  ===
        //@ts-ignore
        function toggle(obj) {
        }
        //@ts-ignore
        function snap(obj) {
            console.log("sbap");
            console.log(obj);
            if (obj === bunny) {
                obj.position.set(0);
            } else {
                obj.position.x = Math.min(Math.max(obj.position.x, 0), app.screen.width);
                obj.position.y = Math.min(Math.max(obj.position.y, 0), app.screen.height);
            }
        }
        //@ts-ignore
        function addInteraction(obj) {
            obj.interactive = true;
            obj
                .on('pointerdown', onDragStart)
                .on('pointerup', onDragEnd)
                .on('pointerupoutside', onDragEnd)
                .on('pointermove', onDragMove);
        }
        //@ts-ignore
        function onDragStart(event) {
            console.log(event.currentTarget)
            const obj = event.currentTarget;
            obj.dragData = event.data;
            obj.dragging = 1;
            obj.dragPointerStart = event.data.getLocalPosition(obj.parent);
            obj.dragObjStart = new PIXI.Point();
            obj.dragObjStart.copyFrom(obj.position);
            obj.dragGlobalStart = new PIXI.Point();
            obj.dragGlobalStart.copyFrom(event.data.global);
        }
        //@ts-ignore
        function onDragEnd(event) {
            const obj = event.currentTarget;
            if (obj.dragging === 1) {
                toggle(obj);
            } else {
                snap(obj);
            }
            obj.dragging = 0;
            obj.dragData = null;
            // set the interaction data to null
        }
        //@ts-ignore
        function onDragMove(event) {
            const obj = event.currentTarget;
            if (!obj.dragging) return;
            const data = obj.dragData; // it can be different pointer!
            if (obj.dragging === 1) {
                // click or drag?
                if (Math.abs(data.global.x - obj.dragGlobalStart.x)
                    + Math.abs(data.global.y - obj.dragGlobalStart.y) >= 3) {
                    // DRAG
                    obj.dragging = 2;
                }
            }
            if (obj.dragging === 2) {
                const dragPointerEnd = data.getLocalPosition(obj.parent);

                if (dragPointerEnd.x >= -2000 && dragPointerEnd.x <= 2000
                    && dragPointerEnd.y >= -2000 && dragPointerEnd.y <= 2000) {
                    // DRAG only if its not too far away, and its not NaN
                    obj.position.set(
                        obj.dragObjStart.x + (dragPointerEnd.x - obj.dragPointerStart.x),
                        obj.dragObjStart.y + (dragPointerEnd.y - obj.dragPointerStart.y),
                    );
                }
            }
        }



    }, [])



    return (
        <Row>
            <div className={s.canvas__col__left}>
                <div id="canvas" className={s.canvas}></div>

            </div>
            <div className={s.canvas__col__right}>

                <div className={s.canvas__control}>

                    <h1 className={s.canvas__control__title}>Apple Pro Display XDR</h1>


                </div>

            </div>

        </Row>
    )
}


