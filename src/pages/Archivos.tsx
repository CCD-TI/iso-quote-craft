import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useModuleStyles } from '@/context/ModuleColorsContext';
import ModuleHeader from '@/components/ui/ModuleHeader';
import { Upload, Image, FileText, Trash2, Eye, Save } from 'lucide-react';

const Archivos = () => {
  const { toast } = useToast();
  const styles = useModuleStyles('archivos');
  
  // Temporary state for uploaded files (before saving)
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [tempPDF, setTempPDF] = useState<string | null>(null);
  const [tempPdfName, setTempPdfName] = useState<string>('');
  
  // Saved state from localStorage
  const [savedImage, setSavedImage] = useState<string | null>(() => {
    return localStorage.getItem('reportImage');
  });
  
  const [savedPDF, setSavedPDF] = useState<string | null>(() => {
    return localStorage.getItem('attachedPDF');
  });
  
  const [savedPdfName, setSavedPdfName] = useState<string>(() => {
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
      setTempImage(base64);
      toast({
        title: 'Imagen cargada',
        description: 'Presiona "Guardar Imagen" para confirmar',
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
      setTempPDF(base64);
      setTempPdfName(file.name);
      toast({
        title: 'PDF cargado',
        description: 'Presiona "Guardar PDF" para confirmar',
      });
    };
    reader.readAsDataURL(file);
  };

  const saveImage = () => {
    if (tempImage) {
      localStorage.setItem('reportImage', tempImage);
      setSavedImage(tempImage);
      setTempImage(null);
      toast({
        title: 'Imagen guardada',
        description: 'La imagen de fondo se usará en el reporte',
      });
    }
  };

  const savePDF = () => {
    if (tempPDF) {
      localStorage.setItem('attachedPDF', tempPDF);
      localStorage.setItem('attachedPDFName', tempPdfName);
      setSavedPDF(tempPDF);
      setSavedPdfName(tempPdfName);
      setTempPDF(null);
      setTempPdfName('');
      toast({
        title: 'PDF guardado',
        description: 'El PDF se adjuntará al reporte generado',
      });
    }
  };

  const removeImage = () => {
    setSavedImage(null);
    setTempImage(null);
    localStorage.removeItem('reportImage');
    toast({
      title: 'Imagen eliminada',
      description: 'La imagen del reporte se ha eliminado',
    });
  };

  const removePDF = () => {
    setSavedPDF(null);
    setSavedPdfName('');
    setTempPDF(null);
    setTempPdfName('');
    localStorage.removeItem('attachedPDF');
    localStorage.removeItem('attachedPDFName');
    toast({
      title: 'PDF eliminado',
      description: 'El PDF adjunto se ha eliminado',
    });
  };

  // Display image (temp has priority over saved)
  const displayImage = tempImage || savedImage;
  const displayPDF = tempPDF || savedPDF;
  const displayPdfName = tempPdfName || savedPdfName;

  return (
    <Layout>
      <ModuleHeader
        icon={Upload}
        title="Archivos del Reporte"
        description="Sube una imagen de fondo y un PDF adjunto para el reporte"
        moduleId="archivos"
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Imagen del Reporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" style={{ color: styles.colors.primaryColor }} />
              Imagen de Fondo
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

            {displayImage && (
              <div className="space-y-3">
                <div className="border rounded-lg p-2 bg-muted/30">
                  <img
                    src={displayImage}
                    alt="Imagen del reporte"
                    className="w-full h-48 object-contain rounded"
                  />
                </div>
                {tempImage && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    ⚠️ Imagen no guardada. Presiona el botón para guardar.
                  </div>
                )}
                <div className="flex gap-2">
                  {tempImage && (
                    <Button
                      size="sm"
                      onClick={saveImage}
                      className="flex items-center gap-2"
                      style={{ backgroundColor: styles.colors.primaryColor }}
                    >
                      <Save className="w-4 h-4" />
                      Guardar Imagen
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </Button>
                </div>
                {savedImage && !tempImage && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                    ✓ Imagen guardada y lista para usar en el reporte
                  </div>
                )}
              </div>
            )}

            {!displayImage && (
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
                {tempPDF && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    ⚠️ PDF no guardado. Presiona el botón para guardar.
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {tempPDF && (
                    <Button
                      size="sm"
                      onClick={savePDF}
                      className="flex items-center gap-2"
                      style={{ backgroundColor: styles.colors.primaryColor }}
                    >
                      <Save className="w-4 h-4" />
                      Guardar PDF
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
                    onClick={removePDF}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </Button>
                </div>
                {savedPDF && !tempPDF && (
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
      </div>

      {/* Vista Previa del Reporte Completo */}
      {(savedImage || savedPDF) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" style={{ color: styles.colors.primaryColor }} />
              Vista Previa del Reporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Así se verá el reporte con los archivos guardados:
            </p>
            
            {/* Simulated Report Preview */}
            <div className="border-2 rounded-lg overflow-hidden shadow-lg">
              {/* Report with Background Image */}
              <div 
                className="relative bg-white p-6 min-h-[400px]"
                style={{
                  backgroundImage: savedImage ? `url(${savedImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-white/85" />
                
                {/* Sample Report Content */}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: styles.colors.primaryColor }}
                      >
                        CCD
                      </div>
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: styles.colors.primaryColor }}>
                          ACUERDO COMERCIAL
                        </h3>
                        <p className="text-sm text-muted-foreground">Cotización de ejemplo</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p>Código: <span className="font-mono font-bold">COT-2024-001</span></p>
                      <p className="text-muted-foreground">Fecha: {new Date().toLocaleDateString('es-PE')}</p>
                    </div>
                  </div>

                  {/* Sample Client Box */}
                  <div 
                    className="rounded-md p-4 mb-4"
                    style={{ border: `2px solid ${styles.colors.primaryColor}` }}
                  >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cliente:</span>
                        <span className="ml-2 font-semibold">Empresa Ejemplo S.A.C.</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">RUC:</span>
                        <span className="ml-2 font-semibold">20123456789</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Table */}
                  <table className="w-full text-sm border-collapse mb-4">
                    <thead>
                      <tr 
                        className="text-white"
                        style={{ background: `linear-gradient(180deg, ${styles.colors.primaryColor}, ${styles.colors.secondaryColor})` }}
                      >
                        <th className="py-2 px-3 text-left">ESTÁNDAR</th>
                        <th className="py-2 px-3 text-center">CERTIFICACIÓN</th>
                        <th className="py-2 px-3 text-center">SEGUIMIENTO</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-3 font-semibold" style={{ color: styles.colors.primaryColor }}>ISO 9001:2015</td>
                        <td className="py-2 px-3 text-center">S/ 5,000.00</td>
                        <td className="py-2 px-3 text-center">S/ 2,500.00</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Sample Total */}
                  <div className="flex justify-end">
                    <div 
                      className="px-4 py-2 rounded text-white font-bold"
                      style={{ background: `linear-gradient(180deg, ${styles.colors.primaryColor}, ${styles.colors.secondaryColor})` }}
                    >
                      TOTAL: S/ 8,850.00
                    </div>
                  </div>
                </div>
              </div>

              {/* Attached PDF Section */}
              {savedPDF && (
                <div className="border-t-2 p-4 bg-muted/30">
                  <h4 
                    className="font-bold text-sm mb-3 flex items-center gap-2"
                    style={{ color: styles.colors.primaryColor }}
                  >
                    <FileText className="w-4 h-4" />
                    DOCUMENTO ADJUNTO: {savedPdfName}
                  </h4>
                  <iframe
                    src={savedPDF}
                    className="w-full h-[500px] border rounded"
                    title="PDF Preview"
                  />
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Esta es una vista previa de ejemplo. Los datos reales se mostrarán cuando generes una cotización.
            </p>
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
            Los archivos guardados se incluirán automáticamente cuando generes una cotización en el <strong>Generador</strong>:
          </p>
          <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li><strong>Imagen de fondo:</strong> Se usará como marca de agua en el reporte</li>
            <li><strong>PDF Adjunto:</strong> Se mostrará debajo de la cotización</li>
          </ul>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Archivos;
