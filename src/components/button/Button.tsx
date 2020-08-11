import React, { ReactNode } from 'react';

import { Link } from 'components/link/Link';

import s from './Button.scss';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?(): void;
}

export const Button = ({ children, href, onClick }: ButtonProps) => {
  const isLink = typeof href !== 'undefined';
  const isExternal = isLink && /^((https?:)?\/\/|[0-9a-zA-Z]+:)/.test(href || '');

  if (isExternal) {
    return (
      <a className={s.button} target="_blank" rel="noopener noreferrer" href={href}>
        {children}
      </a>
    );
  }

  if (isLink) {
    return (
      <Link className={s.button} to={href || '#'}>
        <span>   {children}</span>
        <svg width="12" height="14" viewBox="0 0 12 14"><path d="M5.17 10V.17h2V10l3.24-3.24 1.42 1.41-5.66 5.66-1.41-1.42L.51 8.17l1.42-1.41z"></path></svg>

      </Link>
    );
  }

  return (
    <button className={s.button} onClick={onClick}>
      {children}
    </button>
  );
};
