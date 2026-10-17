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
        className={`mobile-scrim ${open ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`mobile-panel ${open ? 'is-open' : ''}`}
        aria-label="Menu di động"
        aria-hidden={!open}
      >
        <button
          type="button"
          onClick={onClose}
          className="mobile-close"
          aria-label="Đóng menu"
        >
          <X className="h-5 w-5" />
        </button>

        <nav className="mobile-links">
          {links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={open ? 'is-open' : ''}
              style={{ transitionDelay: open ? `${120 + index * 60}ms` : '0ms' }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          onClick={onClose}
          className={`mobile-cta ${open ? 'is-open' : ''}`}
          style={{ transitionDelay: open ? '420ms' : '0ms' }}
        >
          Đặt lịch
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </aside>
    </>
  );
}
