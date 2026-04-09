import { DataProvider } from '@/contexts/DataContext';
import { fetchAttractions, fetchGroups } from '@/lib/data';

import NotesContainer from '@/components/note/NotesContainer';

export default async function NotesPage() {
  const [attractions, groups] = await Promise.all([fetchAttractions(), fetchGroups()]);

  return (
    <DataProvider attractions={attractions} groups={groups}>
      <NotesContainer />
    </DataProvider>
  );
}
