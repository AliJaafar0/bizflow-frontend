"use client";


import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type DashboardData = {
  stats: {
    customers: number;
    leads: number;
    open_leads: number;
    won_leads: number;
    pipeline_value: number | string;
    pending_tasks: number;
    upcoming_appointments: number;
  };
  recent_customers: {
    id: number;
    name: string;
    email?: string | null;
    status?: string | null;
  }[];
  recent_leads: {
    id: number;
    title: string;
    stage?: string | null;
    value?: number | string | null;
  }[];
  upcoming_appointments: {
    id: number;
    title: string;
    starts_at: string;
  }[];
};

export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await apiRequest("/dashboard");
        setData(result);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);

          if (
            err.message.toLowerCase().includes("unauthenticated")
          ) {
            localStorage.removeItem("bizflow_token");
            router.push("/login");
          }
        } else {
          setError("Failed to load dashboard");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    try {
      await apiRequest("/logout", {
        method: "POST",
      });
    } catch {
      // Token may already be invalid.
    }

    localStorage.removeItem("bizflow_token");
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading dashboard...
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-6 text-red-300">
          {error || "Failed to load dashboard"}
        </div>
      </main>
    );
  }

  const cards = [
    ["Customers", data.stats.customers],
    ["Leads", data.stats.leads],
    ["Open Leads", data.stats.open_leads],
    ["Won Leads", data.stats.won_leads],
    ["Pipeline Value", `$${Number(data.stats.pipeline_value).toLocaleString()}`],
    ["Pending Tasks", data.stats.pending_tasks],
    ["Upcoming Appointments", data.stats.upcoming_appointments],
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
     <Sidebar/>
      <main className="lg:ml-64">
        <header className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold">
              Dashboard
            </h2>

            <p className="text-sm text-slate-400">
              Overview of your workspace
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Logout
          </button>
        </header>

        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(([title, value]) => (
              <div
                key={String(title)}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5"
              >
                <p className="text-sm text-slate-400">
                  {title}
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-lg font-semibold">
                Recent Customers
              </h3>

              <div className="mt-4 space-y-3">
                {data.recent_customers.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No customers yet.
                  </p>
                ) : (
                  data.recent_customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="rounded-lg bg-slate-950 p-3"
                    >
                      <p className="font-medium">
                        {customer.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {customer.email || "No email"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-lg font-semibold">
                Recent Leads
              </h3>

              <div className="mt-4 space-y-3">
                {data.recent_leads.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No leads yet.
                  </p>
                ) : (
                  data.recent_leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-lg bg-slate-950 p-3"
                    >
                      <p className="font-medium">
                        {lead.title}
                      </p>

                      <p className="text-sm text-slate-500">
                        {lead.stage || "No stage"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-lg font-semibold">
                Upcoming Appointments
              </h3>

              <div className="mt-4 space-y-3">
                {data.upcoming_appointments.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No upcoming appointments.
                  </p>
                ) : (
                  data.upcoming_appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-lg bg-slate-950 p-3"
                    >
                      <p className="font-medium">
                        {appointment.title}
                      </p>

                      <p className="text-sm text-slate-500">
                        {new Date(
                          appointment.starts_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}