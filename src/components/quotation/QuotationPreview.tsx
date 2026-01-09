import { forwardRef } from 'react';
import { useApp } from '@/context/AppContext';
import { ClientData, SelectedISO } from '@/types/quotation';
import { numeroALetras } from '@/utils/numberToWords';
import { FileText, Send, Award, FileCheck, CreditCard, CheckCircle2 } from 'lucide-react';

// Import logos
import logoCCD from '@/assets/logo-ccd.jpg';
import logoIAF from '@/assets/logo-iaf.png';
import logoQRO from '@/assets/logo-qro.png';
import watermarkBg from '@/assets/watermark-ccd.jpeg';

interface QuotationPreviewProps {
  client: ClientData;
  selectedISOs: SelectedISO[];
  discount: number;
}

const QuotationPreview = forwardRef<HTMLDivElement, QuotationPreviewProps>(
  ({ client, selectedISOs, discount }, ref) => {
    const { isoStandards, advisors, bankAccounts } = useApp();
    const advisor = advisors.find((a) => a.id === client.asesorId);

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

    const certificationSteps = [
      { num: 1, title: 'Cotización de servicio', icon: FileText },
      { num: 2, title: 'Recepción de requisitos', icon: Send },
      { num: 3, title: 'Emisión del certificado', icon: Award },
      { num: 4, title: 'Solicitud de certificación', icon: FileCheck },
      { num: 5, title: 'Transferencia Bancaria', icon: CreditCard },
      { num: 6, title: 'Gestión de la certificación', icon: CheckCircle2 },
    ];

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
            backgroundImage: `url(${watermarkBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-8">
          {/* Header with Logos */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-primary">
            {/* Left - Logos side by side */}
            <div className="flex items-center gap-5">
              <img src={logoCCD} alt="CCD Logo" className="h-20 object-contain" />
              <img src={logoIAF} alt="IAF Logo" className="h-16 object-contain" />
              <img src={logoQRO} alt="QRO Logo" className="h-16 object-contain" />
            </div>

            {/* Right - Date and Code */}
            <div className="text-right text-sm">
              <p>Día: <span className="font-semibold">{formattedDate}</span></p>
              <p className="text-gold font-semibold">Cotización válida por 48 horas</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary border-b-2 border-primary inline-block pb-1">
              ACUERDO COMERCIAL
            </h1>
          </div>

          {/* Client Reference */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm"><span className="text-muted-foreground">Estimado/a:</span></p>
            <p className="font-mono font-semibold">{client.codigo}</p>
          </div>

          {/* Client Info Box */}
          <div className="border-2 border-primary rounded-md p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-muted-foreground">NOMBRE:</span>
                <span className="font-bold">{client.representante}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-muted-foreground">R.U.C:</span>
                <span className="font-bold">{client.ruc}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
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

          {/* Quotation Badge */}
          <div className="mb-4">
            <span className="inline-block bg-primary text-primary-foreground px-4 py-1 rounded text-sm font-semibold">
              COTIZACIÓN
            </span>
          </div>

          {/* Quotation Table */}
          <table className="w-full mb-4 text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="py-2 px-3 text-left font-semibold border border-primary">ESTÁNDAR</th>
                <th className="py-2 px-3 text-center font-semibold border border-primary">CERTIFICACIÓN</th>
                <th className="py-2 px-3 text-center font-semibold border border-primary">SEGUIMIENTO 1 Y 2</th>
                <th className="py-2 px-3 text-center font-semibold border border-primary">RECERTIFICACIÓN</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ iso, selected }, index) => (
                <tr key={index} className="border border-border bg-white/80">
                  <td className="py-2 px-3 border border-border">
                    <div className="font-semibold text-primary">{iso.code}</div>
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
              <div className="flex justify-between py-2 bg-gold text-primary font-bold">
                <span className="px-2">TARIFA FINAL</span>
                <span className="px-2">{formatCurrency(finalTotal)}</span>
              </div>
              <div className="bg-primary/10 p-2 text-xs text-center mt-1 bg-white/80">
                {numeroALetras(finalTotal)}
              </div>
            </div>
          </div>

          {/* Certification Flow */}
          <div className="mb-6">
            <h3 className="font-bold text-sm mb-3 text-primary">FLUJO DE CERTIFICACIÓN</h3>
            <div className="grid grid-cols-6 gap-2">
              {certificationSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mb-1">
                      {step.num}
                    </div>
                    <Icon className="w-5 h-5 text-gold mb-1" />
                    <span className="text-[10px] leading-tight">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bank Accounts */}
          <div className="mb-6 p-4 bg-white/80 rounded border border-border">
            <h3 className="font-bold text-sm mb-3 text-primary">CUENTAS BANCARIAS</h3>
            <div className="space-y-3">
              {bankAccounts.map((bank) => (
                <div key={bank.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-bold">
                    {bank.bankName.charAt(0)}
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-primary">{bank.accountHolder}</p>
                    <p className="text-muted-foreground">
                      Cuenta corriente en {bank.currency}: N° {bank.accountNumber}
                    </p>
                    <p className="text-muted-foreground">CCI: {bank.cci}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm">
              Asesor: <span className="font-semibold text-primary">{advisor?.name || 'No asignado'}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
);

QuotationPreview.displayName = 'QuotationPreview';

export default QuotationPreview;
