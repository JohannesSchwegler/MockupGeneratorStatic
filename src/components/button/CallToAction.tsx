import React from 'react'
import s from "./CallToAction.scss"
import { Button } from "./Button"
import { Container } from "../container/Container"

export default function CallToAction() {
    return (
        <Container>
            <div className={s.cta}>

                <p className={s.cta__text}>
                    It’s your business.<br />
                    We’re just here to help.
                </p>
                <Button href="/test">
                    Get started
            </Button>
            </div>
        </Container>
    )
}
