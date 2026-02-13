import { useState } from "react";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Calendar } from "lucide-react";
import { NoteType } from "@/types/attraction";
import { AddButton, RemoveButton } from "./buttons";

interface NotesManagerProps {
  notes: NoteType[];
  onChange: (notes: NoteType[]) => void;
}

export function NotesManager({ notes, onChange }: NotesManagerProps) {
  const [newNote, setNewNote] = useState<NoteType>({
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    note: "",
  });

  const addNote = () => {
    if (newNote.note.trim()) {
      onChange([...notes, newNote]);
      setNewNote({
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
    }
  };

  const removeNote = (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    onChange(updatedNotes);
  };

  const updateNote = (index: number, field: keyof NoteType, value: string) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = { ...updatedNotes[index], [field]: value };
    onChange(updatedNotes);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {notes.length === 0 && (
          <p className="text-sm text-gray-500">Нет заметок</p>
        )}
        {notes.map((note, index) => (
          <div
            key={index}
            className="flex items-start space-x-2 p-3 border rounded-md"
          >
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={note.date}
                  onChange={(e) => updateNote(index, "date", e.target.value)}
                  className="h-8"
                />
              </div>
              <Textarea
                value={note.note}
                onChange={(e) => updateNote(index, "note", e.target.value)}
                placeholder="Текст заметки"
                rows={2}
                className="col-span-1 md:col-span-1"
              />
            </div>
            <RemoveButton onClick={() => removeNote(index)} />
          </div>
        ))}
      </div>

      <div className="flex items-start space-x-2 p-3 border rounded-md bg-gray-50">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Input
              type="date"
              value={newNote.date}
              onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
              className="h-8"
            />
          </div>
          <Textarea
            value={newNote.note}
            onChange={(e) => setNewNote({ ...newNote, note: e.target.value })}
            placeholder="Текст заметки"
            rows={2}
            className="col-span-1 md:col-span-1"
          />
        </div>
        <AddButton title="Добавить заметку" onClick={addNote} view="note" />
      </div>
    </div>
  );
}
