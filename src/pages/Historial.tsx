import { useState, useRef, useEffect, useMemo } from 'react';
import { Eye, Trash2, Search, FileText, Download, Edit, Settings, CheckCircle, TrendingUp, Filter, BarChart3 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useModuleStyles } from '@/context/ModuleColorsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DeleteWithCodeDialog from '@/components/ui/DeleteWithCodeDialog';
import QuotationPreview from '@/components/quotation/QuotationPreview';
import QuotationEditDialog from '@/components/quotation/QuotationEditDialog';
import AdvisorPerformanceChart from '@/components/historial/AdvisorPerformanceChart';
import { Quotation } from '@/types/quotation';
import { useToast } from '@/hooks/use-toast';
import {
  downloadPdfArrayBuffer,
  downloadPdfBytes,
  generatePdfArrayBufferFromElement,
  mergePdfArrayBufferWithDataUrl,
} from '@/utils/pdfReport';

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'sent', label: 'Enviada' },
  { value: 'approved', label: 'Aprobada' },
  { value: 'rejected', label: 'Rechazada' },
];

const SolesIcon = ({ className = '' }: { className?: string }) => (
  <span className={`inline-flex h-5 w-5 items-center justify-center text-[11px] font-extrabold leading-none ${className}`}>
    S/.
  </span>
);

