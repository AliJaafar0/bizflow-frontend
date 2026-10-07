"use client";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Customer = {
  id: number;
  name: string;
};

type Appointment = {
  id: number;
  customer_id?: number | null;
  title: string;
  description?: string | null;
  starts_at: string;
  ends_at?: string | null;
  status?: string | null;
  location?: string | null;
  customer?: Customer | null;
};

type AppointmentForm = {
  customer_id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  status: string;
  location: string;
};

const emptyForm: AppointmentForm = {
  customer_id: "",
  title: "",
  description: "",
  starts_at: "",
  ends_at: "",
  status: "scheduled",
  location: "",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [form, setForm] = useState<AppointmentForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");

      const [appointmentData, customerData] = await Promise.all([
        apiRequest("/appointments"),
        apiRequest("/customers"),
      ]);

      if (Array.isArray(appointmentData)) {
        setAppointments(appointmentData);
      } else if (Array.isArray(appointmentData.data)) {
        setAppointments(appointmentData.data);
      } else {
        setAppointments([]);
      }

      if (Array.isArray(customerData)) {
        setCustomers(customerData);
      } else if (Array.isArray(customerData.data)) {
        setCustomers(customerData.data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load appointments");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateField(
    field: keyof AppointmentForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEditing(appointment: Appointment) {
    setEditingId(appointment.id);

    setForm({
      customer_id: appointment.customer_id
        ? String(appointment.customer_id)
        : "",
      title: appointment.title || "",
      description: appointment.description || "",
      starts_at: appointment.starts_at
        ? appointment.starts_at.substring(0, 16)
        : "",
      ends_at: appointment.ends_at
        ? appointment.ends_at.substring(0, 16)
        : "",
      status: appointment.status || "scheduled",
      location: appointment.location || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSaving(true);
    setError("");

    const payload = {
      customer_id: form.customer_id
        ? Number(form.customer_id)
        : null,

      title: form.title,
      description: form.description || null,
      starts_at: form.starts_at,
      ends_at: form.ends_at || null,
      status: form.status,
      location: form.location || null,
    };

    try {
      if (editingId !== null) {
        await apiRequest(`/appointments/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/appointments", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      await loadData();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save appointment");
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteAppointment(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(`/appointments/${id}`, {
        method: "DELETE",
      });

      setAppointments((current) =>
        current.filter(
          (appointment) => appointment.id !== id
        )
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete appointment");
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
    <Sidebar/>

      <main className="lg:ml-64">
        <header className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-2xl font-semibold">
            Appointments
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Schedule and manage customer meetings
          </p>
        </header>

        <div className="p-6">
          {error && (
            <div className="mb-6 rounded-lg border border-red-900 bg-red-950/30 p-4 text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  {editingId !== null
                    ? "Edit Appointment"
                    : "Add Appointment"}
                </h3>

                {editingId !== null && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Customer
                  </label>

                  <select
                    value={form.customer_id}
                    onChange={(e) =>
                      updateField(
                        "customer_id",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">
                      No customer
                    </option>

                    {customers.map((customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Title
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Discovery Call"
                    value={form.title}
                    onChange={(e) =>
                      updateField(
                        "title",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Start time
                  </label>

                  <input
                    type="datetime-local"
                    required
                    value={form.starts_at}
                    onChange={(e) =>
                      updateField(
                        "starts_at",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    End time
                  </label>

                  <input
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(e) =>
                      updateField(
                        "ends_at",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateField(
                        "status",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="scheduled">
                      Scheduled
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Location
                  </label>

                  <input
                    type="text"
                    placeholder="Google Meet, Office..."
                    value={form.location}
                    onChange={(e) =>
                      updateField(
                        "location",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    placeholder="Appointment details"
                    value={form.description}
                    onChange={(e) =>
                      updateField(
                        "description",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? editingId !== null
                      ? "Updating..."
                      : "Adding..."
                    : editingId !== null
                      ? "Update Appointment"
                      : "Add Appointment"}
                </button>
              </form>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Appointment List
                </h3>

                <span className="text-sm text-slate-400">
                  {appointments.length} total
                </span>
              </div>

              {loading ? (
                <p className="mt-6 text-slate-400">
                  Loading appointments...
                </p>
              ) : appointments.length === 0 ? (
                <p className="mt-6 text-slate-500">
                  No appointments yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-lg font-semibold">
                          {appointment.title}
                        </p>

                        {appointment.customer && (
                          <p className="mt-1 text-sm text-slate-400">
                            Customer:{" "}
                            {appointment.customer.name}
                          </p>
                        )}

                        <p className="mt-2 text-sm text-slate-300">
                          Start:{" "}
                          {new Date(
                            appointment.starts_at
                          ).toLocaleString()}
                        </p>

                        {appointment.ends_at && (
                          <p className="text-sm text-slate-400">
                            End:{" "}
                            {new Date(
                              appointment.ends_at
                            ).toLocaleString()}
                          </p>
                        )}

                        {appointment.location && (
                          <p className="mt-1 text-sm text-slate-400">
                            Location:{" "}
                            {appointment.location}
                          </p>
                        )}

                        {appointment.description && (
                          <p className="mt-2 max-w-xl text-sm text-slate-500">
                            {appointment.description}
                          </p>
                        )}

                        <div className="mt-3">
                          <span className="rounded-full bg-blue-950 px-2 py-1 text-xs text-blue-300">
                            {appointment.status ||
                              "scheduled"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            startEditing(appointment)
                          }
                          className="rounded-lg border border-blue-800 px-3 py-2 text-sm text-blue-300 hover:bg-blue-950/40"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteAppointment(
                              appointment.id
                            )
                          }
                          className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}