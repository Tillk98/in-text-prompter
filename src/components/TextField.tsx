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
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleFocus = () => {
      if (containerRef.current) {
        containerRef.current.style.borderWidth = '2px';
        containerRef.current.style.borderColor = 'rgb(49, 130, 206)';
      }
    };

    const handleBlur = () => {
      if (containerRef.current) {
        containerRef.current.style.borderWidth = '';
        containerRef.current.style.borderColor = '';
      }
    };

    return (
      <div 
        ref={containerRef}
        className="flex h-8 w-full flex-none items-center gap-1 rounded-md border border-solid bg-white px-2"
        style={{
          borderColor: 'rgb(228, 228, 231)'
        }}
      >
        <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch px-1">
          <input
            ref={ref}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={style}
            className="h-full w-full border-none bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-800"
          />
        </div>
      </div>
    );
  }
);

TextFieldInput.displayName = 'TextFieldInput';

const TextField = TextFieldComponent as typeof TextFieldComponent & {
  Input: typeof TextFieldInput;
};

TextField.Input = TextFieldInput;

export default TextField;
