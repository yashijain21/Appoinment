import { Routes, Route } from "react-router-dom";
import BookingForm from "./Components/BookingForm.jsx";
import AppointmentsDashboard from "./Components/Appoinment_dasboard.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<BookingForm />} />
      <Route path="/dashboard" element={<AppointmentsDashboard />} />
    </Routes>
  );
}

export default App;
