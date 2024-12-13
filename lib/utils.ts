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
  // Already handled errors
  if (error instanceof AppError) {
    console.error(`[${error.code}] ${error.message}`);
    throw error;
  }

  // Native JavaScript errors
  if (error instanceof Error) {
    console.error(`[ERROR] ${error.name}: ${error.message}`);
    throw new AppError(error.message, 500, error.name.toUpperCase());
  }

  // String errors
  if (typeof error === "string") {
    console.error(`[ERROR] ${error}`);
    throw new AppError(error, 500, 'UNKNOWN_ERROR');
  }

  // Unknown errors
  console.error('[ERROR] Unknown error:', error);
  throw new AppError(
    `Unknown error: ${JSON.stringify(error)}`,
    500,
    'UNKNOWN_ERROR'
  );
};

// PLACEHOLDER LOADER - while image is transforming
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#7986AC" offset="20%" />
      <stop stop-color="#68769e" offset="50%" />
      <stop stop-color="#7986AC" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#7986AC" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export const dataUrl = `data:image/svg+xml;base64,${toBase64(
  shimmer(1000, 1000)
)}`;

// FORM URL QUERY
interface FormUrlQueryParams {
  searchParams: URLSearchParams;
  key: string;
  value: string;
}

export const formUrlQuery = ({
  searchParams,
  key,
  value,
}: FormUrlQueryParams) => {
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
interface RemoveUrlQueryParams {
  searchParams: URLSearchParams;
  keysToRemove: string[];
}

export function removeKeysFromQuery({
  searchParams,
  keysToRemove,
}: RemoveUrlQueryParams) {
  try {
    const currentUrl = qs.parse(searchParams.toString());

    keysToRemove.forEach((key) => {
      delete currentUrl[key];
    });

    // Remove null or undefined values
    Object.keys(currentUrl).forEach(
      (key) => currentUrl[key] == null && delete currentUrl[key]
    );

    return `${window.location.pathname}?${qs.stringify(currentUrl)}`;
  } catch (error) {
    handleError(new AppError('Failed to remove query keys', 400, 'QUERY_REMOVAL_ERROR'));
    return window.location.pathname;
  }
}

// DEBOUNCE
export const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout | null;
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// GET IMAGE SIZE
export type AspectRatioKey = keyof typeof aspectRatioOptions;

export const getImageSize = (
  type: string,
  image: any,
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
export const download = async (url: string, filename: string) => {
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

// DEEP MERGE OBJECTS
export const deepMergeObjects = (obj1: any, obj2: any) => {
  try {
    if (obj2 === null || obj2 === undefined) {
      return obj1;
    }

    let output = { ...obj2 };

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