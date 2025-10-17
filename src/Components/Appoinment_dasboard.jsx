// We'll enhance the component with:
// - A sidebar with navigation tabs (Calendar, Table, Kanban, Analysis)
// - An Analysis tab for recurring customers, most booked services, and growth summary
// - Move current view toggles into sidebar and make Export/Report buttons functional with charts

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  FaCalendarAlt, FaTable, FaChartPie, FaUserClock,
  FaUserCheck, FaUserTimes, FaCalendarTimes, FaMoneyBillWave
} from "react-icons/fa";
import { BsKanban, BsThreeDotsVertical } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TABS = [
  { id: 'calendar', label: 'Calendar View', icon: <FaCalendarAlt /> },
  { id: 'table', label: 'Table View', icon: <FaTable /> },
  { id: 'kanban', label: 'Kanban View', icon: <BsKanban /> },
  { id: 'analysis', label: 'Analysis', icon: <FaChartPie /> },
];

const renderEventContent = (eventInfo) => (
  <div className="text-xs font-medium">
    <div>{eventInfo.event.title}</div>
    <div className="text-gray-500 text-[10px]">{eventInfo.timeText}</div>
  </div>
);

const AppointmentsDashboard = () => {
  const axios = useAxiosPublic();
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "attended": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-yellow-100 text-yellow-800";
      case "no_show": return "bg-red-100 text-red-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  useEffect(() => {
    axios.get("/appointments").then((res) => setAppointments(res.data));
  }, []);

  const recurringCustomers = appointments.reduce((acc, a) => {
    acc[a.customerName] = (acc[a.customerName] || 0) + 1;
    return acc;
  }, {});

  const mostBookedServices = appointments.flatMap((a) => a.serviceNames || []).reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const handleStatusUpdate = async (id, newStatus) => {
  try {
    const res = await axios.patch('/appointments/status', { id, status: newStatus });
    
    // Update local state
    setAppointments(prev => prev.map(appt =>
      appt._id === id ? { ...appt, status: newStatus } : appt
    ));

    if (selectedAppt?._id === id) {
      setSelectedAppt(prev => ({ ...prev, status: newStatus }));
    }

    alert(`Status updated to ${newStatus}`);
  } catch (err) {
    console.error('Error updating status:', err);
    alert('Failed to update status');
  }
};


  const growthSummary = (() => {
    const monthly = {};
    appointments.forEach((a) => {
      const m = new Date(a.appointmentDate).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthly[m] = (monthly[m] || 0) + 1;
    });
    return monthly;
  })();

  const metrics = {
    scheduled: appointments.length,
    attended: appointments.filter((a) => a.status === "attended").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    noShow: appointments.filter((a) => a.status === "no_show").length,
  };
  const groupedByDate = appointments.reduce((acc, appt) => {
  const dateKey = new Date(appt.appointmentDate).toISOString().split('T')[0];
  if (!acc[dateKey]) acc[dateKey] = [];
  acc[dateKey].push(appt);
  return acc;
}, {});

