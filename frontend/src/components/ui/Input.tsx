import { clsx } from 'clsx';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ className, label, error, ...props }: Props) {
  return (
    <label className="block space-y-1">
      {label && <div className="text-sm font-medium opacity-80">{label}</div>}
      <input
        className={clsx(
          'w-full border rounded-md px-3 py-2 bg-white/60 dark:bg-gray-900/60 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500',
          className
        )}
        {...props}
      />
      {error && <div className="text-xs text-red-600">{error}</div>}
    </label>
  );
}


