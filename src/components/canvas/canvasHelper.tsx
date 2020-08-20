
import * as PIXI from "pixi.js"

interface mockupProps {

    width: number,
    height: number

}
export function createCanvasFromMockup(canvasWidth: number, mockup: mockupProps) {

    const { width, height } = mockup;
    const aspectRatioHeight = getAspectRatioHeight(canvasWidth, width, height)

    const app = new PIXI.Application({
        width: canvasWidth, height: aspectRatioHeight, backgroundColor: 0x1099bb, resolution: window.devicePixelRatio || 1,
    });
    return app;
}


export function getAspectRatioHeight(canvasWidth: number, width: number, height: number) {

    return (height / width) * canvasWidth

}


/* export function renderCanvas */