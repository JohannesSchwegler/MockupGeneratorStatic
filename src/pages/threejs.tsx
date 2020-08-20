import React from 'react';
import { Helmet } from 'react-helmet';
import "../styles/devices.min.css"

import { Container } from "../components/container/Container"
import Threejs from "../components/canvas/Threejs"
import Preview from "../pageComponents/index/Preview"
import CTA from "../components/button/CallToAction"
// tslint:disable no-default-export
export default () => (
    <>
        <Helmet title="Mockups" />
        <Container>

            <Threejs />
          

        </Container>


        <CTA />


    </>
);
