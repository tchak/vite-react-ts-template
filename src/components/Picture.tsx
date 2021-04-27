import React, { forwardRef, useState } from 'react';

type SourceType = 'image/webp' | 'image/jpeg' | 'image/png';
type Source = { srcSet: string; type?: SourceType; media?: string };

type PictureProps = {
  sources: Source[];
  loading?: 'lazy' | 'eager';
  src?: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  fallbackSrc?: string;
};

const BLANK_IMG =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const Picture = forwardRef<HTMLImageElement, PictureProps>(
  (
    {
      src = BLANK_IMG,
      fallbackSrc = BLANK_IMG,
      sources,
      alt = '',
      className,
      loading,
      width,
      height,
    },
    ref
  ) => {
    const [isLoading, setLoading] = useState(true);
    return (
      <picture>
        {sources.map(({ srcSet, type, media }, index) => (
          <source srcSet={srcSet} type={type} media={media} key={index} />
        ))}
        <img
          ref={ref}
          loading={loading}
          className={className}
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={() => setLoading(false)}
          onError={(event) => {
            event.currentTarget.src = fallbackSrc;
            setLoading(false);
          }}
          data-loading={isLoading}
        />
      </picture>
    );
  }
);
