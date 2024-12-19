"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CldImage } from "next-cloudinary";
import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { transformationTypes } from "@/constants";
import { IImage } from "@/lib/database/models/image.model";
import { formUrlQuery } from "@/lib/utils";
import { Button } from "../ui/button";
import { Search } from "./Search";

// Updated interface to better match your types/index.d.ts
interface ExtendedIImage extends IImage {
  _id: string;
  publicId: string;
  title: string;
  width: number;
  height: number;
  transformationType: keyof typeof transformationTypes;
  config: {
    width?: number;
    height?: number;
    [key: string]: number | undefined;
  };
  secureURL: string;
  transformationURL: string;
  aspectRatio?: string;
  prompt?: string;
  color?: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    clerkId: string;
  };
}

interface CollectionProps {
  hasSearch?: boolean;
  images: ExtendedIImage[];
  totalPages?: number;
  page: number | string;
}

export const Collection: React.FC<CollectionProps> = ({
  hasSearch = false,
  images,
  totalPages = 1,
  page,
}: CollectionProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onPageChange = (action: "next" | "prev") => {
    const currentPage = Number(page);
    const pageValue = action === "next" ? currentPage + 1 : currentPage - 1;
    
    const newUrl = formUrlQuery({
      searchParams: searchParams.toString(),
      key: "page",
      value: pageValue.toString(),
    });
    
    router.push(newUrl, { scroll: false });
  };

  return (
    <>
      <div className="collection-heading">
        <h2 className="h2-bold text-dark-600">Recent Edits</h2>
        {hasSearch && <Search />}
      </div>

      {images.length > 0 ? (
        <ul className="collection-list">
          {images.map((image) => (
            <Card image={image} key={image._id} />
          ))}
        </ul>
      ) : (
        <div className="collection-empty">
          <p className="p-20-semibold">Empty List</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent className="flex w-full">
            <Button
              disabled={Number(page) <= 1}
              className="collection-btn"
              onClick={() => onPageChange("prev")}
            >
              <PaginationPrevious className="hover:bg-transparent hover:text-white" />
            </Button>
            <p className="flex-center p-16-medium w-fit flex-1">
              {page} / {totalPages}
            </p>
            <Button
              className="button w-32 bg-purple-gradient bg-cover text-white"
              onClick={() => onPageChange("next")}
              disabled={Number(page) >= totalPages}
            >
              <PaginationNext className="hover:bg-transparent hover:text-white" />
            </Button>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};

interface CardProps {
  image: ExtendedIImage;
}

const Card: React.FC<CardProps> = ({ image }) => {
  return (
    <li>
      <Link href={`/transformations/${image._id}`} className="collection-card">
        <CldImage
          src={image.publicId}
          alt={image.title}
          width={image.width}
          height={image.height}
          {...image.config}
          loading="lazy"
          className="h-52 w-full rounded-[10px] object-cover"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        />
        <div className="flex-between">
          <p className="p-20-semibold mr-3 line-clamp-1 text-dark-600">
            {image.title}
          </p>
          <Image
            src={`/assets/icons/${transformationTypes[image.transformationType].icon}`}
            alt={image.title}
            width={24}
            height={24}
          />
        </div>
      </Link>
    </li>
  );
};