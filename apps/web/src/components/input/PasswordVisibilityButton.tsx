import { Eye, EyeOff } from 'lucide-react';

type PasswordVisibilityButtonProps = {
  visible: boolean;
  fieldLabel?: string;
  onToggle: () => void;
  className?: string;
  iconSize?: number;
};

export default function PasswordVisibilityButton({
  visible,
  fieldLabel = 'password',
  onToggle,
  className,
  iconSize = 17,
}: PasswordVisibilityButtonProps) {
  const actionLabel = `${visible ? 'Hide' : 'Show'} ${fieldLabel}`;

  return (
    <button
      type="button"
      className={className}
      onClick={onToggle}
      aria-label={actionLabel}
      title={actionLabel}
    >
      {visible ? (
        <EyeOff size={iconSize} aria-hidden="true" />
      ) : (
        <Eye size={iconSize} aria-hidden="true" />
      )}
    </button>
  );
}
