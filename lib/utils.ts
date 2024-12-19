/* eslint-disable prefer-const */
/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";
import qs from "qs";
import { twMerge } from "tailwind-merge";
import { aspectRatioOptions } from "@/constants";

// Custom error class for application-specific errors
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ENHANCED ERROR HANDLER
export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    console.error(`[${error.code}] ${error.message}`);
    throw error;
  }

  if (error instanceof Error) {
    console.error(`[ERROR] ${error.name}: ${error.message}`);
    throw new AppError(error.message, 500, error.name.toUpperCase());
  }

  if (typeof error === "string") {
    console.error(`[ERROR] ${error}`);
    throw new AppError(error, 500, 'UNKNOWN_ERROR');
  }

  console.error('[ERROR] Unknown error:', error);
  throw new AppError(
    `Unknown error: ${JSON.stringify(error)}`,
    500,
    'UNKNOWN_ERROR'
  );
};

// SVG Types for shimmer
interface SVGDimensions {
  width: number;
  height: number;
}

// PLACEHOLDER LOADER
const shimmer = ({ width, height }: SVGDimensions): string => `
<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#7986AC" offset="20%" />
      <stop stop-color="#68769e" offset="50%" />
      <stop stop-color="#7986AC" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#7986AC" />
  <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${width}" to="${width}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string): string =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export const dataUrl = `data:image/svg+xml;base64,${toBase64(
  shimmer({ width: 1000, height: 1000 })
)}`;

// URL Query Types
interface FormUrlQueryParams {
  searchParams: string | URLSearchParams;
  key: string;
  value: string | number;
}

interface RemoveUrlQueryParams {
  searchParams: string | URLSearchParams;
  keysToRemove: string[];
}

// FORM URL QUERY
export const formUrlQuery = ({
  searchParams,
  key,
  value,
}: FormUrlQueryParams): string => {
  try {
    const params = { ...qs.parse(searchParams.toString()), [key]: value };
    return `${window.location.pathname}?${qs.stringify(params, {
      skipNulls: true,
    })}`;
  } catch (error) {
    handleError(new AppError('Failed to form URL query', 400, 'URL_QUERY_ERROR'));
    return window.location.pathname;
  }
};

// REMOVE KEY FROM QUERY
export function removeKeysFromQuery({
  searchParams,
  keysToRemove,
}: RemoveUrlQueryParams): string {
  try {
    const currentUrl = qs.parse(searchParams.toString());

    keysToRemove.forEach((key) => {
      delete currentUrl[key];
    });

    Object.keys(currentUrl).forEach(
      (key) => currentUrl[key] == null && delete currentUrl[key]
    );

    return `${window.location.pathname}?${qs.stringify(currentUrl)}`;
  } catch (error) {
    handleError(new AppError('Failed to remove query keys', 400, 'QUERY_REMOVAL_ERROR'));
    return window.location.pathname;
  }
}

// Debounce Types
type DebouncedFunction<T extends (...args: any[]) => void> = (...args: Parameters<T>) => void;

// DEBOUNCE
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): DebouncedFunction<T> => {
  let timeoutId: NodeJS.Timeout | null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Image Types
interface ImageDimensions {
  width?: number;
  height?: number;
  aspectRatio?: AspectRatioKey;
}

// GET IMAGE SIZE
export type AspectRatioKey = keyof typeof aspectRatioOptions;

export const getImageSize = (
  type: string,
  image: ImageDimensions,
  dimension: "width" | "height"
): number => {
  try {
    if (type === "fill") {
      return (
        aspectRatioOptions[image.aspectRatio as AspectRatioKey]?.[dimension] ||
        1000
      );
    }
    return image?.[dimension] || 1000;
  } catch (error) {
    handleError(new AppError('Failed to get image size', 400, 'IMAGE_SIZE_ERROR'));
    return 1000;
  }
};

// DOWNLOAD IMAGE
export const download = async (url: string, filename: string): Promise<void> => {
  if (!url) {
    throw new AppError('Resource URL not provided', 400, 'MISSING_URL');
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new AppError('Failed to fetch resource', response.status, 'FETCH_ERROR');
    }

    const blob = await response.blob();
    const blobURL = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobURL;

    if (filename && filename.length) {
      a.download = `${filename.replace(" ", "_")}.png`;
    }

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobURL);
  } catch (error) {
    handleError(error);
  }
};

// Object Types for deepMergeObjects
interface GenericObject {
  [key: string]: any;
}

// DEEP MERGE OBJECTS
export const deepMergeObjects = <T extends GenericObject>(
  obj1: T, 
  obj2: T | null | undefined
): T => {
  try {
    if (obj2 === null || obj2 === undefined) {
      return obj1;
    }

    let output = { ...obj2 } as T;

    for (let key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        if (
          obj1[key] &&
          typeof obj1[key] === "object" &&
          obj2[key] &&
          typeof obj2[key] === "object"
        ) {
          output[key] = deepMergeObjects(obj1[key], obj2[key]);
        } else {
          output[key] = obj1[key];
        }
      }
    }

    return output;
  } catch (error) {
    handleError(new AppError('Failed to merge objects', 500, 'MERGE_ERROR'));
    return obj1;
  }
};