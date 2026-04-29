import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

import { useData } from '@/contexts/DataContext';
import { DEFAULT_COORDINATES } from '@/lib/constants';
import { Attraction, CreateAttractionRequest } from '@/types/attraction';

import { AddButton, CancelFormButton, EditButton, SubmitFormButton } from '../ui/buttons';
import { CoordinatesInput } from '../ui/CoordinatesInput';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MultiSelect } from '../ui/MultiSelect';
import { NotesManager } from '../ui/NotesManager';
import { Textarea } from '../ui/textarea';

interface NewAttractionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleSubmit?: (formData: CreateAttractionRequest) => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  groupId?: string;
  attraction?: Attraction;
  attractionsCount?: number;
}

const getInitialAttractionFormState = (groupId?: string, attractionsCount = 0) => ({
  groupId: groupId || '',
  name: '',
  category: '',
  description: '',
  imageUrl: '',
  yaMapUrl: '',
  isVisited: false,
  isFavorite: false,
  coordinates: DEFAULT_COORDINATES,
  order: attractionsCount + 1,
  notes: [],
});

export const NewAttractionDialog = ({
  isOpen,
  setIsOpen,
  handleSubmit,
  isSubmitting,
  setIsSubmitting,
  groupId,
  attraction,
  attractionsCount = 0,
}: NewAttractionDialogProps) => {
  const [formUserData, setFormUserData] = useState<CreateAttractionRequest>({} as CreateAttractionRequest);
  const { groups } = useData();

  /* Паттерн User Interaction State (состояние взаимодействия) */
  const formData = {
    ...getInitialAttractionFormState(groupId, attractionsCount),
    ...attraction,
    ...formUserData,
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await handleSubmit?.(formData);
      toast.success(`Объект успешно ${attraction ? 'обновлен' : 'создан'}`);
      setIsOpen(false);
    } catch (error) {
      toast.error(`Не удалось ${attraction ? 'обновить' : 'создать'} объект`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{attraction ? <EditButton /> : <AddButton title="Добавить новый объект" />}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{attraction ? 'Редактировать объект' : 'Добавить объект'}</DialogTitle>
          <DialogDescription>
            {attraction ? 'Измените информацию об объекте' : 'Заполните информацию о новом объекте'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Город</Label>
              <MultiSelect
                isMulti={false}
                onSelectionChange={(value) => {
                  const newId = groups.find(({ name }) => name === value[0])?.id;

                  if (newId) {
                    setFormUserData((val) => ({ ...val, groupId: newId }));
                  }
                }}
                options={groups.map(({ name }) => name)}
                selectedOptions={[groups.find(({ id }) => id === formData.groupId)?.name!]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormUserData({ ...formUserData, name: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Категория (необязательно)</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormUserData({ ...formUserData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL изображения</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormUserData({ ...formUserData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yaMapUrl">URL Яндекс.Карты</Label>
              <Input
                id="yaMapUrl"
                type="url"
                value={formData.yaMapUrl}
                onChange={(e) => setFormUserData({ ...formUserData, yaMapUrl: e.target.value })}
                placeholder="https://yandex.ru/maps/-/CDgBC~cD"
              />
            </div>
            <CoordinatesInput
              value={formData.coordinates}
              onChange={(coordinates) => setFormUserData({ ...formUserData, coordinates })}
              required
            />
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 w-fit">
                <Label htmlFor="order">Порядок</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order || 1}
                  onChange={(e) =>
                    setFormUserData({
                      ...formUserData,
                      order: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-20"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormUserData({ ...formUserData, isVisited: !formData.isVisited })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    formData.isVisited ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isVisited ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <Label>Посещено</Label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormUserData({
                      ...formUserData,
                      isFavorite: !formData.isFavorite,
                    })
                  }
                  className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                >
                  <Star
                    className={`h-5 w-5 ${formData.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                  />
                </button>
                <Label>Избранное</Label>
              </div>
            </div>
            <div className="flex items-center gap-4"></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormUserData({ ...formUserData, description: e.target.value })}
              placeholder="Добавьте описание объекта..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Заметки</Label>
            <NotesManager
              notes={formData.notes || []}
              onChange={(notes) => setFormUserData({ ...formUserData, notes })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <CancelFormButton onClick={() => setIsOpen(false)} />
            <SubmitFormButton isSubmitting={isSubmitting} id={attraction?.id} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
