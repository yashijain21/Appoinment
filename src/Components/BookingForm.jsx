import { useEffect, useState } from "react";
import {
  Sofa,
  Car,
  Wrench,
  Sailboat,
  Paintbrush,
  DoorOpen,
  Building
} from "lucide-react";


import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPublic from "../hooks/useAxiosPublic";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingForm = () => {
  const axios = useAxiosPublic();
  const navigate = useNavigate();
  const location = useLocation();
const categoryIcons = {
  "Mobil tjänster":DoorOpen,
  "Möbelrengöring": Sofa,
  "Biltvättstjänster": Car,
  "Rekonditionering": Wrench,
  "Husbil & Båt": Sailboat,
  "Lackreparation & Små Bucklor": Paintbrush,
  "Företagstjänster":Building,
};

  const [allCategories, setAllCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  
  const [selectedParentId, setSelectedParentId] = useState("");

  const [allServices, setAllServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState(null);

  const [bookedTimes, setBookedTimes] = useState([]);

  const totalPrice = selectedServices.reduce((acc, item) => acc + item.price, 0);

  // Fetch categories and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, serviceRes] = await Promise.all([
          axios.get("/categories"),
          axios.get("/services"),
        ]);

        setAllCategories(catRes.data);
        setAllServices(serviceRes.data);
        const parentCats = catRes.data.filter((cat) => !cat.parent);
        setParentCategories(parentCats);

        // If coming from category page with pre-selected service
        if (location.state?.selectedService) {
          const svc = location.state.selectedService;
          const fullService = serviceRes.data.find((s) => s._id === svc._id);
          if (fullService) {
            setSelectedParentId(fullService.category);
            setSelectedServices([fullService]);
            const filtered = serviceRes.data.filter(
              (s) => s.category === fullService.category
            );
            setFilteredServices(filtered);
            setStep(2);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [location.state, axios]);

  // Filter services based on selected parent category
  useEffect(() => {
    if (selectedParentId) {
      const subcategoryIds = allCategories
        .filter((cat) => cat.parent === selectedParentId)
        .map((cat) => cat._id);
const services = allServices.filter(
  (svc) =>
    subcategoryIds.includes(svc.category) || svc.category === selectedParentId
);


      setFilteredServices(services);
    }
  }, [selectedParentId, allCategories, allServices]);

  // Fetch booked times
  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (!date) return;
      const selectedDate = date.toISOString().split("T")[0];
      try {
        const res = await axios.get(`/appointments?date=${selectedDate}`);
        const times = res.data.map((appt) =>
          new Date(`${selectedDate}T${appt.appointmentTime}`)
        );
        setBookedTimes(times);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }
    };
    fetchBookedTimes();
  }, [date]);

  const handleServiceToggle = (service) => {
    const exists = selectedServices.find((s) => s._id === service._id);
    if (exists) {
      setSelectedServices((prev) => prev.filter((s) => s._id !== service._id));
    } else {
      setSelectedServices((prev) => [...prev, service]);
    }
  };

  const removeService = (serviceId) => {
    setSelectedServices((prev) => prev.filter((s) => s._id !== serviceId));
  };

  const handleSubmit = async () => {
    const payload = {
      services: selectedServices.map((s) => s._id),
      totalPrice,
      appointmentDate: date.toISOString().split("T")[0],
      appointmentTime: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
    };

    try {
      const response = await axios.post("/appointments", payload);
      console.log("Appointment booked:", response.data);
      navigate("/thank-you");
    } catch (err) {
      console.error("Error booking appointment:", err);
      alert("Error booking appointment.");
    }
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return !!selectedParentId;
      case 2:
        return selectedServices.length > 0;
      case 3:
        return name && phone && address && email && date;
      default:
        return true;
    }
  };

  const steps = [
    { id: 1, },
    { id: 2,},
    { id: 3, },
    { id: 4,  },
  ];

  return (
    <div className=" max-w-4xl mx-auto p-4 border-secondary m-7 rounded-xl shadow-lg border ">
     

      {/* Step Content */}
      <div className="bg-white rounded-lg  p-6 space-y-6">
        {/* Step 1 */}
       {step === 1 && (
  <>
    <h2 className="text-2xl text-center font-semibold text-gray-800 mb-2">Step 1</h2>
      <div className=" flex gap-2 ">
                <div
                className={` h-1 w-[25%] bg-primary rounded-xl
                }`}
              />
              <div
                className={` h-1 w-[25%] bg-gray-300 rounded-xl
                }`}
              />
              <div
                className={` h-1 w-[25%]  bg-gray-300 rounded-xl
                }`}
              />
              <div
                className={` h-1 w-[25%]  bg-gray-300 rounded-xl
                }`}
              />
              </div> 
    <p className="text-lg text-gray-600 mb-6">Select required service</p>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      {parentCategories.map((cat) => {
        const Icon = categoryIcons[cat.name]; // get icon based on name

        return (
          <div
            key={cat._id}
            onClick={() => setSelectedParentId(cat._id)}
            className={`cursor-pointer flex flex-col items-center p-4 rounded-xl border transition-all duration-200 ${
              selectedParentId === cat._id
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-gray-300 hover:shadow-md text-gray-700"
            }`}
          >
            <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full mb-3">
              {Icon ? <Icon className="w-6 h-6" /> : <span className="text-sm">Icon</span>}
            </div>
            <span className="text-center text-sm font-medium">{cat.name}</span>
          </div>
        );
      })}
    </div>

  </>
)}


        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">Step 2</h2>
                    <div className=" flex gap-2 ">
                <div
                className={` h-1 w-[25%] bg-primary rounded-xl
                }`}
              />
              <div
                className={` h-1 w-[25%] bg-primary rounded-xl
                }`}
              />
              <div
                className={` h-1 w-[25%]  bg-gray-300 rounded-xl
                }`}
              />
              <div
                className={` h-1 w-[25%]  bg-gray-300 rounded-xl
                }`}
              />
              </div>
               <p className="text-lg text-gray-600 mt-6 mb-6">Select required service</p>
            {filteredServices?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {filteredServices.map((service) => {
                  const isSelected = selectedServices.some((s) => s._id === service._id);
                  return (
                    <label
                      key={service._id}
                      className={`border rounded-lg p-4 flex flex-col gap-2 cursor-pointer transition ${
                        isSelected ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleServiceToggle(service)}
                          className="mr-2"
                        />
                        <span className="font-medium text-lg">{service.name}</span>
                      </div>
                      <p className="text-sm text-gray-500">{service.description}</p>
                      <div className="text-right text-sm text-gray-700 font-semibold">
                        {service.price} kr
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 mt-4">No services available in this category.</p>
            )}

            <div className="flex justify-end items-center mt-6">
              <span className="text-lg font-semibold text-blue-600">
                Total: {totalPrice} kr
              </span>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold text-center text-gray-700">Step 3</h2>
            <div className=" flex gap-2 ">
                <div
                className={` h-1 w-[25%] bg-primary rounded-xl
                }`}
              />
              <div
                className={` h-1 w-[25%] bg-primary rounded-xl
                }`}
              />
              <div
                className={` h-1 w-[25%]  bg-primary rounded-xl
                }`}
              />
              <div
                className={` h-1 w-[25%]  bg-gray-300 rounded-xl
                }`}
              />
              </div>
              <p className="text-lg text-gray-600 mt-6 mb-6">Enter your information </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name" className="border p-3 rounded-md" value={name} onChange={(e) => setName(e.target.value)} />
              <input type="tel" placeholder="Phone Number" className="border p-3 rounded-md" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input type="email" placeholder="Email Address" className="border p-3 rounded-md" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="text" placeholder="Full Address" className="border p-3 rounded-md " value={address} onChange={(e) => setAddress(e.target.value)} />
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                showTimeSelect
                timeIntervals={30}
                dateFormat="PPPPp"
                minDate={new Date()}
                placeholderText="Choose date & time"
                className="border p-3 rounded-md w-full md:col-span-2"
                excludeTimes={bookedTimes}
              />
            </div>
          </>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <>
            <h2 className="text-xl font-semibold text-center text-gray-700">Step 4</h2>
             <div className=" flex gap-2 ">
                <div
                className={` h-1 w-[25%] bg-primary rounded-xl
                }`}
              />
              <div
                className={` h-1 w-[25%] bg-primary rounded-xl
                }`}
              />
              <div
                className={` h-1 w-[25%]  bg-primary rounded-xl
                }`}
              />
              <div
                className={` h-1 w-[25%]  bg-primary rounded-xl
                }`}
              />
              </div>
              <p className="text-lg text-gray-600 mt-6 mb-6">Review & Confirmation </p>
            <div className="text-sm space-y-2">
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Phone:</strong> {phone}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Address:</strong> {address}</p>
              <p><strong>Date:</strong> {date?.toLocaleString()}</p>
              <p className="font-semibold">Selected Services:</p>
              <ul className="list-disc list-inside space-y-1">
                {selectedServices.map((s) => (
                  <li key={s._id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-sm text-gray-500">{s.description}</div>
                      </div>
                      <div className="text-right font-semibold">{s.price} kr</div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-right text-secondary font-bold">Total: {totalPrice} kr</p>
            </div>
          </>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-between">
        {step > 1 && (
          <button
            onClick={prevStep}
            className="bg-gray-300 hover:bg-primary text-gray-800 hover:text-white px-4 py-2 rounded"
          >
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={nextStep}
            className="bg-secondary hover:bg-primary text-white px-6 py-2 rounded ml-auto"
            disabled={!validateStep(step)}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="bg-primary text-white px-6 py-2 rounded ml-auto"
          >
            Confirm Booking
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
