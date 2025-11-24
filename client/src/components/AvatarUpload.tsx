import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface AvatarUploadProps {
  currentAvatar: string | null;
  userName: string | null;
  onUploadSuccess: (url: string) => void;
}

export default function AvatarUpload({
  currentAvatar,
  userName,
  onUploadSuccess,
}: AvatarUploadProps) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.profile.uploadAvatar.useMutation({
    onSuccess: (data) => {
      toast.success('Avatar atualizado com sucesso!');
      onUploadSuccess(data.url);
      setPreview(null);
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao fazer upload do avatar');
      setIsUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido. Use JPEG, PNG, WebP ou GIF.');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(',')[1];
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!preview) return;

    setIsUploading(true);
    const base64Data = preview.split(',')[1];
    const mimeType = preview.split(';')[0].split(':')[1];

    uploadMutation.mutate({
      base64: base64Data,
      mimeType,
    });
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={preview || currentAvatar || undefined} />
          <AvatarFallback className="text-4xl">
            {userName?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        {preview && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center gap-2">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="p-2 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
              title="Confirmar"
            >
              <Check className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              title="Cancelar"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        variant="outline"
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {isUploading ? 'Enviando...' : 'Alterar Avatar'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Máximo 5MB. Formatos: JPEG, PNG, WebP, GIF
      </p>
    </div>
  );
}
