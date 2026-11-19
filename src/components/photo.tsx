import Image from "next/image";
import { photoSrc, type Photo as PhotoT } from "@/lib/photos";

/**
 * Editorial photograph, optimised through next/image. Fills its positioned
 * parent; the parent sets the aspect ratio and radius. The elevated colour
 * shows while it loads and if the CDN can't be reached (offline PWA).
 */
export function Photo({
  photo,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  className = "",
  decorative = false,
}: {
  photo: PhotoT;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** true when nearby text already says what the image shows */
  decorative?: boolean;
}) {
  return (
    <Image
      src={photoSrc(photo)}
      alt={decorative ? "" : photo.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
