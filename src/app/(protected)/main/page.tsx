import { DataProvider } from '@/contexts/DataContext';
import { fetchAttractions } from '@/lib/data';

import MainContainer from '@/components/main/MainContainer';

export default async function MainPage() {
  const attractions = await fetchAttractions();

  return (
    <DataProvider attractions={attractions} groups={[]}>
      <MainContainer />
    </DataProvider>
  );
}
