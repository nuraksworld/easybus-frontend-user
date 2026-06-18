const handleSubmit = async () => {
  if (!selectedSeats.length) {
    message.warning("Please select at least one seat");
    return;
  }

  setLoading(true);
  try {
    const user = JSON.parse(localStorage.getItem("easybus_user") || "{}");

    const payload = {
      trip_id: selectedTrip.trip_id,
      seats: selectedSeats,
      customer_name: user.name || "Guest",
      customer_phone: user.phone,
      genders: selectedSeats.map(() => "M"), // optional, or handle properly
      from_stop_id: selectedTrip.from_stop_id,
      to_stop_id: selectedTrip.to_stop_id,
      expected_amount: totalAmount,
    };

    const { data } = await api.post("/bookings/hold", payload);

    if (data.booking_id) {
      message.success("Your seats have been reserved!");
      navigate("/book-tickets", { state: { tab: "myBookings" } }); // 👈 auto open My Bookings
    } else {
      message.error("Failed to reserve seats.");
    }
  } catch (e) {
    console.error(e);
    message.error(e?.response?.data?.error || "Reservation failed");
  } finally {
    setLoading(false);
  }
};
