import { DataProvider } from '@/contexts/DataContext';
import { fetchAttractions, fetchGroups } from '@/lib/data';

import GroupDetailContainer from '@/components/group/GroupDetailContainer';

export default async function GroupDetailPage() {
  const [attractions, groups] = await Promise.all([fetchAttractions(), fetchGroups()]);

  return (
    <DataProvider attractions={attractions} groups={groups}>
      <GroupDetailContainer />
    </DataProvider>
  );
}
