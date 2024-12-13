'use client';

import Image from 'next/image';
import { CldUploadWidget, CloudinaryUploadWidgetResults, CloudinaryUploadWidgetError } from 'next-cloudinary';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type ImageType = {
  publicId: string;
  width: number;
  height: number;
  secureURL: string;
}

type MediaUploaderProps = {
  onValueChange: (value: string) => void;
  setImage: (value: any) => void;
  publicId: string;
  image: string;
  type: string;
}

const MediaUploader = ({
  onValueChange,
  setImage,
  publicId,
  image,
  type
}: MediaUploaderProps) => {
  const [mediaUrl, setMediaUrl] = useState<ImageType | null>(null);

  const onUploadSuccess = (results: CloudinaryUploadWidgetResults) => {
    if (!results.info || typeof results.info === 'string') return;

    const info = results.info;

    setMediaUrl({
      publicId: info.public_id,
      width: info.width,
      height: info.height,
      secureURL: info.secure_url
    });

    onValueChange(info.public_id);
    setImage(info.secure_url);
  };

  const onUploadError = (error: CloudinaryUploadWidgetError) => {
    const errorMessage = typeof error === 'string' ? error : error?.statusText || 'Something went wrong';
    console.error('Upload error:', errorMessage);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-center flex-col gap-4 bg-dark-3 rounded-xl">
        {publicId || image ? (
          <>
            <div className="flex-center flex-col gap-4">
              <Image
                src={image || publicId}
                alt="image"
                width={250}
                height={250}
                className="h-fit w-fit rounded-lg object-cover"
              />
            </div>
          </>
        ) : (
          <div className="flex-center flex-col gap-4 p-7 text-grey-500">
            <Image
              src="/assets/icons/upload.svg"
              alt="upload"
              width={77}
              height={77}
            />
            <h3 className="mb-2 mt-2">Drag photo here</h3>
            <p className="text-light-2 small-regular mb-4">SVG, PNG, JPG</p>
          </div>
        )}
      </div>

      <CldUploadWidget
        uploadPreset="jsm_project"
        options={{
          multiple: false,
          resourceType: "image",
        }}
        onSuccess={onUploadSuccess}
        onError={onUploadError}
      >
        {({ open }) => (
          <Button 
            variant="ghost"
            className="bg-purple-gradient bg-cover text-white"
            onClick={() => open()}
          >
            Select File
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
};

export default MediaUploader;