"use client";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Customer = {
  id: number;
  name: string;
};

type Lead = {
  id: number;
  customer_id?: number | null;
  title: string;
  value?: number | string | null;
  stage?: string | null;
  source?: string | null;
  notes?: string | null;
  expected_close_date?: string | null;
  customer?: Customer | null;
};

type LeadForm = {
  customer_id: string;
  title: string;
  value: string;
  stage: string;
  source: string;
  notes: string;
  expected_close_date: string;
};

const emptyForm: LeadForm = {
  customer_id: "",
  title: "",
  value: "",
  stage: "new",
  source: "",
  notes: "",
  expected_close_date: "",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [form, setForm] = useState<LeadForm>(emptyForm);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");

      const [leadData, customerData] = await Promise.all([
        apiRequest("/leads"),
        apiRequest("/customers"),
      ]);

      if (Array.isArray(leadData)) {
        setLeads(leadData);
      } else if (Array.isArray(leadData.data)) {
        setLeads(leadData.data);
      } else {
        setLeads([]);
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
        setError("Failed to load leads");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateField(field: keyof LeadForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEditing(lead: Lead) {
    setEditingId(lead.id);

    setForm({
      customer_id: lead.customer_id
        ? String(lead.customer_id)
        : "",
      title: lead.title || "",
      value:
        lead.value !== null && lead.value !== undefined
          ? String(lead.value)
          : "",
      stage: lead.stage || "new",
      source: lead.source || "",
      notes: lead.notes || "",
      expected_close_date: lead.expected_close_date
        ? lead.expected_close_date.substring(0, 10)
        : "",
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

    const payload = {
      customer_id: form.customer_id
        ? Number(form.customer_id)
        : null,

      title: form.title,

      value: form.value
        ? Number(form.value)
        : 0,

      stage: form.stage || null,

      source: form.source || null,

      notes: form.notes || null,

      expected_close_date:
        form.expected_close_date || null,
    };

    try {
      if (editingId !== null) {
        await apiRequest(`/leads/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/leads", {
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
        setError("Failed to save lead");
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteLead(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(`/leads/${id}`, {
        method: "DELETE",
      });

      setLeads((current) =>
        current.filter((lead) => lead.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete lead");
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar/>

      <main className="lg:ml-64">
        <header className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-2xl font-semibold">
            Leads
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Manage your sales opportunities
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
                    ? "Edit Lead"
                    : "Add Lead"}
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
                    Lead title
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Website redesign project"
                    value={form.title}
                    onChange={(e) =>
                      updateField("title", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Value
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1200"
                    value={form.value}
                    onChange={(e) =>
                      updateField("value", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Stage
                  </label>

                  <select
                    value={form.stage}
                    onChange={(e) =>
                      updateField("stage", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="qualified">
                      Qualified
                    </option>
                    <option value="proposal">
                      Proposal
                    </option>
                    <option value="negotiation">
                      Negotiation
                    </option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
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
                    Expected close date
                  </label>

                  <input
                    type="date"
                    value={form.expected_close_date}
                    onChange={(e) =>
                      updateField(
                        "expected_close_date",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Notes
                  </label>

                  <textarea
                    rows={4}
                    placeholder="Lead notes"
                    value={form.notes}
                    onChange={(e) =>
                      updateField("notes", e.target.value)
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
                      ? "Update Lead"
                      : "Add Lead"}
                </button>
              </form>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Lead List
                </h3>

                <span className="text-sm text-slate-400">
                  {leads.length} total
                </span>
              </div>

              {loading ? (
                <p className="mt-6 text-slate-400">
                  Loading leads...
                </p>
              ) : leads.length === 0 ? (
                <p className="mt-6 text-slate-500">
                  No leads yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-lg font-semibold">
                          {lead.title}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          {lead.customer?.name ||
                            "No customer"}
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                          Value: $
                          {Number(
                            lead.value || 0
                          ).toLocaleString()}
                        </p>

                        {lead.expected_close_date && (
                          <p className="mt-1 text-sm text-slate-500">
                            Expected close:{" "}
                            {lead.expected_close_date.substring(
                              0,
                              10
                            )}
                          </p>
                        )}

                        {lead.notes && (
                          <p className="mt-2 max-w-xl text-sm text-slate-500">
                            {lead.notes}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {lead.stage && (
                            <span className="rounded-full bg-blue-950 px-2 py-1 text-blue-300">
                              {lead.stage}
                            </span>
                          )}

                          {lead.source && (
                            <span className="rounded-full bg-slate-800 px-2 py-1">
                              {lead.source}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            startEditing(lead)
                          }
                          className="rounded-lg border border-blue-800 px-3 py-2 text-sm text-blue-300 hover:bg-blue-950/40"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteLead(lead.id)
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