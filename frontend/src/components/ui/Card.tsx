import { clsx } from 'clsx';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx('bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-card', className)}>
      {children}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx('p-4 sm:p-6', className)}>{children}</div>;
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx('px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800', className)}>{children}</div>;
}


