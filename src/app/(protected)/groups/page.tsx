import { DataProvider } from '@/contexts/DataContext';
import { fetchAttractions, fetchGroups } from '@/lib/data';

import GroupsContainer from '@/components/group/GroupsContainer';

export default async function GroupsPage() {
  const [attractions, groups] = await Promise.all([fetchAttractions(), fetchGroups()]);

  return (
    <DataProvider attractions={attractions} groups={groups}>
      <GroupsContainer />
    </DataProvider>
  );
}
