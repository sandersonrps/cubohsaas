import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images = [],
  onChange,
  maxImages = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Check if adding these files would exceed the maximum
    if (images.length + acceptedFiles.length > maxImages) {
      toast.error(`Você pode enviar no máximo ${maxImages} imagens`);
      return;
    }

    setUploading(true);
    const newProgress: Record<string, number> = {};
    acceptedFiles.forEach(file => {
      newProgress[file.name] = 0;
    });
    setUploadProgress(newProgress);

    const newImages: string[] = [...images];

    try {
      for (const file of acceptedFiles) {
        // Create a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload the file to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from('imoveis_images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progress) => {
              const percent = Math.round((progress.loaded / progress.total) * 100);
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: percent
              }));
            }
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('imoveis_images')
          .getPublicUrl(filePath);

        newImages.push(publicUrl);
      }

      onChange(newImages);
      toast.success('Imagens enviadas com sucesso');
    } catch (error) {
      console.error('Erro ao enviar imagens:', error);
      toast.error('Erro ao enviar imagens');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [images, maxImages, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    disabled: uploading || images.length >= maxImages
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
        } ${
          uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? 'Solte as imagens aqui...'
              : images.length >= maxImages
              ? `Limite de ${maxImages} imagens atingido`
              : `Arraste e solte imagens aqui, ou clique para selecionar (${images.length}/${maxImages})`}
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="text-sm">
              <div className="flex justify-between mb-1">
                <span>{fileName}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                <img
                  src={url}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Erro';
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;