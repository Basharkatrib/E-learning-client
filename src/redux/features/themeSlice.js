import { createSlice } from '@reduxjs/toolkit'

const initialState = 'light'

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => (state === 'light' ? 'dark' : 'light'),
    setTheme: (_, action) => action.payload,
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export const selectTheme = (state) => state.theme
export default themeSlice.reducer
