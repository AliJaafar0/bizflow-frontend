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
  title: string;
};

type Task = {
  id: number;
  customer_id?: number | null;
  lead_id?: number | null;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: string | null;
  status?: string | null;

  customer?: Customer | null;
  lead?: Lead | null;
};

type TaskForm = {
  customer_id: string;
  lead_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
};

const emptyForm: TaskForm = {
  customer_id: "",
  lead_id: "",
  title: "",
  description: "",
  due_date: "",
  priority: "medium",
  status: "pending",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  const [form, setForm] = useState<TaskForm>(emptyForm);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");

      const [taskData, customerData, leadData] =
        await Promise.all([
          apiRequest("/tasks"),
          apiRequest("/customers"),
          apiRequest("/leads"),
        ]);

      if (Array.isArray(taskData)) {
        setTasks(taskData);
      } else if (Array.isArray(taskData.data)) {
        setTasks(taskData.data);
      } else {
        setTasks([]);
      }

      if (Array.isArray(customerData)) {
        setCustomers(customerData);
      } else if (Array.isArray(customerData.data)) {
        setCustomers(customerData.data);
      } else {
        setCustomers([]);
      }

      if (Array.isArray(leadData)) {
        setLeads(leadData);
      } else if (Array.isArray(leadData.data)) {
        setLeads(leadData.data);
      } else {
        setLeads([]);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load tasks");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateField(
    field: keyof TaskForm,
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

  function startEditing(task: Task) {
    setEditingId(task.id);

    setForm({
      customer_id: task.customer_id
        ? String(task.customer_id)
        : "",

      lead_id: task.lead_id
        ? String(task.lead_id)
        : "",

      title: task.title || "",

      description: task.description || "",

      due_date: task.due_date
        ? task.due_date.substring(0, 16)
        : "",

      priority: task.priority || "medium",

      status: task.status || "pending",
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

      lead_id: form.lead_id
        ? Number(form.lead_id)
        : null,

      title: form.title,

      description: form.description || null,

      due_date: form.due_date || null,

      priority: form.priority,

      status: form.status,
    };

    try {
      if (editingId !== null) {
        await apiRequest(`/tasks/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/tasks", {
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
        setError("Failed to save task");
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(`/tasks/${id}`, {
        method: "DELETE",
      });

      setTasks((current) =>
        current.filter((task) => task.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete task");
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar/>

      <main className="lg:ml-64">
        <header className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-2xl font-semibold">
            Tasks
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Organize and track your work
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
                    ? "Edit Task"
                    : "Add Task"}
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
                    Task title
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Send proposal"
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
                    Lead
                  </label>

                  <select
                    value={form.lead_id}
                    onChange={(e) =>
                      updateField(
                        "lead_id",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">
                      No lead
                    </option>

                    {leads.map((lead) => (
                      <option
                        key={lead.id}
                        value={lead.id}
                      >
                        {lead.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Due date
                  </label>

                  <input
                    type="datetime-local"
                    value={form.due_date}
                    onChange={(e) =>
                      updateField(
                        "due_date",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Priority
                  </label>

                  <select
                    value={form.priority}
                    onChange={(e) =>
                      updateField(
                        "priority",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>
                  </select>
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
                    <option value="pending">
                      Pending
                    </option>

                    <option value="in_progress">
                      In Progress
                    </option>

                    <option value="completed">
                      Completed
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    placeholder="Task description"
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
                      ? "Update Task"
                      : "Add Task"}
                </button>
              </form>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Task List
                </h3>

                <span className="text-sm text-slate-400">
                  {tasks.length} total
                </span>
              </div>

              {loading ? (
                <p className="mt-6 text-slate-400">
                  Loading tasks...
                </p>
              ) : tasks.length === 0 ? (
                <p className="mt-6 text-slate-500">
                  No tasks yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-lg font-semibold">
                          {task.title}
                        </p>

                        {task.customer && (
                          <p className="mt-1 text-sm text-slate-400">
                            Customer:{" "}
                            {task.customer.name}
                          </p>
                        )}

                        {task.lead && (
                          <p className="text-sm text-slate-400">
                            Lead: {task.lead.title}
                          </p>
                        )}

                        {task.due_date && (
                          <p className="mt-1 text-sm text-slate-500">
                            Due:{" "}
                            {new Date(
                              task.due_date
                            ).toLocaleString()}
                          </p>
                        )}

                        {task.description && (
                          <p className="mt-2 max-w-xl text-sm text-slate-500">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-slate-800 px-2 py-1">
                            {task.priority ||
                              "medium"}
                          </span>

                          <span className="rounded-full bg-blue-950 px-2 py-1 text-blue-300">
                            {task.status ||
                              "pending"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            startEditing(task)
                          }
                          className="rounded-lg border border-blue-800 px-3 py-2 text-sm text-blue-300 hover:bg-blue-950/40"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteTask(task.id)
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