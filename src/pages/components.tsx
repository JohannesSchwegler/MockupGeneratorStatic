import React from 'react';
import { Helmet } from 'react-helmet';

import Hero from "../pageComponents/components/Hero"
import DashboardLayout from "../components/dashboard-layout/DashboardLayout"
import Sidebar from "../components/dashboard-layout/Sidebar"
// tslint:disable no-default-export
export default () => (
  <>
    <Helmet title="Components" />
    <Hero />
    <DashboardLayout >
      <Sidebar>df</Sidebar>
fdfdf

    </DashboardLayout>
  </>
);
