import { Route, Routes, BrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  return (
    <>
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              theme: {
                primary: "#4aed88",
              },
            },
          }}
        ></Toaster>
      </div>
      {/* Wrap all your routes in BrowserRouter */}
      <BrowserRouter>
        {/* Under BrowserRouter list all your routes in Routes component */}
        <Routes>
          <Route path="/" element={<HomePage />} exact />
          <Route path="/editor/:roomId" element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
