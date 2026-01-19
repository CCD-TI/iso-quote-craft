import { useState, useRef, useEffect } from 'react';
import { Eye, Download, Save, Loader2 } from 'lucide-react';
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
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useModuleStyles } from '@/context/ModuleColorsContext';
import { useAttachedFiles } from '@/hooks/useSupabaseData';
import {
  downloadPdfArrayBuffer,
  downloadPdfBytes,
  generatePdfArrayBufferFromElement,
} from '@/utils/pdfReport';
import { PDFDocument } from 'pdf-lib';

const Index = () => {
  const { getNextQuotationCode, addQuotation, loading: appLoading } = useApp();
  const { advisor } = useAuth();
  const { toast } = useToast();
  const styles = useModuleStyles('generador');
  const { attachedFile } = useAttachedFiles();
  const previewRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [quotationCode, setQuotationCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(true);

  const currentDate = new Date();

  const [clientData, setClientData] = useState<ClientData>({
    ruc: '',
    razonSocial: '',
    representante: '',
    celular: '',
    correo: '',
    asesorId: advisor?.id || '',
    fecha: currentDate,
    codigo: '',
  });

  const [selectedISOs, setSelectedISOs] = useState<SelectedISO[]>([]);
  const [discount, setDiscount] = useState(0);
  const [includeIGV, setIncludeIGV] = useState(true);
  const [implementation, setImplementation] = useState({
    enabled: false,
    companySize: 'pequeña' as 'pequeña' | 'mediana' | 'grande',
    unitPrice: 3500,
    quantity: 1,
  });

  // Generate quotation code
  const generateNewCode = async () => {
    setIsGeneratingCode(true);
    try {
      const code = await getNextQuotationCode(new Date());
      setQuotationCode(code);
      setClientData(prev => ({ ...prev, codigo: code }));
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Generate quotation code on mount
  useEffect(() => {
    generateNewCode();
  }, []);

  // Reset form and generate new code
  const resetFormAndGenerateNewCode = async () => {
    setClientData({
      ruc: '',
      razonSocial: '',
      representante: '',
      celular: '',
      correo: '',
      asesorId: advisor?.id || '',
      fecha: new Date(),
      codigo: '',
    });
    setSelectedISOs([]);
    setDiscount(0);
    setIncludeIGV(true);
    setImplementation({
      enabled: false,
      companySize: 'pequeña' as 'pequeña' | 'mediana' | 'grande',
      unitPrice: 3500,
      quantity: 1,
    });
    await generateNewCode();
  };

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
    if (!clientData.asesorId && !advisor) {
      toast({
        title: 'Error de validación',
        description: 'No hay asesor asignado. Por favor, cierre sesión e inicie de nuevo.',
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

  const mergePdfBuffers = async (buffer1: ArrayBuffer, buffer2: ArrayBuffer): Promise<Uint8Array> => {
    const pdf1 = await PDFDocument.load(buffer1);
    const pdf2 = await PDFDocument.load(buffer2);
    const mergedPdf = await PDFDocument.create();
    
    const pages1 = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
    const pages2 = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
    
    pages1.forEach(page => mergedPdf.addPage(page));
    pages2.forEach(page => mergedPdf.addPage(page));
    
    return await mergedPdf.save();
  };

  const fetchPdfAsArrayBuffer = async (url: string): Promise<ArrayBuffer> => {
    const response = await fetch(url);
    return await response.arrayBuffer();
  };

  const saveQuotation = async () => {
    const subtotal = selectedISOs.reduce((sum, sel) => {
      let total = 0;
      if (sel.certification) total += sel.certificationPrice;
      if (sel.followUp) total += sel.followUpPrice;
      if (sel.recertification) total += sel.recertificationPrice;
      return sum + total;
    }, 0);

    const igv = includeIGV ? subtotal * 0.18 : 0;
    const totalCertificacion = subtotal + igv;
    const implementationTotal = implementation.enabled 
      ? implementation.unitPrice * implementation.quantity 
      : 0;
    const totalGeneral = totalCertificacion + implementationTotal;
    const finalTotal = totalGeneral - discount;

    await addQuotation({
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
      includeIGV,
      implementation,
      implementationTotal,
    });

    // Also download PDF when saving
    await downloadPdfFromRef();

    toast({
      title: 'Cotización guardada y descargada',
      description: 'La cotización se ha guardado en el historial y descargado como PDF',
    });
    setShowPreview(false);
    
    // Reset form and generate new quotation code
    await resetFormAndGenerateNewCode();
  };

  const downloadPdfFromRef = async () => {
    // Wait a moment to ensure ref is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const el = downloadRef.current;
    if (!el) return;

    const filename = `${clientData.codigo}.pdf`;
    const options = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };

    try {
      const quotationPdf = await generatePdfArrayBufferFromElement(el, options);
      
      if (attachedFile?.url) {
        // Fetch attached PDF from storage and merge
        const attachedPdfBuffer = await fetchPdfAsArrayBuffer(attachedFile.url);
        const mergedBytes = await mergePdfBuffers(quotationPdf, attachedPdfBuffer);
        downloadPdfBytes(mergedBytes, filename);
      } else {
        downloadPdfArrayBuffer(quotationPdf, filename);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!validateForm()) return;

    // Open preview while generating
    setShowPreview(true);

    // Wait a moment for UI updates
    setTimeout(async () => {
      try {
        await downloadPdfFromRef();

        // Save quotation to history (without downloading again)
        const subtotal = selectedISOs.reduce((sum, sel) => {
          let total = 0;
          if (sel.certification) total += sel.certificationPrice;
          if (sel.followUp) total += sel.followUpPrice;
          if (sel.recertification) total += sel.recertificationPrice;
          return sum + total;
        }, 0);

        const igv = includeIGV ? subtotal * 0.18 : 0;
        const totalCertificacion = subtotal + igv;
        const implementationTotal = implementation.enabled 
          ? implementation.unitPrice * implementation.quantity 
          : 0;
        const totalGeneral = totalCertificacion + implementationTotal;
        const finalTotal = totalGeneral - discount;

        await addQuotation({
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
          includeIGV,
          implementation,
          implementationTotal,
        });

        setShowPreview(false);

        toast({
          title: 'PDF generado',
          description: 'La cotización se ha guardado y descargado correctamente',
        });

        // Reset form and generate new quotation code
        await resetFormAndGenerateNewCode();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo generar el PDF',
          variant: 'destructive',
        });
      }
    }, 300);
  };

  if (appLoading || isGeneratingCode) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

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
          includeIGV={includeIGV}
          onIncludeIGVChange={setIncludeIGV}
          implementation={implementation}
          onImplementationChange={setImplementation}
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
            includeIGV={includeIGV}
            implementation={implementation}
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
          includeIGV={includeIGV}
          implementation={implementation}
        />
      </div>
    </Layout>
  );
};

export default Index;
