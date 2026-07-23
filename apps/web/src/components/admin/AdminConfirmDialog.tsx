import AdminModal from './AdminModal';

interface IAdminConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function AdminConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  destructive = false,
  onClose,
  onConfirm,
}: IAdminConfirmDialogProps) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      preventClose={isLoading}
      ariaLabel={title}
      contentClassName="max-w-md bg-[#1c1a18] text-[#f2f0eb]"
    >
      <h2 className="font-editorial text-xl font-bold sm:text-2xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-6 text-[#aaa59d]">{description}</p>}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="admin-button w-full sm:w-auto"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`${destructive ? 'admin-danger-button' : 'admin-primary-button'} w-full sm:w-auto`}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Please wait…' : confirmText}
        </button>
      </div>
    </AdminModal>
  );
}
