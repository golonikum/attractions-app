import { useRouter } from 'next/navigation';

import { useData } from '@/contexts/DataContext';
import { NoteWithAttractionIdType } from '@/types/attraction';

import { AttractionImage } from '../attraction/AttractionImage';
import { Tag } from '../ui/Tag';

export type NotesTableRowProps = {
  note: NoteWithAttractionIdType;
};

export const NotesTableRow = ({ note }: NotesTableRowProps) => {
  const router = useRouter();
  const { attractions, groups } = useData();

  const handleClick = () => {
    router.push(`/attractions/${note.attractionId}`);
  };

  const attraction = attractions.find((item) => item.id === note.attractionId);

  if (!attraction) {
    return null;
  }

  const group = groups.find((item) => item.id === attraction.groupId);

  return (
    <tr className={attraction.isVisited ? 'bg-green-50' : ''} onClick={handleClick}>
      <td className="px-4 py-2  whitespace-nowrap cursor-pointer">
        <AttractionImage attraction={attraction} className="h-24 w-24 rounded-md" />
      </td>
      <td className="px-4 py-2  cursor-pointer">
        <div className="text-sm font-medium text-gray-900">
          {attraction.name} ({group?.name})
        </div>
        {attraction.category && <Tag text={attraction.category} />}
      </td>
      <td className="px-4 py-2  cursor-pointer">
        <div className="text-sm text-gray-900 line-clamp-4">{note.date}</div>
      </td>
      <td className="px-4 py-2  cursor-pointer">
        <div className="text-sm text-gray-900 line-clamp-4">{note.note}</div>
      </td>
    </tr>
  );
};
