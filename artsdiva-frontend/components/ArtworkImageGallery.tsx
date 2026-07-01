interface ArtworkImageGalleryProps {
  images: string[];
}

export function ArtworkImageGallery({ images }: ArtworkImageGalleryProps) {
  if (images.length === 0) {
    return <p className="text-sm">No images yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {images.map((url) => (
        // Blob URLs are on a dynamic per-file subdomain, so next/image's
        // remote-pattern allowlist isn't a good fit here — plain <img>.
        // eslint-disable-next-line @next/next/no-img-element
        <img key={url} src={url} alt="" className="h-24 w-24 border object-cover" />
      ))}
    </div>
  );
}
