import { useState, useRef, useEffect } from 'react';
import { Eye, Trash2, Search, FileText, Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import QuotationPreview from '@/components/quotation/QuotationPreview';
import { Quotation } from '@/types/quotation';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';

const Historial = () => {
  const { quotations, setQuotations } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [downloadQuotation, setDownloadQuotation] = useState<Quotation | null>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  const filteredQuotations = quotations.filter(
    (q) =>
      q.code.toLowerCase().includes(search.toLowerCase()) ||
      q.client.razonSocial.toLowerCase().includes(search.toLowerCase()) ||
      q.client.ruc.includes(search)
  );

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      setQuotations((prev) => prev.filter((q) => q.id !== deleteId));
      toast({
        title: 'Cotización eliminada',
        description: 'La cotización se ha eliminado correctamente',
      });
      setDeleteId(null);
    }
  };

  // Handle PDF download when dialog is open and ref is ready
  useEffect(() => {
    if (!downloadQuotation) return;

    const timer = setTimeout(async () => {
      if (downloadRef.current) {
        const options = {
          margin: [10, 10, 10, 10] as [number, number, number, number],
          filename: `${downloadQuotation.code}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        };

        try {
          await html2pdf().set(options).from(downloadRef.current).save();
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
        setDownloadQuotation(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [downloadQuotation, toast]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      sent: 'bg-primary/10 text-primary',
      approved: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
    };
    const labels: Record<string, string> = {
      draft: 'Borrador',
      sent: 'Enviada',
      approved: 'Aprobada',
      rejected: 'Rechazada',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <Layout>
      <div className="card-corporate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="section-title mb-0">
            <span className="section-number">
              <FileText className="w-4 h-4" />
            </span>
            <span>Historial de Cotizaciones</span>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por código, RUC o razón social..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredQuotations.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay cotizaciones registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left py-3 px-4 font-semibold rounded-tl-md">Código</th>
                  <th className="text-left py-3 px-4 font-semibold">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                  <th className="text-right py-3 px-4 font-semibold">Total</th>
                  <th className="text-center py-3 px-4 font-semibold">Estado</th>
                  <th className="text-center py-3 px-4 font-semibold rounded-tr-md">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map((quotation, index) => (
                  <tr
                    key={quotation.id}
                    className={`border-b border-border ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-sm">{quotation.code}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{quotation.client.razonSocial}</div>
                        <div className="text-sm text-muted-foreground">
                          RUC: {quotation.client.ruc}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{formatDate(quotation.date)}</td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {formatCurrency(quotation.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(quotation.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedQuotation(quotation)}
                          title="Ver cotización"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDownloadQuotation(quotation)}
                          title="Descargar PDF"
                          className="text-primary hover:text-primary"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(quotation.id)}
                          className="text-destructive hover:text-destructive"
                          title="Eliminar"
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

      <Dialog open={!!selectedQuotation} onOpenChange={() => setSelectedQuotation(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cotización {selectedQuotation?.code}</DialogTitle>
          </DialogHeader>
          {selectedQuotation && (
            <QuotationPreview
              client={selectedQuotation.client}
              selectedISOs={selectedQuotation.selectedISOs}
              discount={selectedQuotation.discount}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden dialog for PDF download */}
      <Dialog open={!!downloadQuotation} onOpenChange={() => setDownloadQuotation(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Descargando PDF...</DialogTitle>
          </DialogHeader>
          {downloadQuotation && (
            <QuotationPreview
              ref={downloadRef}
              client={downloadQuotation.client}
              selectedISOs={downloadQuotation.selectedISOs}
              discount={downloadQuotation.discount}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cotización se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Historial;