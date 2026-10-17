import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, X, Loader2, AlertCircle, CheckCircle2, Link2 } from 'lucide-react';
import { uploadImageToCloudinary } from '../api/cloudinary';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  error?: string;
  onFileSelected?: (file: File) => void;
}

export const ImageUpload = ({ value, onChange, error, onFileSelected }: ImageUploadProps) => {
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
      setUploadError(err.message || 'Không thể tải ảnh lên Cloudinary.');
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          Hình ảnh sản phẩm
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1 transition"
        >
          <Link2 size={13} />
          {showUrlInput ? 'Ẩn nhập URL' : 'Hoặc dán URL ảnh'}
        </button>
      </div>

      {/* Manual URL Input (Collapsible) */}
      {showUrlInput && (
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in duration-200">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Dán liên kết ảnh trực tiếp:
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/... hoặc link ảnh online"
            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
          />
        </div>
      )}

      {/* Image Preview if available */}
      {value ? (
        <div className="relative rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden group">
          <div className="relative h-64 sm:h-72 w-full flex items-center justify-center bg-gray-900/5">
            <img
              src={value}
              alt="Ảnh sản phẩm"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-xs backdrop-blur-xs">
              <CheckCircle2 size={13} />
              Ảnh đã sẵn sàng
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-md"
              title="Xóa ảnh này"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span className="truncate max-w-xs">{value}</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-purple-600 hover:text-purple-700 font-semibold ml-2 shrink-0 hover:underline"
            >
              Đổi ảnh khác
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
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
            isDragging
              ? 'border-purple-500 bg-purple-50/60'
              : 'border-gray-300 hover:border-purple-400 bg-white hover:bg-gray-50/50'
          } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
        >
          {isUploading ? (
            <div className="py-6 flex flex-col items-center">
              <Loader2 className="animate-spin text-purple-600 mb-3" size={36} />
              <p className="text-sm font-semibold text-gray-800">
                Đang tải ảnh lên Cloudinary...
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Quá trình này chỉ mất 1-2 giây
              </p>
            </div>
          ) : (
            <div className="py-4 flex flex-col items-center">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full mb-3">
                <UploadCloud size={28} />
              </div>
              <p className="text-sm font-semibold text-gray-800">
                Kéo thả ảnh vào đây hoặc{' '}
                <span className="text-purple-600 hover:underline">chọn từ máy tính</span>
              </p>
              <p className="text-xs text-gray-500 mt-1.5 max-w-sm">
                Hỗ trợ định dạng JPG, PNG, WEBP, GIF (Dung lượng tối đa 5MB). Ảnh được tải trực tiếp lên Cloudinary.
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
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <strong className="font-semibold">Lỗi tải ảnh: </strong>
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Validation Form Error */}
      {error && !uploadError && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={13} /> {error}
        </p>
      )}
    </div>
  );
};
