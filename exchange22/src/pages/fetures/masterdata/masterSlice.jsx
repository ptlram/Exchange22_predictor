import { createSlice } from "@reduxjs/toolkit";

const masterSlice = createSlice({
  name: "master",
  initialState: { category: "", format: "", team1: "", team2: "" },
  reducers: {
    setcategory: (state, action) => {
      state.category = action.payload;
    },
    setformat: (state, action) => {
      state.format = action.payload;
    },
    setteam1: (state, action) => {
      state.team1 = action.payload;
    },
    setteam2: (state, action) => {
      state.team2 = action.payload;
    },
  },
});

export const { setcategory, setformat, setteam1, setteam2 } =
  masterSlice.actions;
export default masterSlice.reducer;
