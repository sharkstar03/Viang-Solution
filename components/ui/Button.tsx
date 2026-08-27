import React from 'react';

type Variant = 'primary' | 'secondary' | 'whatsapp';
type Size = 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-light',
  secondary: 'bg-white text-primary border border-primary/20 hover:border-primary/60',
  whatsapp: 'bg-whatsapp text-ink hover:brightness-110',
};

const sizes: Record<Size, string> = {
  md: 'px-5 py-3 text-base',
  lg: 'px-7 py-4 text-lg',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Si true, aplica los estilos al hijo (p. ej. un <a>) en vez de crear <button>. */
  asChild?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', asChild, children, className = '', ...rest }: ButtonProps) {
  const cls = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full font-semibold shadow-soft transition-all duration-200 hover:shadow-lg active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`;
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, {
      className: `${cls} ${child.props.className ?? ''}`.trim(),
    });
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
