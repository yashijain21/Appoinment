import { Routes, Route } from "react-router-dom";
import BookingForm from "./Components/BookingForm.jsx";
import AppointmentsDashboard from "./Components/Appoinment_dasboard.jsx";
import Login from "./Components/Login.jsx"
import UserDashboard from "./Components/User_dashboard.jsx"
function App() {
  return (
    <Routes>
      <Route path="/" element={<BookingForm />} />
      <Route path="/login" element={<Login/>}/>
      <Route path="/dashboard" element={<UserDashboard/>}/>
      <Route path="/admindashboard" element={<AppointmentsDashboard />} />
    </Routes>
  );
}

export default App;
