import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useModuleStyles } from '@/context/ModuleColorsContext';
import ModuleHeader from '@/components/ui/ModuleHeader';
import { Upload, Image, FileText, Trash2, Eye } from 'lucide-react';

const Archivos = () => {
  const { toast } = useToast();
  const styles = useModuleStyles('archivos');
  
  const [reportImage, setReportImage] = useState<string | null>(() => {
    return localStorage.getItem('reportImage');
  });
  
  const [attachedPDF, setAttachedPDF] = useState<string | null>(() => {
    return localStorage.getItem('attachedPDF');
  });
  
  const [pdfName, setPdfName] = useState<string>(() => {
    return localStorage.getItem('attachedPDFName') || '';
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un archivo de imagen válido',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setReportImage(base64);
      localStorage.setItem('reportImage', base64);
      toast({
        title: 'Imagen subida',
        description: 'La imagen del reporte se ha guardado correctamente',
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un archivo PDF válido',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAttachedPDF(base64);
      setPdfName(file.name);
      localStorage.setItem('attachedPDF', base64);
      localStorage.setItem('attachedPDFName', file.name);
      toast({
        title: 'PDF subido',
        description: 'El PDF adjunto se ha guardado correctamente',
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setReportImage(null);
    localStorage.removeItem('reportImage');
    toast({
      title: 'Imagen eliminada',
      description: 'La imagen del reporte se ha eliminado',
    });
  };

  const removePDF = () => {
    setAttachedPDF(null);
    setPdfName('');
    localStorage.removeItem('attachedPDF');
    localStorage.removeItem('attachedPDFName');
    toast({
      title: 'PDF eliminado',
      description: 'El PDF adjunto se ha eliminado',
    });
  };

  return (
    <Layout>
      <ModuleHeader
        icon={Upload}
        title="Archivos del Reporte"
        description="Sube una imagen para el reporte y un PDF adjunto"
        moduleId="archivos"
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Imagen del Reporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" style={{ color: styles.colors.primaryColor }} />
              Imagen del Reporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="report-image">Seleccionar imagen</Label>
              <Input
                id="report-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-2"
              />
            </div>

            {reportImage && (
              <div className="space-y-3">
                <div className="border rounded-lg p-2 bg-muted/30">
                  <img
                    src={reportImage}
                    alt="Imagen del reporte"
                    className="w-full h-48 object-contain rounded"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar imagen
                </Button>
              </div>
            )}

            {!reportImage && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay imagen cargada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PDF Adjunto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: styles.colors.primaryColor }} />
              PDF Adjunto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="attached-pdf">Seleccionar PDF</Label>
              <Input
                id="attached-pdf"
                type="file"
                accept="application/pdf"
                onChange={handlePDFUpload}
                className="mt-2"
              />
            </div>

            {attachedPDF && (
              <div className="space-y-3">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <FileText className="w-10 h-10" style={{ color: styles.colors.primaryColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{pdfName}</p>
                      <p className="text-sm text-muted-foreground">Archivo PDF</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(attachedPDF, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver PDF
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removePDF}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar PDF
                  </Button>
                </div>
              </div>
            )}

            {!attachedPDF && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay PDF cargado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      {(reportImage || attachedPDF) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Vista Previa de Archivos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Estos archivos se mostrarán junto con la cotización cuando se genere el reporte.
            </p>
            <div className="space-y-4">
              {reportImage && (
                <div>
                  <h4 className="font-medium mb-2">Imagen del Reporte:</h4>
                  <img
                    src={reportImage}
                    alt="Preview"
                    className="max-w-md h-auto rounded border"
                  />
                </div>
              )}
              {attachedPDF && (
                <div>
                  <h4 className="font-medium mb-2">PDF Adjunto: {pdfName}</h4>
                  <iframe
                    src={attachedPDF}
                    className="w-full h-96 border rounded"
                    title="PDF Preview"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
};

export default Archivos;
