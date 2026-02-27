import { NoteWithAttractionIdType } from '@/types/attraction';

import { NotesTableRow } from './NotesTableRow';

type NotesTableProps = {
  notes: NoteWithAttractionIdType[];
};

export function NotesTable({ notes }: NotesTableProps) {
  return (
    <div className="hidden md:block overflow-x-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Изображение
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              style={{ minWidth: '200px' }}
            >
              Название
            </th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дата
            </th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Заметка
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {notes.map((note, index) => (
            <NotesTableRow key={index} note={note} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
