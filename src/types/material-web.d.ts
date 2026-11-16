import type React from 'react';

type CustomElementProps<T = Record<string, unknown>> = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  T & {
    class?: string;
    slot?: string;
  };

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'md-filled-button': CustomElementProps<{
        href?: string;
        target?: string;
        rel?: string;
        type?: 'button' | 'submit' | 'reset';
        disabled?: boolean;
      }>;
      'md-filled-tonal-button': CustomElementProps<{
        href?: string;
        target?: string;
        rel?: string;
        type?: 'button' | 'submit' | 'reset';
        disabled?: boolean;
      }>;
      'md-outlined-button': CustomElementProps<{
        href?: string;
        target?: string;
        rel?: string;
        type?: 'button' | 'submit' | 'reset';
        disabled?: boolean;
      }>;
      'md-text-button': CustomElementProps<{
        href?: string;
        target?: string;
        rel?: string;
        type?: 'button' | 'submit' | 'reset';
        disabled?: boolean;
      }>;
      'md-chip-set': CustomElementProps;
      'md-filter-chip': CustomElementProps<{
        label?: string;
        selected?: boolean;
        elevated?: boolean;
        removable?: boolean;
        disabled?: boolean;
      }>;
      'md-assist-chip': CustomElementProps<{
        label?: string;
        href?: string;
        elevated?: boolean;
        disabled?: boolean;
      }>;
      'md-divider': CustomElementProps<{
        inset?: boolean;
        'inset-start'?: boolean;
        'inset-end'?: boolean;
      }>;
      'md-elevation': CustomElementProps;
      'md-ripple': CustomElementProps<{
        disabled?: boolean;
      }>;
    }
  }
}

