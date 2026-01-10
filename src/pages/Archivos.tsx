import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useModuleStyles } from '@/context/ModuleColorsContext';
import ModuleHeader from '@/components/ui/ModuleHeader';
import { Upload, FileText, Trash2, Eye, Save, Loader2 } from 'lucide-react';
import { useAttachedFiles } from '@/hooks/useSupabaseData';

const Archivos = () => {
  const { toast } = useToast();
  const styles = useModuleStyles('archivos');
  const { attachedFile, loading, uploadFile, removeFile } = useAttachedFiles();
  
  // Temporary state for uploaded file (before saving)
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [tempFileUrl, setTempFileUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

    // Create temporary URL for preview
    const url = URL.createObjectURL(file);
    setTempFile(file);
    setTempFileUrl(url);
    
    toast({
      title: 'PDF cargado',
      description: 'Presiona "Guardar PDF" para confirmar',
    });
  };

  const savePDF = async () => {
    if (!tempFile) return;
    
    setUploading(true);
    try {
      await uploadFile(tempFile);
      setTempFile(null);
      if (tempFileUrl) {
        URL.revokeObjectURL(tempFileUrl);
        setTempFileUrl(null);
      }
      toast({
        title: 'PDF guardado',
        description: 'El PDF se adjuntará al reporte generado',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el archivo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePDF = async () => {
    try {
      await removeFile();
      setTempFile(null);
      if (tempFileUrl) {
        URL.revokeObjectURL(tempFileUrl);
        setTempFileUrl(null);
      }
      toast({
        title: 'PDF eliminado',
        description: 'El PDF adjunto se ha eliminado',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el archivo',
        variant: 'destructive',
      });
    }
  };

  // Display file (temp has priority over saved)
  const displayPDF = tempFileUrl || attachedFile?.url;
  const displayPdfName = tempFile?.name || attachedFile?.name || '';

  if (loading) {
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
      <ModuleHeader
        icon={Upload}
        title="Archivos del Reporte"
        description="Sube un PDF adjunto para el reporte"
        moduleId="archivos"
      />

      <div className="max-w-2xl mx-auto">
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

            {displayPDF && (
              <div className="space-y-3">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <FileText className="w-10 h-10" style={{ color: styles.colors.primaryColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{displayPdfName}</p>
                      <p className="text-sm text-muted-foreground">Archivo PDF</p>
                    </div>
                  </div>
                </div>
                {tempFile && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    ⚠️ PDF no guardado. Presiona el botón para guardar.
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {tempFile && (
                    <Button
                      size="sm"
                      onClick={savePDF}
                      disabled={uploading}
                      className="flex items-center gap-2"
                      style={{ backgroundColor: styles.colors.primaryColor }}
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {uploading ? 'Guardando...' : 'Guardar PDF'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(displayPDF, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver PDF
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemovePDF}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </Button>
                </div>
                {attachedFile && !tempFile && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                    ✓ PDF guardado y listo para adjuntar al reporte
                  </div>
                )}
              </div>
            )}

            {!displayPDF && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay PDF cargado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vista Previa del PDF */}
        {attachedFile && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" style={{ color: styles.colors.primaryColor }} />
                Vista Previa del PDF Adjunto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={attachedFile.url}
                  className="w-full h-[500px]"
                  title="PDF Preview"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              El archivo PDF guardado se incluirá automáticamente cuando generes una cotización en el <strong>Generador</strong>.
            </p>
            <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li><strong>PDF Adjunto:</strong> Se unirá al final del PDF de la cotización</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Archivos;
