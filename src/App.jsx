import { Route, Routes, BrowserRouter } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./App.css";
import NotFound from "./pages/notFound";

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/testthu" element={<NotFound/>} />
        </Routes>
    </BrowserRouter>
  );
}


export default App;
