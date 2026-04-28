import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variantStyles = {
  primary: 'bg-primary-600 text-white shadow-soft hover:bg-primary-700 focus:ring-4 focus:ring-primary-100',
  secondary: 'border border-dark-200 bg-white text-dark-700 shadow-soft hover:bg-dark-50 focus:ring-4 focus:ring-primary-100',
  danger: 'bg-danger-500 text-white shadow-soft hover:bg-danger-600 focus:ring-4 focus:ring-danger-100',
  ghost: 'bg-transparent text-dark-600 hover:bg-dark-100/80 focus:ring-4 focus:ring-primary-100',
};

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2 rounded-xl font-semibold
          transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
