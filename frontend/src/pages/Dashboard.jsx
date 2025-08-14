
import { useState, useEffect } from "react";
import api from "../api/axiosConfig";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    image: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/events");
      setEvents(res.data.events);
    } catch (err) {
      console.error(err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // const handleChange = (e) => {
  //   if (e.target.name === "image") {
  //     const file = e.target.files[0];
  //     setForm({ ...form, image: file });
  //     if (file) {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         setImagePreview(reader.result);
  //       };
  //       reader.readAsDataURL(file);
  //     } else {
  //       setImagePreview(null);
  //     }
  //   } else {
  //     setForm({ ...form, [e.target.name]: e.target.value });
  //   }
  // };

//   const handleChange = (e) => {
//   if (e.target.name === "image") {
//     const file = e.target.files[0];
//     if (file) {
//       setForm({ ...form, image: file });
//       // Create preview URL
//       setImagePreview(URL.createObjectURL(file));
//     }
//   } else {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   }
// };

const handleChange = (e) => {
  if (e.target.name === "image") {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
      setError("Image size must be less than 5MB");
      return;
    }
    setForm({ ...form, image: file });
    setImagePreview(file ? URL.createObjectURL(file) : null);
  } else {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("date", form.date);
    formData.append("location", form.location);
    
    // Properly append the file if it exists
    if (form.image) {
      formData.append("image", form.image);
    }

    // Debug log
    console.log("Submitting:", Object.fromEntries(formData));

    if (editingId) {
      await api.put(`/events/${editingId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      await api.post("/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    
    // Reset form and fetch events
    setForm({ title: "", description: "", date: "", location: "", image: null });
    setImagePreview(null);
    setEditingId(null);
    await fetchEvents();
  } catch (err) {
    console.error("Submission error:", err);
    setError(err.response?.data?.message || "Failed to save event");
  } finally {
    setLoading(false);
  }
};


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setLoading(true);

  //   try {
  //     const formData = new FormData();
  //     formData.append("title", form.title);
  //     formData.append("description", form.description);
  //     formData.append("date", form.date);
  //     formData.append("location", form.location);
  //     if (form.image) formData.append("image", form.image);

  //     if (editingId) {
  //       await api.put(`/events/${editingId}`, formData, {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       });
  //     } else {
  //       await api.post("/events", formData, {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       });
  //     }
  //     setForm({ title: "", description: "", date: "", location: "", image: null });
  //     setImagePreview(null);
  //     setEditingId(null);
  //     fetchEvents();
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Failed to save event");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleEdit = (event) => {
    setForm({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      image: null,
    });
    setImagePreview(event.imageUrl || null);
    setEditingId(event._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete event");
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", date: "", location: "", image: null });
    setImagePreview(null);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-blue-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Event Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            {editingId ? "Edit your event" : "Create and manage your events"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center text-red-600">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Event Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter event description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter event location"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {editingId ? "Updating..." : "Creating..."}
                    </span>
                  ) : editingId ? (
                    "Update Event"
                  ) : (
                    "Create Event"
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Events List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Your Events
          </h2>

          {loading && !events.length ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-200 rounded-lg h-32"
                ></div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No events
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new event.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {events.map((ev) => (
                <li
                  key={ev._id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start">
                      {ev.imageUrl && (
                        // <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                        //   <img
                        //     src={ev.imageUrl}
                        //     alt={ev.title}
                        //     className="h-24 w-24 object-cover rounded-md"
                        //   />
                        // </div>
                          <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
    <img
      src={ev.imageUrl}
      alt={ev.title}
      className="h-24 w-24 object-cover rounded-md"
      onError={(e) => {
        e.target.src = '/placeholder-image.png'; // Fallback image
      }}
    />
  </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            {ev.title}
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(ev)}
                              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(ev._id)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {ev.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500">
                          <div className="flex items-center mr-4">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {new Date(ev.date).toLocaleString()}
                          </div>
                          {ev.location && (
                            <div className="flex items-center">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {ev.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}