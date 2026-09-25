import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { DEFAULT_COORDINATES } from '@/lib/constants';
import { autofillGroup } from '@/services/groupService';
import { CreateGroupRequest, Group } from '@/types/group';

import { Button } from '../ui/button';
import { AddButton, CancelFormButton, EditButton, SubmitFormButton } from '../ui/buttons';
import { CoordinatesInput } from '../ui/CoordinatesInput';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

const initialGroupFormState: CreateGroupRequest = {
  name: '',
  description: '',
  tag: '',
  coordinates: DEFAULT_COORDINATES,
  zoom: 10,
};

export const NewGroupDialog = ({
  isOpen,
  setIsOpen,
  handleSubmit,
  isSubmitting,
  setIsSubmitting,
  groupData,
  selectedTag = '',
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleSubmit: (formUserData: CreateGroupRequest) => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  groupData?: Group;
  selectedTag?: string;
}) => {
  const [formUserData, setFormUserData] = useState<CreateGroupRequest>({} as CreateGroupRequest);

  /* Паттерн User Interaction State (состояние взаимодействия) */
  const formData = {
    ...initialGroupFormState,
    tag: selectedTag,
    ...groupData,
    ...formUserData,
  };

  const [isAutofilling, setIsAutofilling] = useState(false);

  const handleAutofill = async () => {
    setIsAutofilling(true);

    try {
      const { data } = await autofillGroup(formData.name);
      setFormUserData({ ...formUserData, ...data.autofill });
      toast.success('Поля заполнены — проверьте данные');
    } catch (error) {
      toast.error('Не удалось получить данные о населённом пункте');
    } finally {
      setIsAutofilling(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await handleSubmit(formData);
      toast.success(`Группа успешно ${groupData ? 'обновлена' : 'создана'}`);
      setIsOpen(false);
    } catch (error) {
      toast.error(`Не удалось ${groupData ? 'обновить' : 'создать'} группу`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{groupData ? <EditButton /> : <AddButton title="Добавить новую группу" />}</DialogTrigger>
      {isOpen && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{groupData ? 'Изменить группу' : 'Создать новую группу'}</DialogTitle>
            <DialogDescription>
              {groupData ? 'Измените информацию о группе' : 'Создайте новую группу для организации ваших объектов'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormUserData({ ...formUserData, name: e.target.value })}
                  required
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAutofill}
                  disabled={!formData.name.trim() || isAutofilling}
                  title="Заполнить поля с помощью ИИ"
                >
                  {isAutofilling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Автозаполнение
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormUserData({ ...formUserData, description: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag">Регион (необязательно)</Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e) => setFormUserData({ ...formUserData, tag: e.target.value })}
              />
            </div>
            <CoordinatesInput
              key={formData.coordinates.join(',')}
              value={formData.coordinates}
              onChange={(coordinates) => setFormUserData({ ...formUserData, coordinates })}
              required
            />
            <div className="space-y-2">
              <Label htmlFor="zoom">Масштаб карты</Label>
              <Input
                id="zoom"
                type="number"
                value={formData.zoom}
                onChange={(e) =>
                  setFormUserData({
                    ...formUserData,
                    zoom: parseInt(e.target.value),
                  })
                }
                min="1"
                max="20"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <CancelFormButton onClick={() => setIsOpen(false)} />
              <SubmitFormButton isSubmitting={isSubmitting} id={groupData?.id} />
            </div>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
};
