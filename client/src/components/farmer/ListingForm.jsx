import { useState } from "react";
import Button from "../common/Button.jsx";
import { districts, states } from "../../utils/constants.js";

export default function ListingForm({ onSubmit }) {
  const [form, setForm] = useState({
    cropName: "",
    quantity: "",
    unit: "quintal",
    pricePerUnit: "",
    location: { state: states[0], district: districts[0] },
  });
  const [photo, setPhoto] = useState(null);
  const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const submit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) =>
      key === "location"
        ? Object.entries(value).forEach(([k, v]) =>
            data.append(`location[${k}]`, v),
          )
        : data.append(key, value),
    );
    if (photo) data.append("photo", photo);
    onSubmit(data);
  };
  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm"
    >
      <label className="label">
        Crop name
        <input
          className="field mt-1"
          value={form.cropName}
          onChange={(e) => change("cropName", e.target.value)}
          required
        />
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="label">
          Quantity
          <input
            className="field mt-1"
            type="number"
            value={form.quantity}
            onChange={(e) => change("quantity", e.target.value)}
            required
          />
        </label>
        <label className="label">
          Unit
          <select
            className="field mt-1"
            value={form.unit}
            onChange={(e) => change("unit", e.target.value)}
          >
            <option>kg</option>
            <option>quintal</option>
            <option>ton</option>
          </select>
        </label>
        <label className="label">
          Price per unit
          <input
            className="field mt-1"
            type="number"
            value={form.pricePerUnit}
            onChange={(e) => change("pricePerUnit", e.target.value)}
            required
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="label">
          State
          <select
            className="field mt-1"
            value={form.location.state}
            onChange={(e) =>
              change("location", { ...form.location, state: e.target.value })
            }
          >
            {states.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="label">
          District
          <select
            className="field mt-1"
            value={form.location.district}
            onChange={(e) =>
              change("location", { ...form.location, district: e.target.value })
            }
          >
            {districts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="label">
        Photo
        <input
          className="field mt-1"
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
        />
      </label>
      <Button>Create Listing</Button>
    </form>
  );
}
