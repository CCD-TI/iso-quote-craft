import { useState, useEffect } from 'react';
import { Quotation, SelectedISO, ImplementationData } from '@/types/quotation';
import { useApp } from '@/context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';

interface QuotationEditDialogProps {
  quotation: Quotation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const QuotationEditDialog = ({ quotation, open, onOpenChange, onSave }: QuotationEditDialogProps) => {
  const { advisors, isoStandards, updateQuotation } = useApp();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [clientData, setClientData] = useState({
    ruc: '',
    razonSocial: '',
    representante: '',
    celular: '',
    correo: '',
    asesorId: '',
  });
  const [selectedISOs, setSelectedISOs] = useState<SelectedISO[]>([]);
  const [discount, setDiscount] = useState(0);
  const [includeIGV, setIncludeIGV] = useState(true);
  const [implementation, setImplementation] = useState<ImplementationData>({
    enabled: false,
    companySize: 'pequeña',
    unitPrice: 0,
    quantity: 1,
  });

  useEffect(() => {
    if (quotation) {
      setClientData({
        ruc: quotation.client.ruc,
        razonSocial: quotation.client.razonSocial,
        representante: quotation.client.representante,
        celular: quotation.client.celular,
        correo: quotation.client.correo,
        asesorId: quotation.client.asesorId,
      });
      setSelectedISOs(quotation.selectedISOs);
      setDiscount(quotation.discount);
      setIncludeIGV(quotation.includeIGV ?? true);
      setImplementation(quotation.implementation || {
        enabled: false,
        companySize: 'pequeña',
        unitPrice: 0,
        quantity: 1,
      });
    }
  }, [quotation]);

  const handleISOToggle = (isoId: string, field: 'certification' | 'followUp' | 'recertification', checked: boolean) => {
    setSelectedISOs(prev => {
      const existing = prev.find(iso => iso.isoId === isoId);
      const isoStandard = isoStandards.find(s => s.id === isoId);
      
      if (existing) {
        return prev.map(iso => 
          iso.isoId === isoId 
            ? { ...iso, [field]: checked }
            : iso
        );
      } else if (isoStandard) {
        return [...prev, {
          isoId,
          certification: field === 'certification' ? checked : false,
          certificationPrice: isoStandard.certificationPrice,
          followUp: field === 'followUp' ? checked : false,
          followUpPrice: isoStandard.followUpPrice,
          recertification: field === 'recertification' ? checked : false,
          recertificationPrice: isoStandard.recertificationPrice,
        }];
      }
      return prev;
    });
  };

  const handlePriceChange = (isoId: string, field: 'certificationPrice' | 'followUpPrice' | 'recertificationPrice', value: number) => {
    setSelectedISOs(prev => prev.map(iso => 
      iso.isoId === isoId ? { ...iso, [field]: value } : iso
    ));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    selectedISOs.forEach(iso => {
      if (iso.certification) subtotal += iso.certificationPrice;
      if (iso.followUp) subtotal += iso.followUpPrice;
      if (iso.recertification) subtotal += iso.recertificationPrice;
    });
    
    const subtotalAfterDiscount = subtotal - discount;
    const igv = includeIGV ? subtotalAfterDiscount * 0.18 : 0;
    const totalCertificacion = subtotalAfterDiscount + igv;
    
    const implementationTotal = implementation.enabled 
      ? implementation.unitPrice * implementation.quantity 
      : 0;
    
    const total = totalCertificacion + implementationTotal;
    
    return { subtotal, igv, totalCertificacion, implementationTotal, total };
  };

  const handleSave = async () => {
    if (!quotation) return;
    
    setSaving(true);
    try {
      const { subtotal, igv, implementationTotal, total } = calculateTotals();
      
      const updatedQuotation: Quotation = {
        ...quotation,
        client: {
          ...quotation.client,
          ...clientData,
        },
        selectedISOs,
        subtotal,
        igv,
        discount,
        total,
        includeIGV,
        implementation,
        implementationTotal,
      };
      
      await updateQuotation(updatedQuotation);
      
      toast({
        title: 'Cotización actualizada',
        description: 'Los cambios se han guardado correctamente',
      });
      
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la cotización',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const { subtotal, igv, totalCertificacion, implementationTotal, total } = calculateTotals();

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cotización {quotation?.code}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Datos del Cliente */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Datos del Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>RUC</Label>
                <Input 
                  value={clientData.ruc} 
                  onChange={(e) => setClientData(prev => ({ ...prev, ruc: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Razón Social</Label>
                <Input 
                  value={clientData.razonSocial} 
                  onChange={(e) => setClientData(prev => ({ ...prev, razonSocial: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Representante</Label>
                <Input 
                  value={clientData.representante} 
                  onChange={(e) => setClientData(prev => ({ ...prev, representante: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Celular</Label>
                <Input 
                  value={clientData.celular} 
                  onChange={(e) => setClientData(prev => ({ ...prev, celular: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Correo</Label>
                <Input 
                  value={clientData.correo} 
                  onChange={(e) => setClientData(prev => ({ ...prev, correo: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Asesor</Label>
                <Select 
                  value={clientData.asesorId} 
                  onValueChange={(value) => setClientData(prev => ({ ...prev, asesorId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar asesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {advisors.map((advisor) => (
                      <SelectItem key={advisor.id} value={advisor.id}>
                        {advisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Normas ISO */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Normas ISO</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-2 px-3 text-left">Norma</th>
                    <th className="py-2 px-3 text-center">Certificación</th>
                    <th className="py-2 px-3 text-center">Precio Cert.</th>
                    <th className="py-2 px-3 text-center">Seguimiento</th>
                    <th className="py-2 px-3 text-center">Precio Seg.</th>
                    <th className="py-2 px-3 text-center">Recertificación</th>
                    <th className="py-2 px-3 text-center">Precio Recert.</th>
                  </tr>
                </thead>
                <tbody>
                  {isoStandards.map((iso) => {
                    const selected = selectedISOs.find(s => s.isoId === iso.id);
                    return (
                      <tr key={iso.id} className="border-t">
                        <td className="py-2 px-3 font-medium">{iso.code}</td>
                        <td className="py-2 px-3 text-center">
                          <Checkbox 
                            checked={selected?.certification || false}
                            onCheckedChange={(checked) => handleISOToggle(iso.id, 'certification', !!checked)}
                          />
                        </td>
                        <td className="py-2 px-3">
                          <Input 
                            type="number"
                            className="w-24 text-center"
                            value={selected?.certificationPrice || iso.certificationPrice}
                            onChange={(e) => handlePriceChange(iso.id, 'certificationPrice', parseFloat(e.target.value) || 0)}
                            disabled={!selected?.certification}
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Checkbox 
                            checked={selected?.followUp || false}
                            onCheckedChange={(checked) => handleISOToggle(iso.id, 'followUp', !!checked)}
                          />
                        </td>
                        <td className="py-2 px-3">
                          <Input 
                            type="number"
                            className="w-24 text-center"
                            value={selected?.followUpPrice || iso.followUpPrice}
                            onChange={(e) => handlePriceChange(iso.id, 'followUpPrice', parseFloat(e.target.value) || 0)}
                            disabled={!selected?.followUp}
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Checkbox 
                            checked={selected?.recertification || false}
                            onCheckedChange={(checked) => handleISOToggle(iso.id, 'recertification', !!checked)}
                          />
                        </td>
                        <td className="py-2 px-3">
                          <Input 
                            type="number"
                            className="w-24 text-center"
                            value={selected?.recertificationPrice || iso.recertificationPrice}
                            onChange={(e) => handlePriceChange(iso.id, 'recertificationPrice', parseFloat(e.target.value) || 0)}
                            disabled={!selected?.recertification}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Opciones de Precio */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Opciones de Precio</h3>
              
              <div className="flex items-center justify-between">
                <Label>Incluir IGV (18%)</Label>
                <Switch checked={includeIGV} onCheckedChange={setIncludeIGV} />
              </div>
              
              <div className="space-y-2">
                <Label>Descuento (S/)</Label>
                <Input 
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Servicio de Implementación */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Servicio de Implementación</h3>
                <Switch 
                  checked={implementation.enabled} 
                  onCheckedChange={(checked) => setImplementation(prev => ({ ...prev, enabled: checked }))}
                />
              </div>
              
              {implementation.enabled && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Tamaño de Empresa</Label>
                    <Select 
                      value={implementation.companySize}
                      onValueChange={(value: 'pequeña' | 'mediana' | 'grande') => 
                        setImplementation(prev => ({ ...prev, companySize: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pequeña">Pequeña</SelectItem>
                        <SelectItem value="mediana">Mediana</SelectItem>
                        <SelectItem value="grande">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Precio Unitario (S/)</Label>
                      <Input 
                        type="number"
                        value={implementation.unitPrice}
                        onChange={(e) => setImplementation(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input 
                        type="number"
                        min={1}
                        value={implementation.quantity}
                        onChange={(e) => setImplementation(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumen de Totales */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal Certificación:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-destructive">
              <span>Descuento:</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
            {includeIGV && (
              <div className="flex justify-between">
                <span>IGV (18%):</span>
                <span>{formatCurrency(igv)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total Certificación:</span>
              <span>{formatCurrency(totalCertificacion)}</span>
            </div>
            {implementation.enabled && (
              <div className="flex justify-between">
                <span>Total Implementación:</span>
                <span>{formatCurrency(implementationTotal)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>TOTAL GENERAL:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationEditDialog;
