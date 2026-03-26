'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { importAttractionsFor } from '@/services/importService';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ImportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState('');

  const onRunClick = async () => {
    setIsLoading(true);

    try {
      const returnData = await importAttractionsFor();
      setData(JSON.stringify(returnData));
    } catch (error) {
      toast.error('Не удалось загрузить данные');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container lg:max-w-full mx-auto pt-20 px-4 pb-8 flex flex-col gap-4">
      <Card>
        <Button onClick={onRunClick}>Импортировать</Button>
        {isLoading}
        <pre>{data}</pre>
      </Card>
    </div>
  );
}
