"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Pencil, Trash2, X } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { ROLES, roleLabels, type Role } from "@/lib/roles";
import { listAllUsers, updateUserRoleCompany, deleteUserProfile, type AdminUserRow } from "@/lib/firestore/users";
import { useAuthContext } from "@/components/FirebaseProvider";

const ROLE_OPTIONS: Role[] = ["employee", "hr_client", "psychologist", "admedika", "mi_admin", "super_admin"];

function UsersPageInner() {
  const { profile: myProfile } = useAuthContext();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [editRole, setEditRole] = useState<Role>("employee");
  const [editCompany, setEditCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      const list = await listAllUsers();
      setUsers(list);
    } catch {
      setError("Gagal memuat daftar user");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.company?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [users, search, roleFilter]);

  function openEdit(u: AdminUserRow) {
    setEditing(u);
    setEditRole(u.role);
    setEditCompany(u.company || "");
    setError("");
  }

  async function saveEdit() {
    if (!editing) return;
    // MI Admin can view/manage everyone, but should not be able to grant
    // itself or others super_admin — that would let MI Admin
    // self-escalate. Only an actual super_admin can hand out that role.
    if (editRole === "super_admin" && myProfile?.role !== "super_admin") {
      setError("Hanya Super Admin yang bisa memberikan role Super Admin");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateUserRoleCompany(editing.uid, { role: editRole, company: editCompany.trim() });
      setEditing(null);
      refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u: AdminUserRow) {
    if (!confirm(`Hapus profil "${u.name}"? Ini hanya menghapus akses/profilnya, akun login (email/password) tidak ikut terhapus.`)) return;
    try {
      await deleteUserProfile(u.uid);
      refresh();
    } catch {
      alert("Gagal menghapus profil user");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Image src="/mindfulness-logo.png" alt="Mindfulness Indonesia" width={120} height={30} className="hidden shrink-0 sm:block" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-ink-soft">Admin</p>
              <h1 className="truncate font-display text-xl font-semibold text-ink">Kelola Users</h1>
            </div>
          </div>
          <Link href={myProfile?.role === "super_admin" ? "/super-admin" : "/admin"} className="shrink-0 text-sm font-medium text-ink-soft hover:text-ink">
            &larr; Kembali
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau perusahaan..."
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          >
            <option value="all">Semua Role</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{roleLabels[r]}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-ink-soft">Memuat...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-ink-soft">Tidak ada user yang cocok.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Perusahaan</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.uid} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                    <td className="px-4 py-3 text-ink-soft">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface-sunk px-2.5 py-0.5 text-xs font-semibold text-ink">
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{u.company || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {(myProfile?.role === "super_admin" || u.role !== "super_admin") ? (
                          <>
                            <button onClick={() => openEdit(u)} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-ink hover:bg-surface-sunk">
                              <Pencil size={12} /> Edit
                            </button>
                            <button onClick={() => handleDelete(u)} className="flex items-center gap-1 rounded-lg border border-danger/30 px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/10">
                              <Trash2 size={12} /> Hapus
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-ink-soft">Hanya Super Admin</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-ink">Edit {editing.name}</h2>
                <button onClick={() => setEditing(null)} className="text-ink-soft hover:text-ink">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as Role)}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{roleLabels[r]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Perusahaan</label>
                  <input
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    placeholder="Nama perusahaan"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                  />
                </div>
                {error && <p className="text-sm text-danger">{error}</p>}
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function UsersAdminPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.MI_ADMIN]}>
      <UsersPageInner />
    </RoleGuard>
  );
}
