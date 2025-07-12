interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export const Button = ({
  onClick,
  children,
  disabled = false,
  variant = "primary",
}: ButtonProps) => {
  const baseClasses = "px-4 py-2 rounded border font-medium";

  const variantClasses = {
    primary: "bg-blue-500 text-white border-blue-600 hover:bg-blue-600",
    secondary: "bg-gray-500 text-white border-gray-600 hover:bg-gray-600",
    danger: "bg-red-500 text-white border-red-600 hover:bg-red-600",
  };

  const disabledClasses = "opacity-50 cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled ? disabledClasses : ""
      }`}
    >
      {children}
    </button>
  );
};
