import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  requiresAdmin?: boolean;
}

export default function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/cases', label: 'Cases' },
    { href: '/documents', label: 'Documents' },
    { href: '/tools', label: 'Tools' },
    { href: '/account', label: 'Account' },
  ];
  if (isAdmin) {
    items.push({ href: '/admin', label: 'Admin', requiresAdmin: true });
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 z-50">
      <ul className="flex justify-around">
        {items.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1 text-center py-2">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center space-y-1 text-sm ${
                  active ? 'text-primary font-semibold' : 'text-neutral-500'
                }`}
              >
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}