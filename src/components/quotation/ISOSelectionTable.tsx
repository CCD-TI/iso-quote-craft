import { useApp } from '@/context/AppContext';
import { SelectedISO } from '@/types/quotation';
import { ModuleColors } from '@/context/ModuleColorsContext';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

interface ISOSelectionTableProps {
  selectedISOs: SelectedISO[];
  onChange: (selectedISOs: SelectedISO[]) => void;
  moduleColors: ModuleColors;
}

const ISOSelectionTable = ({ selectedISOs, onChange, moduleColors }: ISOSelectionTableProps) => {
  const { isoStandards } = useApp();

  const getSelectedISO = (isoId: string): SelectedISO => {
    const existing = selectedISOs.find((s) => s.isoId === isoId);
    const iso = isoStandards.find((i) => i.id === isoId);
    return (
      existing || {
        isoId,
        certification: false,
        certificationPrice: iso?.certificationPrice || 0,
        followUp: false,
        followUpPrice: iso?.followUpPrice || 0,
        recertification: false,
        recertificationPrice: iso?.recertificationPrice || 0,
      }
    );
  };

  const handleCheckChange = (
    isoId: string,
    field: 'certification' | 'followUp' | 'recertification',
    checked: boolean
  ) => {
    const current = getSelectedISO(isoId);
    const updated = { ...current, [field]: checked };

    const newSelectedISOs = selectedISOs.filter((s) => s.isoId !== isoId);
    if (updated.certification || updated.followUp || updated.recertification) {
      newSelectedISOs.push(updated);
    }
    onChange(newSelectedISOs);
  };

  const handlePriceChange = (
    isoId: string,
    field: 'certificationPrice' | 'followUpPrice' | 'recertificationPrice',
    value: number
  ) => {
    const current = getSelectedISO(isoId);
    const updated = { ...current, [field]: value };

    const newSelectedISOs = selectedISOs.filter((s) => s.isoId !== isoId);
    if (updated.certification || updated.followUp || updated.recertification) {
      newSelectedISOs.push(updated);
    }
    onChange(newSelectedISOs);
  };

  const getSelectedTags = () => {
    const tags: { isoCode: string; type: string }[] = [];
    selectedISOs.forEach((sel) => {
      const iso = isoStandards.find((i) => i.id === sel.isoId);
      if (!iso) return;
      if (sel.certification) tags.push({ isoCode: iso.code, type: 'Certificación' });
      if (sel.followUp) tags.push({ isoCode: iso.code, type: 'Seguimiento 1 y 2' });
      if (sel.recertification) tags.push({ isoCode: iso.code, type: 'Recertificación' });
    });
    return tags;
  };

  const removeTag = (isoCode: string, type: string) => {
    const iso = isoStandards.find((i) => i.code === isoCode);
    if (!iso) return;

    const fieldMap: Record<string, 'certification' | 'followUp' | 'recertification'> = {
      'Certificación': 'certification',
      'Seguimiento 1 y 2': 'followUp',
      'Recertificación': 'recertification',
    };

    handleCheckChange(iso.id, fieldMap[type], false);
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

  return (
    <div className="card-corporate animate-fade-in">
      <div className="flex items-center gap-3 text-lg font-semibold mb-4">
        <span 
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
          style={sectionNumberStyle}
        >
          2
        </span>
        <span style={sectionTitleStyle}>Selección de Normativas ISO</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={tableHeaderStyle} className="text-white">
              <th className="text-left py-3 px-4 font-semibold rounded-tl-md text-white">
                Estándar
              </th>
              <th className="text-center py-3 px-4 font-semibold text-white">Certificación</th>
              <th className="text-center py-3 px-4 font-semibold text-white">Seguimiento 1 y 2</th>
              <th className="text-center py-3 px-4 font-semibold rounded-tr-md text-white">
                Recertificación
              </th>
            </tr>
          </thead>
          <tbody>
            {isoStandards.map((iso, index) => {
              const selected = getSelectedISO(iso.id);
              return (
                <tr
                  key={iso.id}
                  className={`border-b border-border ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-semibold" style={{ color: moduleColors.primaryColor }}>{iso.code}</div>
                      <div className="text-sm text-muted-foreground">
                        {iso.description}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selected.certification}
                          onCheckedChange={(checked) =>
                            handleCheckChange(iso.id, 'certification', !!checked)
                          }
                        />
                        <span className="text-sm">S/ {iso.certificationPrice.toLocaleString()}</span>
                      </div>
                      {selected.certification && (
                        <input
                          type="number"
                          value={selected.certificationPrice}
                          onChange={(e) =>
                            handlePriceChange(
                              iso.id,
                              'certificationPrice',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="price-input"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selected.followUp}
                          onCheckedChange={(checked) =>
                            handleCheckChange(iso.id, 'followUp', !!checked)
                          }
                        />
                        <span className="text-sm">S/ {iso.followUpPrice.toLocaleString()}</span>
                      </div>
                      {selected.followUp && (
                        <input
                          type="number"
                          value={selected.followUpPrice}
                          onChange={(e) =>
                            handlePriceChange(
                              iso.id,
                              'followUpPrice',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="price-input"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selected.recertification}
                          onCheckedChange={(checked) =>
                            handleCheckChange(iso.id, 'recertification', !!checked)
                          }
                        />
                        <span className="text-sm">S/ {iso.recertificationPrice.toLocaleString()}</span>
                      </div>
                      {selected.recertification && (
                        <input
                          type="number"
                          value={selected.recertificationPrice}
                          onChange={(e) =>
                            handlePriceChange(
                              iso.id,
                              'recertificationPrice',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="price-input"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {getSelectedTags().length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">
              Seleccionados:
            </span>
            {getSelectedTags().map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full border"
                style={{ 
                  backgroundColor: `${moduleColors.primaryColor}15`,
                  color: moduleColors.primaryColor,
                  borderColor: `${moduleColors.primaryColor}30`
                }}
              >
                {tag.isoCode} - {tag.type}
                <button
                  onClick={() => removeTag(tag.isoCode, tag.type)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ISOSelectionTable;