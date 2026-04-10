import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmDialogProps {
  open?: boolean;
  isOpen?: boolean; // Support variant
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void; // Support variant
  onConfirm: () => void;
  studentName?: string;
  title?: string;
  description?: string;
}

export function DeleteConfirmDialog({
  open,
  isOpen,
  onOpenChange,
  onClose,
  onConfirm,
  studentName,
  title,
  description
}: DeleteConfirmDialogProps) {
  const isDialogActive = open !== undefined ? open : !!isOpen;
  const handleOpenChange = (val: boolean) => {
     if (onOpenChange) onOpenChange(val);
     if (!val && onClose) onClose();
  };

  return (
    <AlertDialog open={isDialogActive} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>{title || 'Hapus Jadwal'}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || (
               <>
                 Apakah Anda yakin ingin menghapus jadwal{' '}
                 <span className="font-semibold text-foreground">{studentName}</span>?
                 Tindakan ini tidak dapat dibatalkan.
               </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
