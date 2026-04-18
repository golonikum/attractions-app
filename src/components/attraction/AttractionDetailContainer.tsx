'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useData } from '@/contexts/DataContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useUpdateRequests } from '@/hooks/useUpdateRequests';
import { locateItemOnMainMapHref } from '@/lib/locateItemOnMainMapHref';
import { Attraction, CreateAttractionRequest } from '@/types/attraction';
import { Group } from '@/types/group';

import { AttractionInfoCard } from '@/components/attraction/AttractionInfoCard';
import { NewAttractionDialog } from '@/components/attraction/NewAttractionDialog';
import { BackButton, OpenInYandexMapButton, RemoveButton, ShowOnMapButton } from '@/components/ui/buttons';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingStub, NotFoundStub } from '@/components/ui/stubs';

export default function AttractionDetailContainer() {
  const params = useParams();
  const router = useRouter();
  const attractionId = params.id as string;

  const { groups, attractions, isAttractionsLoading, isGroupsLoading } = useData();
  const { isWideScreen } = useIsMobile();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteAttraction, updateAttraction } = useUpdateRequests();

  useEffect(() => {
    if (!isAttractionsLoading && attractions.length) {
      const foundAttraction = attractions.find((item) => item.id === attractionId);

      if (foundAttraction) {
        setAttraction(foundAttraction);
      }
    }
  }, [isAttractionsLoading, attractions]);

  useEffect(() => {
    if (!isGroupsLoading && attraction && groups.length) {
      const foundGroup = groups.find((item) => item.id === attraction.groupId);

      if (foundGroup) {
        setGroup(foundGroup);
      }
    }
  }, [isGroupsLoading, groups, attraction]);

  // Обработчик отправки формы редактирования достопримечательности
  const handleSubmit = async (formData: CreateAttractionRequest) => {
    const updatedAttraction = await updateAttraction(attractionId, formData);
    setAttraction(updatedAttraction);
  };

  // Обработчик удаления достопримечательности
  const handleDeleteAttraction = useCallback(async () => {
    try {
      await deleteAttraction(attractionId);
      toast.success('Объект успешно удален');

      if (group) {
        router.push(`/groups/${group?.id}`);
      } else {
        router.push('/groups');
      }
    } catch (error) {
      toast.error('Не удалось удалить объект');
    }
  }, [group, attractionId, router]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteAttraction();
    setIsDeleteDialogOpen(false);
  };

  if (isAttractionsLoading || isGroupsLoading) {
    return <LoadingStub />;
  }

  if (!attraction) {
    return <NotFoundStub message="Объект не найден" />;
  }

  return (
    <div className="container lg:max-w-full mx-auto pt-20 px-4 pb-8 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {group && <BackButton />}

        <div className="ml-auto flex space-x-1">
          {isWideScreen && (
            <>
              <ShowOnMapButton view="icon" href={locateItemOnMainMapHref(attraction)} />
              <OpenInYandexMapButton view="icon" attraction={attraction} />
            </>
          )}
          <NewAttractionDialog
            attraction={attraction}
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
          <RemoveButton onClick={handleDeleteClick} />
        </div>
      </div>

      <AttractionInfoCard attraction={attraction} group={group} />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить объект?"
        description="Вы уверены, что хотите удалить этот объект?"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />
    </div>
  );
}
