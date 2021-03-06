import React, { ReactNode, useEffect } from 'react';
import { Helmet } from 'react-helmet';

import Logo from '../../assets/svg/ueno-logo.svg';
import Dribbble from '../../assets/svg/dribbble.svg';
import Twitter from '../../assets/svg/twitter.svg';
import Github from '../../assets/svg/github.svg';
import Instagram from '../../assets/svg/instagram.svg';
import Facebook from '../../assets/svg/facebook.svg';
import Linkedin from '../../assets/svg/linkedin.svg';

import { helmet } from '../../utils/helmet';
import { Header } from '../header/Header';
import { HeaderLink } from '../header/HeaderLink';
import { Footer } from '../footer/Footer';
import { Devtools } from '../devtools/Devtools';
import Scrollbar from 'smooth-scrollbar';
import s from './AppLayout.scss';

interface AppLayoutProps {
  children: ReactNode;
}

const isDev = process.env.NODE_ENV === 'development';

// tslint:disable no-default-export
export default ({ children }: AppLayoutProps) => {


  useEffect(() => {
    const scrollbar: any = document.querySelector('#my-scrollbar')
    console.log(scrollbar);
    const options = {
      damping: 0.07
    }
    Scrollbar.init(scrollbar, options);

  }, [])

  return (

    <div className={s.layout}>
      <Helmet {...helmet} />

      <Header>
        <HeaderLink name="Mockups" to="/mockups" />
        <HeaderLink name="Components" to="/components" />
        <HeaderLink name="Contact" to="/contact" />

      </Header>

      {children}


      <Footer
        logo={<Logo />}
        social={[
          { icon: <Dribbble />, to: 'https://dribbble.com/ueno' },
          { icon: <Twitter />, to: 'https://twitter.com/uenodotco' },
          { icon: <Github />, to: 'https://github.com/ueno-llc' },
          { icon: <Instagram />, to: 'https://www.instagram.com/uenodotco' },
          { icon: <Facebook />, to: 'https://www.facebook.com/uenodotco' },
          { icon: <Linkedin />, to: 'https://www.linkedin.com/company/ueno' },
        ]}
      />

      {isDev && <Devtools />}
    </div>

  );
}
