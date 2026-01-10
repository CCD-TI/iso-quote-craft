import { forwardRef } from 'react';
import { useApp } from '@/context/AppContext';
import { ClientData, SelectedISO } from '@/types/quotation';
import { ModuleColors } from '@/context/ModuleColorsContext';
import { numeroALetras } from '@/utils/numberToWords';
import { CheckCircle2 } from 'lucide-react';

// Import logos
import logoCCD from '@/assets/logo-ccd.jpg';
import logoIAF from '@/assets/logo-iaf.png';
import logoQRO from '@/assets/logo-qro.png';
import logoInterbank from '@/assets/logo-interbank.png';
import watermarkBg from '@/assets/watermark-ccd.jpeg';

interface QuotationPreviewProps {
  client: ClientData;
  selectedISOs: SelectedISO[];
  discount: number;
  moduleColors: ModuleColors;
  /**
   * Solo para vista en pantalla. Para descargar el PDF final (unido) se recomienda ocultarlo.
   */
  showAttachment?: boolean;
}

const QuotationPreview = forwardRef<HTMLDivElement, QuotationPreviewProps>(
  ({ client, selectedISOs, discount, moduleColors, showAttachment = true }, ref) => {
    const { isoStandards, bankAccounts, certificationSteps } = useApp();

    // Get attached PDF + custom background image from localStorage
    const attachedPDF = localStorage.getItem('attachedPDF');
    const pdfName = localStorage.getItem('attachedPDFName') || 'Documento adjunto';
    const reportImage = localStorage.getItem('reportImage');

    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const getSummaryItems = () => {
      const items: { iso: typeof isoStandards[0]; selected: SelectedISO }[] = [];
      selectedISOs.forEach((sel) => {
        const iso = isoStandards.find((i) => i.id === sel.isoId);
        if (!iso) return;
        items.push({ iso, selected: sel });
      });
      return items;
    };

    const items = getSummaryItems();
    
    const subtotal = selectedISOs.reduce((sum, sel) => {
      let total = 0;
      if (sel.certification) total += sel.certificationPrice;
      if (sel.followUp) total += sel.followUpPrice;
      if (sel.recertification) total += sel.recertificationPrice;
      return sum + total;
    }, 0);

    const igv = subtotal * 0.18;
    const totalConIGV = subtotal + igv;
    const discountAmount = totalConIGV * (discount / 100);
    const finalTotal = totalConIGV - discountAmount;

    const formatCurrency = (amount: number) => {
      return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const headerStyle = {
      background: `linear-gradient(180deg, ${moduleColors.primaryColor}, ${moduleColors.secondaryColor})`,
    };

    return (
      <div 
        ref={ref} 
        className="bg-white max-w-[210mm] mx-auto shadow-lg relative overflow-hidden" 
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Watermark Background */}
        <div 
          className="absolute inset-0 z-0 opacity-30"
          style={{
            backgroundImage: `url(${reportImage || watermarkBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-8">
          {/* Header with Logos and Info */}
          <div className="flex justify-between items-start mb-2">
            {/* Left - Logos side by side */}
            <div className="flex items-center gap-5">
              <img src={logoCCD} alt="CCD Logo" className="h-20 object-contain" />
              <img src={logoIAF} alt="IAF Logo" className="h-16 object-contain" />
              <img src={logoQRO} alt="QRO Logo" className="h-16 object-contain" />
            </div>

            {/* Right - Date, Validity and Title */}
            <div className="text-right text-sm">
              <p>Día: <span className="font-semibold" style={{ color: moduleColors.primaryColor }}>{formattedDate}</span></p>
              <p className="font-semibold" style={{ color: moduleColors.accentColor }}>Cotización válida por 48 horas</p>
              <h1 className="text-2xl font-bold mt-2" style={{ color: moduleColors.primaryColor }}>
                ACUERDO COMERCIAL
              </h1>
            </div>
          </div>
          
          {/* Estimado and Code in same row */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm"><span className="text-muted-foreground">Estimado/a:</span></p>
            <p className="font-mono font-bold">{client.codigo}</p>
          </div>

          {/* Client Info Box */}
          <div className="rounded-md p-4 mb-6" style={{ border: `2px solid ${moduleColors.primaryColor}` }}>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-[120px_1fr]">
                <span className="text-muted-foreground">NOMBRE:</span>
                <span className="font-bold">{client.representante}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr]">
                <span className="text-muted-foreground">R.U.C:</span>
                <span className="font-bold">{client.ruc}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr]">
                <span className="text-muted-foreground">RAZÓN SOCIAL:</span>
                <span className="font-bold">{client.razonSocial}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4">
            Te compartimos la cotización correspondiente a los servicios de certificación ISO solicitados. 
            Quedamos atentos a cualquier consulta o ajuste que necesites realizar.
          </p>


          {/* Quotation Table */}
          <table className="w-full mb-4 text-sm border-collapse">
            <thead>
              <tr style={headerStyle} className="text-white">
                <th className="py-2 px-3 text-left font-semibold border text-white" style={{ borderColor: moduleColors.primaryColor }}>ESTÁNDAR</th>
                <th className="py-2 px-3 text-center font-semibold border text-white" style={{ borderColor: moduleColors.primaryColor }}>CERTIFICACIÓN</th>
                <th className="py-2 px-3 text-center font-semibold border text-white" style={{ borderColor: moduleColors.primaryColor }}>SEGUIMIENTO 1 Y 2</th>
                <th className="py-2 px-3 text-center font-semibold border text-white" style={{ borderColor: moduleColors.primaryColor }}>RECERTIFICACIÓN</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ iso, selected }, index) => (
                <tr key={index} className="border border-border bg-white/80">
                  <td className="py-2 px-3 border border-border">
                    <div className="font-semibold" style={{ color: moduleColors.primaryColor }}>{iso.code}</div>
                    <div className="text-xs text-muted-foreground">{iso.description}</div>
                  </td>
                  <td className="py-2 px-3 text-center border border-border">
                    {selected.certification ? formatCurrency(selected.certificationPrice) : '-'}
                  </td>
                  <td className="py-2 px-3 text-center border border-border">
                    {selected.followUp ? formatCurrency(selected.followUpPrice) : '-'}
                  </td>
                  <td className="py-2 px-3 text-center border border-border">
                    {selected.recertification ? formatCurrency(selected.recertificationPrice) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-72 text-sm">
              <div className="flex justify-between py-1 border-b border-border bg-white/80 px-2">
                <span>SUB TOTAL</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border bg-white/80 px-2">
                <span>TARIFA TOTAL INCLUIDO IGV</span>
                <span className="font-semibold">{formatCurrency(totalConIGV)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-1 border-b border-border bg-white/80 px-2">
                  <span>DESCUENTO ({discount}%)</span>
                  <span className="font-semibold text-destructive">- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-white font-bold" style={headerStyle}>
                <span className="px-2">TARIFA FINAL</span>
                <span className="px-2">{formatCurrency(finalTotal)}</span>
              </div>
              <div className="p-2 text-xs text-center mt-1 bg-white/80" style={{ backgroundColor: `${moduleColors.primaryColor}15` }}>
                {numeroALetras(finalTotal)}
              </div>
            </div>
          </div>

          {/* Certification Flow */}
          <div className="mb-6 rounded-md p-4" style={{ border: `2px solid ${moduleColors.primaryColor}` }}>
            <h3 className="font-bold text-sm mb-3 text-center" style={{ color: moduleColors.primaryColor }}>FLUJO DE CERTIFICACIÓN</h3>
            <div className="flex justify-center gap-4">
              {certificationSteps.map((step) => (
                <div key={step.id} className="flex flex-col items-center text-center" style={{ width: '90px' }}>
                  <div 
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold mb-1 shadow-md"
                    style={headerStyle}
                  >
                    {step.order}
                  </div>
                  <CheckCircle2 className="w-5 h-5 mb-1" style={{ color: moduleColors.primaryColor }} />
                  <span className="text-[10px] leading-tight">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Accounts */}
          <div className="mb-6 p-4 bg-white/80 rounded border border-border">
            <h3 className="font-bold text-sm mb-3" style={{ color: moduleColors.primaryColor }}>CUENTAS BANCARIAS</h3>
            <div className="space-y-3">
              {bankAccounts.map((bank) => (
                <div key={bank.id} className="flex items-start gap-3">
                  {bank.logo ? (
                    <img src={bank.logo} alt={bank.bankName} className="h-8 object-contain" />
                  ) : bank.bankName.toLowerCase().includes('interbank') ? (
                    <img src={logoInterbank} alt="Interbank" className="h-8 object-contain" />
                  ) : (
                    <div 
                      className="w-8 h-8 text-white rounded flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: moduleColors.primaryColor }}
                    >
                      {bank.bankName.charAt(0)}
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="font-bold" style={{ color: moduleColors.primaryColor }}>{bank.accountHolder}</p>
                    <p className="text-muted-foreground">
                      Cuenta corriente en {bank.currency}: N° {bank.accountNumber}
                    </p>
                    <p className="text-muted-foreground">CCI: {bank.cci}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attached PDF Section (solo vista en pantalla) */}
          {showAttachment && attachedPDF && (
            <div className="mb-6 p-4 bg-white/80 rounded border border-border">
              <h3 className="font-bold text-sm mb-3" style={{ color: moduleColors.primaryColor }}>
                DOCUMENTO ADJUNTO: {pdfName}
              </h3>
              <div className="border rounded bg-gray-50">
                <object
                  data={attachedPDF}
                  type="application/pdf"
                  className="w-full h-96"
                >
                  <embed
                    src={attachedPDF}
                    type="application/pdf"
                    className="w-full h-96"
                  />
                </object>
              </div>
              <div className="mt-3 text-center">
                <a
                  href={attachedPDF}
                  download={pdfName}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: moduleColors.primaryColor }}
                >
                  Descargar PDF adjunto
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

QuotationPreview.displayName = 'QuotationPreview';

export default QuotationPreview;