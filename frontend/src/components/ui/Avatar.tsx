import { clsx } from 'clsx';

export function Avatar({ src, alt, size = 32 }: { src?: string; alt?: string; size?: number }) {
  return (
    <img src={src || ''} alt={alt || ''} style={{ width: size, height: size }} className={clsx('rounded-full bg-gradient-to-br from-brand-500 to-accent', !src && 'opacity-30')} />
  );
}


