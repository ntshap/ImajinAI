/* eslint-disable no-unused-vars */

// ====== USER INTERFACES ======
interface IUser {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
  planId: number;
  creditBalance: number;
}

// ====== USER PARAMS ======
declare type CreateUserParams = {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
};

declare type UpdateUserParams = {
  firstName: string;
  lastName: string;
  username: string;
  photo: string;
};

// ====== IMAGE INTERFACES ======
interface IImage {
  _id: string;
  title: string;
  author: string;
  publicId: string;
  transformationType: string;
  width: number;
  height: number;
  config: TransformationConfig;
  secureURL: string;
  transformationURL: string;
  aspectRatio?: string;
  prompt?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ====== IMAGE PARAMS ======
declare type AddImageParams = {
  image: {
    title: string;
    publicId: string;
    transformationType: string;
    width: number;
    height: number;
    config: TransformationConfig;
    secureURL: string;
    transformationURL: string;
    aspectRatio?: string;
    prompt?: string;
    color?: string;
  };
  userId: string;
  path: string;
};

declare type UpdateImageParams = {
  image: {
    _id: string;
    title: string;
    publicId: string;
    transformationType: string;
    width: number;
    height: number;
    config: TransformationConfig;
    secureURL: string;
    transformationURL: string;
    aspectRatio?: string;
    prompt?: string;
    color?: string;
  };
  userId: string;
  path: string;
};

declare type TransformationConfig = {
  restore?: boolean;
  fillBackground?: boolean;
  remove?: {
    prompt: string;
    removeShadow?: boolean;
    multiple?: boolean;
  };
  recolor?: {
    prompt?: string;
    to: string;
    multiple?: boolean;
  };
  removeBackground?: boolean;
};

// ====== TRANSACTION INTERFACES ======
interface ITransaction {
  _id: string;
  stripeId: string;
  amount: number;
  plan: string;
  credits: number;
  buyer: string;
  createdAt: Date;
  updatedAt: Date;
}

// ====== TRANSACTION PARAMS ======
declare type CheckoutTransactionParams = {
  plan: string;
  credits: number;
  amount: number;
  buyerId: string;
};

declare type CreateTransactionParams = {
  stripeId: string;
  amount: number;
  credits: number;
  plan: string;
  buyerId: string;
  createdAt: Date;
};

// ====== URL QUERY PARAMS ======
declare type FormUrlQueryParams = {
  searchParams: string;
  key: string;
  value: string | number | null;
};

declare type UrlQueryParams = {
  params: string;
  key: string;
  value: string | null;
};

declare type RemoveUrlQueryParams = {
  searchParams: string;
  keysToRemove: string[];
};

// ====== TRANSFORMATION TYPES ======
declare type TransformationTypeKey =
  | "restore"
  | "fill"
  | "remove"
  | "recolor"
  | "removeBackground";

// ====== COMPONENT PROP TYPES ======
declare type TransformationFormProps = {
  action: "Add" | "Update";
  userId: string;
  type: TransformationTypeKey;
  creditBalance: number;
  data?: IImage | null;
  config?: TransformationConfig | null;
};

declare type TransformedImageProps = {
  image: IImage;
  type: string;
  title: string;
  transformationConfig: TransformationConfig | null;
  isTransforming: boolean;
  hasDownload?: boolean;
  setIsTransforming?: React.Dispatch<React.SetStateAction<boolean>>;
};

// ====== SEARCH PARAMS ======
declare type SearchParamProps = {
  params: { id: string; type: TransformationTypeKey };
  searchParams: { [key: string]: string | string[] | undefined };
};

declare interface SearchParamsProps {
  searchParams: {
    page?: string;
    query?: string;
  };
}

// ====== EXTENDED IMAGE INTERFACE ======
export interface ExtendedIImage extends IImage {
  _id: string;
  publicId: string;
  title: string;
  width: number;
  height: number;
  transformationType: string;
  config: TransformationConfig;
  secureURL: string;
  transformationURL: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    clerkId: string;
  };
}