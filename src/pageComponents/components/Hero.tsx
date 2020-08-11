import React from 'react'
import s from "./Hero.scss"

import { BlockText } from "../../components/block-text/BlockText"
export default function Hero() {
    return (
        <>
        <div className={s.hero}>
            <BlockText
                heading="Tailwind Starter Components"
                description="These components are all open source and built using the standard Tailwind CSS configuration. Feel free to use them for any purpose, even commercially!" />
       </div>
        </>
    )
}
