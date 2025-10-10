"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Hook para leer la URL actual

interface NavLinkProps {
  href: string;
  end?: boolean; // Para que coincida exactamente con la ruta
  children: React.ReactNode;
}

export const NavLink = ({ href, end = false, children }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = end ? pathname === href : pathname.startsWith(href);

  const navLinkClass = `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand-100 text-brand-700'
      : 'text-gray-600 hover:bg-brand-50 hover:text-brand-600'
  }`;

  return (
    <Link href={href} className={navLinkClass}>
      {children}
    </Link>
  );
};