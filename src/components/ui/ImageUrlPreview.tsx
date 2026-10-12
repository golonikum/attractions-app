'use client';

import { useState } from 'react';
import { ImageIcon, ImageOff, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

type Status = 'loading' | 'loaded' | 'error';

const isHttpUrl = (value: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

/**
 * Миниатюра картинки по введённой ссылке — рядом с полем URL изображения.
 * Обычный <img>, а не next/image: ссылка может вести на любой хост, а next/image падает
 * на хостах, которых нет в images.remotePatterns (next.config.ts).
 */
export const ImageUrlPreview = ({ url, className }: { url?: string; className?: string }) => {
  const src = url?.trim() ?? '';
  const isValid = isHttpUrl(src);
  // Статус привязан к ссылке: при смене URL предыдущий результат не показываем
  const [state, setState] = useState<{ src: string; status: Status }>({ src: '', status: 'loading' });
  const status = state.src === src ? state.status : 'loading';

  const boxClassName = cn(
    'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted text-muted-foreground',
    className,
  );

  if (!isValid) {
    return (
      <div className={boxClassName} title="Укажите ссылку на изображение" data-testid="image-url-preview">
        <ImageIcon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(boxClassName, status === 'error' && 'border-destructive text-destructive')}
      title={status === 'error' ? 'Не удалось загрузить изображение' : 'Открыть изображение в новой вкладке'}
      data-testid="image-url-preview"
      data-status={status}
    >
      {status === 'loading' && <Loader2 className="absolute h-4 w-4 animate-spin" />}
      {status === 'error' ? (
        <ImageOff className="h-4 w-4" />
      ) : (
        <img
          key={src}
          src={src}
          alt="Превью изображения"
          referrerPolicy="no-referrer"
          className={cn('h-full w-full object-cover', status !== 'loaded' && 'invisible')}
          onLoad={() => setState({ src, status: 'loaded' })}
          onError={() => setState({ src, status: 'error' })}
        />
      )}
    </a>
  );
};
