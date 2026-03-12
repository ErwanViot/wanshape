import type { InputHTMLAttributes } from 'react';

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Label 'htmlFor' and input 'id' — must be unique per form */
  inputId: string;
};

export function FormInput({ label, inputId, className = '', ...props }: FormInputProps) {
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-strong mb-1.5">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-4 py-3 rounded-xl bg-surface border border-divider text-heading placeholder:text-muted focus:border-brand focus:outline-none transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
