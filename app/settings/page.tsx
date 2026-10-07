"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import Sidebar from "../../components/Sidebar";

type ProfileForm = {
  name: string;
  email: string;
};

type PasswordForm = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

type CompanyForm = {
  name: string;
  email: string;
  phone: string;
  industry: string;
  country: string;
  city: string;
  website: string;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>({
      current_password: "",
      password: "",
      password_confirmation: "",
    });

  const [company, setCompany] = useState<CompanyForm>({
    name: "",
    email: "",
    phone: "",
    industry: "",
    country: "",
    city: "",
    website: "",
  });

  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [savingCompany, setSavingCompany] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSettings() {
    try {
      setError("");

      const [profileData, companyData] =
        await Promise.all([
          apiRequest("/settings/profile"),
          apiRequest("/settings/company"),
        ]);

      setProfile({
        name: profileData.name || "",
        email: profileData.email || "",
      });

      setCompany({
        name: companyData.name || "",
        email: companyData.email || "",
        phone: companyData.phone || "",
        industry: companyData.industry || "",
        country: companyData.country || "",
        city: companyData.city || "",
        website: companyData.website || "",
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load settings");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function updateProfile(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSavingProfile(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest("/settings/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      });

      setSuccess("Profile updated successfully.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update profile");
      }
    } finally {
      setSavingProfile(false);
    }
  }

  async function updatePassword(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      passwordForm.password !==
      passwordForm.password_confirmation
    ) {
      setError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);

    try {
      await apiRequest("/settings/password", {
        method: "PUT",
        body: JSON.stringify(passwordForm),
      });

      setPasswordForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });

      setSuccess("Password updated successfully.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update password");
      }
    } finally {
      setSavingPassword(false);
    }
  }

  async function updateCompany(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSavingCompany(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest("/settings/company", {
        method: "PUT",
        body: JSON.stringify(company),
      });

      setSuccess(
        "Company information updated successfully."
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update company");
      }
    } finally {
      setSavingCompany(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading settings...
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="lg:ml-64">
        <header className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-2xl font-semibold">
            Settings
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Manage your account and company information
          </p>
        </header>

        <div className="p-6">
          {error && (
            <div className="mb-6 rounded-lg border border-red-900 bg-red-950/30 p-4 text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg border border-emerald-900 bg-emerald-950/30 p-4 text-emerald-300">
              {success}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-xl font-semibold">
                Profile
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Update your personal information
              </p>

              <form
                onSubmit={updateProfile}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Name
                  </label>

                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        name: e.target.value,
                      })
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
                    required
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        email: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-lg bg-blue-600 px-4 py-3 font-medium hover:bg-blue-500 disabled:opacity-60"
                >
                  {savingProfile
                    ? "Saving..."
                    : "Save Profile"}
                </button>
              </form>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-xl font-semibold">
                Change Password
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Use your current password to set a new one
              </p>

              <form
                onSubmit={updatePassword}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Current Password
                  </label>

                  <input
                    type="password"
                    required
                    value={
                      passwordForm.current_password
                    }
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        current_password:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    New Password
                  </label>

                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.password}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        password: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    required
                    minLength={8}
                    value={
                      passwordForm.password_confirmation
                    }
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        password_confirmation:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="rounded-lg bg-blue-600 px-4 py-3 font-medium hover:bg-blue-500 disabled:opacity-60"
                >
                  {savingPassword
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </form>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
              <h3 className="text-xl font-semibold">
                Company Information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage your company details
              </p>

              <form
                onSubmit={updateCompany}
                className="mt-5 grid gap-4 md:grid-cols-2"
              >
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Company Name
                  </label>

                  <input
                    type="text"
                    required
                    value={company.name}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Company Email
                  </label>

                  <input
                    type="email"
                    value={company.email}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        email: e.target.value,
                      })
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
                    value={company.phone}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        phone: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Industry
                  </label>

                  <input
                    type="text"
                    value={company.industry}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        industry: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Country
                  </label>

                  <input
                    type="text"
                    value={company.country}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        country: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    City
                  </label>

                  <input
                    type="text"
                    value={company.city}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        city: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-slate-300">
                    Website
                  </label>

                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={company.website}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        website: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={savingCompany}
                    className="rounded-lg bg-blue-600 px-4 py-3 font-medium hover:bg-blue-500 disabled:opacity-60"
                  >
                    {savingCompany
                      ? "Saving..."
                      : "Save Company"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}