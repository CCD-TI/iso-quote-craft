import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Building2, Upload, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BankAccount } from '@/types/quotation';
import { useToast } from '@/hooks/use-toast';

const Bancos = () => {
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount } = useApp();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    cci: '',
    currency: 'soles' as 'soles' | 'dolares',
    logo: '' as string,
  });

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountHolder: '',
      accountNumber: '',
      cci: '',
      currency: 'soles',
      logo: '',
    });
    setEditingBank(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'El archivo es muy grande. Máximo 2MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, logo: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (bank: BankAccount) => {
    setEditingBank(bank);
    setFormData({
      bankName: bank.bankName,
      accountHolder: bank.accountHolder,
      accountNumber: bank.accountNumber,
      cci: bank.cci,
      currency: bank.currency,
      logo: bank.logo || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.bankName.trim() || !formData.accountNumber.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del banco y número de cuenta son obligatorios',
        variant: 'destructive',
      });
      return;
    }

    if (editingBank) {
      updateBankAccount({
        ...editingBank,
        ...formData,
      });
      toast({
        title: 'Cuenta actualizada',
        description: 'La cuenta bancaria se ha actualizado correctamente',
      });
    } else {
      addBankAccount({
        id: Date.now().toString(),
        ...formData,
      });
      toast({
        title: 'Cuenta agregada',
        description: 'La nueva cuenta bancaria se ha agregado correctamente',
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteBankAccount(deleteId);
      toast({
        title: 'Cuenta eliminada',
        description: 'La cuenta bancaria se ha eliminado correctamente',
      });
      setDeleteId(null);
    }
  };

  return (
    <Layout>
      <div className="card-corporate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="section-title mb-0">
            <span className="section-number">
              <Building2 className="w-4 h-4" />
            </span>
            <span>Gestión de Cuentas Bancarias</span>
          </div>
          <Button onClick={openCreateDialog} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Cuenta
          </Button>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay cuentas bancarias registradas</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {bankAccounts.map((bank) => (
              <div
                key={bank.id}
                className="bg-muted/30 rounded-lg p-4 border border-border hover:border-primary/30 transition-colors"
              >
              <div className="flex justify-between items-start mb-3">
                  {bank.logo ? (
                    <img src={bank.logo} alt={bank.bankName} className="w-10 h-10 object-contain rounded" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(bank)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(bank.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1">{bank.bankName}</h3>
                <p className="text-sm font-medium text-primary mb-2">{bank.accountHolder}</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Cuenta corriente en {bank.currency}: N° {bank.accountNumber}</p>
                  <p>CCI: {bank.cci}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBank ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label form-label-required">Nombre del Banco</label>
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Interbank"
                />
              </div>
              <div>
                <label className="form-label">Moneda</label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: 'soles' | 'dolares') =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soles">Soles</SelectItem>
                    <SelectItem value="dolares">Dólares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="form-label form-label-required">Titular de la Cuenta</label>
              <Input
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                placeholder="CENTRO DE CAPACITACIÓN GUBERNAMENTAL"
              />
            </div>
            <div>
              <label className="form-label form-label-required">Número de Cuenta</label>
              <Input
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="200-3007723278"
              />
            </div>
            <div>
              <label className="form-label">CCI</label>
              <Input
                value={formData.cci}
                onChange={(e) => setFormData({ ...formData, cci: e.target.value })}
                placeholder="003-200-003007723278-30"
              />
            </div>
            <div>
              <label className="form-label">Logo del Banco</label>
              <div className="flex items-center gap-3">
                {formData.logo ? (
                  <div className="relative">
                    <img src={formData.logo} alt="Logo" className="w-16 h-16 object-contain border rounded" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={removeLogo}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Subir</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">PNG, JPG. Máx 2MB</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingBank ? 'Guardar Cambios' : 'Agregar Cuenta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuenta bancaria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cuenta se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Bancos;
