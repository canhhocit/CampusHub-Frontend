import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, X, Loader2, AlertCircle, CheckCircle2, Link2 } from 'lucide-react';
import { uploadImageToCloudinary } from '../api/cloudinary';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  error?: string;
  onFileSelected?: (file: File) => void;
  label?: string;
  hideLabel?: boolean;
  allowUrl?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  error,
  onFileSelected,
  label = 'Hình ảnh',
  hideLabel = false,
  allowUrl = false,
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setUploadError(null);
    if (onFileSelected) {
      try {
        onFileSelected(file);
      } catch (e) {
        console.error('Error in onFileSelected callback:', e);
      }
    }
    setIsUploading(true);

    try {
      const url = await uploadImageToCloudinary(file);
      onChange(url);
    } catch (err: any) {
      setUploadError(err.message || 'Không thể tải ảnh lên.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    setUploadError(null);
  };

  return (
    <div className="space-y-2">
      {!hideLabel && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
          {allowUrl && (
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 transition"
            >
              <Link2 size={13} />
              {showUrlInput ? 'Ẩn nhập URL' : 'Dán URL ảnh'}
            </button>
          )}
        </div>
      )}

      {/* Manual URL Input (Collapsible) */}
      {allowUrl && showUrlInput && (
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in duration-150">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Dán link ảnh (https://...)"
            className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-md focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden bg-white transition"
          />
        </div>
      )}

      {/* Image Preview if available */}
      {value ? (
        <div className="relative rounded-lg border border-slate-200 bg-slate-50 overflow-hidden group">
          <div className="relative h-56 sm:h-64 w-full flex items-center justify-center bg-slate-900/5">
            <img
              src={value}
              alt="Ảnh đính kèm"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2.5 left-2.5 bg-slate-900/80 text-white text-[11px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 backdrop-blur-xs">
              <CheckCircle2 size={12} className="text-emerald-400" />
              Đã tải ảnh
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2.5 right-2.5 p-1.5 bg-slate-900/70 hover:bg-rose-600 text-white rounded-md transition"
              title="Xóa ảnh này"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span className="font-medium text-[11px]">Tệp hình ảnh đã nạp thành công</span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-slate-600 hover:text-slate-900 font-medium text-xs transition"
            >
              Thay ảnh khác
            </button>
          </div>
        </div>
      ) : (
        /* Drag and Drop Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border border-dashed rounded-lg p-5 text-center cursor-pointer transition flex flex-col items-center justify-center ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/40'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
          } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
        >
          {isUploading ? (
            <div className="py-4 flex flex-col items-center">
              <Loader2 className="animate-spin text-emerald-600 mb-2" size={28} />
              <p className="text-xs font-semibold text-slate-700">
                Đang tải ảnh lên...
              </p>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center">
              <div className="p-2 bg-slate-100 text-slate-500 rounded-md mb-2">
                <UploadCloud size={22} />
              </div>
              <p className="text-xs font-medium text-slate-700">
                Kéo thả ảnh vào đây hoặc <span className="text-emerald-700 font-bold hover:underline">tải từ máy tính</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
          <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Validation Form Error */}
      {error && !uploadError && (
        <p className="text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};
