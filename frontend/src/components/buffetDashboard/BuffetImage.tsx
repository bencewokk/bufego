// components/BuffetImage.tsx
import { FC, useState, useRef } from "react";
import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import { Buffet } from "../../types";

interface BuffetImageProps {
  buffet: Buffet;
  setBuffet: React.Dispatch<React.SetStateAction<Buffet | null>>;
  navigate: NavigateFunction;
}

export const BuffetImage: FC<BuffetImageProps> = ({ buffet, setBuffet, navigate }) => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(buffet.image || "");
  const [uploading, setUploading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        setUpdateMessage({text: "Please select an image file", type: 'error'});
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setUpdateMessage({text: "Image must be smaller than 5MB", type: 'error'});
        return;
      }
      
      setUploadedImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!buffet || !uploadedImage) return;
    
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
      return;
    }
    
    setUploading(true);
    try {
      // Create form data for image upload
      const formData = new FormData();
      formData.append('image', uploadedImage);
      
      const response = await axios.post(
        `http://localhost:3000/api/buffets/${buffet.id}/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update buffet data with new image URL
      if (response.data && response.data.imageUrl) {
        setBuffet(prev => prev ? {...prev, image: response.data.imageUrl} : null);
        setUpdateMessage({text: "Image uploaded successfully!", type: 'success'});
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUpdateMessage({text: "Failed to upload image. Please try again.", type: 'error'});
    } finally {
      setUploading(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setUpdateMessage(null);
      }, 3000);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Buffet Image</h2>
      <div className="flex flex-col items-center">
        <div className="w-full h-64 mb-4 p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Buffet preview" 
              className="max-w-full max-h-full object-contain rounded"
            />
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-500">No image uploaded</p>
              <p className="text-sm text-gray-400">Upload an image to showcase your buffet</p>
            </div>
          )}
        </div>
        
        <div className="w-full flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <label className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-center cursor-pointer transition">
            Select Image
            <input 
              type="file" 
              className="hidden" 
              onChange={handleImageChange}
              accept="image/*"
              ref={fileInputRef}
            />
          </label>
          <button
            onClick={handleUploadImage}
            disabled={!uploadedImage || uploading}
            className={`px-4 py-2 rounded transition ${
              uploadedImage && !uploading 
                ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
        
        {updateMessage && (
          <div className={`mt-2 p-2 rounded text-sm ${
            updateMessage.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {updateMessage.text}
          </div>
        )}
        
        <div className="mt-3 text-xs text-gray-500">
          <p>Accepted formats: JPG, PNG, GIF</p>
          <p>Maximum size: 5MB</p>
        </div>
      </div>
    </div>
  );
};