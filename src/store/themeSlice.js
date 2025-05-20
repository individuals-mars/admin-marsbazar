import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    theme: "light",
    mode: "light",
}

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        setTheme(state, action) {
            state.theme = action.payload ? "light" : "dark";
        },
        setMode(state, action) {
            state.mode = action.payload;
        },
    },
});
export const { setTheme, setMode } = themeSlice.actions;
export const selectTheme = (state) => state.theme.theme;
export const selectMode = (state) => state.theme.mode;
export default themeSlice.reducer;
