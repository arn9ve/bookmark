"use client";

import React from 'react';

interface DropdownProps {
  button: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  placement?: 'top' | 'bottom';
}

export default function Dropdown({ button, children, className = '', placement = 'bottom' }: DropdownProps) {
  const posClass = placement === 'top' ? 'absolute left-0 bottom-12 w-full' : 'absolute left-0 mt-2 w-full';
  return (
    <div className={`relative ${className}`}>
      {button}
      <div className={posClass}>{children}</div>
    </div>
  );
}


