export default function EventCard({ event }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px", maxWidth: "300px" }}>
      {/* {event.image && <img src={`http://localhost:5000/${event.image}`} alt={event.title} style={{ width: "100%", height: 150, objectFit: "cover" }} />} */}
      {event.image && <img src={event.image} alt={event.title} />}

      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <small>{new Date(event.date).toLocaleString()}</small>
      <p><i>{event.location}</i></p>
    </div>
  );
}