const sortedDates = Object.keys(groupedByDate).sort(
  (a, b) => new Date(a) - new Date(b)
);


  const exportData = () => {
    const data = JSON.stringify(appointments, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'appointments.json';
    link.click();
  };

  const generateReport = () => {
    alert("Report generated! (Mock)");
  };

  const Sidebar = () => (
    <div className="w-full md:w-60 bg-white shadow-lg border-r h-full p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 p-2 w-full rounded-lg text-left ${
            activeTab === tab.id ? "bg-indigo-100 text-indigo-700 font-semibold" : "hover:bg-gray-100"
          }`}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );

  const AnalysisView = () => (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h2>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {["scheduled", "attended", "cancelled", "noShow"].map((key) => (
          <div key={key} className={`p-5 rounded-xl shadow-sm ${getStatusColor(key)}`}>
            <div className="text-sm font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
            <div className="text-2xl font-bold mt-1">{metrics[key]}</div>
            <div className="text-xs text-gray-500 mt-2">vs previous period</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Popular Services</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={Object.entries(mostBookedServices).map(([name, value]) => ({ name, value }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Monthly Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={Object.entries(growthSummary).map(([name, value]) => ({ name, value }))}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Top Customers</h3>
          <ul className="divide-y divide-gray-200">
            {Object.entries(recurringCustomers).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => (
              <li key={name} className="py-2 flex justify-between">
                <span className="font-medium text-gray-700 truncate">{name}</span>
                <span className="text-gray-500">{count}x</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={exportData} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          Export Data
        </button>
        <button onClick={generateReport} className="ml-3 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700">
          Generate Report
        </button>
      </div>
    </div>
  );

  // ... (rest of your component remains unchanged, insert AnalysisView usage as before)

   return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-gray-50">
        {activeTab === 'calendar' && <div className="p-4">{/* Calendar View Here */}
          <div className="w-full bg-white p-4 rounded-xl shadow-md">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridDay"
scrollTime={new Date().toTimeString().slice(0, 5)} // scroll to current time

              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={appointments.map((appt) => ({
                title: appt.customerName,
                start: `${new Date(appt.appointmentDate).toISOString().split("T")[0]}T${appt.appointmentTime}`,
                extendedProps: {
                  services: appt.serviceNames,
                  price: appt.totalPrice,
                  id: appt._id,
                  status: appt.status,
                },
                color: appt.status === 'attended' ? '#10B981' : 
                      appt.status === 'cancelled' ? '#F59E0B' : 
                      appt.status === 'no_show' ? '#EF4444' : '#3B82F6',
              }))}
              eventContent={renderEventContent}
              dateClick={(info) => setSelectedDate(info.date)}
              eventClick={(info) => {
                const id = info.event.extendedProps.id;
                const found = appointments.find((appt) => appt._id === id);
                setSelectedAppt(found);
                setShowModal(true);
              }}
              height="auto"
              eventBorderColor="transparent"
              eventDisplay="block"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }}
            />
            {showModal && selectedAppt && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Appointment Details</h2>
                    <button 
                      onClick={() => setShowModal(false)} 
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <IoMdClose size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center">
                      <span className="w-24 text-gray-600">Name:</span>
                      <span className="font-medium">{selectedAppt.customerName}</span>
                    </div>
                    <div className="flex items-center">
  <span className="w-24 text-gray-600">Phone:</span>
  <span>{selectedAppt.customerPhone}</span>
</div>
<div className="flex items-center">
  <span className="w-24 text-gray-600">Email:</span>
  <span>{selectedAppt.customerEmail}</span>
</div>


                    <div className="flex items-center">
                      <span className="w-24 text-gray-600">Date:</span>
                      <span>{new Date(selectedAppt.appointmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-gray-600">Time:</span>
                      <span>{selectedAppt.appointmentTime}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedAppt.status)}`}>
                        {selectedAppt.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-24 text-gray-600">Services:</span>
                      <span className="flex-1">{selectedAppt.serviceNames?.join(", ")}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-gray-600">Total:</span>
                      <span className="font-bold text-green-600">{selectedAppt.totalPrice} kr</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <button 
                      onClick={() => handleStatusUpdate(selectedAppt._id, "attended")} 
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Attended
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedAppt._id, "cancelled")} 
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancelled
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedAppt._id, "no_show")} 
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      No Show
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>}
        {activeTab === 'table' && <div className="p-4">{/* Table View Here */}
          <div className="overflow-x-auto h-full bg-white rounded-xl shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                          {appt.customerName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{appt.customerName}</div>
                          <div className="text-sm text-gray-500">{appt.customerPhone}</div>
                          <div className="text-sm text-gray-500">{appt.customerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(appt.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{appt.appointmentTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {appt.serviceNames?.join(", ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {appt.totalPrice} kr
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appt.status)}`}>
                        {appt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleStatusUpdate(appt._id, "attended")} 
                          className="text-green-600 hover:text-green-900"
                          title="Mark as Attended"
                        >
                          <FaUserCheck />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(appt._id, "cancelled")} 
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Mark as Cancelled"
                        >
                          <FaUserTimes />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(appt._id, "no_show")} 
                          className="text-red-600 hover:text-red-900"
                          title="Mark as No Show"
                        >
                          <FaCalendarTimes />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>}
        {activeTab === 'kanban' && <div className="p-4">
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]">
            {sortedDates.map((date) => (
              <div key={date} className="min-w-[300px] flex-shrink-0 bg-white rounded-xl shadow p-4">
                <div className="sticky top-0 bg-white pb-2 z-10">
                  <h2 className="text-lg font-semibold text-gray-700">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h2>
                  <p className="text-xs text-gray-500 mb-2">
                    {groupedByDate[date].length} appointment{groupedByDate[date].length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="space-y-3">
                  {groupedByDate[date].map((appt) => (
                    <div key={appt._id} className="p-3 border border-gray-200 rounded-lg shadow-xs hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{appt.customerName}</p>
                          <p className="font-medium text-gray-800">{appt.customerPhone}</p>
                           <p className="font-medium text-gray-800">{appt.customerEmail}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">{appt.appointmentTime}</span> • {appt.serviceNames?.join(", ")}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appt.status)}`}>
                            {appt.status.replace('_', ' ')}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <BsThreeDotsVertical />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <span className="text-sm font-semibold text-green-600">{appt.totalPrice} kr</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleStatusUpdate(appt._id, "attended")} 
                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg transition-colors"
                            title="Attended"
                          >
                            <FaUserCheck size={12} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(appt._id, "cancelled")} 
                            className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-lg transition-colors"
                            title="Cancelled"
                          >
                            <FaUserTimes size={12} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(appt._id, "no_show")} 
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg transition-colors"
                            title="No Show"
                          >
                            <FaCalendarTimes size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>}
        {activeTab === 'analysis' && <AnalysisView />}
      </div>
    </div>
  );
};

export default AppointmentsDashboard;
