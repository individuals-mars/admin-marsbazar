import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "order",
  initialState: {
    list: [],
    selectedOrder: null,
  },
  reducers: {
    setOrders: (state, action) => {
      state.selectedOrder = action.payload;
    },
  },
});

export const { setOrders } = orderSlice.actions;
export default orderSlice.reducer;
