"use client";

import React from 'react';

type ButtonCommonProps = {
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
};

type ButtonAsButton = ButtonCommonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsAnchor = ButtonCommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export default function Button(props: ButtonAsButton | ButtonAsAnchor) {
  const { size = 'md', children, className = '', ...rest } = props as any;
  const sizeCls = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  if ((props as any).href) {
    const { href, ...anchorRest } = rest as any;
    return (
      <a className={`btn ${sizeCls} ${className}`} href={href} {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <button className={`btn ${sizeCls} ${className}`} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}


