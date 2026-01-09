import React from 'react';

interface TextFieldProps {
  className?: string;
  variant?: 'filled' | 'outlined';
  label?: string;
  helpText?: string;
  icon?: string | null;
  iconRight?: string | null;
  children: React.ReactNode;
}

interface TextFieldInputProps {
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

const TextFieldComponent: React.FC<TextFieldProps> = ({ 
  className = '', 
  label,
  helpText,
  icon,
  iconRight,
  children 
}) => {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {/* Icon would go here */}
          </div>
        )}
        {children}
        {iconRight && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {/* Icon would go here */}
          </div>
        )}
      </div>
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
};

export const TextFieldInput = React.forwardRef<HTMLInputElement, TextFieldInputProps>(
  ({ placeholder, value, onChange, style }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={style}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
      />
    );
  }
);

TextFieldInput.displayName = 'TextFieldInput';

const TextField = TextFieldComponent as typeof TextFieldComponent & {
  Input: typeof TextFieldInput;
};

TextField.Input = TextFieldInput;

export default TextField;
