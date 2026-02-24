import { useState, useEffect } from "react";
import {
  UserCog,
  Plus,
  Trash2,
  Shield,
  ShieldOff,
  Loader2,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

interface AdminUser {
  id: string;
  auth_user_id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

const ROLES = ["admin", "manager", "support"] as const;

const roleLabels: Record<string, string> = {
  admin: "Administrátor",
  manager: "Manažér",
  support: "Podpora",
};

const roleBadge: Record<string, string> = {
  admin: "bg-blue-50 text-blue-700",
  manager: "bg-amber-50 text-amber-700",
  support: "bg-green-50 text-green-700",
};

const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`;

async function apiFetch(method: string, path: string, body?: unknown) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${session?.access_token ?? ""}`,
      "Content-Type": "application/json",
      Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "admin", password: "" });

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    try {
      const res = await apiFetch("GET", "");
      if (res.error) throw new Error(res.error);
      setAdmins(res.data || []);
    } catch (err) {
      toast.error("Nepodarilo sa načítať adminov");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setSubmitting(true);
    try {
      const res = await apiFetch("POST", "", form);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Admin používateľ bol vytvorený");
      setShowModal(false);
      setForm({ email: "", name: "", role: "admin", password: "" });
      fetchAdmins();
    } catch {
      toast.error("Nepodarilo sa vytvoriť admina");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(admin: AdminUser) {
    if (admin.auth_user_id === user?.id) {
      toast.error("Nemôžete deaktivovať vlastný účet");
      return;
    }
    try {
      const res = await apiFetch("PUT", "", { id: admin.id, is_active: !admin.is_active });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(admin.is_active ? "Admin bol deaktivovaný" : "Admin bol aktivovaný");
      fetchAdmins();
    } catch {
      toast.error("Nepodarilo sa zmeniť stav admina");
    }
  }

  async function handleDelete(admin: AdminUser) {
    if (admin.auth_user_id === user?.id) {
      toast.error("Nemôžete odstrániť vlastný účet");
      return;
    }
    if (!confirm(`Naozaj chcete odstrániť admina ${admin.email}?`)) return;
    try {
      const res = await apiFetch("DELETE", `?id=${admin.id}`);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Admin bol odstránený");
      fetchAdmins();
    } catch {
      toast.error("Nepodarilo sa odstrániť admina");
    }
  }

  const inputCls =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm";

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Admin používatelia</h2>
            <p className="text-gray-500 text-sm mt-1">
              Spravujte administrátorov a ich prístupy
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-500/20 text-sm"
          >
            <Plus className="w-4 h-4" />
            Pridať admina
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Používateľ
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rola
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stav
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posledné prihlásenie
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vytvorený
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcie
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {admins.map((admin) => {
                  const isSelf = admin.auth_user_id === user?.id;
                  return (
                    <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {(admin.name || admin.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {admin.name || "—"}
                              {isSelf && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                  vy
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge[admin.role] || "bg-gray-100 text-gray-600"}`}
                        >
                          {roleLabels[admin.role] || admin.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${admin.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                        >
                          {admin.is_active ? "Aktívny" : "Neaktívny"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {admin.last_login_at
                          ? new Date(admin.last_login_at).toLocaleDateString("sk-SK")
                          : "Nikdy"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(admin.created_at).toLocaleDateString("sk-SK")}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleActive(admin)}
                            disabled={isSelf}
                            title={admin.is_active ? "Deaktivovať" : "Aktivovať"}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {admin.is_active ? (
                              <ShieldOff className="w-4 h-4" />
                            ) : (
                              <Shield className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(admin)}
                            disabled={isSelf}
                            title="Odstrániť"
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <UserCog className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Žiadni admin používatelia</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Pridajte prvého admina kliknutím na tlačidlo vyššie
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Pridať admin používateľa</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="admin@priklad.sk"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Meno</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ján Novák"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rola</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className={inputCls}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {roleLabels[r]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Heslo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Minimálne 8 znakov"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Vytvoriť admina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
