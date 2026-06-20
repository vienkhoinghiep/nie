"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TopBar from "@/components/layout/TopBar";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  ExternalLink,
  FolderPlus,
  Save,
  X,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
  sort_order: number;
};

type Resource = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  available: boolean;
  sort_order: number;
  product_id: string | null;
};

type Product = {
  id: string;
  slug: string;
  title: string;
  price: number;
};

type Props = {
  initialCategories: Category[];
  initialResources: Resource[];
  initialProducts: Product[];
};

export default function ResourcesAdmin({ initialCategories, initialResources, initialProducts }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pending, startTransition] = useTransition();
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function api(method: string, body?: unknown, query?: string) {
    const url = "/api/admin/resources" + (query || "");
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  async function refresh() {
    const data = await api("GET");
    setCategories(data.categories);
    setResources(data.resources);
    if (data.products) setProducts(data.products);
    router.refresh();
  }

  async function uploadFile(file: File): Promise<string> {
    setUploading(true);
    try {
      // Direct browser → Supabase Storage upload (bypasses Vercel 4.5MB body limit).
      // Admin-only INSERT enforced by storage RLS policies on the 'resources' bucket.
      if (file.size > 50 * 1024 * 1024) {
        throw new Error("File quá lớn (tối đa 50 MB).");
      }
      const supabase = createClient();
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const ext = safeName.includes(".") ? safeName.split(".").pop() : "bin";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("resources").upload(path, file, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw new Error(upErr.message);
      const { data: pub } = supabase.storage.from("resources").getPublicUrl(path);
      return pub.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  async function saveResource(form: ResourceFormData) {
    let fileUrl = form.file_url;
    if (form.file instanceof File) {
      fileUrl = await uploadFile(form.file);
    }
    const payload = {
      kind: "resource",
      title: form.title,
      description: form.description || null,
      category_id: form.category_id,
      file_url: fileUrl || null,
      available: form.available,
      sort_order: form.sort_order,
      product_id: form.product_id || null,
    };
    if (form.id) {
      await api("PATCH", { ...payload, id: form.id });
    } else {
      await api("POST", payload);
    }
    await refresh();
    setEditingResource(null);
    setShowResourceForm(null);
  }

  async function deleteResource(id: string) {
    if (!confirm("Xóa tài nguyên này? Hành động không thể hoàn tác.")) return;
    await api("DELETE", undefined, `?id=${id}&kind=resource`);
    await refresh();
  }

  async function toggleAvailable(r: Resource) {
    await api("PATCH", { kind: "resource", id: r.id, available: !r.available });
    await refresh();
  }

  async function saveCategory(form: CategoryFormData) {
    const payload = {
      kind: "category",
      name: form.name,
      icon: form.icon,
      color: form.color,
      bg: form.bg,
      sort_order: form.sort_order,
    };
    if (form.id) {
      await api("PATCH", { ...payload, id: form.id });
    } else {
      await api("POST", payload);
    }
    await refresh();
    setShowCategoryForm(false);
  }

  async function deleteCategory(id: string) {
    const inCat = resources.filter((r) => r.category_id === id).length;
    if (!confirm(`Xóa category này? ${inCat} tài nguyên bên trong cũng sẽ bị xóa.`)) return;
    await api("DELETE", undefined, `?id=${id}&kind=category`);
    await refresh();
  }

  return (
    <div>
      <TopBar title="Quản lý Tài nguyên" subtitle="Templates, tài liệu và file download cho học viên" />

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {categories.length} danh mục · {resources.length} tài nguyên · {resources.filter((r) => r.available).length} đang hiển thị
          </div>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#222] hover:bg-[#2a2a2a] text-white"
          >
            <FolderPlus size={14} /> Thêm danh mục
          </button>
        </div>

        {showCategoryForm && (
          <CategoryForm
            onCancel={() => setShowCategoryForm(false)}
            onSave={saveCategory}
            initial={null}
          />
        )}

        {/* Categories list */}
        {categories.map((cat) => {
          const catResources = resources.filter((r) => r.category_id === cat.id);
          return (
            <section key={cat.id} className="card-dark p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: cat.bg, color: cat.color }}
                  >
                    {cat.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                  </div>
                  <h3 className="text-base font-semibold text-white">{cat.name}</h3>
                  <span className="text-xs text-gray-500">{catResources.length} tài nguyên</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResourceForm(cat.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-[#2563EB] text-black font-medium hover:bg-[#3B82F6]"
                  >
                    <Plus size={12} /> Thêm
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {showResourceForm === cat.id && (
                <ResourceForm
                  categories={categories}
                  products={products}
                  initial={{ id: "", category_id: cat.id, title: "", description: "", file_url: "", available: false, sort_order: catResources.length + 1, product_id: null }}
                  onCancel={() => setShowResourceForm(null)}
                  onSave={saveResource}
                  uploading={uploading}
                />
              )}

              <div className="space-y-2">
                {catResources.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#161616] border border-[#222]">
                    {editingResource?.id === r.id ? (
                      <ResourceForm
                        categories={categories}
                        products={products}
                        initial={r}
                        onCancel={() => setEditingResource(null)}
                        onSave={saveResource}
                        uploading={uploading}
                      />
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white truncate">{r.title}</span>
                            {r.available ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">Hiển thị</span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/15 text-gray-400">Ẩn</span>
                            )}
                            {r.file_url && (
                              <a
                                href={r.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-[#2563EB] inline-flex items-center gap-0.5 hover:underline"
                              >
                                File <ExternalLink size={9} />
                              </a>
                            )}
                          </div>
                          {r.description && (
                            <p className="text-xs text-gray-500 leading-relaxed">{r.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => toggleAvailable(r)}
                            title={r.available ? "Ẩn" : "Hiển thị"}
                            className="p-1.5 rounded hover:bg-[#222] text-gray-400 hover:text-white"
                          >
                            {r.available ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            onClick={() => setEditingResource(r)}
                            title="Sửa"
                            className="p-1.5 rounded hover:bg-[#222] text-gray-400 hover:text-white"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => deleteResource(r.id)}
                            title="Xóa"
                            className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {catResources.length === 0 && !showResourceForm && (
                  <p className="text-xs text-gray-500 italic">Chưa có tài nguyên nào trong danh mục này.</p>
                )}
              </div>
            </section>
          );
        })}

        {categories.length === 0 && (
          <p className="text-center text-gray-500 py-8">Chưa có danh mục nào. Bấm &ldquo;Thêm danh mục&rdquo; để bắt đầu.</p>
        )}

        {pending && <p className="text-xs text-gray-500">Đang xử lý…</p>}
      </div>
    </div>
  );
}

// ─── Resource Form ───────────────────────────────────────────────

type ResourceFormData = {
  id: string;
  category_id: string;
  title: string;
  description: string;
  file_url: string;
  available: boolean;
  sort_order: number;
  product_id: string | null;
  file?: File;
};

function ResourceForm({
  categories,
  products,
  initial,
  onCancel,
  onSave,
  uploading,
}: {
  categories: Category[];
  products: Product[];
  initial: ResourceFormData | Resource;
  onCancel: () => void;
  onSave: (data: ResourceFormData) => void | Promise<void>;
  uploading: boolean;
}) {
  const [form, setForm] = useState<ResourceFormData>({
    id: initial.id || "",
    category_id: initial.category_id || categories[0]?.id || "",
    title: initial.title || "",
    description: initial.description || "",
    file_url: initial.file_url || "",
    available: initial.available ?? false,
    sort_order: initial.sort_order ?? 999,
    product_id: (initial as Resource).product_id ?? null,
  });
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!form.title.trim()) return alert("Title bắt buộc");
    setSaving(true);
    try {
      await onSave(form);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full p-4 rounded-lg bg-[#161616] border border-[#2a2a2a] space-y-3">
      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Tên tài nguyên *"
        className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-white"
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Mô tả ngắn"
        rows={2}
        className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-white resize-none"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className="bg-[#0a0a0a] border border-[#333] rounded px-2 py-2 text-sm text-white"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="number"
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
          placeholder="Thứ tự"
          className="bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-white"
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">Quyền truy cập</label>
        <select
          value={form.product_id || ""}
          onChange={(e) => setForm({ ...form, product_id: e.target.value || null })}
          className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-white"
        >
          <option value="">🆓 Miễn phí — Mọi học viên đăng nhập đều tải được</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              🔒 Chỉ học viên đã mua: {p.title}{p.price > 0 ? ` (${p.price.toLocaleString("vi-VN")}đ)` : ""}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-gray-500 mt-1">
          {form.product_id ? "Chỉ user enroll khóa này mới thấy file. Người khác thấy badge khoá kèm CTA mua khóa." : "Bất kỳ ai đã đăng nhập đều tải được file này."}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          value={form.file_url}
          onChange={(e) => setForm({ ...form, file_url: e.target.value })}
          placeholder="URL file (hoặc upload bên dưới)"
          className="flex-1 bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-white"
        />
        <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs bg-[#222] hover:bg-[#2a2a2a] cursor-pointer text-white">
          <Upload size={12} />
          {uploading ? "Đang tải..." : "Upload"}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.xlsx,.xls,.docx,.doc,.zip,.png,.jpg,.jpeg"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setForm({ ...form, file: f });
            }}
          />
        </label>
      </div>
      {form.file && (
        <p className="text-xs text-[#2563EB]">📎 File chọn: {form.file.name} ({Math.round(form.file.size / 1024)} KB)</p>
      )}
      <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          checked={form.available}
          onChange={(e) => setForm({ ...form, available: e.target.checked })}
          className="w-4 h-4"
        />
        Cho hiển thị công khai
      </label>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 rounded text-sm text-gray-400 hover:text-white">
          <X size={14} className="inline mr-1" /> Hủy
        </button>
        <button
          onClick={submit}
          disabled={saving || uploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-[#2563EB] text-black hover:bg-[#3B82F6] disabled:opacity-50"
        >
          <Save size={14} /> {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </div>
  );
}

// ─── Category Form ──────────────────────────────────────────────

type CategoryFormData = {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
  sort_order: number;
};

function CategoryForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: CategoryFormData | null;
  onCancel: () => void;
  onSave: (data: CategoryFormData) => void | Promise<void>;
}) {
  const [form, setForm] = useState<CategoryFormData>({
    id: initial?.id || "",
    name: initial?.name || "",
    icon: initial?.icon || "FileText",
    color: initial?.color || "#2563EB",
    bg: initial?.bg || "rgba(37,99,235,0.1)",
    sort_order: initial?.sort_order ?? 999,
  });

  return (
    <div className="card-dark p-4 space-y-3">
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Tên danh mục *"
        className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-white"
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          placeholder="Icon (lucide name)"
          className="bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-white"
        />
        <input
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          placeholder="Color hex"
          className="bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-white"
        />
        <input
          type="number"
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
          placeholder="Thứ tự"
          className="bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-white"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 rounded text-sm text-gray-400 hover:text-white">Hủy</button>
        <button
          onClick={() => {
            if (!form.name.trim()) return alert("Tên bắt buộc");
            onSave({ ...form, bg: form.color + "1a" });
          }}
          className="px-3 py-1.5 rounded text-sm font-medium bg-[#2563EB] text-black hover:bg-[#3B82F6]"
        >
          Lưu
        </button>
      </div>
    </div>
  );
}
