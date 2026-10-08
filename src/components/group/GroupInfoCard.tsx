import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { useData } from '@/contexts/DataContext';
import { autoaddAttractions } from '@/services/attractionService';
import { Attraction } from '@/types/attraction';
import { Group } from '@/types/group';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from '@/components/ui/Tag';

interface GroupInfoCardProps {
  group: Group;
  attractions: Attraction[];
}

export function GroupInfoCard({ group, attractions }: GroupInfoCardProps) {
  const { setAttractions, reload } = useData();
  const [isAutoadding, setIsAutoadding] = useState(false);

  const handleAutoadd = async () => {
    setIsAutoadding(true);

    try {
      const { data } = await autoaddAttractions(group.id);

      if (data.attractions.length) {
        setAttractions((items) => [...items, ...data.attractions]);
        reload({ attractions: true });
        toast.success(`Добавлено объектов: ${data.attractions.length}. Проверьте описания`);
      } else {
        toast.info('Новых достопримечательностей не найдено');
      }
    } catch (error) {
      toast.error((isAxiosError(error) && error.response?.data?.error) || 'Не удалось найти достопримечательности');
    } finally {
      setIsAutoadding(false);
    }
  };

  return (
    <Card className="shrink-0">
      <CardHeader>
        <div className="flex gap-4 justify-between items-start">
          <CardTitle>
            {group.name}{' '}
            {!!attractions.length && <span className="font-normal text-gray-400">({attractions.length})</span>}
          </CardTitle>
          {group.tag && (
            <Link href={`/groups?tag=${group.tag?.replace(' ', '+')}`}>
              <Tag className="cursor-pointer" text={group.tag} variant="default" />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 items-start">
        <p>{group.description}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={handleAutoadd}
          disabled={isAutoadding}
          title="Найти и добавить достопримечательности, которых ещё нет в списке"
        >
          {isAutoadding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {isAutoadding ? 'Ищем достопримечательности…' : 'Автодобавление'}
        </Button>
      </CardContent>
    </Card>
  );
}
