import React from 'react';
import { Helmet } from 'react-helmet';
import "../styles/devices.min.css"

import { Container } from "../components/container/Container"
import Pixi from "../components/canvas/Pixi"
import Preview from "../pageComponents/index/Preview"
import CTA from "../components/button/CallToAction"
// tslint:disable no-default-export


export default () => (
    <>
        <Helmet title="Mockups" />
        <Container>

            <Pixi />


        </Container>


        <CTA />


    </>
);
