"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, UserMinus } from "lucide-react";
import { useAuthContext } from "@/components/FirebaseProvider";
import { auth } from "@/lib/firebase/config";
import { Skeleton } from "@/components/Skeleton";

interface EmployeeRow {
  uid: string;
  name: string;
  department: string | null;
  jobLevel: string | null;
  company: string | null;
}

export default function HrEmployeesPage() {
  const { profile } = useAuthContext();
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [removingUid, setRemovingUid] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      if (!auth?.currentUser) {
        setEmployees([]);
        return;
      }
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch("/api/employees", { headers: { Authorization: `Bearer ${idToken}` } });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Gagal memuat daftar karyawan");
        return;
      }
      setEmployees(json.employees || []);
    } catch {
      setError("Gagal memuat daftar karyawan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.trim().toLowerCase();
    return employees.filter((e) => e.name.toLowerCase().includes(q) || e.department?.toLowerCase().includes(q));
  }, [employees, search]);

  async function handleRemove(uid: string, name: string) {
    if (!confirm(`Keluarkan "${name}" dari perusahaan? Karyawan ini tidak akan lagi terhitung dalam statistik perusahaan kamu (data assessment/konseling pribadinya tetap aman, tidak terhapus).`)) return;
    setRemovingUid(uid);
    try {
      if (!auth?.currentUser) return;
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch("/api/employees", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error || "Gagal mengeluarkan karyawan");
        return;
      }
      setEmployees((prev) => prev.filter((e) => e.uid !== uid));
    } finally {
      setRemovingUid(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Image src="/mindfulness-logo.png" alt="Mindfulness Indonesia" width={120} height={30} className="hidden shrink-0 sm:block" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-ink-soft">HR Dashboard</p>
              <h1 className="truncate font-display text-xl font-semibold text-ink">Daftar Karyawan</h1>
            </div>
          </div>
          <Link href="/hr" className="shrink-0 text-sm font-medium text-ink-soft hover:text-ink">
            &larr; Kembali
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-8">
        <p className="text-sm text-ink-soft">
          Daftar ini hanya menampilkan nama, departemen, dan level jabatan — tidak menampilkan
          email, hasil assessment, atau riwayat konseling pribadi karyawan (data sensitif tetap
          rahasia sesuai kebijakan privasi platform).
        </p>

        {!profile?.company && !loading && (
          <p className="rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
            Perusahaan belum diset di profil kamu. Lengkapi field &quot;Perusahaan&quot; di halaman
            Pengaturan Profil supaya daftar karyawan bisa ditampilkan.
          </p>
        )}

        {error && <p className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau departemen..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-primary"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-ink-soft">Belum ada karyawan terdaftar untuk perusahaan ini.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Departemen</th>
                  <th className="px-4 py-3 font-medium">Level Jabatan</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.uid} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{e.name}</td>
                    <td className="px-4 py-3 text-ink-soft">{e.department || "-"}</td>
                    <td className="px-4 py-3 text-ink-soft">{e.jobLevel || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemove(e.uid, e.name)}
                        disabled={removingUid === e.uid}
                        className="inline-flex items-center gap-1 rounded-lg border border-danger/30 px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
                      >
                        <UserMinus size={12} /> {removingUid === e.uid ? "Memproses..." : "Keluarkan"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
