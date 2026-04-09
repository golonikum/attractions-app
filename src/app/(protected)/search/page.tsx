import { DataProvider } from '@/contexts/DataContext';
import { fetchAttractions } from '@/lib/data';

import SearchContainer from '@/components/search/SearchContainer';

export default async function SearchPage() {
  const attractions = await fetchAttractions();

  return (
    <DataProvider attractions={attractions} groups={[]}>
      <SearchContainer />
    </DataProvider>
  );
}
