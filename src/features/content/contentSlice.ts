import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface ContentItem {
  id: string;
  title: string;
  imagePath: string;
  pricingOption: string;
  price?: number;
  user?: {
    name?: string;
  };
}

interface State {
  allItems: ContentItem[];
  items: ContentItem[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  keyword: string;
  pricingFilters: string[];
}

const initialState: State = {
  allItems: [],
  items: [],
  page: 1,
  hasMore: true,
  loading: false,
  keyword: '',
  pricingFilters: [],
};

export const fetchContent = createAsyncThunk(
  'content/fetch',
  async () => {
    const res = await axios.get('https://closet-recruiting-api.azurewebsites.net/api/data');
    return res.data;
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setKeyword(state, action: PayloadAction<string>) {
      state.keyword = action.payload;
      state.page = 1;
      state.items = paginate(filterItems(state), 1);
    },
    setPricingFilters(state, action: PayloadAction<string[]>) {
      state.pricingFilters = action.payload;
      state.page = 1;
      state.items = paginate(filterItems(state), 1);
    },
    resetFilters(state) {
      state.keyword = '';
      state.pricingFilters = [];
      state.page = 1;
      state.items = paginate(state.allItems, 1);
    },
    loadMore(state) {
      const filtered = filterItems(state);
      const nextPage = state.page + 1;
      const newItems = paginate(filtered, nextPage);
      state.items = [...state.items, ...newItems];
      state.page = nextPage;
      state.hasMore = newItems.length > 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchContent.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchContent.fulfilled, (state, action) => {
      state.allItems = action.payload;
      state.items = paginate(action.payload, 1);
      state.hasMore = true;
      state.loading = false;
    });
  },
});

function filterItems(state: State): ContentItem[] {
  return state.allItems.filter((item) => {
    const keywordMatch =
      state.keyword === '' ||
      item.title.toLowerCase().includes(state.keyword.toLowerCase())
    const pricingMatch =
      state.pricingFilters.length === 0 ||
      state.pricingFilters.includes(item.pricingOption);
    return keywordMatch && pricingMatch;
  });
}

function paginate(items: ContentItem[], page: number, pageSize = 20): ContentItem[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export const { setKeyword, setPricingFilters, resetFilters, loadMore } = contentSlice.actions;
export default contentSlice.reducer;