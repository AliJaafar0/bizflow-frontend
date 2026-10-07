"use client";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Customer = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  source?: string | null;
  status?: string | null;
  notes?: string | null;
};

type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  source: string;
  status: string;
  notes: string;
};

const emptyForm: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  company_name: "",
  source: "",
  status: "active",
  notes: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<CustomerForm>(emptyForm);

  async function loadCustomers() {
    try {
      setError("");

      const data = await apiRequest("/customers");

      if (Array.isArray(data)) {
        setCustomers(data);
      } else if (Array.isArray(data.data)) {
        setCustomers(data.data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load customers");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function updateField(field: keyof CustomerForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEditing(customer: Customer) {
    setEditingId(customer.id);

    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company_name: customer.company_name || "",
      source: customer.source || "",
      status: customer.status || "active",
      notes: customer.notes || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      if (editingId !== null) {
        await apiRequest(`/customers/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await apiRequest("/customers", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }

      resetForm();
      await loadCustomers();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          editingId !== null
            ? "Failed to update customer"
            : "Failed to create customer"
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteCustomer(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(`/customers/${id}`, {
        method: "DELETE",
      });

      setCustomers((current) =>
        current.filter((customer) => customer.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete customer");
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
     <Sidebar/>

      <main className="lg:ml-64">
        <header className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-2xl font-semibold">
            Customers
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Add and manage your customers
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
                    ? "Edit Customer"
                    : "Add Customer"}
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
                    Customer name
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Customer name"
                    value={form.name}
                    onChange={(e) =>
                      updateField("name", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Phone
                  </label>

                  <input
                    type="text"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(e) =>
                      updateField("phone", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Company name
                  </label>

                  <input
                    type="text"
                    placeholder="Company name"
                    value={form.company_name}
                    onChange={(e) =>
                      updateField("company_name", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Source
                  </label>

                  <input
                    type="text"
                    placeholder="Instagram, Referral..."
                    value={form.source}
                    onChange={(e) =>
                      updateField("source", e.target.value)
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
                      updateField("status", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Notes
                  </label>

                  <textarea
                    placeholder="Notes"
                    value={form.notes}
                    onChange={(e) =>
                      updateField("notes", e.target.value)
                    }
                    rows={4}
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
                      ? "Update Customer"
                      : "Add Customer"}
                </button>
              </form>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Customer List
                </h3>

                <span className="text-sm text-slate-400">
                  {customers.length} total
                </span>
              </div>

              {loading ? (
                <p className="mt-6 text-slate-400">
                  Loading customers...
                </p>
              ) : customers.length === 0 ? (
                <p className="mt-6 text-slate-500">
                  No customers yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-lg font-semibold">
                          {customer.name}
                        </p>

                        {customer.company_name && (
                          <p className="mt-1 text-sm text-slate-300">
                            {customer.company_name}
                          </p>
                        )}

                        <p className="mt-1 text-sm text-slate-400">
                          {customer.email || "No email"}
                        </p>

                        <p className="text-sm text-slate-500">
                          {customer.phone || "No phone"}
                        </p>

                        {customer.notes && (
                          <p className="mt-2 max-w-xl text-sm text-slate-500">
                            {customer.notes}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {customer.status && (
                            <span className="rounded-full bg-slate-800 px-2 py-1">
                              {customer.status}
                            </span>
                          )}

                          {customer.source && (
                            <span className="rounded-full bg-slate-800 px-2 py-1">
                              {customer.source}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            startEditing(customer)
                          }
                          className="rounded-lg border border-blue-800 px-3 py-2 text-sm text-blue-300 transition hover:bg-blue-950/40"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteCustomer(customer.id)
                          }
                          className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 transition hover:bg-red-950/40"
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