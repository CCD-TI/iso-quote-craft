import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const DELETE_CODE = 'CcD2027@ok@2';

interface DeleteWithCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const DeleteWithCodeDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = '¿Eliminar este elemento?',
  description = 'Esta acción no se puede deshacer. El elemento se eliminará permanentemente.',
}: DeleteWithCodeDialogProps) => {
  const [code, setCode] = useState('');
  const { toast } = useToast();

  const handleConfirm = () => {
    if (code === DELETE_CODE) {
      onConfirm();
      setCode('');
      onOpenChange(false);
    } else {
      toast({
        title: 'Código incorrecto',
        description: 'Contacte con el administrador para borrar',
        variant: 'destructive',
      });
      setCode('');
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setCode('');
    }
    onOpenChange(isOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <label className="text-sm font-medium mb-2 block">
            Ingrese el código de verificación para eliminar:
          </label>
          <Input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de verificación"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Eliminar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteWithCodeDialog;
