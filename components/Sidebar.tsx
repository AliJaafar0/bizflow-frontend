"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Customers",
    href: "/customers",
  },
  {
    name: "Leads",
    href: "/leads",
  },
  {
    name: "Tasks",
    href: "/tasks",
  },
  {
    name: "Appointments",
    href: "/appointments",
  },
  {
    name: "Team",
    href: "/team",
  },
  {
    name: "Settings",
    href: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-4 lg:hidden">
        <div>
          <h1 className="text-xl font-bold text-white">
            BizFlow
          </h1>

          <p className="text-xs text-slate-500">
            Business workspace
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-slate-700 px-3 py-2 text-xl text-white hover:bg-slate-800"
        >
          ☰
        </button>
      </div>

      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-slate-900 p-6 lg:block">
        <h1 className="text-2xl font-bold text-white">
          BizFlow
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Business workspace
        </p>

        <nav className="mt-10 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-4 py-3 transition ${
                isActive(link.href)
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          <aside className="relative z-10 h-full w-72 border-r border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  BizFlow
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Business workspace
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <nav className="mt-10 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-4 py-3 transition ${
                    isActive(link.href)
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}