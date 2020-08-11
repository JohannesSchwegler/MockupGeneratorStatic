import React from 'react'
import s from "./Hero.scss"
const cubeImage = require("../../assets/images/cube.png")
import { Button } from "../../components/button/Button"
import { Container } from "../../components/container/Container"
export default function Hero() {

    return (
        <div className={s.hero}>
            <div className={s.hero__background}>

            </div>
            <Container>
                <div className={s.hero__grid}>

                    <div className={`${s.hero__grid__col} ${s.__left}`}>
                        <div className={s.hero__header}>
                            <h1>Free and simple
screenshots device mockups generator</h1>

                        </div>

                        <div className={s.hero__subheader}>
                            <h2>Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro voluptatum tempore sit corrupti, cumque, recusandae obcaecati ratione repellendus officiis, temporibus laborum dolores non quas dolor? Sequi a adipisci quam quis.</h2>


                        </div>
                        <div className={s.hero__cta}><Button href="/components">
                            Get started
                        </Button></div>
                    </div>

                    <div className={`${s.hero__grid__col} ${s.__right}`}>
                        <div className={s.hero__phone}>
                            <div className={s.hero__phone__screen}>
                                <div className={s.hero__phone__screen__inner}>
                                    Screen
                                </div>
                            </div>
                        </div>

                        <div className={s.hero__dashboard}>
                            <div className={s.hero__dashboard__sidebar}>
                                <div className={s.hero__dashboard__body}>
                                    Dashboard
                                </div>
                            </div>
                        </div>
                    </div>

                </div>


            </Container>
        </div>
    )
}
