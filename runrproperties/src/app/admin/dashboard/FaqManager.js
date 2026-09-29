"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiHelpCircle,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiLayers,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

export default function FaqManager({ token }) {
  const [faqs, setFaqs] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    order: 0,
    isActive: true,
  });
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [faqToDelete, setFaqToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (text, type = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const getAuthToken = () => {
    if (token) return token;
    if (typeof window !== "undefined") {
      return localStorage.getItem("runr_token") || "";
    }
    return "";
  };

  const getAuthHeaders = () => {
    const jwt = getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    };
  };

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (search.trim()) params.append("search", search.trim());

      const jwt = getAuthToken();
      const res = await fetch(`${API_BASE}/faqs?${params.toString()}`, {
        headers: {
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success) {
        setFaqs(data.data || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error("Error fetching FAQs:", err);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, search]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      order: faqs.length + 1,
      isActive: true,
    });
    setFormError("");
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question || "",
      answer: faq.answer || "",
      order: faq.order || 0,
      isActive: faq.isActive !== false,
    });
    setFormError("");
    setIsFormModalOpen(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      setFormError("Question is required.");
      return;
    }
    if (!formData.answer.trim()) {
      setFormError("Answer is required.");
      return;
    }

    setFormSaving(true);
    setFormError("");
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
      const url = editingFaq ? `${API_BASE}/faqs/${editingFaq._id}` : `${API_BASE}/faqs`;
      const method = editingFaq ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setIsFormModalOpen(false);
        showToast(editingFaq ? "FAQ updated successfully!" : "New FAQ created successfully!");
        fetchFaqs();
      } else {
        setFormError(data.message || "Failed to save FAQ.");
      }
    } catch (err) {
      setFormError("An unexpected network error occurred.");
    } finally {
      setFormSaving(false);
    }
  };

  const handleToggleStatus = async (faq) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
      const newStatus = !faq.isActive;

      setFaqs((prev) =>
        prev.map((f) => (f._id === faq._id ? { ...f, isActive: newStatus } : f))
      );

      const res = await fetch(`${API_BASE}/faqs/${faq._id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(`FAQ marked as ${newStatus ? "Active" : "Inactive"}`);
        fetchFaqs();
      } else {
        fetchFaqs();
      }
    } catch (err) {
      fetchFaqs();
    }
  };

  const handleDeleteFaq = async () => {
    if (!faqToDelete) return;
    setDeleteLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
      const jwt = getAuthToken();
      const res = await fetch(`${API_BASE}/faqs/${faqToDelete._id}`, {
        method: "DELETE",
        headers: {
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
      });
      const data = await res.json();

      if (data.success) {
        setFaqToDelete(null);
        showToast("FAQ deleted successfully!");
        fetchFaqs();
      } else {
        showToast(data.message || "Failed to delete FAQ", "error");
      }
    } catch (err) {
      showToast("Network error deleting FAQ", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 999999,
            background: toastMsg.type === "error" ? "#dc2626" : "#007bbd",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            fontWeight: 600,
            fontSize: "0.92rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {toastMsg.type === "error" ? <FiAlertCircle size={18} /> : <FiCheckCircle size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#e0f2fe",
                color: "#007bbd",
              }}
            >
              <FiHelpCircle size={20} />
            </span>
            <h2 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 800, color: "#0f172a" }}>
              Frequently Asked Questions (FAQs)
            </h2>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
            Manage public FAQs for Home Loans, Property Inquiries, and Platform Questions in real-time.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={fetchFaqs}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "12px",
              border: "1.5px solid #e2e8f0",
              background: "#ffffff",
              color: "#475569",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
            title="Refresh list"
          >
            <FiRefreshCw size={14} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "12px",
              border: "none",
              background: "#007bbd",
              color: "#ffffff",
              fontWeight: 750,
              fontSize: "0.92rem",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(0, 123, 189, 0.28)",
            }}
          >
            <FiPlus size={18} />
            <span>Add New FAQ</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.02)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#e0f2fe",
              color: "#007bbd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiLayers size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>
              {counts.total}
            </h3>
            <p style={{ margin: 0, fontSize: "0.84rem", fontWeight: 600, color: "#64748b" }}>
              Total Questions
            </p>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.02)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#ecfdf5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiCheckCircle size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#059669" }}>
              {counts.active}
            </h3>
            <p style={{ margin: 0, fontSize: "0.84rem", fontWeight: 600, color: "#64748b" }}>
              Active (Live on Website)
            </p>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.02)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#fef2f2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiX size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#dc2626" }}>
              {counts.inactive}
            </h3>
            <p style={{ margin: 0, fontSize: "0.84rem", fontWeight: 600, color: "#64748b" }}>
              Inactive (Hidden)
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: "12px",
              padding: "8px 14px",
              width: "100%",
              maxWidth: "380px",
            }}
          >
            <FiSearch size={16} style={{ color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search in questions or answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                width: "100%",
                fontSize: "0.88rem",
                color: "#0f172a",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#64748b" }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1.5px solid #e2e8f0",
                background: "#f8fafc",
                fontSize: "0.86rem",
                fontWeight: 600,
                color: "#334155",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b", background: "#ffffff", borderRadius: "16px" }}>
            Loading FAQs...
          </div>
        ) : faqs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px dashed #cbd5e1",
              color: "#64748b",
            }}
          >
            <FiHelpCircle size={36} style={{ color: "#94a3b8", marginBottom: "12px" }} />
            <h4 style={{ margin: "0 0 6px", fontSize: "1.1rem", color: "#0f172a" }}>No FAQs found</h4>
            <p style={{ margin: "0 0 16px", fontSize: "0.88rem" }}>
              {search
                ? "No questions match your current search."
                : "No questions added yet. Click 'Add New FAQ' to create one."}
            </p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              style={{
                padding: "8px 18px",
                background: "#007bbd",
                color: "#ffffff",
                borderRadius: "10px",
                border: "none",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
              }}
            >
              + Create First FAQ
            </button>
          </div>
        ) : (
          faqs.map((faq, index) => {
            const isExpanded = expandedFaqId === faq._id;
            return (
              <div
                key={faq._id}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  border: isExpanded ? "1.5px solid #bae6fd" : "1px solid #e2e8f0",
                  overflow: "hidden",
                  boxShadow: isExpanded ? "0 8px 24px rgba(0, 123, 189, 0.08)" : "0 2px 6px rgba(15, 23, 42, 0.02)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* FAQ Header Row */}
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedFaqId(isExpanded ? null : faq._id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: "#f1f5f9",
                        color: "#475569",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      #{faq.order || index + 1}
                    </span>

                    <h4
                      style={{
                        margin: 0,
                        fontSize: "0.98rem",
                        fontWeight: 750,
                        color: "#0f172a",
                        lineHeight: 1.4,
                      }}
                    >
                      {faq.question}
                    </h4>
                  </div>

                  {/* Actions & Status */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(faq)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        border: faq.isActive ? "1px solid #bbf7d0" : "1px solid #fecaca",
                        background: faq.isActive ? "#f0fdf4" : "#fef2f2",
                        color: faq.isActive ? "#16a34a" : "#dc2626",
                        fontSize: "0.76rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                      title="Click to toggle Active / Inactive"
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: faq.isActive ? "#16a34a" : "#dc2626",
                        }}
                      />
                      <span>{faq.isActive ? "Active" : "Inactive"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(faq)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        color: "#007bbd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      title="Edit Question"
                    >
                      <FiEdit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setFaqToDelete(faq)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border: "1px solid #fee2e2",
                        background: "#fff5f5",
                        color: "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      title="Delete Question"
                    >
                      <FiTrash2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq._id)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border: "none",
                        background: "transparent",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* FAQ Expanded Answer */}
                {isExpanded && (
                  <div
                    style={{
                      padding: "0 20px 20px 60px",
                      borderTop: "1px solid #f1f5f9",
                      background: "#fbfcfe",
                      paddingTop: "16px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#475569",
                        fontSize: "0.92rem",
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT FAQ MODAL */}
      {isFormModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => !formSaving && setIsFormModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "580px",
              borderRadius: "20px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#ffffff",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#e0f2fe",
                    color: "#007bbd",
                  }}
                >
                  <FiHelpCircle size={20} />
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
                    {editingFaq ? "Edit FAQ" : "Add New FAQ"}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                    {editingFaq
                      ? "Update question text, answer, and display priority."
                      : "Create a new question to be displayed on the website."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                disabled={formSaving}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFaq} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, margin: 0 }}>
              {/* Modal Body */}
              <div
                style={{
                  padding: "22px 24px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  background: "#ffffff",
                  flex: 1,
                }}
              >
                {formError && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ {formError}
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Question <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. What documents are needed for home loan application?"
                    value={formData.question}
                    onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.92rem",
                      color: "#0f172a",
                      background: "#ffffff",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Answer <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Enter the detailed answer explaining the process or requirement..."
                    value={formData.answer}
                    onChange={(e) => setFormData((prev) => ({ ...prev, answer: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.92rem",
                      color: "#0f172a",
                      background: "#ffffff",
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                      lineHeight: 1.5,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Display Order / Priority
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))}
                    placeholder="1, 2, 3..."
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.9rem",
                      color: "#0f172a",
                      background: "#ffffff",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                  <input
                    type="checkbox"
                    id="faqActiveCheck"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: "18px", height: "18px", accentColor: "#007bbd", cursor: "pointer" }}
                  />
                  <label htmlFor="faqActiveCheck" style={{ fontSize: "0.88rem", fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                    Publish to Live Website immediately (Active)
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #f1f5f9",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "12px",
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={formSaving}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#007bbd",
                    color: "#ffffff",
                    fontWeight: 750,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0, 123, 189, 0.3)",
                  }}
                >
                  {formSaving ? "Saving..." : editingFaq ? "Save Changes" : "Create FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {faqToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => !deleteLoading && setFaqToDelete(null)}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "460px",
              borderRadius: "20px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
              padding: "28px 24px 22px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#fef2f2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <FiTrash2 size={26} />
            </div>

            <h3 style={{ margin: "0 0 8px", fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
              Delete FAQ?
            </h3>
            <p style={{ margin: "0 0 12px", fontSize: "0.9rem", color: "#475569", lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>&quot;{faqToDelete.question}&quot;</strong>?
            </p>
            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                color: "#b45309",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              This question will be removed immediately from the public website.
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setFaqToDelete(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "1.5px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteFaq}
                style={{
                  padding: "10px 22px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontWeight: 750,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(220, 38, 38, 0.3)",
                }}
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
