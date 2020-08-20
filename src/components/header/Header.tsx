import React, { ReactNode } from 'react';

import { Link } from 'components/link/Link';
import { Button } from "../button/Button"
import s from './Header.scss';

interface HeaderProps {
  children: ReactNode;
}

export const Header = ({ children }: HeaderProps) => (
  <header className={s.header}>
    <div className={s.header__container}>
      <div className={s.header__content}>
        <Link to="/" className={s.header__logo}>
          Ldfsdfsdfsdfdf
      </Link>

        <ul className={s.header__navigation}>
          {children}
        </ul>


        <div className={s.header__cta}><Button href="/signup">Sign up</Button></div>

      </div>
    </div>
  </header>
);