const Historial = () => {
  const { quotations, deleteQuotation, updateQuotation, advisors } = useApp();
  const { advisor } = useAuth();
  const { toast } = useToast();
  const styles = useModuleStyles('historial');
  
  // Solo el usuario kevinccd puede eliminar cotizaciones permanentemente
  const canDelete = advisor?.username === 'kevinccd';
  const [search, setSearch] = useState('');
  const [advisorFilter, setAdvisorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [editQuotation, setEditQuotation] = useState<Quotation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [downloadQuotation, setDownloadQuotation] = useState<Quotation | null>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  const getAdvisorName = (asesorId: string) => {
    const advisor = advisors.find((a) => a.id === asesorId);
    return advisor?.name || 'Sin asignar';
  };

  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const matchesSearch =
        q.code.toLowerCase().includes(search.toLowerCase()) ||
        q.client.razonSocial.toLowerCase().includes(search.toLowerCase()) ||
        q.client.ruc.includes(search) ||
        getAdvisorName(q.client.asesorId).toLowerCase().includes(search.toLowerCase());
      
      const matchesAdvisor = advisorFilter === 'all' || q.client.asesorId === advisorFilter;
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      
      return matchesSearch && matchesAdvisor && matchesStatus;
    });
  }, [quotations, search, advisorFilter, statusFilter, advisors]);

  // Estadísticas de implementación (filtradas por asesor)
  const implementationStats = useMemo(() => {
    const filtered = advisorFilter === 'all' 
      ? quotations 
      : quotations.filter(q => q.client.asesorId === advisorFilter);
    
    const withImplementation = filtered.filter(q => q.implementation?.enabled).length;
    const totalImplementationValue = filtered
      .filter(q => q.implementation?.enabled)
      .reduce((sum, q) => sum + (q.implementationTotal || 0), 0);
    
    return {
      total: filtered.length,
      withImplementation,
      withoutImplementation: filtered.length - withImplementation,
      totalValue: totalImplementationValue,
    };
  }, [quotations, advisorFilter]);

  // Estadísticas de cotizaciones aprobadas/vendidas (filtradas por asesor)
  const approvedStats = useMemo(() => {
    const filtered = advisorFilter === 'all' 
      ? quotations 
      : quotations.filter(q => q.client.asesorId === advisorFilter);
    
    const approvedQuotations = filtered.filter(q => q.status === 'approved');
    const totalApprovedValue = approvedQuotations.reduce((sum, q) => sum + q.total, 0);
    const totalQuotedValue = filtered.reduce((sum, q) => sum + q.total, 0);
    
    return {
      count: approvedQuotations.length,
      totalValue: totalApprovedValue,
      totalQuotedValue,
    };
  }, [quotations, advisorFilter]);

  const formatCurrency = (amount: number) => {
    return `S/. ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteQuotation(deleteId);
        toast({
          title: 'Cotización eliminada',
          description: 'La cotización se ha eliminado permanentemente de la base de datos',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar la cotización',
          variant: 'destructive',
        });
      }
      setDeleteId(null);
    }
  };

  // Handle PDF download when dialog is open and ref is ready
  useEffect(() => {
    if (!downloadQuotation) return;

    const timer = setTimeout(async () => {
      if (!downloadRef.current) return;

      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      };

      try {
        const filename = `${downloadQuotation.code}.pdf`;
        const quotationPdf = await generatePdfArrayBufferFromElement(downloadRef.current, options);

        const attachedPdfDataUrl = localStorage.getItem('attachedPDF');
        if (attachedPdfDataUrl) {
          const mergedBytes = await mergePdfArrayBufferWithDataUrl(quotationPdf, attachedPdfDataUrl);
          downloadPdfBytes(mergedBytes, filename);
        } else {
          downloadPdfArrayBuffer(quotationPdf, filename);
        }

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
    }, 300);

    return () => clearTimeout(timer);
  }, [downloadQuotation, toast]);

  const handleStatusChange = async (quotation: Quotation, newStatus: 'draft' | 'sent' | 'approved' | 'rejected') => {
    try {
      await updateQuotation({ ...quotation, status: newStatus });
      toast({
        title: 'Estado actualizado',
        description: `La cotización ${quotation.code} ahora está ${statusOptions.find(s => s.value === newStatus)?.label}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    }
  };

  const getStatusSelectStyles = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'border-muted-foreground/30',
      sent: 'border-primary/50',
      approved: 'border-success/50',
      rejected: 'border-destructive/50',
    };
    return styles[status] || '';
  };

  return (
    <Layout>
      {/* Resumen de Implementación */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="card-corporate p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Cotizaciones</p>
              <p className="text-2xl font-bold">{implementationStats.total}</p>
            </div>
          </div>
        </div>
        <div className="card-corporate p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Settings className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Con Implementación</p>
              <p className="text-2xl font-bold">{implementationStats.withImplementation}</p>
            </div>
          </div>
        </div>
        <div className="card-corporate p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sin Implementación</p>
              <p className="text-2xl font-bold">{implementationStats.withoutImplementation}</p>
            </div>
          </div>
        </div>
        <div className="card-corporate p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <SolesIcon className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Implementación</p>
              <p className="text-xl font-bold">{formatCurrency(implementationStats.totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de Cotizaciones Aprobadas/Vendidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card-corporate p-4 border-l-4 border-l-success">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cotizaciones Aprobadas</p>
              <p className="text-2xl font-bold text-success">{approvedStats.count}</p>
            </div>
          </div>
        </div>
        <div className="card-corporate p-4 border-l-4 border-l-success">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Vendido (Aprobadas)</p>
              <p className="text-xl font-bold text-success">{formatCurrency(approvedStats.totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="card-corporate p-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <SolesIcon className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Cotizado</p>
              <p className="text-xl font-bold">{formatCurrency(approvedStats.totalQuotedValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico: Cotizado vs Vendido por asesor (S/.) */}
      <div className="card-corporate mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rendimiento por asesor</p>
            <p className="text-lg font-semibold">Total cotizado vs vendido (Aprobadas)</p>
          </div>
        </div>
        <AdvisorPerformanceChart advisors={advisors} quotations={quotations} advisorFilter={advisorFilter} />
      </div>

      <div className="card-corporate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="section-title mb-0">
            <span className="section-number" style={styles.sectionNumberStyle}>
              <FileText className="w-4 h-4" />
            </span>
            <span>Historial de Cotizaciones</span>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <Select value={advisorFilter} onValueChange={setAdvisorFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por asesor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los asesores</SelectItem>
                {advisors.map((advisor) => (
                  <SelectItem key={advisor.id} value={advisor.id}>
                    {advisor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por código, RUC, razón social o asesor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Indicador de filtro activo */}
        {advisorFilter !== 'all' && (
          <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-medium">
              📊 Mostrando estadísticas de: <span className="font-bold">{getAdvisorName(advisorFilter)}</span>
            </p>
          </div>
        )}

        {filteredQuotations.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay cotizaciones registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={styles.tableHeaderStyle}>
                  <th className="text-left py-3 px-4 font-semibold rounded-tl-md">Código</th>
                  <th className="text-left py-3 px-4 font-semibold">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold">Asesor</th>
                  <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                  <th className="text-center py-3 px-4 font-semibold">Impl.</th>
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
                    <td className="py-3 px-4 text-sm">{getAdvisorName(quotation.client.asesorId)}</td>
                    <td className="py-3 px-4 text-sm">{formatDate(quotation.date)}</td>
                    <td className="py-3 px-4 text-center">
                      {quotation.implementation?.enabled ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                          Sí
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {formatCurrency(quotation.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Select 
                        value={quotation.status} 
                        onValueChange={(value) => handleStatusChange(quotation, value as 'draft' | 'sent' | 'approved' | 'rejected')}
                      >
                        <SelectTrigger className={`w-32 h-8 text-xs ${getStatusSelectStyles(quotation.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
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
                          onClick={() => setEditQuotation(quotation)}
                          title="Editar cotización"
                          className="text-primary hover:text-primary"
                        >
                          <Edit className="w-4 h-4" />
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
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(quotation.id)}
                            className="text-destructive hover:text-destructive"
                            title="Eliminar permanentemente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
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
              moduleColors={styles.colors}
              includeIGV={selectedQuotation.includeIGV}
              implementation={selectedQuotation.implementation}
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
              moduleColors={styles.colors}
              showAttachment={false}
              includeIGV={downloadQuotation.includeIGV}
              implementation={downloadQuotation.implementation}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <QuotationEditDialog
        quotation={editQuotation}
        open={!!editQuotation}
        onOpenChange={(open) => !open && setEditQuotation(null)}
        onSave={() => setEditQuotation(null)}
      />

      <DeleteWithCodeDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar cotización?"
        description="Esta acción no se puede deshacer. La cotización se eliminará permanentemente."
      />
    </Layout>
  );
};

export default Historial;
