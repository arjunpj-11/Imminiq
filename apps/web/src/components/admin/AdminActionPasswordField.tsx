import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import PasswordVisibilityButton from '../input/PasswordVisibilityButton';

type AdminActionPasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function AdminActionPasswordField({
  value,
  onChange,
  className = 'admin-field mt-4 block',
}: AdminActionPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const isSuperAdmin = useAuthStore((state) => state.user?.role === 'superadmin');
  if (isSuperAdmin) return null;

  return (
    <label className={className}>
      <span className="flex items-center gap-2">
        <ShieldCheck size={14} className="text-[#e8816a]" aria-hidden="true" />
        Admin action password
      </span>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          autoComplete="off"
          maxLength={128}
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, 128))}
          placeholder="Enter your admin action password"
          className="pr-11"
        />
        <PasswordVisibilityButton
          visible={visible}
          fieldLabel="admin action password"
          iconSize={16}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#817c75] transition hover:text-[#f2f0eb]"
          onToggle={() => setVisible((current) => !current)}
        />
      </div>
      <small>Required to authorize this administrative change.</small>
    </label>
  );
}
