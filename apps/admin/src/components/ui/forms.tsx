'use client';

import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

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
  'h-9 w-full rounded-md border border-graphite bg-white px-2.5 text-sm text-deepCharcoal placeholder:text-graphite/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information disabled:cursor-not-allowed disabled:bg-coolSurface disabled:opacity-60 aria-invalid:border-critical';

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

type SelectProps = FieldProps & SelectHTMLAttributes<HTMLSelectElement>;

export function Select({
  label,
  helperText,
  error,
  id,
  className = '',
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  return (
    <Field id={fieldId} label={label} helperText={helperText} error={error}>
      <select
        {...props}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={
          error || helperText ? `${fieldId}-message` : undefined
        }
        className={`${controlClass} ${className}`}
      >
        {children}
      </select>
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
        className="flex min-h-10 cursor-pointer items-center gap-1 text-sm font-medium text-deepCharcoal has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
      >
        <input
          {...props}
          id={fieldId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={
            error || helperText ? `${fieldId}-message` : undefined
          }
          className={`size-2 accent-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information ${className}`}
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
