import { motion, useReducedMotion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

interface SectionRevealProps extends PropsWithChildren {
  className?: string;
  delay?: number;
  id?: string;
}

export function SectionReveal({ children, className, delay = 0, id }: SectionRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24, filter: 'blur(8px)' }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}
