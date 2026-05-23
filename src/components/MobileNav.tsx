import { useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
}

interface MobileNavProps {
  links: NavLink[];
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ links, open, onClose }: MobileNavProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-deep/35 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-dvh w-[86%] max-w-sm flex-col bg-white/94 px-7 pb-8 pt-24 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-smooth lg:hidden ${
          open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        aria-label="Menu di động"
        aria-hidden={!open}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors duration-300 hover:bg-mint"
          aria-label="Đóng menu"
        >
          <X className="h-5 w-5" />
        </button>

        <nav className="flex flex-col">
          {links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`border-b border-deep/10 py-4 text-2xl font-semibold text-ink transition-all duration-500 ${
                open ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
              }`}
              style={{ transitionDelay: open ? `${150 + index * 70}ms` : '0ms' }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          onClick={onClose}
          className={`mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-tech px-5 text-sm font-semibold text-white transition-all duration-500 hover:bg-deep ${
            open ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
          }`}
          style={{ transitionDelay: open ? '440ms' : '0ms' }}
        >
          Tư vấn miễn phí
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </aside>
    </>
  );
}
