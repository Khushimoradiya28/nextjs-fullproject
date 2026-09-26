"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { PROPERTY_TYPES, CITIES } from "../../constants/propertyOptions";
import {
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiPlus,
  FiStar,
  FiFileText,
  FiCheck,
  FiX,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiArrowLeft,
  FiCheckCircle,
  FiImage,
  FiLoader,
} from "react-icons/fi";
import styles from "./admin.module.css";

export default function AdminDashboardPage() {
  const router = useRouter();
  const auth = useAuth() || {};
  const { user, token, logout, loading: authLoading } = auth;

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'bank_partners' | 'properties' | 'users' | 'leads' | 'contact_leads' | 'property_leads' | 'blogs'
  const [stats, setStats] = useState(null);
  const [banks, setBanks] = useState([]);
  const [properties, setProperties] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [leadsList, setLeadsList] = useState([]);
  const [leadCounts, setLeadCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [leadBankFilter, setLeadBankFilter] = useState("all");
  const [searchLead, setSearchLead] = useState("");
  const [contactLeadsList, setContactLeadsList] = useState([]);
  const [contactLeadCounts, setContactLeadCounts] = useState({ total: 0, new: 0, contacted: 0, resolved: 0, closed: 0 });
  const [contactLeadPagination, setContactLeadPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  });
  const [contactLeadStatusFilter, setContactLeadStatusFilter] = useState("all");
  const [searchContactLead, setSearchContactLead] = useState("");
  const [selectedContactLead, setSelectedContactLead] = useState(null);
  const [contactLeadToDelete, setContactLeadToDelete] = useState(null);
  const [openContactStatusDropdownId, setOpenContactStatusDropdownId] = useState(null);

  // Property Leads (Buyer Enquiries) State
  const [propertyLeadsList, setPropertyLeadsList] = useState([]);
  const [propertyLeadCounts, setPropertyLeadCounts] = useState({ total: 0, pending: 0, contacted: 0, closed: 0 });
  const [propertyLeadPagination, setPropertyLeadPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  });
  const [propertyLeadStatusFilter, setPropertyLeadStatusFilter] = useState("all");
  const [searchPropertyLead, setSearchPropertyLead] = useState("");
  const [selectedPropertyLead, setSelectedPropertyLead] = useState(null);
  const [propertyLeadToDelete, setPropertyLeadToDelete] = useState(null);
  const [openPropertyLeadStatusDropdownId, setOpenPropertyLeadStatusDropdownId] = useState(null);

  // Blog Management State
  const [blogsList, setBlogsList] = useState([]);
  const [blogCounts, setBlogCounts] = useState({ total: 0, published: 0, draft: 0 });
  const [blogPagination, setBlogPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  });
  const [blogStatusFilter, setBlogStatusFilter] = useState("all");
  const [blogCategoryFilter, setBlogCategoryFilter] = useState("all");
  const [searchBlog, setSearchBlog] = useState("");
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogViewMode, setBlogViewMode] = useState("list"); // 'list' | 'create' | 'edit'
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Market Trends",
    author: "runr editorial team",
    readTime: "5 min",
    status: "published",
    isFeatured: false,
  });
  const [blogCoverFile, setBlogCoverFile] = useState(null);
  const [blogCoverPreview, setBlogCoverPreview] = useState("");
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogError, setBlogError] = useState("");

  const [loading, setLoading] = useState(true);
  const [bankFilter, setBankFilter] = useState("all");
  const [searchBank, setSearchBank] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

  // Format Date in Asia/Kolkata (IST) Timezone
  const formatISTDate = (dateVal) => {
    if (!dateVal) return "—";
    try {
      return new Date(dateVal).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "—";
    }
  };

  const formatISTTime = (dateVal) => {
    if (!dateVal) return "";
    try {
      return new Date(dateVal).toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  const BLOG_CATEGORIES = [
    "Market Trends",
    "Buying Guide",
    "Investment",
    "Finance",
    "Lifestyle",
    "Legal",
    "Rental",
    "Interior",
    "General",
  ];

  // Helper to get media URL for image preview
  const getMediaUrl = (url) => {
    if (!url) return "/img/blog/1.jpg";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) {
      return url;
    }
    const backendOrigin = API_BASE.replace(/\/api\/?$/, "");
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    if (cleanPath.startsWith("/uploads") || cleanPath.startsWith("/images")) {
      return `${backendOrigin}${cleanPath}`;
    }
    return cleanPath;
  };

  const blogSearchTimeoutRef = useRef(null);

  const blogFiltersRef = useRef({
    status: blogStatusFilter,
    category: blogCategoryFilter,
    search: searchBlog,
  });

  useEffect(() => {
    blogFiltersRef.current = {
      status: blogStatusFilter,
      category: blogCategoryFilter,
      search: searchBlog,
    };
  }, [blogStatusFilter, blogCategoryFilter, searchBlog]);

  const fetchBlogs = useCallback(
    async (
      status = blogFiltersRef.current.status,
      category = blogFiltersRef.current.category,
      search = blogFiltersRef.current.search,
      page = 1,
      showLoading = false
    ) => {
      const authToken = token || localStorage.getItem("runr_token");
      if (showLoading) setBlogLoading(true);
      try {
        const query = new URLSearchParams();
        if (status !== "all") query.append("status", status);
        if (category !== "all") query.append("category", category);
        if (search) query.append("search", search);
        query.append("page", String(page));
        query.append("limit", "10");

        const res = await fetch(`${API_BASE}/admin/blogs?${query.toString()}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        if (data.success) {
          setBlogsList(data.data || []);
          if (data.counts) setBlogCounts(data.counts);
          if (data.pagination) setBlogPagination(data.pagination);
        }
      } catch (err) {
        console.error("Blogs fetch error:", err);
      } finally {
        if (showLoading) setBlogLoading(false);
      }
    },
    [API_BASE, token]
  );

  const handleBlogSearchChange = (val) => {
    setSearchBlog(val);
    if (blogSearchTimeoutRef.current) {
      clearTimeout(blogSearchTimeoutRef.current);
    }
    blogSearchTimeoutRef.current = setTimeout(() => {
      fetchBlogs(blogStatusFilter, blogCategoryFilter, val, 1);
    }, 280);
  };

  const handleOpenAddBlogModal = () => {
    setEditingBlog(null);
    setBlogForm({
      title: "",
      excerpt: "",
      content: "",
      category: "Market Trends",
      author: "runr editorial team",
      readTime: "5 min",
      status: "published",
      isFeatured: false,
    });
    setBlogCoverFile(null);
    setBlogCoverPreview("");
    setBlogError("");
    setBlogViewMode("create");
    window.scrollTo(0, 0);
  };

  const handleOpenEditBlogModal = async (blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog?.title || "",
      excerpt: blog?.excerpt || "",
      content: blog?.content || "",
      category: blog?.category || "Market Trends",
      author: blog?.author || "runr editorial team",
      readTime: blog?.readTime || "5 min",
      status: blog?.status || "published",
      isFeatured: Boolean(blog?.isFeatured),
    });
    setBlogCoverFile(null);
    setBlogCoverPreview(getMediaUrl(blog?.coverImage));
    setBlogError("");
    setBlogViewMode("edit");
    window.scrollTo(0, 0);

    // If content is not present in listing payload, fetch the complete blog post seamlessly
    if (!blog?.content && blog?._id) {
      try {
        const authToken = token || localStorage.getItem("runr_token");
        const res = await fetch(`${API_BASE}/admin/blogs/${blog._id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setEditingBlog(data.data);
          setBlogForm((prev) => ({
            ...prev,
            content: data.data.content || "",
            excerpt: data.data.excerpt || prev.excerpt,
            title: data.data.title || prev.title,
          }));
        }
      } catch (err) {
        console.error("Error fetching single blog content:", err);
      }
    }
  };

  const handleSaveBlog = async (e) => {
    if (e) e.preventDefault();
    if (!blogForm.title.trim() || !blogForm.excerpt.trim() || !blogForm.content.trim()) {
      setBlogError("Please fill in the title, excerpt, and content fields.");
      return;
    }

    setBlogSaving(true);
    setBlogError("");
    const authToken = token || localStorage.getItem("runr_token");

    try {
      const formData = new FormData();
      formData.append("title", blogForm.title.trim());
      formData.append("excerpt", blogForm.excerpt.trim());
      formData.append("content", blogForm.content.trim());
      formData.append("category", blogForm.category);
      formData.append("author", blogForm.author.trim());
      formData.append("readTime", blogForm.readTime.trim());
      formData.append("status", blogForm.status);
      formData.append("isFeatured", String(blogForm.isFeatured));

      if (blogCoverFile) {
        formData.append("coverImage", blogCoverFile);
      }

      const url = editingBlog
        ? `${API_BASE}/admin/blogs/${editingBlog._id}`
        : `${API_BASE}/admin/blogs`;
      const method = editingBlog ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setBlogViewMode("list");
        setEditingBlog(null);
        fetchBlogs(blogStatusFilter, blogCategoryFilter, searchBlog, blogPagination.page);
        // Refresh dashboard overview stats too
        const resStats = await fetch(`${API_BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const dataStats = await resStats.json();
        if (dataStats.success) setStats(dataStats.data);
      } else {
        setBlogError(data.message || "Failed to save blog post.");
      }
    } catch (err) {
      setBlogError("Network error while saving blog.");
    } finally {
      setBlogSaving(false);
    }
  };

  const handleToggleBlogStatus = async (blogId, currentStatus) => {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    // 1. Optimistic instant UI update (Zero latency for the user)
    setBlogsList((prev) =>
      prev.map((b) => (b._id === blogId ? { ...b, status: nextStatus } : b))
    );
    setBlogCounts((prev) => ({
      ...prev,
      published: nextStatus === "published" ? prev.published + 1 : Math.max(0, prev.published - 1),
      draft: nextStatus === "draft" ? prev.draft + 1 : Math.max(0, prev.draft - 1),
    }));

    const authToken = token || localStorage.getItem("runr_token");
    try {
      const res = await fetch(`${API_BASE}/admin/blogs/${blogId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback on failure
        setBlogsList((prev) =>
          prev.map((b) => (b._id === blogId ? { ...b, status: currentStatus } : b))
        );
        setBlogCounts((prev) => ({
          ...prev,
          published: currentStatus === "published" ? prev.published + 1 : Math.max(0, prev.published - 1),
          draft: currentStatus === "draft" ? prev.draft + 1 : Math.max(0, prev.draft - 1),
        }));
        alert(data.message || "Failed to update blog status");
      }
    } catch (err) {
      // Rollback on network error
      setBlogsList((prev) =>
        prev.map((b) => (b._id === blogId ? { ...b, status: currentStatus } : b))
      );
      setBlogCounts((prev) => ({
        ...prev,
        published: currentStatus === "published" ? prev.published + 1 : Math.max(0, prev.published - 1),
        draft: currentStatus === "draft" ? prev.draft + 1 : Math.max(0, prev.draft - 1),
      }));
      alert("Error updating blog status");
    }
  };

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;
    const blogId = blogToDelete._id;
    setActionLoading(blogId);
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const res = await fetch(`${API_BASE}/admin/blogs/${blogId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setBlogsList((prev) => prev.filter((b) => b._id !== blogId));
        setBlogCounts((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          published: blogToDelete.status === "published" ? Math.max(0, prev.published - 1) : prev.published,
          draft: blogToDelete.status === "draft" ? Math.max(0, prev.draft - 1) : prev.draft,
        }));
        setBlogToDelete(null);
      } else {
        alert(data.message || "Failed to delete blog post");
      }
    } catch (err) {
      alert("Error deleting blog post");
    } finally {
      setActionLoading(null);
    }
  };

  // Re-fetch when switching to blogs tab (instant if already loaded)
  useEffect(() => {
    if (activeTab === "blogs" && blogsList.length === 0) {
      fetchBlogs(blogStatusFilter, blogCategoryFilter, searchBlog, 1, true);
    }
  }, [activeTab, fetchBlogs]);

  // Format Date + Time in Asia/Kolkata (IST) Timezone
  const formatISTDateTime = (dateVal) => {
    if (!dateVal) return { date: "—", time: "" };
    try {
      const d = new Date(dateVal);
      const date = d.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const time = d.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return { date, time };
    } catch (e) {
      return { date: "—", time: "" };
    }
  };

  // Check admin authorization
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
        router.push("/login?redirect=/admin/dashboard");
      } else {
        fetchDashboardData();
      }
    }
  }, [user?._id, authLoading]);

  const [propertyCounts, setPropertyCounts] = useState({ total: 0, active: 0, inactive: 0, sold: 0 });
  const [propertyPagination, setPropertyPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  });
  const [propertyStatusFilter, setPropertyStatusFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [listingTypeFilter, setListingTypeFilter] = useState("all");
  const [propertyCityFilter, setPropertyCityFilter] = useState("all");
  const [searchProperty, setSearchProperty] = useState("");
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);
  const [openLeadStatusDropdownId, setOpenLeadStatusDropdownId] = useState(null);

  // User Drawer / Modal & Pagination States
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [userModalLoading, setUserModalLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // { id, name }
  const [bankToDelete, setBankToDelete] = useState(null); // { id, bankName, userName }
  const [pwdModalBank, setPwdModalBank] = useState(null); // { id, bankName, email, userName }
  const [newPwdText, setNewPwdText] = useState("");
  const [showPwdText, setShowPwdText] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userCounts, setUserCounts] = useState({ total: 0, buyer: 0, owner: 0, admin: 0 });
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(`.${styles.customStatusWrap}`)) {
        setOpenStatusDropdownId(null);
        setOpenContactStatusDropdownId(null);
        setOpenLeadStatusDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Re-fetch when switching to contact_leads tab
  useEffect(() => {
    if (activeTab === "contact_leads") {
      fetchContactLeads(contactLeadStatusFilter, searchContactLead, 1);
    }
  }, [activeTab]);

  const fetchProperties = async (
    status = propertyStatusFilter,
    pType = propertyTypeFilter,
    lType = listingTypeFilter,
    city = propertyCityFilter,
    search = searchProperty,
    page = propertyPagination.page
  ) => {
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const query = new URLSearchParams();
      if (status !== "all") query.append("status", status);
      if (pType !== "all") query.append("propertyType", pType);
      if (lType !== "all") query.append("listingType", lType);
      if (city !== "all") query.append("city", city);
      if (search) query.append("search", search);
      query.append("page", String(page));
      query.append("limit", "10");

      const res = await fetch(`${API_BASE}/admin/properties?${query.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setProperties(data.data);
        if (data.counts) setPropertyCounts(data.counts);
        if (data.pagination) setPropertyPagination(data.pagination);
      }
    } catch (err) {
      console.error("Properties fetch error:", err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    const authToken = token || localStorage.getItem("runr_token");
    try {
      // 1. Fetch Stats
      const resStats = await fetch(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const dataStats = await resStats.json();
      if (dataStats.success) setStats(dataStats.data);

      // 2. Fetch Bank Partners
      fetchBankPartners();

      // 3. Fetch Properties
      fetchProperties();

      // 4. Fetch Users
      fetchUsersWithFilters("all", "", 1);

      // 5. Fetch Leads
      fetchLeads("all", "all", "", 1);

      // 6. Fetch Contact Leads
      fetchContactLeads("all", "", 1);

      // 7. Fetch Property Buyer Leads
      fetchPropertyLeads("all", "", 1);
    } catch (err) {
      console.error("Admin data fetch error:", err);
    }
    setLoading(false);
  };

  const fetchLeads = async (
    status = leadStatusFilter,
    bankName = leadBankFilter,
    search = searchLead,
    page = 1,
    limit = 50
  ) => {
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const query = new URLSearchParams();
      if (status !== "all") query.append("status", status);
      if (bankName !== "all") query.append("bankName", bankName);
      if (search) query.append("search", search);
      query.append("page", String(page));
      query.append("limit", String(limit));

      const res = await fetch(`${API_BASE}/admin/leads?${query.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setLeadsList(data.data);
        if (data.counts) setLeadCounts(data.counts);
      }
    } catch (err) {
      console.error("Leads fetch error:", err);
    }
  };

  const handleUpdateLeadStatus = async (leadId, newStatus, notes) => {
    setActionLoading(leadId);
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const body = { status: newStatus };
      if (notes !== undefined) body.notes = notes;

      const res = await fetch(`${API_BASE}/admin/leads/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setLeadsList((prev) =>
          prev.map((l) => (l._id === leadId ? { ...l, ...data.data } : l))
        );
        fetchLeads(leadStatusFilter, leadBankFilter, searchLead, 1);
        const resStats = await fetch(`${API_BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const dataStats = await resStats.json();
        if (dataStats.success) setStats(dataStats.data);
      } else {
        alert(data.message || "Failed to update lead status");
      }
    } catch (err) {
      alert("Error updating lead status");
    }
    setActionLoading(null);
  };

  const fetchContactLeads = async (
    status = contactLeadStatusFilter,
    search = searchContactLead,
    page = contactLeadPagination.page,
    limit = contactLeadPagination.limit || 10
  ) => {
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const query = new URLSearchParams();
      if (status !== "all") query.append("status", status);
      if (search) query.append("search", search);
      query.append("page", String(page));
      query.append("limit", String(limit));

      const res = await fetch(`${API_BASE}/admin/contact-leads?${query.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setContactLeadsList(data.data);
        if (data.counts) setContactLeadCounts(data.counts);
        if (data.pagination) setContactLeadPagination(data.pagination);
      }
    } catch (err) {
      console.error("Contact leads fetch error:", err);
    }
  };

  const handleUpdateContactLeadStatus = async (leadId, newStatus, notes) => {
    setActionLoading(leadId);
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const body = { status: newStatus };
      if (notes !== undefined) body.notes = notes;

      const res = await fetch(`${API_BASE}/admin/contact-leads/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setContactLeadsList((prev) =>
          prev.map((l) => (l._id === leadId ? { ...l, ...data.data } : l))
        );
        if (selectedContactLead && selectedContactLead._id === leadId) {
          setSelectedContactLead((prev) => ({ ...prev, ...data.data }));
        }
        // Refresh overview stats & counts
        fetchContactLeads();
        const resStats = await fetch(`${API_BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const dataStats = await resStats.json();
        if (dataStats.success) setStats(dataStats.data);
      } else {
        alert(data.message || "Failed to update lead status");
      }
    } catch (err) {
      alert("Error updating lead status");
    }
    setActionLoading(null);
  };

  const handleDeleteContactLead = async () => {
    if (!contactLeadToDelete) return;
    const leadId = contactLeadToDelete.id;

    setActionLoading(leadId);
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const res = await fetch(`${API_BASE}/admin/contact-leads/${leadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setContactLeadsList((prev) => prev.filter((l) => l._id !== leadId));
        setContactLeadPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        if (selectedContactLead && selectedContactLead._id === leadId) {
          setSelectedContactLead(null);
        }
        setContactLeadToDelete(null);
        fetchContactLeads();
        // Refresh overview stats
        const resStats = await fetch(`${API_BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const dataStats = await resStats.json();
        if (dataStats.success) setStats(dataStats.data);
      } else {
        alert(data.message || "Failed to delete lead");
      }
    } catch (err) {
      alert("Error deleting lead");
    }
    setActionLoading(null);
  };

  const fetchPropertyLeads = async (
    status = propertyLeadStatusFilter,
    search = searchPropertyLead,
    page = 1,
    limit = 10
  ) => {
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const query = new URLSearchParams();
      if (status !== "all") query.append("status", status);
      if (search) query.append("search", search);
      query.append("page", String(page));
      query.append("limit", String(limit));

      const res = await fetch(`${API_BASE}/admin/property-enquiries?${query.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setPropertyLeadsList(data.data);
        if (data.counts) setPropertyLeadCounts(data.counts);
        if (data.pagination) setPropertyLeadPagination(data.pagination);
      }
    } catch (err) {
      console.error("Property leads fetch error:", err);
    }
  };

  const handleUpdatePropertyLeadStatus = async (leadId, newStatus) => {
    setActionLoading(leadId);
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const res = await fetch(`${API_BASE}/admin/property-enquiries/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPropertyLeadsList((prev) =>
          prev.map((l) => (l._id === leadId ? { ...l, ...data.data } : l))
        );
        if (selectedPropertyLead && selectedPropertyLead._id === leadId) {
          setSelectedPropertyLead((prev) => ({ ...prev, ...data.data }));
        }
        fetchPropertyLeads();
        const resStats = await fetch(`${API_BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const dataStats = await resStats.json();
        if (dataStats.success) setStats(dataStats.data);
      } else {
        alert(data.message || "Failed to update enquiry status");
      }
    } catch (err) {
      alert("Error updating enquiry status");
    }
    setActionLoading(null);
  };

  const handleDeletePropertyLead = async () => {
    if (!propertyLeadToDelete) return;
    const leadId = propertyLeadToDelete.id;

    setActionLoading(leadId);
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const res = await fetch(`${API_BASE}/admin/property-enquiries/${leadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setPropertyLeadsList((prev) => prev.filter((l) => l._id !== leadId));
        setPropertyLeadPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        if (selectedPropertyLead && selectedPropertyLead._id === leadId) {
          setSelectedPropertyLead(null);
        }
        setPropertyLeadToDelete(null);
        fetchPropertyLeads();
        const resStats = await fetch(`${API_BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const dataStats = await resStats.json();
        if (dataStats.success) setStats(dataStats.data);
      } else {
        alert(data.message || "Failed to delete enquiry");
      }
    } catch (err) {
      alert("Error deleting enquiry");
    }
    setActionLoading(null);
  };

  const fetchBankPartners = async (status = bankFilter, search = searchBank) => {
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const query = new URLSearchParams();
      if (status !== "all") query.append("status", status);
      if (search) query.append("search", search);

      const res = await fetch(`${API_BASE}/admin/bank-partners?${query.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) setBanks(data.data);
    } catch (err) {
      console.error("Bank partners fetch error:", err);
    }
  };

  const handleUpdateBankStatus = async (bankId, newStatus, currentActive) => {
    setActionLoading(bankId);
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const res = await fetch(`${API_BASE}/admin/bank-partners/${bankId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: newStatus,
          isActive: currentActive !== undefined ? !currentActive : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh local list
        setBanks((prev) =>
          prev.map((b) => (b._id === bankId ? { ...b, ...data.data } : b))
        );
        // Refresh overview stats
        const resStats = await fetch(`${API_BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const dataStats = await resStats.json();
        if (dataStats.success) setStats(dataStats.data);
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      alert("Error updating status");
    }
    setActionLoading(null);
  };

  const handleDeleteBankPartner = async () => {
    if (!bankToDelete) return;
    const bankId = bankToDelete.id;
    setActionLoading(bankId);
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const res = await fetch(`${API_BASE}/admin/bank-partners/${bankId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setBanks((prev) => prev.filter((b) => b._id !== bankId));
        setBankToDelete(null);
        // Refresh overview stats
        const resStats = await fetch(`${API_BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const dataStats = await resStats.json();
        if (dataStats.success) setStats(dataStats.data);
      } else {
        alert(data.message || "Failed to delete bank partner");
      }
    } catch (err) {
      alert("Error deleting bank partner");
    }
    setActionLoading(null);
  };

  const handleSaveBankPassword = async () => {
    setPwdError("");
    if (!pwdModalBank || !newPwdText || newPwdText.trim().length < 6) {
      setPwdError("Password must be at least 6 characters long");
      return;
    }
    setPwdLoading(true);
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const res = await fetch(`${API_BASE}/admin/bank-partners/${pwdModalBank.id}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          newPassword: newPwdText.trim(),
          email: pwdModalBank.email,
          name: pwdModalBank.userName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBanks((prev) =>
          prev.map((b) =>
            b._id === pwdModalBank.id
              ? {
                  ...b,
                  plainPassword: newPwdText.trim(),
                  userId: data.user ? { ...b.userId, ...data.user } : b.userId,
                }
              : b
          )
        );
        setPwdModalBank(null);
        setNewPwdText("");
        setPwdError("");
      } else {
        setPwdError(data.message || "Failed to update password");
      }
    } catch (err) {
      setPwdError("Error updating password. Please try again.");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleUpdatePropertyStatus = async (propertyId, newStatus) => {
    setActionLoading(propertyId);
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const res = await fetch(`${API_BASE}/admin/properties/${propertyId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local property list
        setProperties((prev) =>
          prev.map((p) => (p._id === propertyId ? { ...p, status: newStatus } : p))
        );
        // Refresh property counts
        fetchProperties();
      } else {
        alert(data.message || "Failed to update property status");
      }
    } catch (err) {
      alert("Error updating property status");
    }
    setActionLoading(null);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setActionLoading(userId);
    const authToken = token || localStorage.getItem("runr_token");
    const newStatus = !currentStatus;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: newStatus } : u))
        );
        // If modal is open for this user, update it too
        setSelectedUserDetail((prev) =>
          prev && prev.user && prev.user._id === userId
            ? { ...prev, user: { ...prev.user, isActive: newStatus } }
            : prev
        );
      } else {
        alert(data.message || "Failed to update user status");
      }
    } catch (err) {
      alert("Error updating user status");
    }
    setActionLoading(null);
  };

  const handleConfirmSoftDelete = async () => {
    if (!userToDelete) return;
    const userId = userToDelete.id;

    setActionLoading(userId);
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) => prev.filter((u) => u._id !== userId));
        setUserPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        if (selectedUserDetail && selectedUserDetail.user?._id === userId) {
          setSelectedUserDetail(null);
        }
        setUserToDelete(null);
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      alert("Error deleting user");
    }
    setActionLoading(null);
  };

  const fetchUsersWithFilters = async (
    role = userRoleFilter,
    search = searchUser,
    page = userPagination.page
  ) => {
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const query = new URLSearchParams();
      if (role !== "all") query.append("role", role);
      if (search) query.append("search", search);
      query.append("page", String(page));
      query.append("limit", "10");

      const res = await fetch(`${API_BASE}/admin/users?${query.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.data);
        if (data.counts) {
          setUserCounts(data.counts);
        }
        if (data.pagination) {
          setUserPagination(data.pagination);
        }
      }
    } catch (err) {
      console.error("Users fetch error:", err);
    }
  };

  const fetchUserDetails = async (userId) => {
    setUserModalLoading(true);
    setSelectedUserDetail({ loading: true });
    const authToken = token || localStorage.getItem("runr_token");
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/details`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedUserDetail(data.data);
      } else {
        alert(data.message || "Failed to fetch user details");
        setSelectedUserDetail(null);
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      alert("Error fetching user details");
      setSelectedUserDetail(null);
    }
    setUserModalLoading(false);
  };

  if (authLoading || (!user && loading)) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <p>Verifying Admin Access...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Admin Sidebar with Site Logo & Clean Theme */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <a href="/" className={styles.brandWrap}>
            <img src="/logo/runr-logo-new.svg" alt="RunR Properties" className={styles.brandLogo} />
          </a>
          <div className={styles.adminBadgeRow}>
            <span className={styles.adminBadge}>Admin Portal</span>
            <a href="/" className={styles.viewSiteLink} title="View Live Website">
              Live Site ↗
            </a>
          </div>
        </div>

        <nav className={styles.navMenu}>
          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "overview" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.navIcon}>
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "bank_partners" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("bank_partners")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.navIcon}>
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
            </svg>
            <span>Bank Partners</span>
            {stats?.pendingBanks > 0 && (
              <span className={styles.navBadge}>{stats.pendingBanks}</span>
            )}
          </button>
          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "properties" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("properties")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.navIcon}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Properties</span>
          </button>
          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "users" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.navIcon}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Users</span>
          </button>
          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "leads" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("leads")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.navIcon}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>Loan Leads</span>
          </button>
          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "contact_leads" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("contact_leads")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.navIcon}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Contact Leads</span>
            {stats?.newContactLeads > 0 && (
              <span className={styles.navBadge} style={{ background: "#ef4444", color: "#ffffff" }}>
                {stats.newContactLeads}
              </span>
            )}
          </button>
          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "property_leads" ? styles.navItemActive : ""}`}
            onClick={() => {
              setActiveTab("property_leads");
              fetchPropertyLeads("all", "", 1);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.navIcon}>
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span>Property Leads</span>
            {(stats?.pendingPropertyEnquiries > 0 || propertyLeadCounts?.pending > 0) && (
              <span className={styles.navBadge} style={{ background: "#0284c7", color: "#ffffff" }}>
                {stats?.pendingPropertyEnquiries ?? propertyLeadCounts?.pending}
              </span>
            )}
          </button>
          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "blogs" ? styles.navItemActive : ""}`}
            onClick={() => {
              setBlogViewMode("list");
              setActiveTab("blogs");
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.navIcon}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <line x1="8" y1="7" x2="16" y2="7" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span>Blogs & Insights</span>
            {blogCounts?.draft > 0 && (
              <span className={styles.navBadge} style={{ background: "#f59e0b", color: "#ffffff" }}>
                {blogCounts.draft}
              </span>
            )}
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminProfile}>
            <div className={styles.adminAvatar}>
              {(user?.name || "A").slice(0, 1).toUpperCase()}
            </div>
            <div className={styles.adminInfo}>
              <span className={styles.adminName}>{user?.name || "Admin"}</span>
              <span className={styles.adminRole}>Super Administrator</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className={styles.mainContent}>
        {/* 1. DASHBOARD OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* Dashboard Welcome & Live Platform Metrics Hero Banner */}
            <div className={styles.dashboardHero}>
              <div className={styles.heroGreetingWrap}>
                <div className={styles.heroBadge}>
                  <span className={styles.liveDot} style={{ background: "#4ade80" }} />
                  RunR Live Control Hub
                </div>
                <h2 className={styles.heroTitle}>
                  Welcome back, {user?.name || "Administrator"} 👋
                </h2>
                <p className={styles.heroSubtitle}>
                  Real-time overview of platform activity, property inventory, loan inquiries, and banking partner operations.
                </p>
              </div>

              <div className={styles.heroMetricsRow}>
                <div className={styles.heroMetricPill}>
                  <span className={styles.heroMetricPillLabel}>💼 Loan Volume</span>
                  <span className={styles.heroMetricPillValue}>
                    ₹ {stats?.totalLoanVolume ? (stats.totalLoanVolume >= 10000000 ? `${(stats.totalLoanVolume / 10000000).toFixed(2)} Cr` : stats.totalLoanVolume.toLocaleString("en-IN")) : "—"}
                  </span>
                </div>
                <div className={styles.heroMetricPill}>
                  <span className={styles.heroMetricPillLabel}>🏠 Active Listings</span>
                  <span className={styles.heroMetricPillValue}>
                    {stats?.activeProperties ?? stats?.totalProperties ?? 0} Properties
                  </span>
                </div>
                <div className={styles.heroMetricPill}>
                  <span className={styles.heroMetricPillLabel}>🏦 Bank Network</span>
                  <span className={styles.heroMetricPillValue}>
                    {stats?.approvedBanks ?? stats?.totalBanks ?? 0} Partners
                  </span>
                </div>
              </div>
            </div>

            {/* Clickable Interactive KPI Cards */}
            <div className={styles.statsGrid}>
              <button
                type="button"
                className={styles.statCard}
                onClick={() => {
                  setActiveTab("bank_partners");
                  setBankFilter(stats?.pendingBanks > 0 ? "pending" : "all");
                }}
                title="Click to view Bank Partners"
              >
                <div className={styles.statCardLeft}>
                  <div className={styles.statIconWrap} style={{ background: "#e0f2fe", color: "#007bbd" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={styles.statValue}>{stats?.totalBanks ?? 0}</h3>
                    <p className={styles.statLabel} style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                      <span>Bank Partners</span>
                      {stats?.pendingBanks > 0 ? (
                        <span style={{ color: "#d97706", fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                          ({stats.pendingBanks} Pending)
                        </span>
                      ) : (
                        <span style={{ color: "#10b981", fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                          ({stats?.approvedBanks ?? 0} Active)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className={styles.statArrow}>→</div>
              </button>

              <button
                type="button"
                className={styles.statCard}
                onClick={() => setActiveTab("properties")}
                title="Click to view Properties"
              >
                <div className={styles.statCardLeft}>
                  <div className={styles.statIconWrap} style={{ background: "#ecfdf5", color: "#10b981" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={styles.statValue}>{stats?.totalProperties ?? 0}</h3>
                    <p className={styles.statLabel} style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                      <span>Total Properties</span>
                      <span style={{ color: "#10b981", fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                        ({stats?.activeProperties ?? 0} Active)
                      </span>
                    </p>
                  </div>
                </div>
                <div className={styles.statArrow}>→</div>
              </button>

              <button
                type="button"
                className={styles.statCard}
                onClick={() => setActiveTab("users")}
                title="Click to view Users (Buyers & Owners)"
              >
                <div className={styles.statCardLeft}>
                  <div className={styles.statIconWrap} style={{ background: "#fffbeb", color: "#f59e0b" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={styles.statValue}>{stats?.totalUsers ?? 0}</h3>
                    <p className={styles.statLabel} style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap", marginTop: "3px" }}>
                      <span style={{ color: "#475569", fontWeight: 700 }}>Users:</span>
                      <span style={{ color: "#0284c7", fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                        {stats?.totalBuyers ?? userCounts?.buyer ?? 0} Buyers
                      </span>
                      <span style={{ color: "#cbd5e1" }}>•</span>
                      <span style={{ color: "#d97706", fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                        {stats?.totalOwners ?? userCounts?.owner ?? 0} Owners
                      </span>
                    </p>
                  </div>
                </div>
                <div className={styles.statArrow}>→</div>
              </button>

              <button
                type="button"
                className={styles.statCard}
                onClick={() => {
                  setActiveTab("leads");
                  fetchLeads("all", "all", "", 1);
                }}
                title="Click to view Loan Volume & Pipeline"
              >
                <div className={styles.statCardLeft}>
                  <div className={styles.statIconWrap} style={{ background: "#fdf2f8", color: "#db2777" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={styles.statValue}>
                      {stats?.totalLoanVolume
                        ? stats.totalLoanVolume >= 10000000
                          ? `₹ ${(stats.totalLoanVolume / 10000000).toFixed(2)} Cr`
                          : `₹ ${stats.totalLoanVolume.toLocaleString("en-IN")}`
                        : "₹ 0"}
                    </h3>
                    <p className={styles.statLabel} style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                      <span>Loan Volume</span>
                      <span style={{ color: "#db2777", fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                        (Live Pipeline)
                      </span>
                    </p>
                  </div>
                </div>
                <div className={styles.statArrow}>→</div>
              </button>

              <button
                type="button"
                className={styles.statCard}
                onClick={() => {
                  setActiveTab("leads");
                  fetchLeads("all", "all", "", 1);
                }}
                title="Click to view Loan Leads"
              >
                <div className={styles.statCardLeft}>
                  <div className={styles.statIconWrap} style={{ background: "#f5f3ff", color: "#8b5cf6" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={styles.statValue}>{stats?.totalLeads ?? 0}</h3>
                    <p className={styles.statLabel} style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                      <span>Total Loan Leads</span>
                      {stats?.pendingLeads > 0 && (
                        <span style={{ color: "#d97706", fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                          ({stats.pendingLeads} Pending)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className={styles.statArrow}>→</div>
              </button>

              <button
                type="button"
                className={styles.statCard}
                onClick={() => {
                  setActiveTab("property_leads");
                  fetchPropertyLeads("all", "", 1);
                }}
                title="Click to view Property Enquiries & Buyer Leads"
              >
                <div className={styles.statCardLeft}>
                  <div className={styles.statIconWrap} style={{ background: "#e0f2fe", color: "#0284c7" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={styles.statValue}>{stats?.totalEnquiries ?? 0}</h3>
                    <p className={styles.statLabel} style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                      <span>Property Leads</span>
                      {stats?.pendingPropertyEnquiries > 0 && (
                        <span style={{ color: "#0284c7", fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                          ({stats.pendingPropertyEnquiries} Pending)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className={styles.statArrow}>→</div>
              </button>

              <button
                type="button"
                className={styles.statCard}
                onClick={() => {
                  setActiveTab("contact_leads");
                  fetchContactLeads(contactLeadStatusFilter, searchContactLead, 1);
                }}
                title="Click to view Contact Leads"
              >
                <div className={styles.statCardLeft}>
                  <div className={styles.statIconWrap} style={{ background: "#ecfeff", color: "#0891b2" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={styles.statValue}>{stats?.totalContactLeads ?? 0}</h3>
                    <p className={styles.statLabel} style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                      <span>Contact Leads</span>
                      {stats?.newContactLeads > 0 && (
                        <span style={{ color: "#ef4444", fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                          ({stats.newContactLeads} New)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className={styles.statArrow}>→</div>
              </button>

              <button
                type="button"
                className={styles.statCard}
                onClick={() => {
                  setActiveTab("blogs");
                  fetchBlogs("all", "all", "", 1);
                }}
                title="Click to view Blogs & Insights"
              >
                <div className={styles.statCardLeft}>
                  <div className={styles.statIconWrap} style={{ background: "#fef3c7", color: "#d97706" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      <line x1="8" y1="7" x2="16" y2="7" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={styles.statValue}>{stats?.totalBlogs ?? 0}</h3>
                    <p className={styles.statLabel} style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                      <span>Blogs & Insights</span>
                      <span style={{ color: "#10b981", fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                        ({stats?.publishedBlogs ?? 0} Live)
                      </span>
                    </p>
                  </div>
                </div>
                <div className={styles.statArrow}>→</div>
              </button>
            </div>

            {/* DASHBOARD ROW 1: Real Customer Loan Leads Feed & Bank Distribution */}
            <div className={styles.dashboardGrid2Col}>
              {/* Left Widget: Recent Loan Leads Live Feed */}
              <div className={styles.widgetCard}>
                <div className={styles.widgetHeader}>
                  <div className={styles.widgetTitleWrap}>
                    <div className={styles.widgetIconBox} style={{ background: "#f0f9ff", color: "#007bbd" }}>
                      🔥
                    </div>
                    <div>
                      <h3 className={styles.widgetTitle}>Recent Loan Enquiries</h3>
                      <p className={styles.widgetSubtitle}>Live applicant submissions and target bank status</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.btnViewAll}
                    onClick={() => {
                      setActiveTab("leads");
                      fetchLeads("all", "all", "", 1);
                    }}
                  >
                    View All Leads ({stats?.totalLeads ?? leadsList.length}) →
                  </button>
                </div>

                <div className={styles.leadFeedList}>
                  {(stats?.recentLeads || leadsList.slice(0, 5)).length === 0 ? (
                    <div style={{ textAlign: "center", color: "#94a3b8", padding: "28px" }}>
                      No loan applications received yet.
                    </div>
                  ) : (
                    (stats?.recentLeads || leadsList.slice(0, 5)).map((lead) => {
                      const dt = formatISTDateTime(lead.createdAt);
                      const currentStatus = lead.status || "pending";
                      return (
                        <div key={lead._id} className={styles.leadFeedItem}>
                          <div className={styles.leadFeedLeft}>
                            <div className={styles.leadFeedAvatar}>
                              {(lead.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h4 className={styles.leadFeedName}>{lead.name}</h4>
                              <div className={styles.leadFeedMeta}>
                                <span className={styles.leadFeedBankBadge}>
                                  🏦 {lead.bankName || "Bank"}
                                </span>
                                {lead.propertyTitle && (
                                  <span style={{ color: "#475569", fontWeight: 600, fontSize: "0.74rem" }}>
                                    • {lead.propertyTitle}
                                  </span>
                                )}
                                <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                                  • {dt.date}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className={styles.leadFeedRight}>
                            <div className={styles.leadFeedAmount}>
                              ₹ {lead.loanAmount ? Number(lead.loanAmount).toLocaleString("en-IN") : "—"}
                            </div>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "12px",
                                textTransform: "capitalize",
                                background: (currentStatus === "approved" || currentStatus === "closed_won") ? "#ecfdf5" : (currentStatus === "rejected" || currentStatus === "closed_lost") ? "#fef2f2" : "#fffbeb",
                                color: (currentStatus === "approved" || currentStatus === "closed_won") ? "#059669" : (currentStatus === "rejected" || currentStatus === "closed_lost") ? "#dc2626" : "#d97706",
                                border: (currentStatus === "approved" || currentStatus === "closed_won") ? "1px solid #a7f3d0" : (currentStatus === "rejected" || currentStatus === "closed_lost") ? "1px solid #fecaca" : "1px solid #fde68a",
                              }}
                            >
                              {currentStatus}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Widget: Bank Partner Distribution & Volume */}
              <div className={styles.widgetCard}>
                <div className={styles.widgetHeader}>
                  <div className={styles.widgetTitleWrap}>
                    <div className={styles.widgetIconBox} style={{ background: "#eff6ff", color: "#2563eb" }}>
                      🏦
                    </div>
                    <div>
                      <h3 className={styles.widgetTitle}>Bank Lead Distribution</h3>
                      <p className={styles.widgetSubtitle}>Share of applications across partner banks</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.btnViewAll}
                    onClick={() => {
                      setActiveTab("bank_partners");
                      setBankFilter("all");
                    }}
                  >
                    Partners ({stats?.totalBanks ?? banks.length}) →
                  </button>
                </div>

                <div className={styles.bankDistList}>
                  {(!stats?.bankWiseLeads || stats.bankWiseLeads.length === 0) ? (
                    <div style={{ textAlign: "center", color: "#94a3b8", padding: "28px" }}>
                      No partner banks lead distribution yet.
                    </div>
                  ) : (
                    stats.bankWiseLeads.map((b) => {
                      const totalCount = stats.totalLeads || 1;
                      const percentage = Math.min(100, Math.round((b.count / totalCount) * 100));
                      return (
                        <div key={b._id || "Other"} className={styles.bankDistItem}>
                          <div className={styles.bankDistHeader}>
                            <span className={styles.bankDistName}>{b._id || "Direct / Other"}</span>
                            <span className={styles.bankDistCount}>
                              {b.count} {b.count === 1 ? "Lead" : "Leads"} ({percentage}%)
                            </span>
                          </div>
                          <div className={styles.bankProgressBarTrack}>
                            <div
                              className={styles.bankProgressBarFill}
                              style={{ width: `${Math.max(5, percentage)}%` }}
                            />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b" }}>
                            <span>Demand Volume</span>
                            <strong style={{ color: "#007bbd" }}>
                              ₹ {b.totalVolume ? (b.totalVolume >= 10000000 ? `${(b.totalVolume / 10000000).toFixed(2)} Cr` : Number(b.totalVolume).toLocaleString("en-IN")) : "0"}
                            </strong>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* DASHBOARD ROW 2: Recently Listed Properties & Platform Action Center */}
            <div className={styles.dashboardGrid2Col}>
              {/* Left Widget: Recent Properties Grid */}
              <div className={styles.widgetCard}>
                <div className={styles.widgetHeader}>
                  <div className={styles.widgetTitleWrap}>
                    <div className={styles.widgetIconBox} style={{ background: "#ecfdf5", color: "#059669" }}>
                      🏡
                    </div>
                    <div>
                      <h3 className={styles.widgetTitle}>Recently Listed Properties</h3>
                      <p className={styles.widgetSubtitle}>Latest residential & commercial listings on RunR</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.btnViewAll}
                    onClick={() => setActiveTab("properties")}
                  >
                    All Properties ({stats?.totalProperties ?? properties.length}) →
                  </button>
                </div>

                <div className={styles.recentPropGrid}>
                  {(stats?.recentProperties || properties.slice(0, 4)).length === 0 ? (
                    <div style={{ textAlign: "center", color: "#94a3b8", padding: "28px", gridColumn: "1 / -1" }}>
                      No properties listed yet.
                    </div>
                  ) : (
                    (stats?.recentProperties || properties.slice(0, 4)).map((prop) => (
                      <a
                        key={prop._id}
                        href={`/property/${prop._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.recentPropCard}
                        title="Click to preview property"
                      >
                        <div className={styles.recentPropCardTop}>
                          <span className={styles.recentPropTypeBadge}>
                            {prop.propertyType || "Property"}
                          </span>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              background: prop.status === "active" ? "#ecfdf5" : "#fef2f2",
                              color: prop.status === "active" ? "#059669" : "#dc2626",
                            }}
                          >
                            {prop.status || "Active"}
                          </span>
                        </div>

                        <h4 className={styles.recentPropTitle}>{prop.title}</h4>
                        <p className={styles.recentPropLoc}>
                          📍 {prop.locality ? `${prop.locality}, ` : ""}{prop.city || "—"}
                        </p>
                        <div className={styles.recentPropPrice}>
                          ₹ {prop.price ? Number(prop.price).toLocaleString("en-IN") : "—"}
                          {prop.listingType === "rent" && (
                            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500 }}> /mo</span>
                          )}
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>

              {/* Right Widget: Platform Action Center & Pending Approvals */}
              <div className={styles.widgetCard}>
                <div className={styles.widgetHeader}>
                  <div className={styles.widgetTitleWrap}>
                    <div className={styles.widgetIconBox} style={{ background: "#fffbeb", color: "#d97706" }}>
                      ⚡
                    </div>
                    <div>
                      <h3 className={styles.widgetTitle}>Platform Action Center</h3>
                      <p className={styles.widgetSubtitle}>Pending approvals & quick admin controls</p>
                    </div>
                  </div>
                </div>

                {/* Pending Bank Approvals Sub-section */}
                {banks.filter((b) => b.status === "pending").length > 0 ? (
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "14px", padding: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <strong style={{ fontSize: "0.85rem", color: "#92400e" }}>
                        ⚠️ {banks.filter((b) => b.status === "pending").length} Pending Bank Approvals
                      </strong>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("bank_partners");
                          setBankFilter("pending");
                        }}
                        style={{ background: "none", border: "none", color: "#d97706", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}
                      >
                        View All →
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {banks.filter((b) => b.status === "pending").slice(0, 2).map((b) => (
                        <div key={b._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #fef3c7" }}>
                          <div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>{b.bankName}</div>
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{b.userId?.email || "—"}</div>
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              className={styles.btnApprove}
                              style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                              disabled={actionLoading === b._id}
                              onClick={() => handleUpdateBankStatus(b._id, "approved")}
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              className={styles.btnReject}
                              style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                              disabled={actionLoading === b._id}
                              onClick={() => handleUpdateBankStatus(b._id, "rejected")}
                            >
                              ✗
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.allClearCard}>
                    <div className={styles.allClearIcon}>🛡️</div>
                    <h4 className={styles.allClearTitle}>All Bank Partners Verified</h4>
                    <p className={styles.allClearDesc}>
                      No pending onboarding requests. All {stats?.approvedBanks ?? banks.length} bank partners are active and operational.
                    </p>
                  </div>
                )}

                {/* 2x2 Quick Shortcuts Hub */}
                <div className={styles.quickActionGrid}>
                  <button
                    type="button"
                    className={styles.quickActionTile}
                    onClick={() => {
                      setActiveTab("leads");
                      fetchLeads("all", "all", "", 1);
                    }}
                  >
                    <div className={styles.quickActionIcon} style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                      📑
                    </div>
                    <div className={styles.quickActionTextWrap}>
                      <span className={styles.quickActionLabel}>Loan Leads</span>
                      <span className={styles.quickActionDesc}>Manage applications</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={styles.quickActionTile}
                    onClick={() => setActiveTab("properties")}
                  >
                    <div className={styles.quickActionIcon} style={{ background: "#ecfdf5", color: "#059669" }}>
                      🏘️
                    </div>
                    <div className={styles.quickActionTextWrap}>
                      <span className={styles.quickActionLabel}>Properties</span>
                      <span className={styles.quickActionDesc}>Moderate listings</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={styles.quickActionTile}
                    onClick={() => {
                      setActiveTab("bank_partners");
                      setBankFilter("all");
                    }}
                  >
                    <div className={styles.quickActionIcon} style={{ background: "#e0f2fe", color: "#0284c7" }}>
                      🏦
                    </div>
                    <div className={styles.quickActionTextWrap}>
                      <span className={styles.quickActionLabel}>Banks Hub</span>
                      <span className={styles.quickActionDesc}>Offers & logins</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={styles.quickActionTile}
                    onClick={() => {
                      setActiveTab("contact_leads");
                      fetchContactLeads(contactLeadStatusFilter, searchContactLead, 1);
                    }}
                  >
                    <div className={styles.quickActionIcon} style={{ background: "#ecfeff", color: "#0891b2" }}>
                      💬
                    </div>
                    <div className={styles.quickActionTextWrap}>
                      <span className={styles.quickActionLabel}>Inquiries</span>
                      <span className={styles.quickActionDesc}>Customer queries</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 2. BANK PARTNERS TAB */}
        {activeTab === "bank_partners" && (
          <div className={styles.panel}>
            <div className={styles.toolbarHeader}>
              <div>
                <h2 className={styles.panelTitle}>Bank Partners Management</h2>
                <p className={styles.panelSubtitle}>
                  Showing {banks.length} registered bank partners and lending institutions
                </p>
              </div>
              <div className={styles.filterGroup}>
                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    name="adminBankPartnerSearchFilter"
                    id="adminBankPartnerSearchFilter"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    placeholder="Search Bank Name..."
                    value={searchBank}
                    onChange={(e) => {
                      setSearchBank(e.target.value);
                      fetchBankPartners(bankFilter, e.target.value);
                    }}
                    className={styles.searchInputWithIcon}
                  />
                  {searchBank && (
                    <button
                      type="button"
                      className={styles.searchClearBtn}
                      onClick={() => {
                        setSearchBank("");
                        fetchBankPartners(bankFilter, "");
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
                <select
                  value={bankFilter}
                  onChange={(e) => {
                    setBankFilter(e.target.value);
                    fetchBankPartners(e.target.value, searchBank);
                  }}
                  className={styles.filterSelect}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thNumber}>#</th>
                    <th className={styles.bankThName}>Bank Name</th>
                    <th className={styles.bankThCred}>Login Account / Credentials</th>
                    <th className={styles.bankThRate}>Rate / Loan Type</th>
                    <th className={styles.bankThStatus}>Status</th>
                    <th className={styles.bankThReqDate}>Requested Date</th>
                    <th className={styles.bankThApproveDate}>Approved Date</th>
                    <th className={styles.bankThAction}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banks.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>
                        No bank partners found matching filter.
                      </td>
                    </tr>
                  ) : (
                    banks.map((b, index) => {
                      const reqDt = formatISTDateTime(b.createdAt || b.userId?.createdAt);
                      const approveDateVal = b.approvedAt || (b.status === "approved" ? b.updatedAt || b.createdAt : null);
                      const appDt = b.status === "approved" && approveDateVal ? formatISTDateTime(approveDateVal) : null;
                      const isOnline = b.isActive && b.userId?.isActive !== false;
                      return (
                        <tr key={b._id}>
                          <td className={styles.tdNumber}>{index + 1}</td>
                          <td>
                            <div className={styles.bankNameWrap}>
                              <div className={styles.bankNameIcon}>🏦</div>
                              <div className={styles.bankNameInfo}>
                                <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>{b.bankName}</strong>
                                {b.tagline && <div style={{ fontSize: "0.76rem", color: "#64748b" }}>{b.tagline}</div>}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className={styles.bankUserCredWrap}>
                              <div className={styles.bankUserAvatar}>
                                {(b.userId?.name || b.bankName || "B").slice(0, 1).toUpperCase()}
                              </div>
                              <div className={styles.credCellBox}>
                                <div className={styles.credHeaderRow}>
                                  <span className={styles.credUserName}>{b.userId?.name || "—"}</span>
                                  <button
                                    type="button"
                                    className={styles.btnKeyPassword}
                                    onClick={() => {
                                      setPwdModalBank({
                                        id: b._id,
                                        bankName: b.bankName,
                                        email: b.userId?.email || "No email",
                                        userName: b.userId?.name || b.bankName,
                                        currentPassword: b.plainPassword || "",
                                      });
                                      setNewPwdText(b.plainPassword || "");
                                      setShowPwdText(false);
                                      setPwdError("");
                                    }}
                                    title="Set or reset login password for this bank partner"
                                  >
                                    🔑 Set Password
                                  </button>
                                </div>
                                <div className={styles.credContactRow}>
                                  <span className={styles.credEmailItem}>
                                    ✉ {b.userId?.email || "No email"}
                                  </span>
                                  {b.userId?.mobile && (
                                    <>
                                      <span className={styles.credDotDivider}>•</span>
                                      <span className={styles.credPhoneItem}>
                                        📞 {b.userId.mobile}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>{b.interestRate ? `${b.interestRate}% p.a.` : "—"}</div>
                            <div style={{ fontSize: "0.76rem", color: "#64748b" }}>{b.loanType || "Home Loan"}</div>
                          </td>
                          <td>
                            {b.status === "approved" ? (
                              b.isActive ? (
                                <span className={styles.statusApproved}>Approved</span>
                              ) : (
                                <span className={styles.statusInactive}>Disabled</span>
                              )
                            ) : b.status === "pending" ? (
                              <span className={styles.statusPending}>Pending</span>
                            ) : (
                              <span className={styles.statusRejected}>Rejected</span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600 }}>{reqDt.date}</div>
                            {reqDt.time && <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{reqDt.time}</div>}
                          </td>
                          <td>
                            {b.status === "approved" ? (
                              appDt ? (
                                <>
                                  <div style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600 }}>{appDt.date}</div>
                                  {appDt.time && <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{appDt.time}</div>}
                                </>
                              ) : (
                                <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>Approved</span>
                              )
                            ) : b.status === "pending" ? (
                              <span style={{ fontSize: "0.74rem", color: "#b45309", fontWeight: 600, background: "#fef3c7", padding: "2px 8px", borderRadius: "6px", border: "1px solid #fde68a" }}>
                                Awaiting
                              </span>
                            ) : (
                              <span style={{ fontSize: "0.74rem", color: "#dc2626", fontWeight: 600, background: "#fee2e2", padding: "2px 8px", borderRadius: "6px", border: "1px solid #fca5a5" }}>
                                Rejected
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center" }}>
                              {b.status === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    className={styles.btnApprove}
                                    disabled={actionLoading === b._id}
                                    onClick={() => handleUpdateBankStatus(b._id, "approved")}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.btnReject}
                                    disabled={actionLoading === b._id}
                                    onClick={() => handleUpdateBankStatus(b._id, "rejected")}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {b.status === "approved" && (
                                <button
                                  type="button"
                                  className={b.isActive ? styles.btnDisable : styles.btnEnable}
                                  disabled={actionLoading === b._id}
                                  onClick={() => handleUpdateBankStatus(b._id, undefined, b.isActive)}
                                >
                                  {b.isActive ? "Disable" : "Enable"}
                                </button>
                              )}
                              {b.status === "rejected" && (
                                <button
                                  type="button"
                                  className={styles.btnApprove}
                                  disabled={actionLoading === b._id}
                                  onClick={() => handleUpdateBankStatus(b._id, "approved")}
                                >
                                  Re-Approve
                                </button>
                              )}
                              <button
                                type="button"
                                className={styles.btnSoftDeleteUser}
                                title="Delete Bank Partner (Soft Delete)"
                                disabled={actionLoading === b._id}
                                onClick={() =>
                                  setBankToDelete({
                                    id: b._id,
                                    bankName: b.bankName,
                                    userName: b.userId?.name || "Partner",
                                  })
                                }
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={styles.deleteIconSvg}
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. PROPERTIES TAB */}
        {activeTab === "properties" && (
          <div className={styles.panel}>
            {/* Top Toolbar: Title & Search/Filters in balanced rows */}
            <div className={styles.toolbarHeader}>
              <div>
                <h2 className={styles.panelTitle}>Platform Properties Directory</h2>
                <p className={styles.panelSubtitle}>
                  Showing {properties.length} of {propertyCounts.total || properties.length} total listings
                </p>
              </div>

              {/* Reset/Clear Filters Button */}
              {(propertyStatusFilter !== "all" ||
                propertyTypeFilter !== "all" ||
                listingTypeFilter !== "all" ||
                propertyCityFilter !== "all" ||
                searchProperty.trim() !== "") && (
                <button
                  type="button"
                  className={styles.btnClearFilters}
                  onClick={() => {
                    setPropertyStatusFilter("all");
                    setPropertyTypeFilter("all");
                    setListingTypeFilter("all");
                    setPropertyCityFilter("all");
                    setSearchProperty("");
                    fetchProperties("all", "all", "all", "all", "", 1);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>

            {/* Filter Controls Row */}
            <div className={styles.filtersControlsBar}>
              {/* Status Pills */}
              <div className={styles.filterPillsRow}>
                <button
                  type="button"
                  className={`${styles.filterPillBtn} ${propertyStatusFilter === "all" ? styles.filterPillBtnActive : ""}`}
                  onClick={() => {
                    setPropertyStatusFilter("all");
                    fetchProperties("all", propertyTypeFilter, listingTypeFilter, propertyCityFilter, searchProperty, 1);
                  }}
                >
                  <span>All Properties</span>
                  <span className={styles.pillCount}>{propertyCounts.total || properties.length}</span>
                </button>
                <button
                  type="button"
                  className={`${styles.filterPillBtn} ${propertyStatusFilter === "active" ? styles.filterPillBtnActive : ""}`}
                  onClick={() => {
                    setPropertyStatusFilter("active");
                    fetchProperties("active", propertyTypeFilter, listingTypeFilter, propertyCityFilter, searchProperty, 1);
                  }}
                >
                  <span>🟢 Active</span>
                  <span className={styles.pillCount}>{propertyCounts.active || 0}</span>
                </button>
                <button
                  type="button"
                  className={`${styles.filterPillBtn} ${propertyStatusFilter === "inactive" ? styles.filterPillBtnActive : ""}`}
                  onClick={() => {
                    setPropertyStatusFilter("inactive");
                    fetchProperties("inactive", propertyTypeFilter, listingTypeFilter, propertyCityFilter, searchProperty, 1);
                  }}
                >
                  <span>🔴 Inactive</span>
                  <span className={styles.pillCount}>{propertyCounts.inactive || 0}</span>
                </button>
                <button
                  type="button"
                  className={`${styles.filterPillBtn} ${propertyStatusFilter === "sold" ? styles.filterPillBtnActive : ""}`}
                  onClick={() => {
                    setPropertyStatusFilter("sold");
                    fetchProperties("sold", propertyTypeFilter, listingTypeFilter, propertyCityFilter, searchProperty, 1);
                  }}
                >
                  <span>⚪ Sold</span>
                  <span className={styles.pillCount}>{propertyCounts.sold || 0}</span>
                </button>
              </div>

              {/* Dropdowns & Search */}
              <div className={styles.dropdownsGroup}>
                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search Title, City, Locality..."
                    value={searchProperty}
                    onChange={(e) => {
                      setSearchProperty(e.target.value);
                      fetchProperties(propertyStatusFilter, propertyTypeFilter, listingTypeFilter, propertyCityFilter, e.target.value, 1);
                    }}
                    className={styles.searchInputWithIcon}
                  />
                  {searchProperty && (
                    <button
                      type="button"
                      className={styles.searchClearBtn}
                      onClick={() => {
                        setSearchProperty("");
                        fetchProperties(propertyStatusFilter, propertyTypeFilter, listingTypeFilter, propertyCityFilter, "", 1);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                <select
                  value={listingTypeFilter}
                  onChange={(e) => {
                    setListingTypeFilter(e.target.value);
                    fetchProperties(propertyStatusFilter, propertyTypeFilter, e.target.value, propertyCityFilter, searchProperty, 1);
                  }}
                  className={styles.filterSelect}
                >
                  <option value="all">Purpose: All (Buy & Rent)</option>
                  <option value="buy">Purpose: Buy</option>
                  <option value="rent">Purpose: Rent</option>
                </select>

                <select
                  value={propertyTypeFilter}
                  onChange={(e) => {
                    setPropertyTypeFilter(e.target.value);
                    fetchProperties(propertyStatusFilter, e.target.value, listingTypeFilter, propertyCityFilter, searchProperty, 1);
                  }}
                  className={styles.filterSelect}
                >
                  <option value="all">All Property Types</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <select
                  value={propertyCityFilter}
                  onChange={(e) => {
                    setPropertyCityFilter(e.target.value);
                    fetchProperties(propertyStatusFilter, propertyTypeFilter, listingTypeFilter, e.target.value, searchProperty, 1);
                  }}
                  className={styles.filterSelect}
                >
                  <option value="all">All Cities</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thNumber}>#</th>
                    <th>Property Details</th>
                    <th>Owner / Contact</th>
                    <th>Type / Purpose</th>
                    <th>City / Locality</th>
                    <th>Price</th>
                    <th>Listed / Updated</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>
                        No properties found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    properties.map((p, index) => {
                      const serialNumber = (propertyPagination.page - 1) * propertyPagination.limit + (index + 1);
                      return (
                      <tr key={p._id}>
                        <td className={styles.tdNumber}>{serialNumber}</td>
                        <td>
                          <a
                            href={`/property/${p._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.propTitleLink}
                            title="Preview property in new tab"
                          >
                            <strong className={styles.propTitleText}>{p.title}</strong>
                          </a>
                          {p.category && (
                            <span
                              className={
                                p.category.toLowerCase() === "commercial"
                                  ? styles.categoryCommercial
                                  : styles.categoryResidential
                              }
                            >
                              {p.category}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className={styles.ownerNameText}>{p.owner?.name || "—"}</div>
                          <div className={styles.ownerContactRow}>
                            {p.owner?.email && (
                              <a href={`mailto:${p.owner.email}`} className={styles.contactLink} title="Email Owner">
                                ✉ {p.owner.email}
                              </a>
                            )}
                            {p.owner?.mobile && (
                              <a href={`tel:${p.owner.mobile}`} className={styles.contactLink} title="Call Owner">
                                📞 {p.owner.mobile}
                              </a>
                            )}
                            {!p.owner?.email && !p.owner?.mobile && (
                              <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>No contact info</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>{p.propertyType}</div>
                          <span
                            className={
                              p.listingType?.toLowerCase() === "rent" ? styles.listingBadgeRent : styles.listingBadgeBuy
                            }
                          >
                            For {p.listingType ? p.listingType.toUpperCase() : "BUY"}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.city}</div>
                          <div style={{ fontSize: "0.76rem", color: "#64748b" }}>{p.locality || "—"}</div>
                        </td>
                        <td>
                          <strong style={{ color: "#0f172a", fontSize: "0.92rem" }}>
                            ₹ {p.price ? Number(p.price).toLocaleString("en-IN") : "—"}
                          </strong>
                          {p.listingType === "rent" && (
                            <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block" }}>/ month</span>
                          )}
                        </td>
                        <td>
                          {(() => {
                            const dt = formatISTDateTime(p.createdAt);
                            const updDt = p.updatedAt && p.updatedAt !== p.createdAt ? formatISTDate(p.updatedAt) : null;
                            return (
                              <>
                                <div style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600 }}>{dt.date}</div>
                                {dt.time && <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{dt.time}</div>}
                                {updDt && (
                                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                                    Upd: {updDt}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </td>
                        <td>
                          {/* Premium Custom Status Dropdown Menu */}
                          <div className={styles.customStatusWrap}>
                            <button
                              type="button"
                              disabled={actionLoading === p._id}
                              onClick={() =>
                                setOpenStatusDropdownId((prev) => (prev === p._id ? null : p._id))
                              }
                              className={`${styles.customStatusBtn} ${
                                p.status === "active"
                                  ? styles.statusActiveBtn
                                  : p.status === "inactive"
                                  ? styles.statusInactiveBtn
                                  : styles.statusSoldBtn
                              }`}
                            >
                              <span className={styles.statusDot} />
                              <span className={styles.statusLabel}>
                                {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : "Active"}
                              </span>
                              <svg
                                className={`${styles.statusChevron} ${
                                  openStatusDropdownId === p._id ? styles.statusChevronOpen : ""
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>

                            {openStatusDropdownId === p._id && (
                              <div className={styles.customStatusMenu}>
                                <button
                                  type="button"
                                  className={`${styles.statusMenuItem} ${styles.statusActiveItem} ${
                                    p.status === "active" ? styles.statusMenuItemActive : ""
                                  }`}
                                  onClick={() => {
                                    handleUpdatePropertyStatus(p._id, "active");
                                    setOpenStatusDropdownId(null);
                                  }}
                                >
                                  <span className={`${styles.menuDot} ${styles.dotActive}`} />
                                  <span>Active</span>
                                  {p.status === "active" && <span className={styles.checkIcon}>✓</span>}
                                </button>

                                <button
                                  type="button"
                                  className={`${styles.statusMenuItem} ${styles.statusInactiveItem} ${
                                    p.status === "inactive" ? styles.statusMenuItemActive : ""
                                  }`}
                                  onClick={() => {
                                    handleUpdatePropertyStatus(p._id, "inactive");
                                    setOpenStatusDropdownId(null);
                                  }}
                                >
                                  <span className={`${styles.menuDot} ${styles.dotInactive}`} />
                                  <span>Inactive</span>
                                  {p.status === "inactive" && <span className={styles.checkIcon}>✓</span>}
                                </button>

                                <button
                                  type="button"
                                  className={`${styles.statusMenuItem} ${styles.statusSoldItem} ${
                                    p.status === "sold" ? styles.statusMenuItemActive : ""
                                  }`}
                                  onClick={() => {
                                    handleUpdatePropertyStatus(p._id, "sold");
                                    setOpenStatusDropdownId(null);
                                  }}
                                >
                                  <span className={`${styles.menuDot} ${styles.dotSold}`} />
                                  <span>Sold</span>
                                  {p.status === "sold" && <span className={styles.checkIcon}>✓</span>}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <a
                            href={`/property/${p._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.btnViewProperty}
                            title="Preview property details in new tab"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>Preview</span>
                          </a>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {propertyPagination.totalPages > 1 && (
              <div className={styles.paginationBar}>
                <div className={styles.paginationInfo}>
                  Showing {(propertyPagination.page - 1) * propertyPagination.limit + 1} -{" "}
                  {Math.min(propertyPagination.page * propertyPagination.limit, propertyPagination.total)} of{" "}
                  <strong>{propertyPagination.total}</strong> properties
                </div>

                <div className={styles.paginationBtns}>
                  <button
                    type="button"
                    disabled={!propertyPagination.hasPrev}
                    className={styles.pageArrowBtn}
                    onClick={() => {
                      fetchProperties(
                        propertyStatusFilter,
                        propertyTypeFilter,
                        listingTypeFilter,
                        propertyCityFilter,
                        searchProperty,
                        propertyPagination.page - 1
                      );
                    }}
                  >
                    ‹ Previous
                  </button>

                  {Array.from({ length: propertyPagination.totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      type="button"
                      className={`${styles.pageNumberBtn} ${
                        propertyPagination.page === pNum ? styles.pageNumberBtnActive : ""
                      }`}
                      onClick={() => {
                        fetchProperties(
                          propertyStatusFilter,
                          propertyTypeFilter,
                          listingTypeFilter,
                          propertyCityFilter,
                          searchProperty,
                          pNum
                        );
                      }}
                    >
                      {pNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={!propertyPagination.hasNext}
                    className={styles.pageArrowBtn}
                    onClick={() => {
                      fetchProperties(
                        propertyStatusFilter,
                        propertyTypeFilter,
                        listingTypeFilter,
                        propertyCityFilter,
                        searchProperty,
                        propertyPagination.page + 1
                      );
                    }}
                  >
                    Next ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. USERS TAB */}
        {activeTab === "users" && (
          <div className={styles.panel}>
            {/* Users Toolbar Header */}
            <div className={styles.toolbarHeader}>
              <div>
                <h2 className={styles.panelTitle}>User Accounts Management</h2>
                <p className={styles.panelSubtitle}>
                  Showing {usersList.length} of {userPagination.total || usersList.length} total users •{" "}
                  <strong style={{ color: "#0284c7" }}>
                    {userCounts?.buyer || stats?.totalBuyers || 0} Buyers
                  </strong>
                  {" • "}
                  <strong style={{ color: "#d97706" }}>
                    {userCounts?.owner || stats?.totalOwners || 0} Owners
                  </strong>
                </p>
              </div>

              <div className={styles.filterGroup}>
                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search Name, Email, Mobile..."
                    value={searchUser}
                    onChange={(e) => {
                      setSearchUser(e.target.value);
                      fetchUsersWithFilters(userRoleFilter, e.target.value, 1);
                    }}
                    className={styles.searchInputWithIcon}
                  />
                  {searchUser && (
                    <button
                      type="button"
                      className={styles.searchClearBtn}
                      onClick={() => {
                        setSearchUser("");
                        fetchUsersWithFilters(userRoleFilter, "", 1);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    fetchUsersWithFilters(e.target.value, searchUser, 1);
                  }}
                  className={styles.filterSelect}
                >
                  <option value="all">All Roles ({userCounts?.total || stats?.totalUsers || 0})</option>
                  <option value="buyer">Buyers / Seekers ({userCounts?.buyer || stats?.totalBuyers || 0})</option>
                  <option value="owner">Property Owners ({userCounts?.owner || stats?.totalOwners || 0})</option>
                  <option value="admin">Administrators ({userCounts?.admin || stats?.totalAdmins || 0})</option>
                </select>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thNumber}>#</th>
                    <th>User / Account</th>
                    <th>Contact Info</th>
                    <th>Role</th>
                    <th>Properties</th>
                    <th>Login Status</th>
                    <th>Joined Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>
                        No users found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u, index) => (
                      <tr
                        key={u._id}
                        className={styles.clickableTableRow}
                        onClick={() => fetchUserDetails(u._id)}
                      >
                        <td className={styles.tdNumber}>
                          {(userPagination.page - 1) * userPagination.limit + index + 1}
                        </td>
                        <td>
                          <div className={styles.userNameWrapper}>
                            <div className={styles.userTableAvatar}>
                              {(u.name || "U").slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <strong className={styles.userTableName}>{u.name}</strong>
                              <div className={styles.userRoleSmall}>{u.roleId?.displayName || u.role}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.ownerContactRow}>
                            <a
                              href={`mailto:${u.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className={styles.contactLink}
                            >
                              ✉ {u.email}
                            </a>
                            {u.mobile ? (
                              <a
                                href={`tel:${u.mobile}`}
                                onClick={(e) => e.stopPropagation()}
                                className={styles.contactLink}
                              >
                                📞 {u.mobile}
                              </a>
                            ) : (
                              <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>No mobile</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className={
                              u.role === "admin"
                                ? styles.roleBadgeAdmin
                                : u.role === "owner"
                                ? styles.roleBadgeOwner
                                : u.role === "bank_partner"
                                ? styles.roleBadgeBank
                                : styles.roleBadgeBuyer
                            }
                          >
                            {u.role === "bank_partner" ? "Bank Partner" : u.role?.replace("_", " ")}
                          </span>
                        </td>
                        <td>
                          {u.propertiesCount > 0 ? (
                            <span className={styles.propCountBadge}>
                              🏡 {u.propertiesCount} {u.propertiesCount === 1 ? "Prop" : "Props"}
                              {u.activePropertiesCount > 0 && (
                                <span className={styles.activePropSub}>({u.activePropertiesCount} active)</span>
                              )}
                            </span>
                          ) : (
                            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>0 Props</span>
                          )}
                        </td>
                        <td>
                          {/* Toggle Switch to Deny/Allow Login & Show/Hide Properties */}
                          {u.role === "admin" ? (
                            <span className={styles.statusActive}>
                              Active
                            </span>
                          ) : (
                            <div
                              className={styles.toggleStatusWrap}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                disabled={actionLoading === u._id}
                                className={`${styles.switchBtn} ${
                                  u.isActive !== false ? styles.switchBtnActive : styles.switchBtnInactive
                                }`}
                                onClick={() => handleToggleUserStatus(u._id, u.isActive !== false)}
                              >
                                <span className={styles.switchSlider} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          {(() => {
                            const dt = formatISTDateTime(u.createdAt);
                            return (
                              <>
                                <div style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600 }}>{dt.date}</div>
                                {dt.time && <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{dt.time}</div>}
                              </>
                            );
                          })()}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className={styles.userActionBtnsGroup} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className={styles.btnViewDetails}
                              onClick={() => fetchUserDetails(u._id)}
                            >
                              View ↗
                            </button>
                            {u.role !== "admin" && (
                              <button
                                type="button"
                                className={styles.btnSoftDeleteUser}
                                disabled={actionLoading === u._id}
                                onClick={() => setUserToDelete({ id: u._id, name: u.name || "User" })}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={styles.deleteIconSvg}
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Users Pagination Controls */}
            {userPagination.totalPages > 1 && (
              <div className={styles.paginationBar}>
                <div className={styles.paginationInfo}>
                  Showing {(userPagination.page - 1) * userPagination.limit + 1} -{" "}
                  {Math.min(userPagination.page * userPagination.limit, userPagination.total)} of{" "}
                  <strong>{userPagination.total}</strong> users
                </div>

                <div className={styles.paginationBtns}>
                  <button
                    type="button"
                    disabled={!userPagination.hasPrev}
                    className={styles.pageArrowBtn}
                    onClick={() => {
                      fetchUsersWithFilters(
                        userRoleFilter,
                        searchUser,
                        userPagination.page - 1
                      );
                    }}
                  >
                    ‹ Previous
                  </button>

                  {Array.from({ length: userPagination.totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      type="button"
                      className={`${styles.pageNumberBtn} ${
                        userPagination.page === pNum ? styles.pageNumberBtnActive : ""
                      }`}
                      onClick={() => {
                        fetchUsersWithFilters(
                          userRoleFilter,
                          searchUser,
                          pNum
                        );
                      }}
                    >
                      {pNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={!userPagination.hasNext}
                    className={styles.pageArrowBtn}
                    onClick={() => {
                      fetchUsersWithFilters(
                        userRoleFilter,
                        searchUser,
                        userPagination.page + 1
                      );
                    }}
                  >
                    Next ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. LOAN LEADS TAB */}
        {activeTab === "leads" && (
          <div className={styles.panel}>
            <div className={styles.toolbarHeader}>
              <div>
                <h2 className={styles.panelTitle}>Customer Loan Leads</h2>
                <p className={styles.panelSubtitle}>
                  Showing {leadsList.length} total loan applications • Click status badge to update lead approval or progress
                </p>
              </div>

              <div className={styles.filterGroup}>
                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search Applicant, Email, Phone, Bank..."
                    value={searchLead}
                    onChange={(e) => {
                      setSearchLead(e.target.value);
                      fetchLeads(leadStatusFilter, leadBankFilter, e.target.value, 1);
                    }}
                    className={styles.searchInputWithIcon}
                  />
                  {searchLead && (
                    <button
                      type="button"
                      className={styles.searchClearBtn}
                      onClick={() => {
                        setSearchLead("");
                        fetchLeads(leadStatusFilter, leadBankFilter, "", 1);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className={styles.filterPillsRow} style={{ marginBottom: "20px" }}>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${leadStatusFilter === "all" ? styles.filterPillBtnActive : ""}`}
                onClick={() => {
                  setLeadStatusFilter("all");
                  fetchLeads("all", leadBankFilter, searchLead, 1);
                }}
              >
                <span>All Leads</span>
                <span className={styles.pillCount}>{leadCounts.total || leadsList.length}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${leadStatusFilter === "pending" ? styles.filterPillBtnActive : ""}`}
                onClick={() => {
                  setLeadStatusFilter("pending");
                  fetchLeads("pending", leadBankFilter, searchLead, 1);
                }}
              >
                <span>🟡 Pending</span>
                <span className={styles.pillCount}>{leadCounts.pending || 0}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${leadStatusFilter === "approved" ? styles.filterPillBtnActive : ""}`}
                onClick={() => {
                  setLeadStatusFilter("approved");
                  fetchLeads("approved", leadBankFilter, searchLead, 1);
                }}
              >
                <span>🟢 Approved</span>
                <span className={styles.pillCount}>{leadCounts.approved || 0}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${leadStatusFilter === "rejected" ? styles.filterPillBtnActive : ""}`}
                onClick={() => {
                  setLeadStatusFilter("rejected");
                  fetchLeads("rejected", leadBankFilter, searchLead, 1);
                }}
              >
                <span>🔴 Rejected</span>
                <span className={styles.pillCount}>{leadCounts.rejected || 0}</span>
              </button>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thNumber}>#</th>
                    <th>Applicant Details</th>
                    <th>Employment & Income</th>
                    <th>Target Bank</th>
                    <th>Loan Amount</th>
                    <th>Property / Message</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leadsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>
                        No home loan leads found.
                      </td>
                    </tr>
                  ) : (
                    leadsList.map((l, index) => {
                      const currentStatus = l.status || "pending";
                      const isDropdownOpen = openLeadStatusDropdownId === l._id;
                      return (
                        <tr key={l._id}>
                          <td className={styles.tdNumber}>{index + 1}</td>
                          <td>
                            <strong>{l.name}</strong>
                            <div style={{ fontSize: "0.82rem", color: "#334155" }}>{l.email}</div>
                            <div style={{ fontSize: "0.78rem", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                              <span>📞 {l.phone || "—"}</span>
                              {l.phone && (
                                <a
                                  href={`https://wa.me/91${String(l.phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${l.name}, thank you for your home loan enquiry on RunR Properties.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chat on WhatsApp"
                                  style={{ color: "#22c55e", fontSize: "0.8rem", textDecoration: "none" }}
                                >
                                  💬
                                </a>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              <span style={{
                                display: "inline-block",
                                background: "#f0f9ff",
                                color: "#007bbd",
                                border: "1px solid #bae6fd",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "6px",
                                marginBottom: "4px"
                              }}>
                                {l.employmentType || "Salaried"}
                              </span>
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "#475569", fontWeight: 600 }}>
                              Income: {l.monthlyIncome ? (l.monthlyIncome.startsWith("₹") ? l.monthlyIncome : `₹ ${l.monthlyIncome}`) : "—"}
                            </div>
                          </td>
                          <td>
                            <strong>{l.bankName || l.bankId?.bankName || "—"}</strong>
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, color: "#007bbd", fontSize: "0.95rem" }}>
                              ₹ {l.loanAmount ? Number(l.loanAmount).toLocaleString("en-IN") : "—"}
                            </span>
                          </td>
                          <td>
                            {l.propertyTitle ? (
                              <div style={{ fontSize: "0.8rem", color: "#0f172a", fontWeight: 600, marginBottom: "4px" }}>
                                🏢 {l.propertyTitle}
                              </div>
                            ) : null}
                            {l.message ? (
                              <div style={{
                                fontSize: "0.76rem",
                                color: "#334155",
                                background: "#f8fafc",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                maxWidth: "240px",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word"
                              }}>
                                💬 {l.message}
                              </div>
                            ) : null}
                            {l.notes ? (
                              <div style={{
                                fontSize: "0.74rem",
                                color: "#005f94",
                                background: "#f0f9ff",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                border: "1px solid #bae6fd",
                                marginTop: "4px",
                                maxWidth: "240px",
                                wordBreak: "break-word"
                              }}>
                                📝 <strong>Bank Note:</strong> {l.notes}
                              </div>
                            ) : null}
                            {!l.message && !l.notes && (
                              <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>—</span>
                            )}
                          </td>
                          <td>
                            {/* Read-Only Status Badge (Managed by Bank Partner) */}
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "0.78rem",
                                fontWeight: "700",
                                border: (currentStatus === "approved" || currentStatus === "closed_won")
                                  ? "1px solid #a7f3d0"
                                  : (currentStatus === "rejected" || currentStatus === "closed_lost")
                                  ? "1px solid #fecaca"
                                  : (currentStatus === "contacted" || currentStatus === "in_progress")
                                  ? "1px solid #bae6fd"
                                  : "1px solid #fde68a",
                                background: (currentStatus === "approved" || currentStatus === "closed_won")
                                  ? "#ecfdf5"
                                  : (currentStatus === "rejected" || currentStatus === "closed_lost")
                                  ? "#fef2f2"
                                  : (currentStatus === "contacted" || currentStatus === "in_progress")
                                  ? "#f0f9ff"
                                  : "#fffbeb",
                                color: (currentStatus === "approved" || currentStatus === "closed_won")
                                  ? "#059669"
                                  : (currentStatus === "rejected" || currentStatus === "closed_lost")
                                  ? "#dc2626"
                                  : (currentStatus === "contacted" || currentStatus === "in_progress")
                                  ? "#007bbd"
                                  : "#d97706",
                              }}
                              title={`Status managed by Bank Partner: ${l.bankName || "Bank"}`}
                            >
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  backgroundColor: "currentColor",
                                }}
                              />
                              <span>
                                {currentStatus === "approved" || currentStatus === "closed_won"
                                  ? "Approved"
                                  : currentStatus === "rejected" || currentStatus === "closed_lost"
                                  ? "Rejected"
                                  : currentStatus === "contacted"
                                  ? "Contacted"
                                  : currentStatus === "in_progress"
                                  ? "In Progress"
                                  : "Pending"}
                              </span>
                            </span>
                          </td>
                          <td>
                            {(() => {
                              const dt = formatISTDateTime(l.createdAt);
                              return (
                                <>
                                  <div style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600 }}>{dt.date}</div>
                                  {dt.time && <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{dt.time}</div>}
                                </>
                              );
                            })()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. CONTACT US LEADS TAB */}
        {activeTab === "contact_leads" && (
          <div className={styles.panel}>
            {/* Toolbar Header */}
            <div className={styles.toolbarHeader}>
              <div>
                <h2 className={styles.panelTitle}>Contact Us Inquiries & Leads</h2>
                <p className={styles.panelSubtitle}>
                  Showing {contactLeadsList.length} of {contactLeadCounts.total || contactLeadsList.length} total inquiries • Click on any row to view full details
                </p>
              </div>

              <div className={styles.filterGroup}>
                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search Name, Email, Phone, Subject..."
                    value={searchContactLead}
                    onChange={(e) => {
                      setSearchContactLead(e.target.value);
                      fetchContactLeads(contactLeadStatusFilter, e.target.value, 1);
                    }}
                    className={styles.searchInputWithIcon}
                  />
                  {searchContactLead && (
                    <button
                      type="button"
                      className={styles.searchClearBtn}
                      onClick={() => {
                        setSearchContactLead("");
                        fetchContactLeads(contactLeadStatusFilter, "", 1);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Pills Bar (Horizontal Row) */}
            <div className={styles.filterPillsRow} style={{ marginBottom: "20px" }}>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${contactLeadStatusFilter === "all" ? styles.filterPillBtnActive : ""}`}
                onClick={() => {
                  setContactLeadStatusFilter("all");
                  fetchContactLeads("all", searchContactLead, 1);
                }}
              >
                <span>All Inquiries</span>
                <span className={styles.pillCount}>{contactLeadCounts.total || 0}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${contactLeadStatusFilter === "new" ? styles.filterPillBtnActive : ""}`}
                onClick={() => {
                  setContactLeadStatusFilter("new");
                  fetchContactLeads("new", searchContactLead, 1);
                }}
              >
                <span>✨ New</span>
                <span className={styles.pillCount}>{contactLeadCounts.new || 0}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${contactLeadStatusFilter === "contacted" ? styles.filterPillBtnActive : ""}`}
                onClick={() => {
                  setContactLeadStatusFilter("contacted");
                  fetchContactLeads("contacted", searchContactLead, 1);
                }}
              >
                <span>📞 Contacted</span>
                <span className={styles.pillCount}>{contactLeadCounts.contacted || 0}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${contactLeadStatusFilter === "resolved" ? styles.filterPillBtnActive : ""}`}
                onClick={() => {
                  setContactLeadStatusFilter("resolved");
                  fetchContactLeads("resolved", searchContactLead, 1);
                }}
              >
                <span>✅ Resolved</span>
                <span className={styles.pillCount}>{contactLeadCounts.resolved || 0}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${contactLeadStatusFilter === "closed" ? styles.filterPillBtnActive : ""}`}
                onClick={() => {
                  setContactLeadStatusFilter("closed");
                  fetchContactLeads("closed", searchContactLead, 1);
                }}
              >
                <span>⚪ Closed</span>
                <span className={styles.pillCount}>{contactLeadCounts.closed || 0}</span>
              </button>
            </div>

            {/* Contact Leads Data Table */}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thNumber}>#</th>
                    <th>Sender Info</th>
                    <th>Contact Details</th>
                    <th>Subject & Message</th>
                    <th>Status</th>
                    <th>Received Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contactLeadsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "#64748b", padding: "36px" }}>
                        No contact inquiries found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    contactLeadsList.map((lead, index) => {
                      const isDropdownOpen = openContactStatusDropdownId === lead._id;
                      return (
                        <tr
                          key={lead._id}
                          className={styles.clickableTableRow}
                          onClick={() => setSelectedContactLead(lead)}
                        >
                          <td className={styles.tdNumber}>
                            {(contactLeadPagination.page - 1) * contactLeadPagination.limit + index + 1}
                          </td>
                          <td>
                            <div className={styles.userNameWrapper}>
                              <div className={styles.userTableAvatar} style={{ background: "#e0f2fe", color: "#0284c7" }}>
                                {(lead.name || "C").slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <strong className={styles.userTableName}>{lead.name}</strong>
                                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                  {lead.status === "new" ? "✨ New Message" : "Lead Inquiry"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className={styles.ownerContactRow}>
                              <a
                                href={`mailto:${lead.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className={styles.contactLink}
                              >
                                ✉ {lead.email}
                              </a>
                              {lead.phone ? (
                                <a
                                  href={`tel:${lead.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className={styles.contactLink}
                                >
                                  📞 {lead.phone}
                                </a>
                              ) : (
                                <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>No phone</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className={styles.messageSubjectWrap}>
                              <div className={styles.messageSubject} title={lead.subject}>
                                {lead.subject}
                              </div>
                              <div className={styles.messageSnippet} title={lead.message || "No message"}>
                                {lead.message || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No message provided</span>}
                              </div>
                            </div>
                          </td>
                          <td>
                            {/* Interactive Status Selector Dropdown */}
                            <div
                              className={styles.customStatusWrap}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                disabled={actionLoading === lead._id}
                                className={`${styles.customStatusBtn} ${
                                  lead.status === "new"
                                    ? styles.statusNewBtn
                                    : lead.status === "contacted"
                                    ? styles.statusContactedBtn
                                    : lead.status === "resolved"
                                    ? styles.statusResolvedBtn
                                    : styles.statusClosedBtn
                                }`}
                                onClick={() =>
                                  setOpenContactStatusDropdownId(isDropdownOpen ? null : lead._id)
                                }
                              >
                                <span className={styles.statusBtnDot} />
                                <span className={styles.statusBtnText}>
                                  {lead.status === "new"
                                    ? "New"
                                    : lead.status === "contacted"
                                    ? "Contacted"
                                    : lead.status === "resolved"
                                    ? "Resolved"
                                    : "Closed"}
                                </span>
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  className={`${styles.statusCaretSvg} ${isDropdownOpen ? styles.caretOpen : ""}`}
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </button>

                              {isDropdownOpen && (
                                <div className={styles.customStatusMenu}>
                                  <button
                                    type="button"
                                    className={`${styles.statusMenuItem} ${styles.statusNewItem} ${
                                      lead.status === "new" ? styles.statusMenuItemActive : ""
                                    }`}
                                    onClick={() => {
                                      setOpenContactStatusDropdownId(null);
                                      if (lead.status !== "new") {
                                        handleUpdateContactLeadStatus(lead._id, "new");
                                      }
                                    }}
                                  >
                                    <span className={`${styles.menuDot} ${styles.dotNew}`} />
                                    New
                                    {lead.status === "new" && <span className={styles.checkIcon}>✓</span>}
                                  </button>
                                  <button
                                    type="button"
                                    className={`${styles.statusMenuItem} ${styles.statusContactedItem} ${
                                      lead.status === "contacted" ? styles.statusMenuItemActive : ""
                                    }`}
                                    onClick={() => {
                                      setOpenContactStatusDropdownId(null);
                                      if (lead.status !== "contacted") {
                                        handleUpdateContactLeadStatus(lead._id, "contacted");
                                      }
                                    }}
                                  >
                                    <span className={`${styles.menuDot} ${styles.dotContacted}`} />
                                    Contacted
                                    {lead.status === "contacted" && <span className={styles.checkIcon}>✓</span>}
                                  </button>
                                  <button
                                    type="button"
                                    className={`${styles.statusMenuItem} ${styles.statusResolvedItem} ${
                                      lead.status === "resolved" ? styles.statusMenuItemActive : ""
                                    }`}
                                    onClick={() => {
                                      setOpenContactStatusDropdownId(null);
                                      if (lead.status !== "resolved") {
                                        handleUpdateContactLeadStatus(lead._id, "resolved");
                                      }
                                    }}
                                  >
                                    <span className={`${styles.menuDot} ${styles.dotResolved}`} />
                                    Resolved
                                    {lead.status === "resolved" && <span className={styles.checkIcon}>✓</span>}
                                  </button>
                                  <button
                                    type="button"
                                    className={`${styles.statusMenuItem} ${styles.statusClosedItem} ${
                                      lead.status === "closed" ? styles.statusMenuItemActive : ""
                                    }`}
                                    onClick={() => {
                                      setOpenContactStatusDropdownId(null);
                                      if (lead.status !== "closed") {
                                        handleUpdateContactLeadStatus(lead._id, "closed");
                                      }
                                    }}
                                  >
                                    <span className={`${styles.menuDot} ${styles.dotClosed}`} />
                                    Closed
                                    {lead.status === "closed" && <span className={styles.checkIcon}>✓</span>}
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {(() => {
                              const dt = formatISTDateTime(lead.createdAt);
                              return (
                                <>
                                  <div style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600 }}>{dt.date}</div>
                                  {dt.time && <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{dt.time}</div>}
                                </>
                              );
                            })()}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className={styles.userActionBtnsGroup} onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className={styles.btnViewDetails}
                                onClick={() => setSelectedContactLead(lead)}
                              >
                                View Message ↗
                              </button>
                              <button
                                type="button"
                                className={styles.btnSoftDeleteUser}
                                disabled={actionLoading === lead._id}
                                onClick={() =>
                                  setContactLeadToDelete({
                                    id: lead._id,
                                    name: lead.name,
                                    subject: lead.subject,
                                  })
                                }
                                title="Delete Lead"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={styles.deleteIconSvg}
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {contactLeadPagination.total > 0 && (
              <div className={styles.paginationBar}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                  <div className={styles.paginationInfo}>
                    Showing {(contactLeadPagination.page - 1) * contactLeadPagination.limit + 1} -{" "}
                    {Math.min(
                      contactLeadPagination.page * contactLeadPagination.limit,
                      contactLeadPagination.total
                    )}{" "}
                    of <strong>{contactLeadPagination.total}</strong> inquiries
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#64748b" }}>
                    <span>Per page:</span>
                    <select
                      value={contactLeadPagination.limit || 10}
                      onChange={(e) => {
                        const newLimit = parseInt(e.target.value) || 10;
                        setContactLeadPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
                        fetchContactLeads(contactLeadStatusFilter, searchContactLead, 1, newLimit);
                      }}
                      className={styles.filterSelect}
                      style={{ padding: "4px 8px", fontSize: "0.8rem", borderRadius: "8px" }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className={styles.paginationBtns}>
                  <button
                    type="button"
                    disabled={!contactLeadPagination.hasPrev}
                    className={styles.pageArrowBtn}
                    onClick={() => {
                      fetchContactLeads(
                        contactLeadStatusFilter,
                        searchContactLead,
                        contactLeadPagination.page - 1,
                        contactLeadPagination.limit
                      );
                    }}
                  >
                    ‹ Previous
                  </button>

                  {Array.from({ length: Math.max(1, contactLeadPagination.totalPages) }, (_, i) => i + 1).map(
                    (pNum) => (
                      <button
                        key={pNum}
                        type="button"
                        className={`${styles.pageNumberBtn} ${
                          contactLeadPagination.page === pNum ? styles.pageNumberBtnActive : ""
                        }`}
                        onClick={() => {
                          fetchContactLeads(
                            contactLeadStatusFilter,
                            searchContactLead,
                            pNum,
                            contactLeadPagination.limit
                          );
                        }}
                      >
                        {pNum}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={!contactLeadPagination.hasNext}
                    className={styles.pageArrowBtn}
                    onClick={() => {
                      fetchContactLeads(
                        contactLeadStatusFilter,
                        searchContactLead,
                        contactLeadPagination.page + 1,
                        contactLeadPagination.limit
                      );
                    }}
                  >
                    Next ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5.5. PROPERTY LEADS & BUYER ENQUIRIES TAB */}
        {activeTab === "property_leads" && (
          <div className={styles.panel}>
            {/* Toolbar Header */}
            <div className={styles.toolbarHeader}>
              <div>
                <h2 className={styles.panelTitle}>Property Leads & Buyer Enquiries</h2>
                <p className={styles.panelSubtitle}>
                  Showing {propertyLeadsList.length} of {propertyLeadPagination.total || propertyLeadsList.length} total enquiries • Track buyer messages, properties and assigned owners
                </p>
              </div>

              <div className={styles.filterGroup}>
                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search Buyer, Phone, Email, Property..."
                    value={searchPropertyLead}
                    onChange={(e) => {
                      setSearchPropertyLead(e.target.value);
                      fetchPropertyLeads(propertyLeadStatusFilter, e.target.value, 1);
                    }}
                    className={styles.searchInputWithIcon}
                  />
                  {searchPropertyLead && (
                    <button
                      type="button"
                      className={styles.searchClearBtn}
                      onClick={() => {
                        setSearchPropertyLead("");
                        fetchPropertyLeads(propertyLeadStatusFilter, "", 1);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Pills Bar (Horizontal Row) */}
            <div className={styles.filterPillsRow} style={{ marginBottom: "20px" }}>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${propertyLeadStatusFilter === "all" ? styles.filterPillBtnActive : ""}`}
                onClick={() => {
                  setPropertyLeadStatusFilter("all");
                  fetchPropertyLeads("all", searchPropertyLead, 1);
                }}
              >
                <span>All Enquiries</span>
                <span className={styles.pillCount}>{propertyLeadCounts.total || 0}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${propertyLeadStatusFilter.toLowerCase() === "pending" ? styles.filterPillBtnActive : ""}`}
                onClick={() => {
                  setPropertyLeadStatusFilter("Pending");
                  fetchPropertyLeads("Pending", searchPropertyLead, 1);
                }}
              >
                <span>✨ Pending</span>
                <span className={styles.pillCount}>{propertyLeadCounts.pending || 0}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${propertyLeadStatusFilter.toLowerCase() === "contacted" ? styles.filterPillBtnActive : ""}`}
                onClick={() => {
                  setPropertyLeadStatusFilter("Contacted");
                  fetchPropertyLeads("Contacted", searchPropertyLead, 1);
                }}
              >
                <span>📞 Contacted</span>
                <span className={styles.pillCount}>{propertyLeadCounts.contacted || 0}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${propertyLeadStatusFilter.toLowerCase() === "closed" ? styles.filterPillBtnActive : ""}`}
                onClick={() => {
                  setPropertyLeadStatusFilter("Closed");
                  fetchPropertyLeads("Closed", searchPropertyLead, 1);
                }}
              >
                <span>⚪ Closed</span>
                <span className={styles.pillCount}>{propertyLeadCounts.closed || 0}</span>
              </button>
            </div>

            {/* Property Leads Data Table */}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thNumber}>#</th>
                    <th>Buyer / Inquirer</th>
                    <th>Interested Property</th>
                    <th>Property Owner</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Received Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyLeadsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", color: "#64748b", padding: "36px" }}>
                        No property enquiries found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    propertyLeadsList.map((lead, index) => {
                      const isDropdownOpen = openPropertyLeadStatusDropdownId === lead._id;
                      const prop = lead.property || {};
                      const owner = lead.owner || {};
                      const propPhoto = (prop.images && prop.images.length > 0)
                        ? prop.images[0]
                        : (prop.photos && prop.photos.length > 0)
                        ? prop.photos[0]
                        : (prop.image || "/img/buy-properties/1.jpg");
                      const propImgUrl = getMediaUrl(propPhoto);
                      const normStatus = (lead.status || "Pending").toLowerCase();

                      return (
                        <tr
                          key={lead._id}
                          className={styles.clickableTableRow}
                          onClick={() => setSelectedPropertyLead(lead)}
                        >
                          <td className={styles.tdNumber}>
                            {(propertyLeadPagination.page - 1) * propertyLeadPagination.limit + index + 1}
                          </td>
                          <td>
                            <div className={styles.userNameWrapper}>
                              <div className={styles.userTableAvatar} style={{ background: "#e0f2fe", color: "#0284c7" }}>
                                {(lead.name || "B").slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <strong className={styles.userTableName}>{lead.name}</strong>
                                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                  <a
                                    href={`tel:${lead.mobile}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className={styles.contactLink}
                                    style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}
                                  >
                                    📞 {lead.mobile}
                                  </a>
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                                  ✉ {lead.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "180px" }}>
                              <img
                                src={propImgUrl}
                                alt={prop.title || "Property"}
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  borderRadius: "8px",
                                  objectFit: "cover",
                                  border: "1px solid #e2e8f0",
                                  flexShrink: 0,
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = "/img/buy-properties/1.jpg";
                                }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <strong
                                  style={{
                                    display: "block",
                                    fontSize: "0.84rem",
                                    color: "#0f172a",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "180px",
                                  }}
                                  title={prop.title || "Property"}
                                >
                                  {prop.title || "Property Listing"}
                                </strong>
                                <div style={{ fontSize: "0.74rem", color: "#007bbd", fontWeight: 700 }}>
                                  {prop.price ? (prop.price >= 10000000 ? `₹ ${(prop.price / 10000000).toFixed(2)} Cr` : `₹ ${(prop.price / 100000).toFixed(1)} Lakh`) : "Price on Request"}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                  📍 {prop.city || prop.locality || "Gujarat"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong style={{ fontSize: "0.82rem", color: "#334155" }}>
                                {owner.name || "Owner"}
                              </strong>
                              {owner.mobile && (
                                <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                                  📞 {owner.mobile}
                                </div>
                              )}
                              {owner.email && (
                                <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                                  ✉ {owner.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className={styles.messageSnippet} title={lead.message} style={{ maxWidth: "160px" }}>
                              {lead.message || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No message</span>}
                            </div>
                          </td>
                          <td>
                            {/* Read-Only Status Badge (Managed by Property Owner) */}
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "0.78rem",
                                fontWeight: "700",
                                background:
                                  normStatus === "pending"
                                    ? "#fef3c7"
                                    : normStatus === "contacted"
                                    ? "#e0f2fe"
                                    : "#d1fae5",
                                color:
                                  normStatus === "pending"
                                    ? "#b45309"
                                    : normStatus === "contacted"
                                    ? "#0284c7"
                                    : "#047857",
                                border:
                                  normStatus === "pending"
                                    ? "1px solid #fde68a"
                                    : normStatus === "contacted"
                                    ? "1px solid #bae6fd"
                                    : "1px solid #a7f3d0",
                              }}
                              title={`Status managed by property owner: ${lead.status || "Pending"}`}
                            >
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  backgroundColor: "currentColor",
                                }}
                              />
                              <span>
                                {normStatus === "pending"
                                  ? "Pending"
                                  : normStatus === "contacted"
                                  ? "Contacted"
                                  : "Closed"}
                              </span>
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600 }}>
                              {formatISTDate(lead.createdAt)}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                              {formatISTTime(lead.createdAt)}
                            </div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className={styles.userActionBtnsGroup} onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className={styles.btnViewDetails}
                                onClick={() => setSelectedPropertyLead(lead)}
                              >
                                View Details ↗
                              </button>
                              <button
                                type="button"
                                className={styles.btnSoftDeleteUser}
                                disabled={actionLoading === lead._id}
                                onClick={() =>
                                  setPropertyLeadToDelete({
                                    id: lead._id,
                                    name: lead.name,
                                    propertyTitle: prop.title || "Property",
                                  })
                                }
                                title="Delete Lead"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={styles.deleteIconSvg}
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {propertyLeadPagination.total > 0 && (
              <div className={styles.paginationBar}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                  <div className={styles.paginationInfo}>
                    Showing {(propertyLeadPagination.page - 1) * propertyLeadPagination.limit + 1} -{" "}
                    {Math.min(
                      propertyLeadPagination.page * propertyLeadPagination.limit,
                      propertyLeadPagination.total
                    )}{" "}
                    of <strong>{propertyLeadPagination.total}</strong> enquiries
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#64748b" }}>
                    <span>Page</span>
                    <strong style={{ color: "#0f172a" }}>{propertyLeadPagination.page}</strong>
                    <span>of</span>
                    <strong style={{ color: "#0f172a" }}>{propertyLeadPagination.totalPages}</strong>
                  </div>
                </div>

                <div className={styles.paginationBtns}>
                  <button
                    type="button"
                    disabled={!propertyLeadPagination.hasPrev}
                    className={styles.pageArrowBtn}
                    onClick={() => {
                      fetchPropertyLeads(
                        propertyLeadStatusFilter,
                        searchPropertyLead,
                        propertyLeadPagination.page - 1,
                        propertyLeadPagination.limit
                      );
                    }}
                  >
                    ‹ Previous
                  </button>

                  {Array.from({ length: Math.max(1, propertyLeadPagination.totalPages) }, (_, i) => i + 1).map(
                    (pNum) => (
                      <button
                        key={pNum}
                        type="button"
                        className={`${styles.pageNumberBtn} ${
                          propertyLeadPagination.page === pNum ? styles.pageNumberBtnActive : ""
                        }`}
                        onClick={() => {
                          fetchPropertyLeads(
                            propertyLeadStatusFilter,
                            searchPropertyLead,
                            pNum,
                            propertyLeadPagination.limit
                          );
                        }}
                      >
                        {pNum}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={!propertyLeadPagination.hasNext}
                    className={styles.pageArrowBtn}
                    onClick={() => {
                      fetchPropertyLeads(
                        propertyLeadStatusFilter,
                        searchPropertyLead,
                        propertyLeadPagination.page + 1,
                        propertyLeadPagination.limit
                      );
                    }}
                  >
                    Next ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. BLOGS & INSIGHTS MANAGEMENT TAB */}
        {activeTab === "blogs" && (
          <div>
            {blogViewMode === "list" ? (
              <div className={styles.panel}>
                {/* Toolbar Header */}
                <div className={styles.toolbarHeader}>
                  <div>
                    <h2 className={styles.panelTitle}>Blog & Insights Management</h2>
                    <p className={styles.panelSubtitle}>
                      Showing {blogsList.length} of {blogCounts.total || blogsList.length} total articles • Manage real estate market guides and news
                    </p>
                  </div>

                  <div className={styles.filterGroup}>
                    <button
                      type="button"
                      className={styles.btnAddBank}
                      onClick={handleOpenAddBlogModal}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        borderRadius: "10px",
                        background: "#007bbd",
                        color: "#ffffff",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.88rem",
                        boxShadow: "0 4px 12px rgba(0, 123, 189, 0.2)",
                      }}
                    >
                      <FiPlus style={{ fontSize: "1.1rem" }} /> Add New Blog
                    </button>
                  </div>
                </div>

                {/* Filter Controls Bar */}
                <div className={styles.filtersControlsBar}>
                  <div className={styles.dropdownsGroup}>
                    <div className={styles.searchWrapper}>
                      <FiSearch className={styles.searchIcon} style={{ fontSize: "15px" }} />
                      <input
                        type="text"
                        placeholder="Search articles by title, excerpt, category, or author..."
                        value={searchBlog}
                        onChange={(e) => handleBlogSearchChange(e.target.value)}
                        className={styles.searchInputWithIcon}
                      />
                      {searchBlog && (
                        <button
                          type="button"
                          className={styles.searchClearBtn}
                          onClick={() => {
                            setSearchBlog("");
                            if (blogSearchTimeoutRef.current) clearTimeout(blogSearchTimeoutRef.current);
                            fetchBlogs(blogStatusFilter, blogCategoryFilter, "", 1);
                          }}
                        >
                          <FiX style={{ fontSize: "12px" }} />
                        </button>
                      )}
                    </div>

                    <select
                      value={blogCategoryFilter}
                      onChange={(e) => {
                        setBlogCategoryFilter(e.target.value);
                        fetchBlogs(blogStatusFilter, e.target.value, searchBlog, 1);
                      }}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Categories</option>
                      {BLOG_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <select
                      value={blogStatusFilter}
                      onChange={(e) => {
                        setBlogStatusFilter(e.target.value);
                        fetchBlogs(e.target.value, blogCategoryFilter, searchBlog, 1);
                      }}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Statuses ({blogCounts.total})</option>
                      <option value="published">Published ({blogCounts.published})</option>
                      <option value="draft">Drafts ({blogCounts.draft})</option>
                    </select>

                    {(searchBlog || blogCategoryFilter !== "all" || blogStatusFilter !== "all") && (
                      <button
                        type="button"
                        className={styles.btnClearFilters}
                        onClick={() => {
                          setSearchBlog("");
                          setBlogCategoryFilter("all");
                          setBlogStatusFilter("all");
                          if (blogSearchTimeoutRef.current) clearTimeout(blogSearchTimeoutRef.current);
                          fetchBlogs("all", "all", "", 1);
                        }}
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Blogs Table */}
                {blogLoading && blogsList.length === 0 ? (
                  <div className={styles.blogTableLoadingSkeleton}>
                    <FiLoader className={styles.blogSpinIcon} style={{ fontSize: "2rem" }} />
                    <span>Loading articles...</span>
                  </div>
                ) : blogsList.length === 0 ? (
                  <div className={styles.emptyTableState}>
                    <div className={styles.emptyIcon}>
                      <FiFileText style={{ fontSize: "2.5rem", color: "#94a3b8" }} />
                    </div>
                    <h4 className={styles.emptyTitle}>No blog posts found</h4>
                    <p className={styles.emptyDesc}>
                      {searchBlog || blogCategoryFilter !== "all" || blogStatusFilter !== "all"
                        ? "No articles matched your active filters. Try resetting search or filter criteria."
                        : "No articles have been created yet. Click '+ Add New Blog' to publish your first post."}
                    </p>
                    <button
                      type="button"
                      className={styles.btnAddBank}
                      onClick={handleOpenAddBlogModal}
                      style={{
                        marginTop: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#007bbd",
                        color: "#ffffff",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      <FiPlus /> Create First Blog
                    </button>
                  </div>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.thNumber}>#</th>
                          <th style={{ minWidth: "280px" }}>Article Details</th>
                          <th style={{ minWidth: "140px" }}>Category</th>
                          <th style={{ minWidth: "130px" }}>Author & Read</th>
                          <th style={{ minWidth: "120px" }}>Status</th>
                          <th style={{ minWidth: "130px" }}>Published Date</th>
                          <th style={{ textAlign: "right", minWidth: "160px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogsList.map((blog, idx) => (
                          <tr key={blog._id}>
                            <td className={styles.tdNumber}>
                              {(blogPagination.page - 1) * blogPagination.limit + idx + 1}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <img
                                  src={getMediaUrl(blog.coverImage)}
                                  alt={blog.title}
                                  className={styles.blogCoverThumb}
                                  loading="lazy"
                                  decoding="async"
                                  width={54}
                                  height={38}
                                />
                                <div>
                                  <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.92rem", lineHeight: 1.3 }}>
                                    {blog.title}
                                    {blog.isFeatured && (
                                      <span style={{ marginLeft: "8px", fontSize: "0.68rem", background: "#fef3c7", color: "#d97706", padding: "2px 6px", borderRadius: "4px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                        <FiStar style={{ fontSize: "0.72rem" }} /> Featured
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "3px", maxWidth: "340px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {blog.excerpt}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: "0.76rem", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", background: "#f1f5f9", color: "#334155" }}>
                                {blog.category}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                                {blog.author ? blog.author.replace(/Runr/g, "runr") : "runr team"}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                {blog.readTime || "5 min"}
                              </div>
                            </td>
                            <td>
                              {/* Toggle Switch to Publish/Unpublish Blog (Show/Hide on site) */}
                              <div
                                role="button"
                                tabIndex={0}
                                className={styles.toggleStatusWrap}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleToggleBlogStatus(blog._id, blog.status);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleToggleBlogStatus(blog._id, blog.status);
                                  }
                                }}
                                title={
                                  blog.status === "published"
                                    ? "Currently Active / Published (Click to Deactivate to Draft)"
                                    : "Currently Inactive / Draft (Click to Activate & Publish to site)"
                                }
                                style={{
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <span
                                  className={`${styles.switchBtn} ${
                                    blog.status === "published"
                                      ? styles.switchBtnActive
                                      : styles.switchBtnInactive
                                  }`}
                                  aria-hidden="true"
                                >
                                  <span className={styles.switchSlider} />
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.78rem",
                                    fontWeight: 800,
                                    color: blog.status === "published" ? "#15803d" : "#64748b",
                                    userSelect: "none",
                                  }}
                                >
                                  {blog.status === "published" ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: "0.82rem", color: "#334155" }}>
                                {formatISTDate(blog.createdAt)}
                              </div>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                                <a
                                  href={`/blog/${blog.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.btnViewLiveSite}
                                  title="Preview on live site"
                                >
                                  <FiExternalLink style={{ fontSize: "0.8rem" }} /> View
                                </a>
                                <button
                                  type="button"
                                  className={styles.btnEditAction}
                                  onClick={() => handleOpenEditBlogModal(blog)}
                                  title="Edit Blog"
                                >
                                  <FiEdit2 style={{ fontSize: "0.8rem" }} /> Edit
                                </button>
                                <button
                                  type="button"
                                  className={styles.btnDeleteAction}
                                  onClick={() => setBlogToDelete(blog)}
                                  title="Delete Blog"
                                >
                                  <FiTrash2 style={{ fontSize: "0.85rem" }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls */}
                {blogPagination.totalPages > 1 && (
                  <div className={styles.paginationBar}>
                    <div className={styles.paginationInfo}>
                      Showing {(blogPagination.page - 1) * blogPagination.limit + 1} -{" "}
                      {Math.min(blogPagination.page * blogPagination.limit, blogCounts.total)} of{" "}
                      <strong>{blogCounts.total}</strong> articles
                    </div>
                    <div className={styles.paginationBtns}>
                      <button
                        type="button"
                        disabled={!blogPagination.hasPrev}
                        className={styles.pageArrowBtn}
                        onClick={() => fetchBlogs(blogStatusFilter, blogCategoryFilter, searchBlog, blogPagination.page - 1)}
                      >
                        ‹ Previous
                      </button>
                      {Array.from({ length: blogPagination.totalPages }, (_, i) => i + 1).map((pNum) => (
                        <button
                          key={pNum}
                          type="button"
                          className={`${styles.pageNumberBtn} ${blogPagination.page === pNum ? styles.pageNumberBtnActive : ""}`}
                          onClick={() => fetchBlogs(blogStatusFilter, blogCategoryFilter, searchBlog, pNum)}
                        >
                          {pNum}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={!blogPagination.hasNext}
                        className={styles.pageArrowBtn}
                        onClick={() => fetchBlogs(blogStatusFilter, blogCategoryFilter, searchBlog, blogPagination.page + 1)}
                      >
                        Next ›
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* IN-PAGE CREATE / EDIT BLOG FORM VIEW */
              <div className={styles.blogEditorWrapper}>
                {/* Form Header Bar */}
                <div className={styles.blogEditorHeaderBar}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setBlogViewMode("list");
                        setEditingBlog(null);
                      }}
                      className={styles.blogBackBtn}
                    >
                      <FiArrowLeft style={{ fontSize: "1.1rem" }} /> Back to Blog List
                    </button>
                    <div>
                      <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#007bbd", display: "inline-flex" }}>{blogViewMode === "edit" ? <FiEdit2 /> : <FiPlus />}</span>
                        {blogViewMode === "edit" ? "Edit Blog Article" : "Create New Blog Article"}
                      </h2>
                      <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "3px 0 0 0" }}>
                        {blogViewMode === "edit"
                          ? `Editing "${editingBlog?.title || "article"}"`
                          : "Fill in the details below to publish a new article to the website"}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setBlogViewMode("list");
                        setEditingBlog(null);
                      }}
                      className={styles.btnCancelConfirm}
                      disabled={blogSaving}
                      style={{ padding: "8px 16px", fontSize: "0.84rem" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveBlog}
                      className={styles.btnAddBank}
                      disabled={blogSaving}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 20px",
                        borderRadius: "10px",
                        background: "#007bbd",
                        color: "#ffffff",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.86rem",
                        boxShadow: "0 2px 8px rgba(0, 123, 189, 0.25)",
                      }}
                    >
                      <FiCheckCircle />
                      {blogSaving ? "Saving..." : blogViewMode === "edit" ? "Save Changes" : "Publish Article"}
                    </button>
                  </div>
                </div>

                {blogError && (
                  <div style={{ padding: "12px 16px", borderRadius: "12px", background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", fontSize: "0.88rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>⚠️</span>
                    <span>{blogError}</span>
                  </div>
                )}

                {/* 2-Column Split Layout */}
                <form onSubmit={handleSaveBlog} className={styles.blogEditorLayout}>
                  {/* LEFT: Main Content & Excerpt */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div className={styles.blogEditorCard}>
                      <h3 className={styles.blogCardTitle}>
                        <FiEdit2 style={{ color: "#007bbd" }} /> Article Content
                      </h3>

                      {/* Title */}
                      <div className={styles.blogFormGroup}>
                        <label className={styles.blogFormLabel}>
                          Article Title <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Top 10 High-Growth Locations in Gujarat for 2026"
                          value={blogForm.title}
                          onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                          className={styles.blogFormInput}
                          style={{ fontSize: "0.95rem", fontWeight: 600, padding: "12px 14px" }}
                        />
                      </div>

                      {/* Excerpt */}
                      <div className={styles.blogFormGroup}>
                        <label className={styles.blogFormLabel}>
                          Short Excerpt / Summary <span style={{ color: "#dc2626" }}>*</span>
                          <span className={styles.blogFormLabelHint}>Shown on cards & previews</span>
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="A crisp 1-2 sentence overview summarizing what the reader will learn..."
                          value={blogForm.excerpt}
                          onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                          className={styles.blogFormTextarea}
                          style={{ minHeight: "80px", resize: "vertical" }}
                        />
                      </div>

                      {/* Full Content */}
                      <div className={styles.blogFormGroup}>
                        <label className={styles.blogFormLabel}>
                          Full Article Content (HTML / Text) <span style={{ color: "#dc2626" }}>*</span>
                          <span className={styles.blogFormLabelHint}>Supports standard HTML tags</span>
                        </label>
                        <textarea
                          rows={14}
                          required
                          placeholder="Write your article content here. You can use HTML tags like <h2>, <p>, <ul>, <li>, <strong>, <a> for rich styling..."
                          value={blogForm.content}
                          onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                          className={styles.blogFormTextarea}
                          style={{ fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: "0.88rem", lineHeight: 1.6, minHeight: "260px", resize: "vertical" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDEBAR: Settings & Media */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Publishing Settings Card */}
                    <div className={styles.blogEditorCard}>
                      <h3 className={styles.blogCardTitle}>
                        <FiCheckCircle style={{ color: "#007bbd" }} /> Publication Settings
                      </h3>

                      {/* Status */}
                      <div className={styles.blogFormGroup}>
                        <label className={styles.blogFormLabel}>Publication Status</label>
                        <select
                          value={blogForm.status}
                          onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
                          className={styles.blogFormSelect}
                        >
                          <option value="published">Published (Live on site)</option>
                          <option value="draft">Draft (Hidden from public)</option>
                        </select>
                      </div>

                      {/* Category */}
                      <div className={styles.blogFormGroup}>
                        <label className={styles.blogFormLabel}>Category</label>
                        <select
                          value={blogForm.category}
                          onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                          className={styles.blogFormSelect}
                        >
                          {BLOG_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Author & Read Time in 2 cols */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div className={styles.blogFormGroup}>
                          <label className={styles.blogFormLabel}>Author</label>
                          <input
                            type="text"
                            list="blogAuthorPresets"
                            placeholder="e.g. runr editorial team"
                            value={blogForm.author}
                            onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                            className={styles.blogFormInput}
                          />
                          <datalist id="blogAuthorPresets">
                            <option value="runr editorial team" />
                            <option value="runr market research" />
                            <option value="runr insights" />
                            <option value="runr property advisor" />
                          </datalist>
                        </div>

                        <div className={styles.blogFormGroup}>
                          <label className={styles.blogFormLabel}>Read Time</label>
                          <input
                            type="text"
                            placeholder="e.g. 5 min"
                            value={blogForm.readTime}
                            onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                            className={styles.blogFormInput}
                          />
                        </div>
                      </div>

                      {/* Featured Highlight Checkbox */}
                      <div
                        className={styles.featuredToggleBox}
                        onClick={() => setBlogForm({ ...blogForm, isFeatured: !blogForm.isFeatured })}
                      >
                        <input
                          type="checkbox"
                          id="isFeaturedBlogInPage"
                          checked={blogForm.isFeatured}
                          onChange={(e) => setBlogForm({ ...blogForm, isFeatured: e.target.checked })}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: "17px", height: "17px", accentColor: "#007bbd", cursor: "pointer" }}
                        />
                        <label
                          htmlFor="isFeaturedBlogInPage"
                          style={{ fontSize: "0.85rem", fontWeight: 700, color: "#92400e", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}
                        >
                          <FiStar style={{ color: "#d97706", fontSize: "1rem" }} /> Highlight on Homepage
                        </label>
                      </div>
                    </div>

                    {/* Cover Media Card */}
                    <div className={styles.blogEditorCard}>
                      <h3 className={styles.blogCardTitle}>
                        <FiImage style={{ color: "#007bbd" }} /> Cover Image
                      </h3>

                      <input
                        id="blogCoverInputInPage"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBlogCoverFile(file);
                            setBlogCoverPreview(URL.createObjectURL(file));
                          }
                        }}
                      />

                      {blogCoverPreview ? (
                        <div className={styles.blogImagePreviewBox}>
                          <img src={blogCoverPreview} alt="Preview" className={styles.blogImagePreviewImg} />
                          <div
                            className={styles.blogImageChangeOverlay}
                            onClick={() => document.getElementById("blogCoverInputInPage")?.click()}
                          >
                            <FiEdit2 /> Change Cover Image
                          </div>
                        </div>
                      ) : (
                        <div
                          className={styles.blogImageDropzoneClean}
                          onClick={() => document.getElementById("blogCoverInputInPage")?.click()}
                        >
                          <div style={{ color: "#007bbd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FiImage style={{ fontSize: "2rem" }} />
                          </div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>
                            Upload Cover Image
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                            JPG, PNG, WEBP up to 5MB
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 6. USER PROFILE & ASSOCIATED PROPERTIES MODAL */}
      {selectedUserDetail && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedUserDetail(null)}
        >
          <div
            className={styles.userModalCard}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalAvatar}>
                  {(selectedUserDetail.user?.name || "U").slice(0, 1).toUpperCase()}
                </div>
                <div className={styles.modalUserInfo}>
                  <div className={styles.modalUserTitleRow}>
                    <h3 className={styles.modalUserName}>
                      {selectedUserDetail.user?.name || "User Profile"}
                    </h3>
                    <span
                      className={
                        selectedUserDetail.user?.role === "admin"
                          ? styles.roleBadgeAdmin
                          : selectedUserDetail.user?.role === "owner"
                          ? styles.roleBadgeOwner
                          : selectedUserDetail.user?.role === "bank_partner"
                          ? styles.roleBadgeBank
                          : styles.roleBadgeBuyer
                      }
                    >
                      {selectedUserDetail.user?.role === "bank_partner"
                        ? "Bank Partner"
                        : selectedUserDetail.user?.role?.replace("_", " ")}
                    </span>
                  </div>
                  <div className={styles.modalContactRow}>
                    {selectedUserDetail.user?.email && (
                      <a
                        href={`mailto:${selectedUserDetail.user.email}`}
                        className={styles.modalContactLink}
                        title="Send Email"
                      >
                        <span className={styles.contactIcon}>✉</span>
                        {selectedUserDetail.user.email}
                      </a>
                    )}
                    {selectedUserDetail.user?.mobile ? (
                      <a
                        href={`tel:${selectedUserDetail.user.mobile}`}
                        className={styles.modalContactLink}
                        title="Call User"
                      >
                        <span className={styles.contactIcon}>📞</span>
                        {selectedUserDetail.user.mobile}
                      </a>
                    ) : (
                      <span className={styles.modalNoMobile}>No Mobile</span>
                    )}
                    <span className={styles.modalJoinedDate}>
                      <span className={styles.contactIcon}>🗓</span>
                      Joined:{" "}
                      {(() => {
                        const dt = formatISTDateTime(selectedUserDetail.user?.createdAt);
                        return `${dt.date} ${dt.time ? `(${dt.time})` : ""}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setSelectedUserDetail(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              {userModalLoading ? (
                <div className={styles.modalLoadingBox}>
                  <div className={styles.spinner}></div>
                  <p>Loading user profile & listed properties...</p>
                </div>
              ) : (
                <>
                  {/* 1. STATS SECTION (Dynamic based on Role) */}
                  {selectedUserDetail.user?.role === "buyer" ? (
                    <div className={styles.modalStatsGrid}>
                      <div className={`${styles.modalStatCard} ${styles.statTotal}`}>
                        <div className={styles.modalStatNum}>
                          {selectedUserDetail.counts?.enquiriesCount ?? 0}
                        </div>
                        <div className={styles.modalStatLabel}>Enquiries Sent</div>
                      </div>
                      <div className={`${styles.modalStatCard} ${styles.statActive}`}>
                        <div className={styles.modalStatNum}>
                          {selectedUserDetail.counts?.wishlistCount ?? 0}
                        </div>
                        <div className={styles.modalStatLabel}>Saved in Wishlist</div>
                      </div>
                      <div className={`${styles.modalStatCard} ${styles.statSold}`}>
                        <div className={styles.modalStatNum}>
                          {selectedUserDetail.counts?.loanLeadsCount ?? 0}
                        </div>
                        <div className={styles.modalStatLabel}>Loan Applications</div>
                      </div>
                      <div className={`${styles.modalStatCard} ${styles.statTotal}`}>
                        <div className={styles.modalStatNum} style={{ color: "#007bbd" }}>
                          Active
                        </div>
                        <div className={styles.modalStatLabel}>Buyer Status</div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.modalStatsGrid}>
                      <div className={`${styles.modalStatCard} ${styles.statTotal}`}>
                        <div className={styles.modalStatNum}>
                          {selectedUserDetail.counts?.total ?? 0}
                        </div>
                        <div className={styles.modalStatLabel}>Total Properties</div>
                      </div>
                      <div className={`${styles.modalStatCard} ${styles.statActive}`}>
                        <div className={styles.modalStatNum}>
                          {selectedUserDetail.counts?.active ?? 0}
                        </div>
                        <div className={styles.modalStatLabel}>Active Listings</div>
                      </div>
                      <div className={`${styles.modalStatCard} ${styles.statInactive}`}>
                        <div className={styles.modalStatNum}>
                          {selectedUserDetail.counts?.inactive ?? 0}
                        </div>
                        <div className={styles.modalStatLabel}>Inactive</div>
                      </div>
                      <div className={`${styles.modalStatCard} ${styles.statSold}`}>
                        <div className={styles.modalStatNum}>
                          {selectedUserDetail.counts?.sold ?? 0}
                        </div>
                        <div className={styles.modalStatLabel}>Sold Out</div>
                      </div>
                    </div>
                  )}

                  {/* Bank Partner Details (if role is bank_partner) */}
                  {selectedUserDetail.bankProfile && (
                    <div className={styles.modalBankCard}>
                      <div className={styles.modalBankCardHeader}>
                        <span className={styles.bankIcon}>🏛</span>
                        <strong>Associated Bank Partner Info</strong>
                      </div>
                      <div className={styles.modalBankGrid}>
                        <div className={styles.bankGridItem}>
                          <span className={styles.modalMetaLabel}>Bank Name:</span>
                          <strong className={styles.bankVal}>{selectedUserDetail.bankProfile.bankName}</strong>
                        </div>
                        <div className={styles.bankGridItem}>
                          <span className={styles.modalMetaLabel}>Status:</span>
                          <span
                            className={
                              selectedUserDetail.bankProfile.status === "approved"
                                ? styles.statusApproved
                                : selectedUserDetail.bankProfile.status === "rejected"
                                ? styles.statusRejected
                                : styles.statusPending
                            }
                          >
                            {selectedUserDetail.bankProfile.status}
                          </span>
                        </div>
                        <div className={styles.bankGridItem}>
                          <span className={styles.modalMetaLabel}>Interest Rate:</span>
                          <strong className={styles.bankVal}>{selectedUserDetail.bankProfile.interestRate || "—"}% p.a.</strong>
                        </div>
                        <div className={styles.bankGridItem}>
                          <span className={styles.modalMetaLabel}>Public Visibility:</span>
                          <strong className={styles.bankVal}>{selectedUserDetail.bankProfile.isActive ? "🟢 Visible" : "🔴 Hidden"}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. ROLE SPECIFIC CONTENT LIST */}
                  {selectedUserDetail.user?.role === "buyer" ? (
                    <>
                      {/* Buyer's Property Inquiries */}
                      <div className={styles.modalPropSectionHeader}>
                        <div className={styles.modalPropTitleGroup}>
                          <h4 className={styles.modalSectionTitle}>
                            Buyer's Contacted Property Inquiries
                          </h4>
                          <span className={styles.modalPropCountBadge}>
                            {(selectedUserDetail.enquiries || []).length} Sent
                          </span>
                        </div>
                      </div>

                      {(!selectedUserDetail.enquiries || selectedUserDetail.enquiries.length === 0) ? (
                        <div className={styles.modalEmptyBox}>
                          <div className={styles.emptyIconWrap}>📩</div>
                          <h5 style={{ margin: "10px 0 4px", fontSize: "1rem", color: "#1e293b", fontWeight: 700 }}>No Inquiries Sent Yet</h5>
                          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                            This buyer has not contacted any property owners yet.
                          </p>
                        </div>
                      ) : (
                        <div className={styles.modalTableWrap}>
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th className={styles.thNumber}>#</th>
                                <th style={{ minWidth: "220px" }}>Target Property</th>
                                <th style={{ minWidth: "150px" }}>Property Owner</th>
                                <th style={{ minWidth: "180px" }}>Buyer Message</th>
                                <th style={{ minWidth: "90px" }}>Status</th>
                                <th style={{ textAlign: "right" }}>Inquiry Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedUserDetail.enquiries.map((enq, idx) => (
                                <tr key={enq._id}>
                                  <td className={styles.tdNumber}>{idx + 1}</td>
                                  <td>
                                    {enq.property ? (
                                      <div>
                                        <strong className={styles.modalPropTitle}>{enq.property.title}</strong>
                                        <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                                          {enq.property.city} • ₹ {Number(enq.property.price).toLocaleString("en-IN")}
                                        </div>
                                      </div>
                                    ) : (
                                      <span style={{ color: "#94a3b8" }}>Property unavailable</span>
                                    )}
                                  </td>
                                  <td>
                                    {enq.owner ? (
                                      <div>
                                        <strong>{enq.owner.name}</strong>
                                        <div style={{ fontSize: "0.74rem", color: "#64748b" }}>{enq.owner.email}</div>
                                      </div>
                                    ) : (
                                      "—"
                                    )}
                                  </td>
                                  <td>
                                    <div style={{ fontSize: "0.82rem", color: "#334155", maxWidth: "260px" }}>
                                      "{enq.message}"
                                    </div>
                                  </td>
                                  <td>
                                    <span
                                      className={
                                        enq.status === "Closed"
                                          ? styles.statusApproved
                                          : enq.status === "Contacted"
                                          ? styles.statusPending
                                          : styles.statusActive
                                      }
                                    >
                                      {enq.status || "Pending"}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: "right", fontSize: "0.8rem", color: "#64748b" }}>
                                    {(() => {
                                      const dt = formatISTDateTime(enq.createdAt);
                                      return (
                                        <>
                                          <div style={{ fontWeight: 600, color: "#334155" }}>{dt.date}</div>
                                          {dt.time && <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{dt.time}</div>}
                                        </>
                                      );
                                    })()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Buyer's Wishlist Items (If any) */}
                      {selectedUserDetail.wishlist && selectedUserDetail.wishlist.length > 0 && (
                        <>
                          <div className={styles.modalPropSectionHeader} style={{ marginTop: "12px" }}>
                            <div className={styles.modalPropTitleGroup}>
                              <h4 className={styles.modalSectionTitle}>
                                ❤️ Saved Wishlist Properties
                              </h4>
                              <span className={styles.modalPropCountBadge}>
                                {selectedUserDetail.wishlist.length} Saved
                              </span>
                            </div>
                          </div>
                          <div className={styles.modalTableWrap}>
                            <table className={styles.table}>
                              <thead>
                                <tr>
                                  <th className={styles.thNumber}>#</th>
                                  <th>Property</th>
                                  <th>Location</th>
                                  <th>Price</th>
                                  <th style={{ textAlign: "right" }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedUserDetail.wishlist.map((w, idx) => (
                                  <tr key={w._id}>
                                    <td className={styles.tdNumber}>{idx + 1}</td>
                                    <td>
                                      <strong>{w.propertyId?.title || "Property Listing"}</strong>
                                    </td>
                                    <td>{w.propertyId?.city || "—"}</td>
                                    <td>
                                      <strong style={{ color: "#007bbd" }}>
                                        ₹ {w.propertyId?.price ? Number(w.propertyId.price).toLocaleString("en-IN") : "—"}
                                      </strong>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                      {w.propertyId?._id && (
                                        <a
                                          href={`/property/${w.propertyId._id}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={styles.btnViewLiveSite}
                                        >
                                          View Live ↗
                                        </a>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Properties Table Header for Owners / Bank Partners */}
                      <div className={styles.modalPropSectionHeader}>
                        <div className={styles.modalPropTitleGroup}>
                          <h4 className={styles.modalSectionTitle}>
                            Owner Property Listings
                          </h4>
                          <span className={styles.modalPropCountBadge}>
                            {(selectedUserDetail.properties || []).length} Total
                          </span>
                        </div>
                      </div>

                      {(!selectedUserDetail.properties || selectedUserDetail.properties.length === 0) ? (
                        <div className={styles.modalEmptyBox}>
                          <div className={styles.emptyIconWrap}>🏠</div>
                          <h5 style={{ margin: "10px 0 4px", fontSize: "1rem", color: "#1e293b", fontWeight: 700 }}>No Properties Posted</h5>
                          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                            This user has not listed any property on RunR yet.
                          </p>
                        </div>
                      ) : (
                        <div className={styles.modalTableWrap}>
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th className={styles.thNumber}>#</th>
                                <th style={{ minWidth: "220px" }}>Property</th>
                                <th style={{ minWidth: "120px" }}>Type & Purpose</th>
                                <th style={{ minWidth: "140px" }}>Location</th>
                                <th style={{ minWidth: "110px" }}>Price</th>
                                <th style={{ minWidth: "90px" }}>Status</th>
                                <th style={{ textAlign: "right" }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedUserDetail.properties.map((p, idx) => (
                                <tr key={p._id}>
                                  <td className={styles.tdNumber}>{idx + 1}</td>
                                  <td>
                                    <div className={styles.propItemRow}>
                                      {p.photos && p.photos.length > 0 ? (
                                        <img
                                          src={p.photos[0]}
                                          alt={p.title}
                                          className={styles.modalPropThumb}
                                        />
                                      ) : (
                                        <div className={styles.modalPropPlaceholder}>🏡</div>
                                      )}
                                      <div className={styles.propItemInfo}>
                                        <strong className={styles.modalPropTitle}>{p.title}</strong>
                                        <span className={styles.modalPropDate}>
                                          Added {formatISTDate(p.createdAt)}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                                      <span
                                        className={
                                          p.category?.toLowerCase() === "commercial"
                                            ? styles.categoryCommercial
                                            : styles.categoryResidential
                                        }
                                      >
                                        {p.category || "Residential"}
                                      </span>
                                      <span
                                        className={
                                          p.listingType?.toLowerCase() === "rent"
                                            ? styles.listingBadgeRent
                                            : styles.listingBadgeBuy
                                        }
                                      >
                                        For {p.listingType ? p.listingType.toUpperCase() : "BUY"}
                                      </span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className={styles.propLocationCity}>{p.city}</div>
                                    <div className={styles.propLocationLocality}>{p.locality || "—"}</div>
                                  </td>
                                  <td>
                                    <div className={styles.propPriceTag}>
                                      ₹ {Number(p.price).toLocaleString("en-IN")}
                                    </div>
                                  </td>
                                  <td>
                                    <span
                                      className={
                                        p.status === "active"
                                          ? styles.statusActive
                                          : p.status === "sold"
                                          ? styles.statusSold
                                          : styles.statusInactive
                                      }
                                    >
                                      {p.status === "active" ? "● Active" : p.status === "sold" ? "● Sold" : "● Inactive"}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: "right" }}>
                                    <a
                                      href={`/property/${p._id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={styles.btnViewLiveSite}
                                    >
                                      View Live ↗
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Custom Soft Delete Confirmation Modal */}
      {userToDelete && (
        <div className={styles.confirmModalOverlay} onClick={() => !actionLoading && setUserToDelete(null)}>
          <div className={styles.confirmModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmModalIconWrap}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3 className={styles.confirmModalTitle}>Delete User Account?</h3>
            <p className={styles.confirmModalDesc}>
              Are you sure you want to delete <strong>&quot;{userToDelete.name}&quot;</strong>?
            </p>
            <div className={styles.confirmModalNote}>
              Note: This will perform a soft-delete (hide the user and their listings from the live platform while keeping DB records safe).
            </div>

            <div className={styles.confirmModalActions}>
              <button
                type="button"
                className={styles.btnCancelConfirm}
                disabled={actionLoading === userToDelete.id}
                onClick={() => setUserToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnDeleteConfirm}
                disabled={actionLoading === userToDelete.id}
                onClick={handleConfirmSoftDelete}
              >
                {actionLoading === userToDelete.id ? "Deleting..." : "Yes, Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Soft Delete Confirmation Modal for Bank Partner */}
      {bankToDelete && (
        <div className={styles.confirmModalOverlay} onClick={() => !actionLoading && setBankToDelete(null)}>
          <div className={styles.confirmModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmModalIconWrap}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3 className={styles.confirmModalTitle}>Delete Bank Partner?</h3>
            <p className={styles.confirmModalDesc}>
              Are you sure you want to delete <strong>&quot;{bankToDelete.bankName}&quot;</strong> (Account: {bankToDelete.userName})?
            </p>
            <div className={styles.confirmModalNote}>
              Note: This will soft-delete the bank partner profile and revoke dashboard login access while keeping existing customer lead records intact in the database.
            </div>

            <div className={styles.confirmModalActions}>
              <button
                type="button"
                className={styles.btnCancelConfirm}
                disabled={actionLoading === bankToDelete.id}
                onClick={() => setBankToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnDeleteConfirm}
                disabled={actionLoading === bankToDelete.id}
                onClick={handleDeleteBankPartner}
              >
                {actionLoading === bankToDelete.id ? "Deleting..." : "Yes, Delete Bank Partner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CONTACT LEAD DETAIL / VIEW MESSAGE MODAL */}
      {selectedContactLead && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedContactLead(null)}
        >
          <div
            className={styles.contactModalCard}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={styles.contactModalHeader}>
              <h3 className={styles.contactModalTitle}>
                <span style={{ fontSize: "1.3rem" }}>✉</span>
                Contact Inquiry Details
              </h3>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setSelectedContactLead(null)}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.contactModalBody}>
              {/* Sender Details Grid */}
              <div className={styles.contactModalInfoGrid}>
                <div className={styles.contactInfoField}>
                  <span className={styles.contactInfoLabel}>Sender Name</span>
                  <span className={styles.contactInfoVal}>{selectedContactLead.name}</span>
                </div>
                <div className={styles.contactInfoField}>
                  <span className={styles.contactInfoLabel}>Email Address</span>
                  <span className={styles.contactInfoVal}>
                    <a href={`mailto:${selectedContactLead.email}`}>
                      {selectedContactLead.email}
                    </a>
                  </span>
                </div>
                <div className={styles.contactInfoField}>
                  <span className={styles.contactInfoLabel}>Phone Number</span>
                  <span className={styles.contactInfoVal}>
                    {selectedContactLead.phone ? (
                      <a href={`tel:${selectedContactLead.phone}`}>
                        {selectedContactLead.phone}
                      </a>
                    ) : (
                      <span style={{ color: "#94a3b8", fontWeight: "normal" }}>Not provided</span>
                    )}
                  </span>
                </div>
                <div className={styles.contactInfoField}>
                  <span className={styles.contactInfoLabel}>Received At</span>
                  <span className={styles.contactInfoVal}>
                    {(() => {
                      const dt = formatISTDateTime(selectedContactLead.createdAt);
                      return `${dt.date} ${dt.time ? `(${dt.time})` : ""}`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Message Block */}
              <div className={styles.contactMessageBlock}>
                <div className={styles.contactInfoLabel} style={{ marginBottom: "6px" }}>
                  Subject
                </div>
                <h4 className={styles.contactMessageSubject}>{selectedContactLead.subject}</h4>

                <div className={styles.contactInfoLabel} style={{ marginBottom: "6px", marginTop: "16px" }}>
                  Message
                </div>
                <p className={styles.contactMessageContent}>
                  {selectedContactLead.message || (
                    <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No additional message provided.</span>
                  )}
                </p>
              </div>

              {/* Status Update Control Section */}
              <div className={styles.contactStatusChangerRow}>
                <div className={styles.statusChangerHeader}>
                  <div>
                    <span className={styles.statusChangerTitle}>Lead Follow-up Status</span>
                    <span className={styles.statusChangerSub} style={{ display: "block", marginTop: "2px" }}>
                      Click any option below to update status:
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        background:
                          selectedContactLead.status === "new"
                            ? "#e0f2fe"
                            : selectedContactLead.status === "contacted"
                            ? "#fef3c7"
                            : selectedContactLead.status === "resolved"
                            ? "#d1fae5"
                            : "#f1f5f9",
                        color:
                          selectedContactLead.status === "new"
                            ? "#0284c7"
                            : selectedContactLead.status === "contacted"
                            ? "#b45309"
                            : selectedContactLead.status === "resolved"
                            ? "#047857"
                            : "#475569",
                      }}
                    >
                      ● Current: {selectedContactLead.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className={styles.statusBtnGroup}>
                  {[
                    { key: "new", label: "New", icon: "✨" },
                    { key: "contacted", label: "Contacted", icon: "📞" },
                    { key: "resolved", label: "Resolved", icon: "✅" },
                    { key: "closed", label: "Closed", icon: "⚪" },
                  ].map((st) => {
                    const isCurrent = selectedContactLead.status === st.key;
                    return (
                      <button
                        key={st.key}
                        type="button"
                        disabled={actionLoading === selectedContactLead._id}
                        className={`${styles.statusOptionBtn} ${styles[`statusOptionBtn_${st.key}`]} ${
                          isCurrent ? styles.statusOptionBtnActive : ""
                        }`}
                        onClick={() => handleUpdateContactLeadStatus(selectedContactLead._id, st.key)}
                        title={`Change status to ${st.label}`}
                      >
                        <span>{st.icon}</span>
                        <span>{st.label}</span>
                        {isCurrent && <span style={{ marginLeft: "auto", fontWeight: 900 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={styles.contactModalFooter}>
              <button
                type="button"
                className={styles.btnCancelConfirm}
                onClick={() => {
                  const lead = selectedContactLead;
                  setSelectedContactLead(null);
                  setContactLeadToDelete({
                    id: lead._id,
                    name: lead.name,
                    subject: lead.subject,
                  });
                }}
                style={{ color: "#dc2626", borderColor: "#fecaca" }}
              >
                Delete Lead
              </button>
              <a
                href={`mailto:${selectedContactLead.email}?subject=Re: ${encodeURIComponent(
                  selectedContactLead.subject
                )}`}
                className={styles.btnViewDetails}
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 16px" }}
              >
                ✉ Reply via Email
              </a>
              <button
                type="button"
                className={styles.btnCancelConfirm}
                onClick={() => setSelectedContactLead(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DELETE CONTACT LEAD CONFIRMATION MODAL */}
      {contactLeadToDelete && (
        <div
          className={styles.confirmModalOverlay}
          onClick={() => !actionLoading && setContactLeadToDelete(null)}
        >
          <div className={styles.confirmModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmModalIconWrap}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3 className={styles.confirmModalTitle}>Delete Contact Lead?</h3>
            <p className={styles.confirmModalDesc}>
              Are you sure you want to delete inquiry from <strong>&quot;{contactLeadToDelete.name}&quot;</strong> ({contactLeadToDelete.subject})?
            </p>
            <div className={styles.confirmModalNote}>
              This contact lead record will be permanently deleted from the database.
            </div>

            <div className={styles.confirmModalActions}>
              <button
                type="button"
                className={styles.btnCancelConfirm}
                disabled={actionLoading === contactLeadToDelete.id}
                onClick={() => setContactLeadToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnDeleteConfirm}
                disabled={actionLoading === contactLeadToDelete.id}
                onClick={handleDeleteContactLead}
              >
                {actionLoading === contactLeadToDelete.id ? "Deleting..." : "Yes, Delete Lead"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8.5. PROPERTY ENQUIRY / LEAD DETAIL MODAL */}
      {selectedPropertyLead && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedPropertyLead(null)}
        >
          <div
            className={styles.contactModalCard}
            style={{ maxWidth: "680px", borderRadius: "18px", boxShadow: "0 25px 60px rgba(15, 23, 42, 0.22)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={styles.contactModalHeader} style={{ padding: "18px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "#f0f9ff",
                    border: "1.5px solid #bae6fd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    flexShrink: 0,
                  }}
                >
                  🏠
                </div>
                <div>
                  <h3 className={styles.contactModalTitle} style={{ fontSize: "1.12rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    Property Lead Details
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "#64748b", fontWeight: 500 }}>
                    {selectedPropertyLead.property?.title ? (
                      <>Enquiry for <strong style={{ color: "#334155" }}>{selectedPropertyLead.property.title}</strong> • </>
                    ) : null}
                    Received on {formatISTDate(selectedPropertyLead.createdAt)} at {formatISTTime(selectedPropertyLead.createdAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setSelectedPropertyLead(null)}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.contactModalBody} style={{ padding: "20px 24px", gap: "16px" }}>
              {/* Buyer & Owner 2-Card Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
                {/* Buyer Card */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <span>👤</span> BUYER / INQUIRER
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                    {selectedPropertyLead.name}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "2px" }}>
                    {selectedPropertyLead.mobile ? (
                      <a
                        href={`tel:${selectedPropertyLead.mobile}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#007bbd", textDecoration: "none", fontSize: "0.84rem", fontWeight: 600 }}
                      >
                        <span>📞</span> {selectedPropertyLead.mobile}
                      </a>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No phone provided</span>
                    )}
                    {selectedPropertyLead.email ? (
                      <a
                        href={`mailto:${selectedPropertyLead.email}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", textDecoration: "none", fontSize: "0.8rem", wordBreak: "break-all" }}
                      >
                        <span>✉️</span> {selectedPropertyLead.email}
                      </a>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No email provided</span>
                    )}
                  </div>
                </div>

                {/* Property Owner Card */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <span>🏢</span> PROPERTY OWNER
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                    {selectedPropertyLead.owner?.name || "Property Owner"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "2px" }}>
                    {selectedPropertyLead.owner?.mobile ? (
                      <a
                        href={`tel:${selectedPropertyLead.owner.mobile}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#007bbd", textDecoration: "none", fontSize: "0.84rem", fontWeight: 600 }}
                      >
                        <span>📞</span> {selectedPropertyLead.owner.mobile}
                      </a>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Phone not listed</span>
                    )}
                    {selectedPropertyLead.owner?.email ? (
                      <a
                        href={`mailto:${selectedPropertyLead.owner.email}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", textDecoration: "none", fontSize: "0.8rem", wordBreak: "break-all" }}
                      >
                        <span>✉️</span> {selectedPropertyLead.owner.email}
                      </a>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Email not listed</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Property Card Snippet */}
              {selectedPropertyLead.property && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    background: "#ffffff",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
                  }}
                >
                  <img
                    src={getMediaUrl((selectedPropertyLead.property.images && selectedPropertyLead.property.images[0]) || (selectedPropertyLead.property.photos && selectedPropertyLead.property.photos[0]) || selectedPropertyLead.property.image || "/img/buy-properties/1.jpg")}
                    alt={selectedPropertyLead.property.title || "Property"}
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: "1px solid #e2e8f0",
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/img/buy-properties/1.jpg";
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: "0 0 3px", fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {selectedPropertyLead.property.title}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", flexWrap: "wrap" }}>
                      <span style={{ color: "#007bbd", fontWeight: 800 }}>
                        {selectedPropertyLead.property.price ? (selectedPropertyLead.property.price >= 10000000 ? `₹ ${(selectedPropertyLead.property.price / 10000000).toFixed(2)} Cr` : `₹ ${(selectedPropertyLead.property.price / 100000).toFixed(1)} Lakh`) : "Price on Request"}
                      </span>
                      <span style={{ color: "#64748b", fontWeight: 600 }}>
                        📍 {selectedPropertyLead.property.city || selectedPropertyLead.property.locality || "Gujarat"}
                      </span>
                    </div>
                  </div>
                  {selectedPropertyLead.property._id && (
                    <a
                      href={`/property/${selectedPropertyLead.property._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: "none",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#007bbd",
                        background: "#f0f9ff",
                        border: "1px solid #bae6fd",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      View Property ↗
                    </a>
                  )}
                </div>
              )}

              {/* Buyer's Message Box */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span>💬</span> BUYER&apos;S MESSAGE
                </div>
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderLeft: "3.5px solid #007bbd",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    fontSize: "0.88rem",
                    color: "#334155",
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedPropertyLead.message ? (
                    selectedPropertyLead.message
                  ) : (
                    <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No message provided by buyer.</span>
                  )}
                </div>
              </div>

              {/* Live Owner Managed Status Card */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🛡️</span> Live Lead Status
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: "0.74rem", color: "#64748b", fontWeight: 500 }}>
                    Status managed directly by Property Owner ({selectedPropertyLead.owner?.name || "Owner"})
                  </p>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "0.76rem",
                      fontWeight: 800,
                      padding: "4px 12px",
                      borderRadius: "20px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      letterSpacing: "0.03em",
                      border:
                        (selectedPropertyLead.status || "").toLowerCase() === "pending"
                          ? "1px solid #fde68a"
                          : (selectedPropertyLead.status || "").toLowerCase() === "contacted"
                          ? "1px solid #bae6fd"
                          : "1px solid #a7f3d0",
                      background:
                        (selectedPropertyLead.status || "").toLowerCase() === "pending"
                          ? "#fef3c7"
                          : (selectedPropertyLead.status || "").toLowerCase() === "contacted"
                          ? "#e0f2fe"
                          : "#d1fae5",
                      color:
                        (selectedPropertyLead.status || "").toLowerCase() === "pending"
                          ? "#b45309"
                          : (selectedPropertyLead.status || "").toLowerCase() === "contacted"
                          ? "#0284c7"
                          : "#047857",
                    }}
                  >
                    ● {(selectedPropertyLead.status || "Pending").toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                background: "#f8fafc",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const lead = selectedPropertyLead;
                  setSelectedPropertyLead(null);
                  setPropertyLeadToDelete({
                    id: lead._id,
                    name: lead.name,
                    propertyTitle: lead.property?.title || "Property",
                  });
                }}
                style={{
                  background: "#ffffff",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                🗑 Delete Lead
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                {selectedPropertyLead.mobile && (
                  <a
                    href={`tel:${selectedPropertyLead.mobile}`}
                    style={{
                      textDecoration: "none",
                      background: "#f0f9ff",
                      color: "#007bbd",
                      border: "1px solid #bae6fd",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    📞 Call Buyer
                  </a>
                )}
                {selectedPropertyLead.email && (
                  <a
                    href={`mailto:${selectedPropertyLead.email}?subject=Regarding Enquiry for ${encodeURIComponent(
                      selectedPropertyLead.property?.title || "Property"
                    )}`}
                    style={{
                      textDecoration: "none",
                      background: "#f0f9ff",
                      color: "#007bbd",
                      border: "1px solid #bae6fd",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    ✉ Email Buyer
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedPropertyLead(null)}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8.6. DELETE PROPERTY LEAD CONFIRMATION MODAL */}
      {propertyLeadToDelete && (
        <div
          className={styles.confirmModalOverlay}
          onClick={() => !actionLoading && setPropertyLeadToDelete(null)}
        >
          <div className={styles.confirmModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmModalIconWrap}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3 className={styles.confirmModalTitle}>Delete Property Enquiry?</h3>
            <p className={styles.confirmModalDesc}>
              Are you sure you want to delete inquiry from <strong>&quot;{propertyLeadToDelete.name}&quot;</strong> for property &quot;{propertyLeadToDelete.propertyTitle}&quot;?
            </p>
            <div className={styles.confirmModalNote}>
              This property enquiry record will be permanently deleted from the database.
            </div>

            <div className={styles.confirmModalActions}>
              <button
                type="button"
                className={styles.btnCancelConfirm}
                disabled={actionLoading === propertyLeadToDelete.id}
                onClick={() => setPropertyLeadToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnDeleteConfirm}
                disabled={actionLoading === propertyLeadToDelete.id}
                onClick={handleDeletePropertyLead}
              >
                {actionLoading === propertyLeadToDelete.id ? "Deleting..." : "Yes, Delete Enquiry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. BANK PARTNER SET / RESET PASSWORD MODAL */}
      {pwdModalBank && (
        <div
          className={styles.confirmModalOverlay}
          onClick={() => !pwdLoading && setPwdModalBank(null)}
        >
          <div className={styles.pwdModalCard} onClick={(e) => e.stopPropagation()}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveBankPassword();
              }}
              autoComplete="off"
            >
              <div className={styles.pwdModalHeader}>
                <h3 className={styles.pwdModalTitle}>
                  <span>🔑</span> Set Bank Partner Password
                </h3>
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  style={{ fontSize: "1.2rem", width: "30px", height: "30px" }}
                  onClick={() => !pwdLoading && setPwdModalBank(null)}
                >
                  ×
                </button>
              </div>

              <div className={styles.pwdModalBody}>
                <div className={styles.pwdUserBox}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
                    {pwdModalBank.bankName}
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "#0284c7", fontWeight: 600 }}>
                    ✉ {pwdModalBank.email}
                  </span>
                </div>

                <div className={styles.pwdFormGroup}>
                  <label className={styles.pwdLabel}>New Login Password</label>
                  <div className={styles.pwdInputWrapper}>
                    <input
                      type={showPwdText ? "text" : "password"}
                      name="partnerNewPassword"
                      id="partnerNewPassword"
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                      value={newPwdText}
                      onChange={(e) => setNewPwdText(e.target.value)}
                      placeholder="Enter minimum 6 characters..."
                      className={styles.pwdInput}
                      autoFocus
                    />
                    <button
                      type="button"
                      className={styles.pwdEyeBtn}
                      onClick={() => setShowPwdText(!showPwdText)}
                      title={showPwdText ? "Hide password" : "Show password"}
                    >
                      {showPwdText ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {pwdError && (
                    <div style={{ fontSize: "0.78rem", color: "#dc2626", fontWeight: 700, marginTop: "2px" }}>
                      ⚠️ {pwdError}
                    </div>
                  )}
                  <small style={{ fontSize: "0.74rem", color: "#64748b" }}>
                    This updates the partner&apos;s password directly in the database.
                  </small>
                </div>
              </div>

              <div className={styles.pwdModalFooter}>
                <button
                  type="button"
                  className={styles.btnCancelConfirm}
                  onClick={() => setPwdModalBank(null)}
                  disabled={pwdLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnSavePwd}
                  disabled={pwdLoading || !newPwdText || newPwdText.trim().length < 6}
                >
                  {pwdLoading ? "Updating..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. DELETE BLOG CONFIRMATION MODAL */}
      {blogToDelete && (
        <div className={styles.confirmModalOverlay} onClick={() => !actionLoading && setBlogToDelete(null)}>
          <div className={styles.confirmModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmModalIconWrap}>
              <FiTrash2 style={{ fontSize: "28px", color: "#dc2626" }} />
            </div>

            <h3 className={styles.confirmModalTitle}>Delete Blog Post?</h3>
            <p className={styles.confirmModalDesc}>
              Are you sure you want to delete <strong>&quot;{blogToDelete.title}&quot;</strong>?
            </p>
            <div className={styles.confirmModalNote}>
              This article will be removed from the blog listing and homepage.
            </div>

            <div className={styles.confirmModalActions}>
              <button
                type="button"
                className={styles.btnCancelConfirm}
                disabled={actionLoading === blogToDelete._id}
                onClick={() => setBlogToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnDeleteConfirm}
                disabled={actionLoading === blogToDelete._id}
                onClick={handleDeleteBlog}
              >
                {actionLoading === blogToDelete._id ? "Deleting..." : "Yes, Delete Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
