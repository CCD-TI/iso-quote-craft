import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Edit, Trash2, GripVertical, CheckCircle2 } from 'lucide-react';
import { CertificationStep } from '@/types/quotation';

const FlujoCertificacion = () => {
  const { certificationSteps, addCertificationStep, updateCertificationStep, deleteCertificationStep, reorderCertificationSteps } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<CertificationStep | null>(null);
  const [deletingStepId, setDeletingStepId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '' });

  const resetForm = () => {
    setFormData({ title: '' });
    setEditingStep(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (step: CertificationStep) => {
    setEditingStep(step);
    setFormData({ title: step.title });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    if (editingStep) {
      updateCertificationStep({
        ...editingStep,
        title: formData.title,
      });
    } else {
      const newStep: CertificationStep = {
        id: crypto.randomUUID(),
        order: certificationSteps.length + 1,
        title: formData.title,
      };
      addCertificationStep(newStep);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deletingStepId) {
      deleteCertificationStep(deletingStepId);
      setDeleteDialogOpen(false);
      setDeletingStepId(null);
    }
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === certificationSteps.length - 1)
    ) return;

    const newSteps = [...certificationSteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Update order property
    const reorderedSteps = newSteps.map((step, i) => ({ ...step, order: i + 1 }));
    reorderCertificationSteps(reorderedSteps);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="section-title">
              <span className="section-number">F</span>
              Flujo de Certificación
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestiona los pasos del flujo de certificación que aparecen en las cotizaciones
            </p>
          </div>
          <Button onClick={openCreateDialog} className="bg-gradient-corporate hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Paso
          </Button>
        </div>

        {/* Steps Grid */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h3 className="font-semibold text-primary mb-4">Vista Previa del Flujo</h3>
          <div className="flex flex-wrap gap-4 justify-center mb-8 p-4 bg-muted/30 rounded-lg">
            {certificationSteps.map((step) => (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-corporate text-white flex items-center justify-center text-sm font-bold mb-2 shadow-md">
                  {step.order}
                </div>
                <CheckCircle2 className="w-5 h-5 text-primary mb-1" />
                <span className="text-xs max-w-[100px] leading-tight">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Steps List */}
          <div className="space-y-2">
            {certificationSteps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border"
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="h-6 w-6 p-0"
                  >
                    ▲
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === certificationSteps.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    ▼
                  </Button>
                </div>
                <GripVertical className="w-5 h-5 text-muted-foreground" />
                <div className="w-8 h-8 rounded-full bg-gradient-corporate text-white flex items-center justify-center text-sm font-bold">
                  {step.order}
                </div>
                <span className="flex-1 font-medium">{step.title}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(step)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setDeletingStepId(step.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStep ? 'Editar Paso' : 'Agregar Nuevo Paso'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Paso</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Solicitud de certificación"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-gradient-corporate hover:opacity-90">
                {editingStep ? 'Actualizar' : 'Agregar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este paso?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El paso será eliminado permanentemente del flujo de certificación.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default FlujoCertificacion;
