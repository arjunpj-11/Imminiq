import ConfirmDialog from '../../../../../components/overlays/ConfirmDialog'

type CloneTrackerConfirmDialogProps = {
  open: boolean
  trackerTitle: string
  isLoading: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function CloneTrackerConfirmDialog({
  open,
  trackerTitle,
  isLoading,
  onConfirm,
  onClose,
}: CloneTrackerConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Clone this tracker?"
      description={(
        <>
          Are you sure you want to clone “{trackerTitle}”? A separate editable copy will be added to your trackers.
        </>
      )}
      confirmText="Clone tracker"
      isLoading={isLoading}
      icon="⧉"
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
