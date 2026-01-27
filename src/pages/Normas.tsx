import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Award, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useApp } from '@/context/AppContext';
import { useModuleStyles } from '@/context/ModuleColorsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import DeleteWithCodeDialog from '@/components/ui/DeleteWithCodeDialog';
import { ISOStandard } from '@/types/quotation';
import { useToast } from '@/hooks/use-toast';

type SortField = 'code' | 'description' | 'certificationPrice' | 'followUpPrice' | 'recertificationPrice';
type SortDirection = 'asc' | 'desc';

const Normas = () => {
  const { isoStandards, addISOStandard, updateISOStandard, deleteISOStandard } = useApp();
  const { toast } = useToast();
  const { sectionNumberStyle, tableHeaderStyle, colors } = useModuleStyles('normas');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingISO, setEditingISO] = useState<ISOStandard | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    certificationPrice: 0,
    followUpPrice: 0,
    recertificationPrice: 0,
  });

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      certificationPrice: 0,
      followUpPrice: 0,
      recertificationPrice: 0,
    });
    setEditingISO(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (iso: ISOStandard) => {
    setEditingISO(iso);
    setFormData({
      code: iso.code,
      name: iso.name,
      description: iso.description,
      certificationPrice: iso.certificationPrice,
      followUpPrice: iso.followUpPrice,
      recertificationPrice: iso.recertificationPrice,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'El código y nombre son obligatorios',
        variant: 'destructive',
      });
      return;
    }

    if (editingISO) {
      updateISOStandard({
        ...editingISO,
        ...formData,
      });
      toast({
        title: 'Norma actualizada',
        description: 'La norma ISO se ha actualizado correctamente',
      });
    } else {
      addISOStandard({
        id: Date.now().toString(),
        ...formData,
      });
      toast({
        title: 'Norma agregada',
        description: 'La nueva norma ISO se ha agregado correctamente',
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteISOStandard(deleteId);
      toast({
        title: 'Norma eliminada',
        description: 'La norma ISO se ha eliminado correctamente',
      });
      setDeleteId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return `S/. ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  };

  // Sorting logic
  const sortedISOStandards = useMemo(() => {
    return [...isoStandards].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'code':
          aValue = a.code.toLowerCase();
          bValue = b.code.toLowerCase();
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'certificationPrice':
          aValue = a.certificationPrice;
          bValue = b.certificationPrice;
          break;
        case 'followUpPrice':
          aValue = a.followUpPrice;
          bValue = b.followUpPrice;
          break;
        case 'recertificationPrice':
          aValue = a.recertificationPrice;
          bValue = b.recertificationPrice;
          break;
        default:
          aValue = a.code.toLowerCase();
          bValue = b.code.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [isoStandards, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" /> 
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  return (
    <Layout>
      <div className="card-corporate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="section-title mb-0">
            <span className="section-number" style={sectionNumberStyle}>
              <Award className="w-4 h-4" />
            </span>
            <span>Gestión de Normas ISO</span>
          </div>
          <Button onClick={openCreateDialog} className="flex items-center gap-2" style={{ backgroundColor: colors.accentColor }}>
            <Plus className="w-4 h-4" />
            Nueva Norma
          </Button>
        </div>

        {isoStandards.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay normas ISO registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={tableHeaderStyle}>
                  <th 
                    className="text-left py-3 px-4 font-semibold rounded-tl-md cursor-pointer hover:bg-opacity-80 select-none"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center">
                      Código
                      <SortIcon field="code" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-opacity-80 select-none"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center">
                      Descripción
                      <SortIcon field="description" />
                    </div>
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-semibold cursor-pointer hover:bg-opacity-80 select-none"
                    onClick={() => handleSort('certificationPrice')}
                  >
                    <div className="flex items-center justify-end">
                      Certificación
                      <SortIcon field="certificationPrice" />
                    </div>
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-semibold cursor-pointer hover:bg-opacity-80 select-none"
                    onClick={() => handleSort('followUpPrice')}
                  >
                    <div className="flex items-center justify-end">
                      Seguimiento
                      <SortIcon field="followUpPrice" />
                    </div>
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-semibold cursor-pointer hover:bg-opacity-80 select-none"
                    onClick={() => handleSort('recertificationPrice')}
                  >
                    <div className="flex items-center justify-end">
                      Recertificación
                      <SortIcon field="recertificationPrice" />
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-semibold rounded-tr-md">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedISOStandards.map((iso, index) => (
                  <tr
                    key={iso.id}
                    className={`border-b border-border ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-semibold text-primary">{iso.code}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {iso.description}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(iso.certificationPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(iso.followUpPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(iso.recertificationPrice)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(iso)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(iso.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingISO ? 'Editar Norma ISO' : 'Nueva Norma ISO'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label form-label-required">Código</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="ISO 9001:2015"
                />
              </div>
              <div>
                <label className="form-label form-label-required">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre de la norma"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Descripción</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción breve"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="form-label">Certificación (S/)</label>
                <Input
                  type="number"
                  value={formData.certificationPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, certificationPrice: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="form-label">Seguimiento (S/)</label>
                <Input
                  type="number"
                  value={formData.followUpPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, followUpPrice: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="form-label">Recertificación (S/)</label>
                <Input
                  type="number"
                  value={formData.recertificationPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, recertificationPrice: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingISO ? 'Guardar Cambios' : 'Agregar Norma'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteWithCodeDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar norma ISO?"
        description="Esta acción no se puede deshacer. La norma se eliminará permanentemente."
      />
    </Layout>
  );
};

export default Normas;