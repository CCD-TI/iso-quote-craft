import { useApp } from '@/context/AppContext';
import { SelectedISO, QuotationSummaryItem } from '@/types/quotation';
import { ModuleColors } from '@/context/ModuleColorsContext';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ImplementationData {
  enabled: boolean;
  companySize: 'pequeña' | 'mediana' | 'grande';
  unitPrice: number;
  quantity: number;
}

interface PriceSummaryProps {
  selectedISOs: SelectedISO[];
  discount: number;
  onDiscountChange: (discount: number) => void;
  moduleColors: ModuleColors;
  includeIGV?: boolean;
  onIncludeIGVChange?: (include: boolean) => void;
  implementation?: ImplementationData;
  onImplementationChange?: (data: ImplementationData) => void;
}

const PriceSummary = ({ 
  selectedISOs, 
  discount, 
  onDiscountChange, 
  moduleColors,
  includeIGV = true,
  onIncludeIGVChange,
  implementation = { enabled: false, companySize: 'pequeña', unitPrice: 3500, quantity: 1 },
  onImplementationChange
}: PriceSummaryProps) => {
  const { isoStandards } = useApp();

  const getSummaryItems = (): QuotationSummaryItem[] => {
    const items: QuotationSummaryItem[] = [];
    selectedISOs.forEach((sel) => {
      const iso = isoStandards.find((i) => i.id === sel.isoId);
      if (!iso) return;
      if (sel.certification) {
        items.push({
          isoCode: iso.code,
          type: 'Certificación',
          amount: sel.certificationPrice,
        });
      }
      if (sel.followUp) {
        items.push({
          isoCode: iso.code,
          type: 'Seguimiento 1 y 2',
          amount: sel.followUpPrice,
        });
      }
      if (sel.recertification) {
        items.push({
          isoCode: iso.code,
          type: 'Recertificación',
          amount: sel.recertificationPrice,
        });
      }
    });
    return items;
  };

  const items = getSummaryItems();
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const igv = includeIGV ? subtotal * 0.18 : 0;
  const totalCertificacion = subtotal + igv;
  
  // Implementation calculation (sin IGV)
  const implementationTotal = implementation.enabled 
    ? implementation.unitPrice * implementation.quantity 
    : 0;
  
  const totalGeneral = totalCertificacion + implementationTotal;
  const finalTotal = totalGeneral - discount;

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleImplementationToggle = (enabled: boolean) => {
    onImplementationChange?.({ ...implementation, enabled });
  };

  const handleCompanySizeChange = (size: 'pequeña' | 'mediana' | 'grande') => {
    onImplementationChange?.({ ...implementation, companySize: size });
  };

  const handleUnitPriceChange = (price: number) => {
    onImplementationChange?.({ ...implementation, unitPrice: price });
  };

  const handleQuantityChange = (qty: number) => {
    onImplementationChange?.({ ...implementation, quantity: qty });
  };

  const sectionNumberStyle = {
    background: `linear-gradient(180deg, ${moduleColors.primaryColor}, ${moduleColors.secondaryColor})`,
  };

  const sectionTitleStyle = {
    background: `linear-gradient(180deg, ${moduleColors.primaryColor}, ${moduleColors.secondaryColor})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const tableHeaderStyle = {
    background: `linear-gradient(180deg, ${moduleColors.primaryColor}, ${moduleColors.secondaryColor})`,
  };

  const finalPriceStyle = {
    background: `linear-gradient(180deg, ${moduleColors.primaryColor}, ${moduleColors.secondaryColor})`,
  };

  return (
    <div className="card-corporate animate-fade-in">
      <div className="flex items-center gap-3 text-lg font-semibold mb-4">
        <span 
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
          style={sectionNumberStyle}
        >
          3
        </span>
        <span style={sectionTitleStyle}>Resumen de Precios</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={tableHeaderStyle} className="text-white">
              <th className="text-left py-3 px-4 font-semibold rounded-tl-md text-white">
                Concepto
              </th>
              <th className="text-right py-3 px-4 font-semibold rounded-tr-md text-white">
                Monto
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className={`border-b border-border ${
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                }`}
              >
                <td className="py-3 px-4">
                  <span className="font-medium" style={{ color: moduleColors.primaryColor }}>{item.isoCode}</span>
                  <span className="text-muted-foreground"> ({item.type})</span>
                </td>
                <td className="py-3 px-4 text-right font-medium">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={2} className="py-8 text-center text-muted-foreground">
                  No hay normativas seleccionadas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          {/* Implementación Service Section */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch 
                  checked={implementation.enabled}
                  onCheckedChange={handleImplementationToggle}
                />
                <Label className="font-medium cursor-pointer" onClick={() => handleImplementationToggle(!implementation.enabled)}>
                  Incluir Servicio de Implementación
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">(Sin IGV)</span>
            </div>
            
            {implementation.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Tamaño de Empresa</Label>
                  <Select 
                    value={implementation.companySize} 
                    onValueChange={(v) => handleCompanySizeChange(v as 'pequeña' | 'mediana' | 'grande')}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="pequeña">Pequeña</SelectItem>
                      <SelectItem value="mediana">Mediana</SelectItem>
                      <SelectItem value="grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Precio Unitario (S/)</Label>
                  <input
                    type="number"
                    value={implementation.unitPrice}
                    onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                    className="price-input w-full"
                    min={0}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Cantidad de ISOs</Label>
                  <input
                    type="number"
                    value={implementation.quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="price-input w-full"
                    min={1}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Total Implementación</Label>
                  <div 
                    className="py-2 px-3 rounded-md text-white font-semibold text-center"
                    style={finalPriceStyle}
                  >
                    {formatCurrency(implementationTotal)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subtotal Certificación */}
          <div className="flex justify-between items-center py-2 px-4 bg-muted/50 rounded">
            <div className="flex items-center gap-4">
              <span className="font-medium">Sub Total (Certificación)</span>
            </div>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>

          {/* IGV Toggle */}
          <div className="flex justify-between items-center py-2 px-4 bg-muted/50 rounded">
            <div className="flex items-center gap-3">
              <Switch 
                checked={includeIGV}
                onCheckedChange={onIncludeIGVChange}
              />
              <span className="font-medium">Incluir IGV (18%)</span>
            </div>
            <span className="font-semibold">{formatCurrency(igv)}</span>
          </div>

          {/* Total Certificación con/sin IGV */}
          <div className="flex justify-between items-center py-2 px-4 bg-muted/50 rounded">
            <span className="font-medium">Total Certificación {includeIGV ? 'con' : 'sin'} IGV</span>
            <span className="font-semibold">{formatCurrency(totalCertificacion)}</span>
          </div>

          {/* Implementation total if enabled */}
          {implementation.enabled && (
            <div className="flex justify-between items-center py-2 px-4 bg-muted/50 rounded">
              <span className="font-medium">+ Implementación (sin IGV)</span>
              <span className="font-semibold">{formatCurrency(implementationTotal)}</span>
            </div>
          )}

          {/* Discount as fixed amount */}
          <div className="flex justify-between items-center py-2 px-4 bg-muted/50 rounded">
            <div className="flex items-center gap-2">
              <span className="font-medium">Descuento (S/)</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                className="price-input w-24"
                min={0}
              />
            </div>
            <span className="text-destructive font-semibold">
              - {formatCurrency(discount)}
            </span>
          </div>

          {/* Final Price */}
          <div 
            className="flex justify-between items-center py-3 px-4 text-white rounded-md"
            style={finalPriceStyle}
          >
            <span className="font-bold text-lg">PRECIO FINAL</span>
            <span className="font-bold text-xl">{formatCurrency(finalTotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceSummary;
