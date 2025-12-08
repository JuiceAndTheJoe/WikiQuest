import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import persistenceMiddleware from "./middleware/persistenceMiddleware";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      persistenceMiddleware,
    ),
});
