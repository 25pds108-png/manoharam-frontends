import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  isLoading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-3.5 py-1">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            danger ? 'bg-chili-50 text-chili-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm text-ink-700 leading-relaxed pt-1">
          {description}
        </p>
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-cream-200">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={danger ? 'danger' : 'primary'}
          size="sm"
          loading={isLoading}
          onClick={onConfirm}
          className="w-full sm:w-auto"
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
