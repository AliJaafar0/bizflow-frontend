"use client";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

type TeamForm = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
  is_active: boolean;
};

const emptyForm: TeamForm = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "member",
  is_active: true,
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState<TeamForm>(emptyForm);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTeam() {
    try {
      setError("");

      const data = await apiRequest("/team");

      if (Array.isArray(data)) {
        setMembers(data);
      } else if (Array.isArray(data.data)) {
        setMembers(data.data);
      } else {
        setMembers([]);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load team");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeam();
  }, []);

  function updateField(
    field: keyof TeamForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function startEditing(member: TeamMember) {
    if (member.role === "owner") {
      setError("Owner account must be managed from Settings.");
      return;
    }

    setEditingId(member.id);

    setForm({
      name: member.name,
      email: member.email,
      password: "",
      password_confirmation: "",
      role: member.role,
      is_active: member.is_active,
    });

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      if (editingId !== null) {
        const payload: Record<string, string | boolean> = {
          name: form.name,
          email: form.email,
          role: form.role,
          is_active: form.is_active,
        };

        if (form.password) {
          payload.password = form.password;
          payload.password_confirmation =
            form.password_confirmation;
        }

        await apiRequest(`/team/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/team", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            password_confirmation:
              form.password_confirmation,
            role: form.role,
            is_active: form.is_active,
          }),
        });
      }

      resetForm();
      await loadTeam();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save team member");
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteMember(member: TeamMember) {
    if (member.role === "owner") {
      setError("Owner account cannot be removed from Team.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this team member?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(`/team/${member.id}`, {
        method: "DELETE",
      });

      setMembers((current) =>
        current.filter(
          (currentMember) =>
            currentMember.id !== member.id
        )
      );

      if (editingId === member.id) {
        resetForm();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to remove team member");
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
     <Sidebar/>

      <main className="lg:ml-64">
        <header className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-2xl font-semibold">
            Team
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Manage members and their roles
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
                    ? "Edit Member"
                    : "Add Member"}
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
                    Name
                  </label>

                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) =>
                      updateField(
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Team member name"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      updateField(
                        "email",
                        e.target.value
                      )
                    }
                    placeholder="member@example.com"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Password
                  </label>

                  <input
                    type="password"
                    required={editingId === null}
                    minLength={8}
                    value={form.password}
                    onChange={(e) =>
                      updateField(
                        "password",
                        e.target.value
                      )
                    }
                    placeholder={
                      editingId !== null
                        ? "Leave empty to keep password"
                        : "Minimum 8 characters"
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    required={
                      editingId === null ||
                      form.password.length > 0
                    }
                    minLength={8}
                    value={
                      form.password_confirmation
                    }
                    onChange={(e) =>
                      updateField(
                        "password_confirmation",
                        e.target.value
                      )
                    }
                    placeholder="Repeat password"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Role
                  </label>

                  <select
                    value={form.role}
                    onChange={(e) =>
                      updateField(
                        "role",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="member">
                      Member
                    </option>

                    <option value="admin">
                      Admin
                    </option>
                  </select>
                </div>

                <label className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 p-4">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      updateField(
                        "is_active",
                        e.target.checked
                      )
                    }
                  />

                  <span className="text-sm">
                    Active account
                  </span>
                </label>

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
                      ? "Update Member"
                      : "Add Member"}
                </button>
              </form>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Team Members
                </h3>

                <span className="text-sm text-slate-400">
                  {members.length} total
                </span>
              </div>

              {loading ? (
                <p className="mt-6 text-slate-400">
                  Loading team...
                </p>
              ) : members.length === 0 ? (
                <p className="mt-6 text-slate-500">
                  No team members yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-lg font-semibold">
                          {member.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          {member.email}
                        </p>

                        <div className="mt-3 flex gap-2 text-xs">
                          <span className="rounded-full bg-blue-950 px-2 py-1 text-blue-300">
                            {member.role}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 ${
                              member.is_active
                                ? "bg-emerald-950 text-emerald-300"
                                : "bg-red-950 text-red-300"
                            }`}
                          >
                            {member.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </div>

                      {member.role === "owner" ? (
                        <div className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400">
                          Managed from Settings
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              startEditing(member)
                            }
                            className="rounded-lg border border-blue-800 px-3 py-2 text-sm text-blue-300 hover:bg-blue-950/40"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteMember(member)
                            }
                            className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40"
                          >
                            Remove
                          </button>
                        </div>
                      )}
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