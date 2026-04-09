import { DataProvider } from '@/contexts/DataContext';
import { fetchAttractions, fetchGroups } from '@/lib/data';

import GalleryContainer from '@/components/gallery/GalleryContainer';

export default async function GalleryPage() {
  const [attractions, groups] = await Promise.all([fetchAttractions(), fetchGroups()]);

  return (
    <DataProvider attractions={attractions} groups={groups}>
      <GalleryContainer />
    </DataProvider>
  );
}
