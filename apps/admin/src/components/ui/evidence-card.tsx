'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  FileText,
  Image as ImageIcon,
} from '@phosphor-icons/react';

export interface EvidenceItem {
  type: 'photo' | 'document';
  url: string;
  caption: string;
}

export function EvidenceCard({ item }: { item: EvidenceItem }) {
  const [unavailable, setUnavailable] = useState(false);

  return (
    <figure className="flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-graphite/15 bg-white">
      <div className="relative flex aspect-[4/3] min-h-36 items-center justify-center bg-coolSurface">
        {item.type === 'photo' && !unavailable ? (
          <Image
            src={item.url}
            alt={item.caption}
            fill
            sizes="(max-width: 767px) 100vw, 360px"
            className="object-cover"
            unoptimized
            onError={() => setUnavailable(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center text-sm text-graphite/70">
            {item.type === 'photo' ? (
              <ImageIcon size={28} aria-hidden="true" />
            ) : (
              <FileText size={28} aria-hidden="true" />
            )}
            <span>
              {item.type === 'photo' ? 'Photo preview unavailable' : 'Document'}
            </span>
          </div>
        )}
      </div>
      <figcaption className="min-h-14 border-t border-graphite/10 px-3 py-2.5 text-sm font-medium text-deepCharcoal">
        {item.caption}
      </figcaption>
      {!unavailable && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="mx-3 mb-3 mt-auto inline-flex min-h-9 w-fit items-center gap-2 text-sm font-medium text-graphite hover:text-deepCharcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow"
        >
          <ArrowRight size={16} aria-hidden="true" />
          View
        </a>
      )}
    </figure>
  );
}
