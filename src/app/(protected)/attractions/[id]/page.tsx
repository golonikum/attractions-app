import { DataProvider } from '@/contexts/DataContext';
import { fetchGroups } from '@/lib/data';

import AttractionDetailContainer from '@/components/attraction/AttractionDetailContainer';

export default async function AttractionDetailPage() {
  const groups = await fetchGroups();

  return (
    <DataProvider attractions={[]} groups={groups}>
      <AttractionDetailContainer />
    </DataProvider>
  );
}
