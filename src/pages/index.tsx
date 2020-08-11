import React from 'react';
import { Helmet } from 'react-helmet';
import "../styles/devices.min.css"


import Hero from "../pageComponents/index/Hero"
import Services from "../pageComponents/index/Services"
import Preview from "../pageComponents/index/Preview"
import CTA from "../components/button/CallToAction"
// tslint:disable no-default-export
export default () => (
  <>
    <Helmet title="Home" />

    <Hero />
    <Services />
    <Preview />


    <CTA />


  </>
);
