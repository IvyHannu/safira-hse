'use client';

import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
export { Select } from './select';

interface FieldProps {
  label: string;
  helperText?: string;
  error?: string;
}

function Field({
  id,
  label,
  helperText,
  error,
  children,
}: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-deepCharcoal">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-message`} className="text-sm font-semibold text-critical">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-message`} className="text-sm text-graphite">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

const controlClass =
  'h-11 min-h-11 w-full rounded-md border border-graphite bg-white px-3 text-sm text-deepCharcoal placeholder:text-graphite/70 hover:border-deepCharcoal focus:border-signalYellow focus:outline-none disabled:cursor-not-allowed disabled:border-coolConcrete disabled:bg-coolSurface disabled:text-graphite/70 disabled:opacity-100 aria-invalid:border-critical';

type InputProps = FieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'children'>;

export function Input({
  label,
  helperText,
  error,
  id,
  className = '',
  ...props
}: InputProps) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  return (
    <Field id={fieldId} label={label} helperText={helperText} error={error}>
      <input
        {...props}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={
          error || helperText ? `${fieldId}-message` : undefined
        }
        className={`${controlClass} ${className}`}
      />
    </Field>
  );
}

export function SearchInput(props: Omit<InputProps, 'type'>) {
  const generatedId = useId();
  const { label, helperText, error, className = '', id, ...inputProps } = props;
  const fieldId = id || generatedId;
  return (
    <Field id={fieldId} label={label} helperText={helperText} error={error}>
      <div className="relative">
        <MagnifyingGlass
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-graphite/70"
        />
        <input
          {...inputProps}
          id={fieldId}
          type="search"
          aria-invalid={!!error}
          aria-describedby={
            error || helperText ? `${fieldId}-message` : undefined
          }
          className={`${controlClass} min-h-11 border-graphite/25 pl-10 shadow-sm focus:border-signalYellow focus:outline-none focus:ring-0 ${className}`}
        />
      </div>
    </Field>
  );
}

type TextareaProps = FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({
  label,
  helperText,
  error,
  id,
  className = '',
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  return (
    <Field id={fieldId} label={label} helperText={helperText} error={error}>
      <textarea
        {...props}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={
          error || helperText ? `${fieldId}-message` : undefined
        }
        className={`${controlClass} min-h-24 py-1 ${className}`}
      />
    </Field>
  );
}

type ChoiceProps = FieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

function Choice({
  type,
  label,
  helperText,
  error,
  id,
  className = '',
  ...props
}: ChoiceProps & { type: 'checkbox' | 'radio' }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  return (
    <div className="grid gap-1">
      <label
        htmlFor={fieldId}
        className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-deepCharcoal has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
      >
        <input
          {...props}
          id={fieldId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={
            error || helperText ? `${fieldId}-message` : undefined
          }
          className={`size-5 shrink-0 accent-signalYellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow ${className}`}
        />
        {label}
      </label>
      {error ? (
        <p
          id={`${fieldId}-message`}
          className="text-sm font-semibold text-critical"
        >
          {error}
        </p>
      ) : helperText ? (
        <p id={`${fieldId}-message`} className="text-sm text-graphite">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export function Checkbox(props: ChoiceProps) {
  return <Choice {...props} type="checkbox" />;
}

export function Radio(props: ChoiceProps) {
  return <Choice {...props} type="radio" />;
}
