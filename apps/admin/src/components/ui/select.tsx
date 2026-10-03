'use client';

import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type FocusEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { CaretDown, Check } from '@phosphor-icons/react';

interface SelectOption {
  value: string;
  label: string;
  disabled: boolean;
}

interface SelectProps extends ComponentPropsWithRef<'select'> {
  label: string;
  helperText?: string;
  error?: string;
}

function optionText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) return children.map(optionText).join('');
  return '';
}

function getOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type === 'optgroup') {
      return getOptions((child.props as { children?: ReactNode }).children);
    }
    if (child.type !== 'option') return [];
    const props = child.props as {
      value?: string | number;
      label?: string;
      disabled?: boolean;
      children?: ReactNode;
    };
    const label = props.label ?? optionText(props.children);
    return [
      {
        value: String(props.value ?? label),
        label,
        disabled: Boolean(props.disabled),
      },
    ];
  });
}

export function Select({
  label,
  helperText,
  error,
  id,
  className = '',
  children,
  value,
  defaultValue,
  disabled,
  onChange,
  onBlur,
  ref,
  ...nativeProps
}: SelectProps) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const triggerId = `${fieldId}-trigger`;
  const listboxId = `${fieldId}-options`;
  const options = useMemo(() => getOptions(children), [children]);
  const nativeRef = useRef<HTMLSelectElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    String(defaultValue ?? options[0]?.value ?? ''),
  );
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [placement, setPlacement] = useState({ top: 0, left: 0, width: 0 });
  const selectedValue = value === undefined ? uncontrolledValue : String(value);
  const selected = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    const actualValue = nativeRef.current?.value;
    if (value === undefined && actualValue !== undefined) {
      setUncontrolledValue(actualValue);
    }
  });

  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listboxId}-${activeIndex}`)?.focus();
  }, [activeIndex, listboxId, open]);

  useEffect(() => {
    if (!open) return;
    function closeOnOutside(event: PointerEvent) {
      if (
        !triggerRef.current?.contains(event.target as Node) &&
        !menuRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', closeOnOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
    };
  }, [open]);

  function setNativeRef(node: HTMLSelectElement | null) {
    nativeRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }

  function openMenu() {
    if (disabled) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const isMobile = window.innerWidth < 640;
    setMobile(isMobile);
    if (!isMobile) {
      const estimatedHeight = Math.min(options.length * 44 + 8, 320);
      const above =
        window.innerHeight - rect.bottom < estimatedHeight + 8 &&
        rect.top > estimatedHeight;
      setPlacement({
        top: above ? rect.top - estimatedHeight - 4 : rect.bottom + 4,
        left: Math.max(
          8,
          Math.min(rect.left, window.innerWidth - rect.width - 8),
        ),
        width: rect.width,
      });
    }
    setActiveIndex(
      Math.max(
        0,
        options.findIndex((option) => option.value === selectedValue),
      ),
    );
    setOpen(true);
  }

  function closeMenu(restoreFocus = false) {
    setOpen(false);
    const select = nativeRef.current;
    if (select) {
      onBlur?.({
        target: select,
        currentTarget: select,
      } as FocusEvent<HTMLSelectElement>);
    }
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function choose(option: SelectOption) {
    if (option.disabled) return;
    const select = nativeRef.current;
    if (select) {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        'value',
      )?.set;
      setter?.call(select, option.value);
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    setUncontrolledValue(option.value);
    closeMenu(true);
  }

  function moveActive(direction: number) {
    if (!options.length) return;
    let next = activeIndex;
    for (let i = 0; i < options.length; i += 1) {
      next = (next + direction + options.length) % options.length;
      if (!options[next].disabled) break;
    }
    setActiveIndex(next);
  }

  function tabOut(backward: boolean) {
    const focusable = Array.from(
      document.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(
      (element) =>
        !menuRef.current?.contains(element) && element.offsetParent !== null,
    );
    const index = focusable.indexOf(triggerRef.current as HTMLElement);
    closeMenu();
    requestAnimationFrame(() =>
      focusable[index + (backward ? -1 : 1)]?.focus(),
    );
  }

  const menu = open ? (
    <>
      {mobile && (
        <div
          className="fixed inset-0 z-[80] bg-deepCharcoal/60"
          onClick={() => closeMenu(true)}
          aria-hidden="true"
        />
      )}
      <div
        ref={menuRef}
        className={
          mobile
            ? 'fixed inset-x-0 bottom-0 z-[81] max-h-[70dvh] overflow-y-auto rounded-t-xl border border-graphite/15 bg-white p-3 shadow-xl'
            : 'fixed z-[81] max-h-80 overflow-y-auto rounded-md border border-graphite/20 bg-white p-1 shadow-lg'
        }
        style={
          mobile
            ? { paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }
            : placement
        }
      >
        {mobile && (
          <p className="px-3 pb-2 pt-1 text-sm font-semibold text-deepCharcoal">
            {label}
          </p>
        )}
        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              moveActive(1);
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              moveActive(-1);
            } else if (event.key === 'Home') {
              event.preventDefault();
              setActiveIndex(0);
            } else if (event.key === 'End') {
              event.preventDefault();
              setActiveIndex(options.length - 1);
            } else if (event.key === 'Escape') {
              event.preventDefault();
              closeMenu(true);
            } else if (event.key === 'Tab') {
              event.preventDefault();
              tabOut(event.shiftKey);
            }
          }}
        >
          {options.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              id={`${listboxId}-${index}`}
              type="button"
              role="option"
              aria-selected={option.value === selectedValue}
              disabled={option.disabled}
              onClick={() => choose(option)}
              className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow disabled:cursor-not-allowed disabled:opacity-45 ${
                option.value === selectedValue
                  ? 'bg-signalYellow font-semibold text-deepCharcoal active:bg-signalYellow/90'
                  : 'text-deepCharcoal hover:bg-coolSurface focus:bg-coolSurface active:bg-coolConcrete'
              }`}
            >
              <span>{option.label}</span>
              {option.value === selectedValue && (
                <Check size={18} weight="bold" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  ) : null;

  return (
    <div className="grid min-w-0 gap-1">
      <label
        htmlFor={triggerId}
        className="text-sm font-semibold text-deepCharcoal"
      >
        {label}
      </label>
      <select
        {...nativeProps}
        ref={setNativeRef}
        id={fieldId}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
      >
        {children}
      </select>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error || helperText ? `${fieldId}-message` : undefined
        }
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (
            event.key === 'ArrowDown' ||
            event.key === 'ArrowUp' ||
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault();
            if (!open) openMenu();
          } else if (event.key === 'Escape' && open) {
            event.preventDefault();
            closeMenu();
          }
        }}
        className={`flex h-12 min-h-12 w-full items-center justify-between gap-2 rounded-md border border-graphite/30 bg-white px-3 text-left text-sm text-deepCharcoal shadow-sm transition-[border-color,background-color] hover:border-deepCharcoal/45 active:bg-coolSurface focus-visible:border-signalYellow focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-coolSurface disabled:text-graphite/60 ${open ? 'border-signalYellow' : ''} ${error ? 'border-critical' : ''} ${className}`}
      >
        <span className="min-w-0 truncate">
          {selected?.label ?? options[0]?.label ?? ''}
        </span>
        <CaretDown
          size={16}
          weight="bold"
          className="shrink-0 text-graphite/70"
          aria-hidden="true"
        />
      </button>
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
      {menu && createPortal(menu, document.body)}
    </div>
  );
}
