import { NoteWithAttractionIdType } from '@/types/attraction';

import { Table } from '../ui/table';

import { NOTES_TABLE_COLUMNS, NotesTableRow } from './NotesTableRow';

type NotesTableProps = {
  notes: NoteWithAttractionIdType[];
};

export function NotesTable({ notes }: NotesTableProps) {
  return (
    <Table columns={NOTES_TABLE_COLUMNS}>
      {notes.map((note, index) => (
        <NotesTableRow key={index} note={note} />
      ))}
    </Table>
  );
}
