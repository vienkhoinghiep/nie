"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import EmailNav from "@/components/email/EmailNav";
import {
  Workflow, Plus, Play, Pause, Trash2, Tag, Users, List,
  ShoppingCart, Edit, MoreHorizontal, Sparkles, FileText,
} from "lucide-react";
import Link from "next/link";
import ConfirmDeleteModal from "@/components/email/ConfirmDeleteModal";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Automation {
  id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "paused" | "archived";
  trigger_type: "tag_added" | "subscribed_to_list" | "manual" | "purchase";
  enrolled_count: number;
  completed_count: number;
  active_count: number;
  created_at: string;
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Nháp", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  active: { label: "Đang chạy", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  paused: { label: "Tạm dừng", color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  archived: { label: "Lưu trữ", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const TRIGGER_CONFIG: Record<string, { label: string; icon: typeof Tag }> = {
  tag_added: { label: "Tag Added", icon: Tag },
  subscribed_to_list: { label: "Subscribed to List", icon: List },
  manual: { label: "Manual", icon: Users },
  purchase: { label: "Purchase", icon: ShoppingCart },
};

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AutomationsPage() {
  const router = useRouter();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // Delete confirmation modal state — supports single AND bulk delete.
  const [deleteTargets, setDeleteTargets] = useState<Automation[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Create modal state
  const [createMode, setCreateMode] = useState<"template" | "blank">("template");
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTriggerType, setNewTriggerType] = useState("tag_added");
  const [creating, setCreating] = useState(false);

  const fetchAutomations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/email/automations");
      if (res.ok) {
        const data = await res.json();
        setAutomations(data.automations ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setOpenDropdown(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Filter
  const filtered = automations.filter((a) => {
    if (activeTab === "all") return true;
    return a.status === activeTab;
  });

  // Stats
  const totalCount = automations.length;
  const activeCount = automations.filter((a) => a.status === "active").length;
  const totalEnrolled = automations.reduce((sum, a) => sum + (a.enrolled_count || 0), 0);
  const completionRate =
    totalEnrolled > 0
      ? ((automations.reduce((sum, a) => sum + (a.completed_count || 0), 0) / totalEnrolled) * 100).toFixed(1)
      : "0.0";

  const stats = [
    { label: "Total automations", value: totalCount, icon: Workflow, color: "#3b82f6" },
    { label: "Active automations", value: activeCount, icon: Play, color: "#22c55e" },
    { label: "Total enrolled", value: totalEnrolled, icon: Users, color: "#2563EB" },
    { label: "Completion rate", value: `${completionRate}%`, icon: Workflow, color: "#8b5cf6" },
  ];

  // Actions
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setOpenDropdown(null);
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/email/automations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchAutomations();
    } catch { /* */ }
  };

  // Open the controlled delete modal — replaces native `confirm()`
  // which is silently blocked by some browsers / extensions / webviews.
  const askDelete = (a: Automation) => {
    setOpenDropdown(null);
    setDeleteError(null);
    setDeleteTargets([a]);
  };

  const askBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setOpenDropdown(null);
    setDeleteError(null);
    setDeleteTargets(automations.filter((a) => selectedIds.has(a.id)));
  };

  const confirmDelete = async () => {
    if (deleteTargets.length === 0) return;
    setDeleting(true);
    setDeleteError(null);
    const failures: string[] = [];
    try {
      for (const t of deleteTargets) {
        const res = await fetch(`/api/email/automations/${t.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          failures.push(`"${t.name}" — ${data.error || res.statusText}`);
        }
      }
      if (failures.length === 0) {
        setDeleteTargets([]);
        setSelectedIds(new Set());
        fetchAutomations();
      } else {
        setDeleteError(
          `Xoá ${deleteTargets.length - failures.length}/${deleteTargets.length} thành công. ` +
          `Lỗi: ${failures.slice(0, 3).join("; ")}${failures.length > 3 ? "…" : ""}`
        );
        fetchAutomations();
      }
    } catch (e) {
      setDeleteError(
        e instanceof Error ? `Lỗi kết nối: ${e.message}` : "Lỗi kết nối khi xóa."
      );
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((i) => prev.has(i));
      const next = new Set(prev);
      if (allSelected) ids.forEach((i) => next.delete(i));
      else ids.forEach((i) => next.add(i));
      return next;
    });
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreateMode("template");
    // Lazy-load templates the first time the modal opens
    if (templates.length === 0 && !templatesLoading) {
      setTemplatesLoading(true);
      fetch("/api/email/automations/templates")
        .then((r) => r.json())
        .then((data) => setTemplates(data.templates ?? []))
        .catch(() => {})
        .finally(() => setTemplatesLoading(false));
    }
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/email/automations/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: templateId }),
      });
      const data = await res.json();
      if (res.ok && data.automation?.id) {
        setShowCreateModal(false);
        // Jump straight into the flow builder so the user can configure emails
        router.push(`/email/automations/${data.automation.id}`);
      }
    } catch { /* */ } finally {
      setCreating(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/email/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDescription,
          trigger_type: newTriggerType,
        }),
      });
      const data = await res.json();
      if (res.ok && data.automation?.id) {
        setShowCreateModal(false);
        setNewName("");
        setNewDescription("");
        setNewTriggerType("tag_added");
        // Jump straight into the flow builder
        router.push(`/email/automations/${data.automation.id}`);
      }
    } catch { /* */ } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <TopBar title="Email Automations" subtitle="Lộ trình gửi email tự động" />

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: s.color + "18" }}
                >
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs + Create button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-0 border-b border-[#2a2a2a]">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                  activeTab === tab.value
                    ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: "#2563EB" }}
          >
            <Plus size={15} /> Tạo automation mới
          </button>
        </div>

        {/* Automation list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-4 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#2a2a2a] rounded w-1/3" />
                    <div className="h-3 bg-[#2a2a2a] rounded w-1/2" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-16 bg-[#2a2a2a] rounded-full" />
                    <div className="flex gap-3">
                      <div className="h-4 w-12 bg-[#2a2a2a] rounded" />
                      <div className="h-4 w-12 bg-[#2a2a2a] rounded" />
                      <div className="h-4 w-12 bg-[#2a2a2a] rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "rgba(37,99,235,0.1)" }}
            >
              <Workflow size={28} className="text-[#2563EB]" />
            </div>
            <p className="text-white font-medium mb-1">
              {activeTab !== "all" ? "Không tìm thấy automation nào" : "Chưa có automation nào"}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              {activeTab !== "all"
                ? "Thử thay đổi bộ lọc."
                : "Tạo automation đầu tiên để bắt đầu!"}
            </p>
            {activeTab === "all" && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ background: "#2563EB" }}
              >
                <Plus size={15} /> Tạo automation mới
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Select-all + bulk action bar */}
            {filtered.length > 0 && (
              <div
                className="flex items-center gap-3 mb-3 px-4 py-2.5 rounded-xl"
                style={{
                  background:
                    selectedIds.size > 0 ? "rgba(37,99,235,0.08)" : "#141414",
                  border:
                    selectedIds.size > 0
                      ? "1px solid rgba(37,99,235,0.3)"
                      : "1px solid #2a2a2a",
                }}
              >
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 &&
                      filtered.every((a) => selectedIds.has(a.id))
                    }
                    onChange={() =>
                      toggleSelectAll(filtered.map((a) => a.id))
                    }
                    className="w-4 h-4 rounded accent-[#2563EB]"
                  />
                  <span>
                    {selectedIds.size > 0
                      ? `Đã chọn ${selectedIds.size}`
                      : "Chọn tất cả trên trang"}
                  </span>
                </label>
                {selectedIds.size > 0 && (
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedIds(new Set())}
                      className="text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1"
                    >
                      Bỏ chọn
                    </button>
                    <button
                      type="button"
                      onClick={askBulkDelete}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      style={{
                        background: "rgba(239,68,68,0.12)",
                        color: "#ef4444",
                        border: "1px solid rgba(239,68,68,0.3)",
                      }}
                    >
                      <Trash2 size={12} />
                      Xóa {selectedIds.size} automation
                    </button>
                  </div>
                )}
              </div>
            )}

          <div className="space-y-3">
            {filtered.map((a) => {
              const st = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.draft;
              const trigger = TRIGGER_CONFIG[a.trigger_type] ?? TRIGGER_CONFIG.manual;
              const TriggerIcon = trigger.icon;
              const isSelected = selectedIds.has(a.id);

              return (
                <div
                  key={a.id}
                  className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a3a3a] transition-all"
                  style={
                    isSelected
                      ? {
                          background: "rgba(37,99,235,0.06)",
                          borderColor: "rgba(37,99,235,0.35)",
                        }
                      : undefined
                  }
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    {/* Checkbox */}
                    <label
                      className="flex items-center cursor-pointer shrink-0 self-start md:self-center pt-1 md:pt-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(a.id)}
                        className="w-4 h-4 rounded accent-[#2563EB]"
                      />
                    </label>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          href={`/email/automations/${a.id}`}
                          className="font-semibold text-white text-sm truncate hover:text-[#2563EB] transition-colors"
                        >
                          {a.name}
                        </Link>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {a.status === "active" && (
                            <span
                              className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse"
                              style={{ background: st.color }}
                            />
                          )}
                          {st.label}
                        </span>
                      </div>
                      {a.description && (
                        <p className="text-xs text-gray-500 truncate mb-1">
                          {a.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <TriggerIcon size={11} />
                        <span>{trigger.label}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-5 text-xs shrink-0">
                      <div className="text-center min-w-[50px]">
                        <div className="text-gray-500 mb-0.5">Enrolled</div>
                        <div className="font-semibold text-white">
                          {a.enrolled_count ?? 0}
                        </div>
                      </div>
                      <div className="text-center min-w-[50px]">
                        <div className="text-gray-500 mb-0.5">Completed</div>
                        <div className="font-semibold" style={{ color: "#2563EB" }}>
                          {a.completed_count ?? 0}
                        </div>
                      </div>
                      <div className="text-center min-w-[50px]">
                        <div className="text-gray-500 mb-0.5">Active</div>
                        <div className="font-semibold" style={{ color: "#22c55e" }}>
                          {a.active_count ?? 0}
                        </div>
                      </div>
                    </div>

                    {/* Actions dropdown */}
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === a.id ? null : a.id);
                        }}
                        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#252525] transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {openDropdown === a.id && (
                        <div
                          className="absolute right-0 top-full mt-1 w-44 rounded-lg overflow-hidden shadow-xl z-20"
                          style={{ background: "#1f1f1f", border: "1px solid #2a2a2a" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            href={`/email/automations/${a.id}`}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors"
                          >
                            <Edit size={12} /> Chỉnh sửa
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(a.id, a.status)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors"
                          >
                            {a.status === "active" ? (
                              <>
                                <Pause size={12} /> Tạm dừng
                              </>
                            ) : (
                              <>
                                <Play size={12} /> Kích hoạt
                              </>
                            )}
                          </button>
                          <div className="border-t border-[#2a2a2a]" />
                          <button
                            onClick={() => askDelete(a)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={12} /> Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowCreateModal(false)}
          />
          <div
            className="relative w-full max-w-2xl mx-4 rounded-xl p-6 max-h-[85vh] overflow-y-auto"
            style={{ background: "#151515", border: "1px solid #2a2a2a" }}
          >
            <h2 className="text-lg font-semibold text-white mb-1">
              Tạo automation mới
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Chọn template có sẵn để bắt đầu nhanh, hoặc tạo từ đầu.
            </p>

            {/* Mode tabs */}
            <div className="flex items-center gap-1 mb-5 p-1 rounded-lg bg-[#0d0d0d] border border-[#2a2a2a]">
              <button
                onClick={() => setCreateMode("template")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  createMode === "template"
                    ? "bg-[#2563EB] text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Sparkles size={14} /> Từ template
              </button>
              <button
                onClick={() => setCreateMode("blank")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  createMode === "blank"
                    ? "bg-[#2563EB] text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileText size={14} /> Tạo từ đầu
              </button>
            </div>

            {createMode === "template" ? (
              <div className="space-y-3">
                {templatesLoading ? (
                  <div className="py-12 text-center text-sm text-gray-500">Đang tải template...</div>
                ) : templates.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">Chưa có template nào.</div>
                ) : (
                  templates.map((t) => {
                    const trigger = TRIGGER_CONFIG[t.trigger_type] ?? TRIGGER_CONFIG.manual;
                    const TIcon = trigger.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleCreateFromTemplate(t.id)}
                        disabled={creating}
                        className="w-full text-left p-4 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] hover:border-[#2563EB] hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-wait"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: "rgba(37,99,235,0.12)" }}
                          >
                            <Sparkles size={16} className="text-[#2563EB]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-semibold text-white text-sm">{t.name}</h4>
                              <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                                <TIcon size={10} /> {trigger.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{t.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
                <div className="flex items-center justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Tên automation
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="VD: Welcome Series"
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-gray-500 bg-[#0d0d0d] border border-[#2a2a2a] outline-none focus:border-[#2563EB] transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Mô tả
                    </label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Mô tả ngắn gọn về automation này..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-gray-500 bg-[#0d0d0d] border border-[#2a2a2a] outline-none focus:border-[#2563EB] transition-colors resize-none"
                    />
                  </div>

                  {/* Trigger type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Trigger type
                    </label>
                    <select
                      value={newTriggerType}
                      onChange={(e) => setNewTriggerType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-[#0d0d0d] border border-[#2a2a2a] outline-none focus:border-[#2563EB] transition-colors"
                    >
                      <option value="tag_added">Tag Added</option>
                      <option value="subscribed_to_list">Subscribed to List</option>
                      <option value="manual">Manual</option>
                      <option value="purchase">Purchase</option>
                    </select>
                  </div>
                </div>

                {/* Modal actions */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim() || creating}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                    style={{ background: "#2563EB" }}
                  >
                    {creating ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus size={15} />
                    )}
                    Tạo automation
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation modal — single OR bulk */}
      <ConfirmDeleteModal
        open={deleteTargets.length > 0}
        title={
          deleteTargets.length === 1
            ? `Xóa automation "${deleteTargets[0]?.name ?? ""}"?`
            : `Xóa ${deleteTargets.length} automation cùng lúc?`
        }
        body={
          (deleteTargets.length > 1
            ? `Bạn đang xóa ${deleteTargets.length} automation:\n` +
              deleteTargets
                .slice(0, 5)
                .map((t) => `  • ${t.name}`)
                .join("\n") +
              (deleteTargets.length > 5 ? `\n  • … và ${deleteTargets.length - 5} automation khác` : "") +
              "\n\n"
            : "") +
          "Xóa automation sẽ XÓA LUÔN toàn bộ enrollment và log liên quan.\n" +
          "Subscriber đang giữa chuỗi email sẽ ngừng nhận tiếp.\n\n" +
          "Hành động KHÔNG thể hoàn tác."
        }
        confirmLabel={
          deleteTargets.length === 1
            ? "Xóa automation"
            : `Xóa ${deleteTargets.length} automation`
        }
        loading={deleting}
        errorMessage={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (deleting) return;
          setDeleteTargets([]);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
