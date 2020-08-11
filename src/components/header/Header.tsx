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
          Logo
      </Link>

        <ul className={s.header__navigation}>
          <li>
            <a href="#product" className="font-medium text-gray-500 hover:text-gray-900 transition duration-150 ease-in-out">Product</a>
          </li>
          <li>
            <a href="#product" className="font-medium text-gray-500 hover:text-gray-900 transition duration-150 ease-in-out">Product</a>
          </li>
        </ul>


        <div className={s.header__cta}><Button href="/signup">Sign up</Button></div>

      </div>
    </div>
  </header>
);
