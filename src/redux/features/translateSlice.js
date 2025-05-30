import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    language: "en",
};

const translateSlice = createSlice({
    name: "translate",
    initialState,
    reducers: {
        toggleLanguage: (state) => {
            state.language = state.language === "en" ? "ar" : "en";
        },
    }
});

export const { toggleLanguage, setTranslate } = translateSlice.actions;
export const selectTranslate = (state) => state.translate.language;
export default translateSlice.reducer;
