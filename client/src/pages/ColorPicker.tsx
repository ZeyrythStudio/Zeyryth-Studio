import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/_core/hooks/useAuth';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Plus, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { getLoginUrl } from '@/const';

export default function ColorPicker() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p>{t('common.loading')}</p>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-xl">{t('auth.loginMessage')}</p>
          <Button asChild>
            <a href={getLoginUrl()}>{t('auth.login')}</a>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getColorAtPosition = (x: number, y: number) => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    const pixelData = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
    const hex = `#${((1 << 24) + (pixelData[0] << 16) + (pixelData[1] << 8) + pixelData[2]).toString(16).slice(1).toUpperCase()}`;

    return hex;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMagnifierPos({
      x,
      y,
    });

    // Atualizar cor em tempo real
    const color = getColorAtPosition(x, y);
    if (color) {
      setSelectedColor(color);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const color = getColorAtPosition(x, y);
    if (color) {
      setSelectedColor(color);
      addColorToPalette(color);
    }
  };

  const addColorToPalette = (color?: string) => {
    const colorToAdd = color || selectedColor;
    if (!selectedColors.includes(colorToAdd)) {
      setSelectedColors([...selectedColors, colorToAdd]);
      toast.success('Cor adicionada à paleta!');
    } else {
      toast.info('Esta cor já está na paleta');
    }
  };

  const removeColor = (color: string) => {
    setSelectedColors(selectedColors.filter(c => c !== color));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
      : '';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('colorPicker.title')}</h1>
          <p className="text-muted-foreground">{t('colorPicker.selectColor')}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('colorPicker.uploadImage')}</CardTitle>
                <CardDescription>Passe o mouse sobre a imagem para ver as cores em tempo real. Clique para adicionar à paleta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image-upload">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Clique para fazer upload de uma imagem
                      </p>
                    </div>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {image && (
                  <div className="relative">
                    <img
                      ref={imageRef}
                      src={image}
                      alt="Uploaded"
                      className="w-full rounded-lg cursor-crosshair"
                      onClick={handleImageClick}
                      onMouseMove={handleMouseMove}
                      onMouseEnter={() => setShowMagnifier(true)}
                      onMouseLeave={() => setShowMagnifier(false)}
                    />
                    {showMagnifier && (
                      <div
                        className="absolute pointer-events-none border-4 border-white shadow-lg rounded-full"
                        style={{
                          left: magnifierPos.x - 50,
                          top: magnifierPos.y - 50,
                          width: 100,
                          height: 100,
                          background: `radial-gradient(circle, ${selectedColor} 0%, transparent 70%)`,
                          boxShadow: '0 0 0 2px rgba(0,0,0,0.2)',
                        }}
                      />
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('colorPicker.selectedColor')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="w-full h-32 rounded-lg border-2 transition-colors"
                  style={{ backgroundColor: selectedColor, borderColor: selectedColor }}
                />
                <div className="space-y-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">HEX:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedColor)}
                      className="w-full justify-between"
                    >
                      {selectedColor}
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">RGB:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(hexToRgb(selectedColor))}
                      className="w-full justify-between"
                    >
                      {hexToRgb(selectedColor)}
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button className="w-full" onClick={() => addColorToPalette()}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('colorPicker.addToPalette')}
                </Button>
              </CardContent>
            </Card>

            {selectedColors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('colorPicker.createPalette')}</CardTitle>
                  <CardDescription>{selectedColors.length} cores selecionadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {selectedColors.map((color, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded cursor-pointer hover:scale-110 transition-transform relative group"
                        style={{ backgroundColor: color }}
                        onClick={() => removeColor(color)}
                        title={`${color} - Clique para remover`}
                      >
                        <div className="absolute inset-0 rounded bg-black opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100">✕</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Clique em uma cor para remover</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
