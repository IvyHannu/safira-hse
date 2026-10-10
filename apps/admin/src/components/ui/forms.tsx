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
  labelClassName = '',
  helperText,
  error,
  children,
}: FieldProps & { id: string; children: ReactNode; labelClassName?: string }) {
  return (
    <div className="grid gap-1">
      <label
        htmlFor={id}
        className={`text-sm font-semibold text-deepCharcoal ${labelClassName}`}
      >
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

export function SearchInput(
  props: Omit<InputProps, 'type'> & { labelHidden?: boolean },
) {
  const generatedId = useId();
  const {
    label,
    labelHidden = false,
    helperText,
    error,
    className = '',
    id,
    ...inputProps
  } = props;
  const fieldId = id || generatedId;
  return (
    <Field
      id={fieldId}
      label={label}
      labelClassName={labelHidden ? 'sr-only' : ''}
      helperText={helperText}
      error={error}
    >
      <div className="relative">
        <span
          className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-graphite/70"
          aria-hidden="true"
        >
          <MagnifyingGlass size={18} />
        </span>
        <input
          {...inputProps}
          id={fieldId}
          type="search"
          aria-invalid={!!error}
          aria-describedby={
            error || helperText ? `${fieldId}-message` : undefined
          }
          className={`${controlClass} safira-search-input ${className}`}
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
          className={`${type === 'checkbox' ? 'size-[18px]' : 'size-5'} shrink-0 accent-signalYellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow ${className}`}
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
