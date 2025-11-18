import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileIcon } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUploaded: (url: string) => void;
  currentFileUrl?: string;
  onFileRemoved?: () => void;
}

export const FileUpload = ({ onFileUploaded, currentFileUrl, onFileRemoved }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be less than 20MB");
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to upload files");
        return;
      }

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('evidence-attachments')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('evidence-attachments')
        .getPublicUrl(filePath);

      onFileUploaded(publicUrl);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
      setFileName(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFileName(null);
    if (onFileRemoved) {
      onFileRemoved();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">Attachment (Logo, Screenshot, etc.)</Label>
      {(currentFileUrl || fileName) ? (
        <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-card">
          <FileIcon className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm flex-1 truncate">
            {fileName || currentFileUrl?.split('/').pop()}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            accept="image/*,.pdf,.doc,.docx"
            className="cursor-pointer"
          />
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              Uploading...
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Upload company logos, screenshots, or supporting documents (max 20MB)
      </p>
    </div>
  );
};
