import { useApp } from '@/context/AppContext';
import { SelectedISO, QuotationSummaryItem } from '@/types/quotation';
import { ModuleColors } from '@/context/ModuleColorsContext';

interface PriceSummaryProps {
  selectedISOs: SelectedISO[];
  discount: number;
  onDiscountChange: (discount: number) => void;
  moduleColors: ModuleColors;
}

const PriceSummary = ({ selectedISOs, discount, onDiscountChange, moduleColors }: PriceSummaryProps) => {
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
  const igv = subtotal * 0.18;
  const totalConIGV = subtotal + igv;
  const discountAmount = totalConIGV * (discount / 100);
  const finalTotal = totalConIGV - discountAmount;

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <div className="flex justify-between items-center py-2 px-4 bg-muted/50 rounded">
            <span className="font-medium">Sub Total</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-4 bg-muted/50 rounded">
            <span className="font-medium">IGV (18%)</span>
            <span className="font-semibold">{formatCurrency(igv)}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-4 bg-muted/50 rounded">
            <span className="font-medium">Total con IGV</span>
            <span className="font-semibold">{formatCurrency(totalConIGV)}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-4 bg-muted/50 rounded">
            <div className="flex items-center gap-2">
              <span className="font-medium">Descuento (%)</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                className="price-input w-16"
                min={0}
                max={100}
              />
            </div>
            <span className="text-destructive font-semibold">
              - {formatCurrency(discountAmount)}
            </span>
          </div>
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