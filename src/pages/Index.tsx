import { useState, useRef } from 'react';
import { Eye, Download, Save } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ClientDataForm from '@/components/quotation/ClientDataForm';
import ISOSelectionTable from '@/components/quotation/ISOSelectionTable';
import PriceSummary from '@/components/quotation/PriceSummary';
import QuotationPreview from '@/components/quotation/QuotationPreview';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ClientData, SelectedISO } from '@/types/quotation';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useModuleStyles } from '@/context/ModuleColorsContext';
import {
  downloadPdfArrayBuffer,
  downloadPdfBytes,
  generatePdfArrayBufferFromElement,
  mergePdfArrayBufferWithDataUrl,
} from '@/utils/pdfReport';

const Index = () => {
  const { getNextQuotationCode, addQuotation } = useApp();
  const { toast } = useToast();
  const styles = useModuleStyles('generador');
  const previewRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const currentDate = new Date();

  const [clientData, setClientData] = useState<ClientData>({
    ruc: '',
    razonSocial: '',
    representante: '',
    celular: '',
    correo: '',
    asesorId: '',
    fecha: currentDate,
    codigo: getNextQuotationCode(currentDate),
  });

  const [selectedISOs, setSelectedISOs] = useState<SelectedISO[]>([]);
  const [discount, setDiscount] = useState(0);

  const validateForm = (): boolean => {
    if (!clientData.ruc || clientData.ruc.length !== 11) {
      toast({
        title: 'Error de validación',
        description: 'El RUC debe tener 11 dígitos',
        variant: 'destructive',
      });
      return false;
    }
    if (!clientData.razonSocial) {
      toast({
        title: 'Error de validación',
        description: 'La razón social es obligatoria',
        variant: 'destructive',
      });
      return false;
    }
    if (!clientData.representante) {
      toast({
        title: 'Error de validación',
        description: 'El nombre del representante es obligatorio',
        variant: 'destructive',
      });
      return false;
    }
    if (!clientData.celular || clientData.celular.length !== 9) {
      toast({
        title: 'Error de validación',
        description: 'El celular debe tener 9 dígitos',
        variant: 'destructive',
      });
      return false;
    }
    if (!clientData.asesorId) {
      toast({
        title: 'Error de validación',
        description: 'Debe seleccionar un asesor',
        variant: 'destructive',
      });
      return false;
    }
    if (selectedISOs.length === 0) {
      toast({
        title: 'Error de validación',
        description: 'Debe seleccionar al menos una normativa ISO',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    setShowPreview(true);
  };

  const saveQuotation = () => {
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

    addQuotation({
      id: Date.now().toString(),
      code: clientData.codigo,
      date: new Date().toISOString(),
      client: clientData,
      selectedISOs,
      subtotal,
      igv,
      discount,
      total: finalTotal,
      status: 'draft',
    });

    toast({
      title: 'Cotización guardada',
      description: 'La cotización se ha guardado en el historial',
    });
    setShowPreview(false);
  };

  const handleDownloadPDF = async () => {
    if (!validateForm()) return;

    // Keep the existing behavior: open preview while generating
    setShowPreview(true);

    // Wait a moment for any UI updates
    setTimeout(async () => {
      const el = downloadRef.current;
      if (!el) {
        toast({
          title: 'Error',
          description: 'No se pudo preparar el documento para descarga',
          variant: 'destructive',
        });
        return;
      }

      const filename = `${clientData.codigo}.pdf`;
      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      };

      try {
        // 1) Generate the quotation PDF from HTML
        const quotationPdf = await generatePdfArrayBufferFromElement(el, options);

        // 2) If there's an uploaded PDF, merge it as extra pages
        const attachedPdfDataUrl = localStorage.getItem('attachedPDF');
        if (attachedPdfDataUrl) {
          const mergedBytes = await mergePdfArrayBufferWithDataUrl(quotationPdf, attachedPdfDataUrl);
          downloadPdfBytes(mergedBytes, filename);
        } else {
          downloadPdfArrayBuffer(quotationPdf, filename);
        }

        saveQuotation();
        setShowPreview(false);

        toast({
          title: 'PDF generado',
          description: 'La cotización se ha descargado correctamente',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo generar el PDF',
          variant: 'destructive',
        });
      }
    }, 300);
  };

  return (
    <Layout>
      <div className="flex justify-end gap-3 mb-6">
        <Button
          onClick={handlePreview}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Vista Previa
        </Button>
        <Button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
        >
          <Download className="w-4 h-4" />
          Descargar PDF
        </Button>
      </div>

      <div className="space-y-6">
        <ClientDataForm data={clientData} onChange={setClientData} moduleColors={styles.colors} />
        <ISOSelectionTable selectedISOs={selectedISOs} onChange={setSelectedISOs} moduleColors={styles.colors} />
        <PriceSummary
          selectedISOs={selectedISOs}
          discount={discount}
          onDiscountChange={setDiscount}
          moduleColors={styles.colors}
        />
        
        {/* Preview Button at the bottom */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handlePreview}
            className="flex items-center gap-2 hover:opacity-90 text-white px-8 py-3 text-lg shadow-lg"
            style={styles.headerStyle}
          >
            <Eye className="w-5 h-5" />
            Vista Previa
          </Button>
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa de Cotización</DialogTitle>
          </DialogHeader>
          <QuotationPreview
            ref={previewRef}
            client={clientData}
            selectedISOs={selectedISOs}
            discount={discount}
            moduleColors={styles.colors}
          />
          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cerrar
            </Button>
            <Button onClick={saveQuotation} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Guardar Cotización
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden render used only for PDF generation (without embedded PDF area) */}
      <div className="fixed left-[-10000px] top-0 w-[210mm]">
        <QuotationPreview
          ref={downloadRef}
          client={clientData}
          selectedISOs={selectedISOs}
          discount={discount}
          moduleColors={styles.colors}
          showAttachment={false}
        />
      </div>
    </Layout>
  );
};

export default Index;