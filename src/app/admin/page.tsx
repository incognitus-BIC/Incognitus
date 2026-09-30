"use client";

import { useEffect, useState, useTransition } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Event, TeamMember } from "@/types/database";
import ImageCropModal from "./ImageCropModal";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"team" | "events">("team");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "hidden">("all");

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 3200);
  };

  // ==========================================
  // IMAGE CROP & UPLOAD MODAL STATE
  // ==========================================
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropConfig, setCropConfig] = useState<{
    aspectRatio: number;
    circularCrop: boolean;
    bucketName: string;
    folder: string;
    title: string;
    targetWidth: number;
    targetHeight: number;
    onSuccess: (url: string) => void;
  }>({
    aspectRatio: 1,
    circularCrop: true,
    bucketName: "media",
    folder: "team",
    title: "Crop & Frame Member Avatar (1:1)",
    targetWidth: 600,
    targetHeight: 600,
    onSuccess: () => {},
  });

  const openEventImageCropper = () => {
    setCropConfig({
      aspectRatio: 16 / 9,
      circularCrop: false,
      bucketName: "media",
      folder: "events",
      title: "Crop & Resize Event Banner (16:9)",
      targetWidth: 1280,
      targetHeight: 720,
      onSuccess: (url: string) => {
        setFormImageUrl(url);
      },
    });
    setIsCropModalOpen(true);
  };

  const openTeamAvatarCropper = () => {
    setCropConfig({
      aspectRatio: 1,
      circularCrop: true,
      bucketName: "media",
      folder: "team",
      title: "Crop & Frame Member Avatar (1:1)",
      targetWidth: 600,
      targetHeight: 600,
      onSuccess: (url: string) => {
        setMemberImageUrl(url);
      },
    });
    setIsCropModalOpen(true);
  };

  // Direct 1-click cropper from card deck
  const openMemberCropperDirectly = (member: TeamMember) => {
    setCropConfig({
      aspectRatio: 1,
      circularCrop: true,
      bucketName: "media",
      folder: "team",
      title: `Update Avatar: ${member.name} (1:1)`,
      targetWidth: 600,
      targetHeight: 600,
      onSuccess: async (url: string) => {
        if (!supabase) return;
        setTeamMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, image_url: url } : m))
        );
        try {
          const { error } = await supabase
            .from("team_members")
            .update({ image_url: url })
            .eq("id", member.id);
          if (error) throw error;
          showToast(`Avatar updated for ${member.name}!`, "success");
        } catch {
          showToast("Failed to save avatar", "error");
          loadTeamMembers();
        }
      },
    });
    setIsCropModalOpen(true);
  };

  const openEventCropperDirectly = (event: Event) => {
    setCropConfig({
      aspectRatio: 16 / 9,
      circularCrop: false,
      bucketName: "media",
      folder: "events",
      title: `Update Banner: ${event.title} (16:9)`,
      targetWidth: 1280,
      targetHeight: 720,
      onSuccess: async (url: string) => {
        if (!supabase) return;
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, image_url: url } : e))
        );
        try {
          const { error } = await supabase
            .from("events")
            .update({ image_url: url })
            .eq("id", event.id);
          if (error) throw error;
          showToast(`Banner updated for ${event.title}!`, "success");
        } catch {
          showToast("Failed to save banner", "error");
          loadEvents();
        }
      },
    });
    setIsCropModalOpen(true);
  };

  // ==========================================
  // EVENTS STATE
  // ==========================================
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsTableMissing, setEventsTableMissing] = useState(false);
  const [isEventPending, startEventTransition] = useTransition();

  // Event Form State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formLocation, setFormLocation] = useState("Biratnagar International College");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formRegistrationUrl, setFormRegistrationUrl] = useState("");
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [eventFormMessage, setEventFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ==========================================
  // TEAM STATE
  // ==========================================
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [teamTableMissing, setTeamTableMissing] = useState(false);
  const [isTeamPending, startTeamTransition] = useTransition();

  // Team Member Form State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberInitials, setMemberInitials] = useState("");
  const [memberImageUrl, setMemberImageUrl] = useState("");
  const [memberDisplayOrder, setMemberDisplayOrder] = useState<number>(1);
  const [memberIsActive, setMemberIsActive] = useState(true);
  const [teamFormMessage, setTeamFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ==========================================
  // FETCH LOGIC
  // ==========================================
  const loadEvents = async () => {
    if (!supabase) {
      setLoadingEvents(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setEventsTableMissing(true);
        setEvents([]);
      } else {
        setEventsTableMissing(false);
        setEvents(data ?? []);
      }
    } catch {
      setEventsTableMissing(true);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadTeamMembers = async () => {
    if (!supabase) {
      setLoadingTeam(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        setTeamTableMissing(true);
        setTeamMembers([]);
      } else {
        setTeamTableMissing(false);
        setTeamMembers(data ?? []);
      }
    } catch {
      setTeamTableMissing(true);
      setTeamMembers([]);
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      if (!supabase) {
        if (isMounted) {
          setLoadingEvents(false);
          setLoadingTeam(false);
        }
        return;
      }

      try {
        const [eventsRes, teamRes] = await Promise.all([
          supabase.from("events").select("*").order("created_at", { ascending: false }),
          supabase.from("team_members").select("*").order("display_order", { ascending: true }),
        ]);

        if (!isMounted) return;

        if (eventsRes.error) {
          setEventsTableMissing(true);
        } else {
          setEventsTableMissing(false);
          setEvents(eventsRes.data ?? []);
        }

        if (teamRes.error) {
          setTeamTableMissing(true);
        } else {
          setTeamTableMissing(false);
          setTeamMembers(teamRes.data ?? []);
        }
      } catch {
        if (isMounted) {
          setEventsTableMissing(true);
          setTeamTableMissing(true);
        }
      } finally {
        if (isMounted) {
          setLoadingEvents(false);
          setLoadingTeam(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper for auto-generating initials
  const handleNameChange = (val: string) => {
    setMemberName(val);
    if (!editingMemberId || !memberInitials) {
      const parts = val.trim().split(/\s+/);
      const inits =
        parts.length > 1
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : val.slice(0, 2).toUpperCase();
      setMemberInitials(inits);
    }
  };

  // ==========================================
  // EVENT ACTIONS
  // ==========================================
  const openCreateEventModal = () => {
    setEditingEventId(null);
    setFormTitle("");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setFormDate(tomorrow.toISOString().slice(0, 16));
    setFormLocation("Biratnagar International College");
    setFormDescription("");
    setFormImageUrl("");
    setFormRegistrationUrl("");
    setFormIsPublished(true);
    setEventFormMessage(null);
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (event: Event) => {
    setEditingEventId(event.id);
    setFormTitle(event.title);
    setFormDate(new Date(event.date).toISOString().slice(0, 16));
    setFormLocation(event.location);
    setFormDescription(event.description);
    setFormImageUrl(event.image_url || "");
    setFormRegistrationUrl(event.registration_form_url || "");
    setFormIsPublished(event.is_published);
    setEventFormMessage(null);
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setEventFormMessage(null);

    if (!formTitle.trim()) {
      setEventFormMessage({ type: "error", text: "Please enter an event title." });
      return;
    }
    if (!formDate) {
      setEventFormMessage({ type: "error", text: "Please select an event date." });
      return;
    }

    const client = supabase;
    if (!client) return;

    startEventTransition(async () => {
      try {
        const payload = {
          title: formTitle.trim(),
          date: new Date(formDate).toISOString(),
          location: formLocation.trim() || "Biratnagar International College",
          description: formDescription.trim(),
          image_url: formImageUrl.trim() || null,
          registration_form_url: formRegistrationUrl.trim() || null,
          is_published: formIsPublished,
        };

        if (editingEventId) {
          const { error } = await client
            .from("events")
            .update(payload)
            .eq("id", editingEventId);
          if (error) throw error;
          setEventFormMessage({ type: "success", text: "Event updated successfully!" });
          showToast(`Event "${formTitle.trim()}" updated!`, "success");
        } else {
          const { error } = await client.from("events").insert([payload]);
          if (error) throw error;
          setEventFormMessage({ type: "success", text: "Event created successfully!" });
          showToast(`New event "${formTitle.trim()}" created!`, "success");
        }

        await loadEvents();
        setTimeout(() => setIsEventModalOpen(false), 700);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to save event";
        setEventFormMessage({ type: "error", text: message });
      }
    });
  };

  const toggleEventPublished = async (event: Event) => {
    if (!supabase) return;
    const newStatus = !event.is_published;
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, is_published: newStatus } : e))
    );
    showToast(
      newStatus ? `"${event.title}" is now LIVE on portfolio` : `"${event.title}" moved to drafts`,
      "info"
    );

    try {
      const { error } = await supabase
        .from("events")
        .update({ is_published: newStatus })
        .eq("id", event.id);
      if (error) throw error;
    } catch {
      loadEvents();
    }
  };

  const deleteEvent = async (id: string, title: string) => {
    if (!supabase) return;
    if (!confirm(`Are you sure you want to delete event "${title}"?`)) return;
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== id));
      showToast(`Deleted event "${title}"`, "info");
    } catch {
      showToast("Failed to delete event", "error");
    }
  };

  // ==========================================
  // TEAM MEMBER ACTIONS
  // ==========================================
  const openCreateMemberModal = () => {
    setEditingMemberId(null);
    setMemberName("");
    setMemberRole("");
    setMemberInitials("");
    setMemberImageUrl("");
    setMemberDisplayOrder(teamMembers.length + 1);
    setMemberIsActive(true);
    setTeamFormMessage(null);
    setIsTeamModalOpen(true);
  };

  const openEditMemberModal = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setMemberName(member.name);
    setMemberRole(member.role);
    setMemberInitials(member.initials || "");
    setMemberImageUrl(member.image_url || "");
    setMemberDisplayOrder(member.display_order);
    setMemberIsActive(member.is_active);
    setTeamFormMessage(null);
    setIsTeamModalOpen(true);
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setTeamFormMessage(null);

    if (!memberName.trim()) {
      setTeamFormMessage({ type: "error", text: "Please enter the member's full name." });
      return;
    }
    if (!memberRole.trim()) {
      setTeamFormMessage({ type: "error", text: "Please enter the member's role." });
      return;
    }

    const client = supabase;
    if (!client) return;

    startTeamTransition(async () => {
      try {
        const payload = {
          name: memberName.trim(),
          role: memberRole.trim(),
          initials: memberInitials.trim().toUpperCase() || memberName.trim().slice(0, 2).toUpperCase(),
          image_url: memberImageUrl.trim() || null,
          display_order: Number(memberDisplayOrder) || 1,
          is_active: memberIsActive,
        };

        if (editingMemberId) {
          const { error } = await client
            .from("team_members")
            .update(payload)
            .eq("id", editingMemberId);
          if (error) throw error;
          setTeamFormMessage({ type: "success", text: "Member updated successfully!" });
          showToast(`Officer "${memberName.trim()}" updated!`, "success");
        } else {
          const { error } = await client.from("team_members").insert([payload]);
          if (error) throw error;
          setTeamFormMessage({ type: "success", text: "Member added successfully!" });
          showToast(`Officer "${memberName.trim()}" added to team!`, "success");
        }

        await loadTeamMembers();
        setTimeout(() => setIsTeamModalOpen(false), 700);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to save team member";
        setTeamFormMessage({ type: "error", text: message });
      }
    });
  };

  const toggleMemberActive = async (member: TeamMember) => {
    if (!supabase) return;
    const newStatus = !member.is_active;
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, is_active: newStatus } : m))
    );
    showToast(
      newStatus ? `${member.name} is now LIVE on portfolio` : `${member.name} is now HIDDEN`,
      "info"
    );

    try {
      const { error } = await supabase
        .from("team_members")
        .update({ is_active: newStatus })
        .eq("id", member.id);
      if (error) throw error;
    } catch {
      loadTeamMembers();
    }
  };

  const moveMemberOrder = async (index: number, direction: "up" | "down") => {
    if (!supabase) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= teamMembers.length) return;

    const currentMember = teamMembers[index];
    const targetMember = teamMembers[targetIndex];

    const newCurrentOrder = targetMember.display_order;
    const newTargetOrder = currentMember.display_order;

    // Optimistic update
    const updated = [...teamMembers];
    updated[index] = { ...currentMember, display_order: newCurrentOrder };
    updated[targetIndex] = { ...targetMember, display_order: newTargetOrder };
    updated.sort((a, b) => a.display_order - b.display_order);
    setTeamMembers(updated);
    showToast(`Reordered "${currentMember.name}" ${direction === "up" ? "up" : "down"}`);

    try {
      await supabase
        .from("team_members")
        .update({ display_order: newCurrentOrder })
        .eq("id", currentMember.id);
      await supabase
        .from("team_members")
        .update({ display_order: newTargetOrder })
        .eq("id", targetMember.id);
    } catch {
      loadTeamMembers();
    }
  };

  const deleteTeamMember = async (id: string, name: string) => {
    if (!supabase) return;
    if (!confirm(`Are you sure you want to remove "${name}" from the team?`)) return;
    try {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
      showToast(`Removed "${name}" from team`, "info");
    } catch {
      showToast("Failed to delete team member", "error");
    }
  };

  // Filtered lists
  const filteredMembers = teamMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && m.is_active) ||
      (filterStatus === "hidden" && !m.is_active);
    return matchesSearch && matchesStatus;
  });

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && e.is_published) ||
      (filterStatus === "hidden" && !e.is_published);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in pb-12">
      {/* ========================================================================= */}
      {/* FLOATING TOAST NOTIFICATION */}
      {/* ========================================================================= */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border text-xs sm:text-sm font-medium ${
              toast.type === "success"
                ? "bg-slate-900/95 text-white border-emerald-500/30"
                : toast.type === "error"
                ? "bg-red-950/95 text-red-100 border-red-500/30"
                : "bg-slate-900/95 text-white border-purple-500/30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                toast.type === "success"
                  ? "bg-emerald-400"
                  : toast.type === "error"
                  ? "bg-red-400"
                  : "bg-purple-400"
              }`}
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXECUTIVE COMMAND HEADER */}
      {/* ========================================================================= */}
      <div className="bg-white/85 backdrop-blur-xl border border-purple-100/90 rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_-10px_rgba(75,63,135,0.08)] flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle Ambient Background Highlight */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-purple-200/35 via-indigo-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="section-label mb-0">&lt;console/&gt;</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs font-mono font-medium text-slate-500">
              Live Club Operations Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-[var(--font-heading)] text-[var(--color-dark,#1F1A33)]">
            Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Manage your executive officers, photos, workshop events, and registration forms in real-time with instant live portfolio synchronization.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {activeTab === "team" ? (
            <button
              onClick={openCreateMemberModal}
              disabled={teamTableMissing || !isSupabaseConfigured}
              className="px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md shadow-purple-950/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #5D4FA0 0%, #4B3F87 100%)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Team Officer</span>
            </button>
          ) : (
            <button
              onClick={openCreateEventModal}
              disabled={eventsTableMissing || !isSupabaseConfigured}
              className="px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md shadow-purple-950/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #5D4FA0 0%, #4B3F87 100%)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Create New Event</span>
            </button>
          )}

          <button
            onClick={() => {
              if (activeTab === "team") loadTeamMembers();
              else loadEvents();
              showToast("Syncing with Supabase database...", "info");
            }}
            disabled={loadingTeam || loadingEvents}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors inline-flex items-center gap-1.5 shadow-2xs hover:border-slate-300 cursor-pointer"
            title="Refresh database records"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className={loadingTeam || loadingEvents ? "animate-spin text-[#4B3F87]" : "text-slate-500"}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEGMENTED NAVIGATION PILL BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
        {/* Navigation Tabs with Nesting Radii */}
        <div className="inline-flex items-center bg-white p-1.5 rounded-2xl border border-purple-100 shadow-sm backdrop-blur-md">
          <button
            onClick={() => {
              setActiveTab("team");
              setSearchQuery("");
            }}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm font-[var(--font-heading)] transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
              activeTab === "team"
                ? "bg-[#4B3F87] text-white shadow-md shadow-purple-900/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-purple-50/60"
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Team Section</span>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold transition-colors ${
                activeTab === "team"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {teamMembers.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("events");
              setSearchQuery("");
            }}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm font-[var(--font-heading)] transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
              activeTab === "events"
                ? "bg-[#4B3F87] text-white shadow-md shadow-purple-900/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-purple-50/60"
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Events &amp; Workshops</span>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold transition-colors ${
                activeTab === "events"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {events.length}
            </span>
          </button>
        </div>

        {/* Live Status indicator pill */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-purple-100/80 text-[11px] font-mono text-slate-500 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>RLS Storage: media/</span>
          <span className="text-slate-300">&bull;</span>
          <span>WebP Optimized</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TEAM SECTION */}
      {/* ========================================================================= */}
      {activeTab === "team" && (
        <div className="flex flex-col gap-6">
          {/* Metrics Overview Cards with Elevated Corners */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-purple-100/80 bg-white/90 p-5 shadow-xs hover:shadow-md hover:border-purple-200 transition-all duration-300 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                  Total Officers
                </span>
                <div className="text-3xl font-extrabold mt-1 font-[var(--font-heading)] text-[var(--color-dark,#1F1A33)]">
                  {teamMembers.length}
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Configured in roster</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 text-[var(--color-primary)] flex items-center justify-center ring-1 ring-purple-100 shadow-2xs">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-medium text-emerald-600 uppercase tracking-wider">
                  Live On Site
                </span>
                <div className="text-3xl font-extrabold mt-1 font-[var(--font-heading)] text-emerald-600">
                  {teamMembers.filter((m) => m.is_active).length}
                </div>
                <span className="text-[11px] text-emerald-600/70 mt-0.5 block">Visible to public visitors</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-100 shadow-2xs">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                  Hidden / Inactive
                </span>
                <div className="text-3xl font-extrabold mt-1 font-[var(--font-heading)] text-slate-500">
                  {teamMembers.filter((m) => !m.is_active).length}
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Excluded from public site</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center ring-1 ring-slate-200 shadow-2xs">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              </div>
            </div>
          </div>

          {/* Unified Search & Status Filter Toolbelt */}
          <div className="bg-white border border-purple-100/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search officers by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[#4B3F87] focus:bg-white focus:outline-none text-xs sm:text-sm text-slate-800 transition-colors shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 shrink-0 self-start sm:self-auto">
                {(["all", "active", "hidden"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 cursor-pointer ${
                      filterStatus === status
                        ? "bg-white text-[#4B3F87] shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {status === "all" ? "All" : status === "active" ? "Live" : "Hidden"}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Result Counter */}
            <div className="text-xs font-mono text-slate-400 shrink-0 self-start md:self-center">
              Showing {filteredMembers.length} of {teamMembers.length}
            </div>
          </div>

          {/* Members Deck */}
          {loadingTeam ? (
            <div className="py-20 bg-white/80 rounded-3xl border border-purple-100 text-center">
              <div className="w-8 h-8 mx-auto border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-700">Connecting to Supabase team records...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-16 px-6 bg-white/80 rounded-3xl border border-dashed border-purple-200 text-center max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="font-bold text-base text-slate-900">
                {searchQuery ? "No members match your search query" : "No Team Members Configured Yet"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? "Try clearing your search query or switching the status filter."
                  : "Click 'Add Team Officer' above to create your first executive card."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs font-semibold text-[var(--color-primary)] hover:underline"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
              {filteredMembers.map((member, index) => (
                <div
                  key={member.id}
                  className={`group relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/5 hover:-translate-y-1 p-5 flex flex-col justify-between ${
                    member.is_active
                      ? "border-purple-100/90 hover:border-purple-300"
                      : "border-slate-200/90 bg-slate-50/50 opacity-80"
                  }`}
                >
                  {/* Card Top: Rank Badge, Reorder Arrows & 1-Click Status Pill */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/80">
                        #{index + 1}
                      </span>

                      {/* Order Adjustment Arrows */}
                      <div className="flex items-center border border-slate-200/90 rounded-lg overflow-hidden bg-white shadow-2xs">
                        <button
                          onClick={() => moveMemberOrder(index, "up")}
                          disabled={index === 0}
                          className="p-1 hover:bg-purple-50 hover:text-[var(--color-primary)] disabled:opacity-20 text-slate-500 transition-colors"
                          title="Move Up in Roster"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                        </button>
                        <span className="w-px h-3 bg-slate-200" />
                        <button
                          onClick={() => moveMemberOrder(index, "down")}
                          disabled={index === teamMembers.length - 1}
                          className="p-1 hover:bg-purple-50 hover:text-[var(--color-primary)] disabled:opacity-20 text-slate-500 transition-colors"
                          title="Move Down in Roster"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Direct 1-Click Live/Hidden Toggle Pill */}
                    <button
                      onClick={() => toggleMemberActive(member)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all shadow-2xs ${
                        member.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                      }`}
                      title="Click to toggle public visibility"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          member.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                        }`}
                      />
                      <span>{member.is_active ? "LIVE" : "HIDDEN"}</span>
                    </button>
                  </div>

                  {/* Member Centerpiece */}
                  <div className="text-center py-2">
                    <div className="relative group/avatar inline-block mx-auto mb-3">
                      <div
                        className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden flex items-center justify-center shadow-md border-2 border-white ring-4 ring-purple-100/90 group-hover:ring-purple-200 transition-all duration-300"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--color-secondary-light), var(--color-primary))",
                        }}
                      >
                        {member.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.image_url}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover/avatar:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span
                            className="text-2xl font-bold text-white select-none"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {member.initials || member.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Quick Change Photo on Hover */}
                      <button
                        onClick={() => openMemberCropperDirectly(member)}
                        className="absolute inset-0 rounded-full bg-slate-950/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 backdrop-blur-xs cursor-pointer"
                        title="Click to crop or change avatar"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span>Change</span>
                      </button>
                    </div>

                    <h3
                      className="text-base font-bold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors truncate px-2"
                      title={member.name}
                    >
                      {member.name}
                    </h3>

                    <div className="mt-1">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-purple-50 text-[var(--color-primary)] border border-purple-100/80 truncate max-w-full"
                        title={member.role}
                      >
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditMemberModal(member)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/80 text-xs font-semibold text-[var(--color-primary)] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      <span>Edit Profile</span>
                    </button>

                    <button
                      onClick={() => deleteTeamMember(member.id, member.name)}
                      className="p-2 rounded-xl border border-red-200/80 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors shadow-2xs"
                      title="Remove officer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EVENTS & WORKSHOPS */}
      {/* ========================================================================= */}
      {activeTab === "events" && (
        <div className="flex flex-col gap-6">
          {/* Events Metric Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-purple-100/80 bg-white/90 p-5 shadow-xs hover:shadow-md hover:border-purple-200 transition-all duration-300 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                  Total Events
                </span>
                <div className="text-3xl font-extrabold mt-1 font-[var(--font-heading)] text-[var(--color-dark,#1F1A33)]">
                  {events.length}
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Workshops &amp; CTF matches</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 text-[var(--color-primary)] flex items-center justify-center ring-1 ring-purple-100 shadow-2xs">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-medium text-emerald-600 uppercase tracking-wider">
                  Live on Portfolio
                </span>
                <div className="text-3xl font-extrabold mt-1 font-[var(--font-heading)] text-emerald-600">
                  {events.filter((e) => e.is_published).length}
                </div>
                <span className="text-[11px] text-emerald-600/70 mt-0.5 block">Accepting public visitors</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-100 shadow-2xs">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white/90 p-5 shadow-xs hover:shadow-md hover:border-amber-200 transition-all duration-300 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-medium text-amber-600 uppercase tracking-wider">
                  Drafts
                </span>
                <div className="text-3xl font-extrabold mt-1 font-[var(--font-heading)] text-amber-600">
                  {events.filter((e) => !e.is_published).length}
                </div>
                <span className="text-[11px] text-amber-600/70 mt-0.5 block">Unpublished drafts</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-100 shadow-2xs">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
          </div>

          {/* Unified Search & Filter Toolbelt */}
          <div className="bg-white border border-purple-100/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search events by title or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[#4B3F87] focus:bg-white focus:outline-none text-xs sm:text-sm text-slate-800 transition-colors shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 shrink-0 self-start sm:self-auto">
                {(["all", "active", "hidden"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 cursor-pointer ${
                      filterStatus === status
                        ? "bg-white text-[#4B3F87] shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {status === "active" ? "Live" : status === "hidden" ? "Drafts" : "All"}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 shrink-0 self-start md:self-center">
              Showing {filteredEvents.length} of {events.length}
            </div>
          </div>

          {/* Events List */}
          {loadingEvents ? (
            <div className="py-20 bg-white/80 rounded-3xl border border-purple-100 text-center">
              <div className="w-8 h-8 mx-auto border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-700">Loading events from Supabase...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-16 px-6 bg-white/80 rounded-3xl border border-dashed border-purple-200 text-center max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="font-bold text-base text-slate-900">
                {searchQuery ? "No events match your search" : "No Events Created Yet"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? "Try adjusting your search keywords."
                  : "Click 'Create New Event' above to announce your upcoming cybersecurity workshops."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs font-semibold text-[var(--color-primary)] hover:underline"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="group bg-white rounded-2xl border border-purple-100/90 hover:border-purple-300 p-5 shadow-xs hover:shadow-xl hover:shadow-purple-950/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Event Banner Image (16:9) with Quick Crop on Hover */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 mb-4 group/poster">
                      {event.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-purple-50/60 via-slate-100 to-indigo-50/40">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-purple-100 flex items-center justify-center text-purple-400 mb-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">No poster image uploaded</span>
                        </div>
                      )}

                      {/* Quick Crop Button Overlay */}
                      <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-xs">
                        <button
                          type="button"
                          onClick={() => openEventCropperDirectly(event)}
                          className="px-3.5 py-1.5 rounded-xl bg-white/95 text-slate-900 text-xs font-semibold hover:bg-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span>Crop New Banner</span>
                        </button>
                      </div>

                      {/* Floating Direct Status Pill */}
                      <button
                        onClick={() => toggleEventPublished(event)}
                        className={`absolute top-3 right-3 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs transition-all ${
                          event.is_published
                            ? "bg-emerald-500/90 text-white hover:bg-emerald-600"
                            : "bg-amber-500/90 text-white hover:bg-amber-600"
                        }`}
                        title="Click to toggle published status"
                      >
                        {event.is_published ? "LIVE" : "DRAFT"}
                      </button>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                      <span className="font-mono font-semibold text-[var(--color-primary)] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-slate-600 flex items-center gap-1 font-medium">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {event.location}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-[var(--color-primary)] transition-colors leading-snug">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {/* Registration link status */}
                    <div className="mt-3">
                      {event.registration_form_url ? (
                        <a
                          href={event.registration_form_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                          <span>RSVP Link Active &bull; Test URL</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span>No registration link set</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditEventModal(event)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/80 text-xs font-semibold text-[var(--color-primary)] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      <span>Edit Details</span>
                    </button>

                    <button
                      onClick={() => deleteEvent(event.id, event.title)}
                      className="p-2 rounded-xl border border-red-200/80 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors shadow-2xs"
                      title="Delete event"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EVENT CREATE / EDIT */}
      {/* ========================================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-purple-100 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[var(--color-primary)] uppercase tracking-wider">
                  Event Editor
                </span>
                <h2 className="text-xl font-bold font-[var(--font-heading)] text-slate-900 mt-1">
                  {editingEventId ? "Edit Event Details" : "Create New Workshop or CTF"}
                </h2>
              </div>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 mb-1.5">
                  EVENT TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intro to Binary Exploitation & Reverse Engineering"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none text-slate-900 text-sm font-medium transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-700 mb-1.5">
                    DATE &amp; TIME *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none text-slate-900 text-sm font-mono transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-700 mb-1.5">
                    LOCATION
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BIC Auditorium or Discord"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none text-slate-900 text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 mb-1.5">
                  DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  placeholder="Overview of topics, prerequisites, speaker information..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none text-slate-900 text-sm transition-colors"
                />
              </div>

              {/* Poster Image with Cropper */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 mb-1.5">
                  POSTER / BANNER IMAGE (16:9)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://... or click Upload &amp; Crop"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none text-slate-900 text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={openEventImageCropper}
                    className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-semibold text-[var(--color-primary)] whitespace-nowrap transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload &amp; Crop
                  </button>
                </div>

                {formImageUrl && (
                  <div className="mt-2.5 relative rounded-xl overflow-hidden border border-slate-200 aspect-video max-h-36 bg-slate-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formImageUrl} alt="Banner preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={openEventImageCropper}
                        className="px-3 py-1.5 rounded-lg bg-white/95 text-slate-800 text-xs font-semibold hover:bg-white transition-colors"
                      >
                        Re-crop
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormImageUrl("")}
                        className="px-3 py-1.5 rounded-lg bg-red-600/90 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 mb-1.5">
                  REGISTRATION FORM LINK (Google Form / Discord RSVP)
                </label>
                <input
                  type="url"
                  placeholder="https://forms.gle/... or https://discord.gg/..."
                  value={formRegistrationUrl}
                  onChange={(e) => setFormRegistrationUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none text-slate-900 text-sm transition-colors"
                />
              </div>

              {/* Custom Modern Styled Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">
                    Publish Live on inCognitus Website
                  </span>
                  <span className="text-xs text-slate-500">
                    Immediately showcase this event to students and community members
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsPublished(!formIsPublished)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formIsPublished ? "bg-[var(--color-primary)]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      formIsPublished ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {eventFormMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-medium ${
                    eventFormMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {eventFormMessage.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEventPending}
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-md shadow-purple-900/20 disabled:opacity-50 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #5D4FA0 0%, #4B3F87 100%)" }}
                >
                  {isEventPending ? "Saving..." : editingEventId ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TEAM MEMBER CREATE / EDIT */}
      {/* ========================================================================= */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-purple-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[var(--color-primary)] uppercase tracking-wider">
                  Executive Officer
                </span>
                <h2 className="text-xl font-bold font-[var(--font-heading)] text-slate-900 mt-1">
                  {editingMemberId ? "Edit Officer Profile" : "Add New Officer"}
                </h2>
              </div>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleTeamSubmit} className="space-y-4">
              {/* Live Preview Avatar & Card */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-purple-50/70 to-slate-50 border border-purple-100/90 text-center">
                <div
                  className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-purple-200 mb-2.5"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-secondary-light), var(--color-primary))",
                  }}
                >
                  {memberImageUrl.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={memberImageUrl.trim()}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-xl font-bold text-white select-none" style={{ fontFamily: "var(--font-heading)" }}>
                      {memberInitials.trim().toUpperCase() || "OF"}
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {memberName.trim() || "Officer Name"}
                </span>
                <span className="text-xs font-mono font-medium text-[var(--color-primary)] mt-0.5">
                  {memberRole.trim() || "Executive Position"}
                </span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 mb-1.5">
                  FULL NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aashish Sharma"
                  value={memberName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none text-slate-900 text-sm font-medium transition-colors"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 mb-1.5">
                  ROLE / POSITION *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. President, Vice President, CTF Lead..."
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none text-slate-900 text-sm transition-colors"
                />
              </div>

              {/* Initials & Display Order Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-700 mb-1.5">
                    INITIALS (2 LETTERS)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. AS"
                    value={memberInitials}
                    onChange={(e) => setMemberInitials(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none text-slate-900 text-sm uppercase font-mono font-bold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-700 mb-1.5">
                    DISPLAY ORDER #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={memberDisplayOrder}
                    onChange={(e) => setMemberDisplayOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none text-slate-900 text-sm font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Photo URL & Crop */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 mb-1.5">
                  AVATAR / PROFILE PHOTO (1:1 CIRCULAR)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://... or click Upload &amp; Crop"
                    value={memberImageUrl}
                    onChange={(e) => setMemberImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none text-slate-900 text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={openTeamAvatarCropper}
                    className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-semibold text-[var(--color-primary)] whitespace-nowrap transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload &amp; Crop
                  </button>
                </div>
                {memberImageUrl && (
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={openTeamAvatarCropper}
                      className="text-xs text-[var(--color-primary)] font-semibold hover:underline"
                    >
                      Re-crop current photo
                    </button>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      type="button"
                      onClick={() => setMemberImageUrl("")}
                      className="text-xs text-red-600 font-semibold hover:underline"
                    >
                      Remove photo (use initials badge)
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  Tip: Upload any photo to zoom &amp; position their face, or leave blank to display the purple initials badge.
                </p>
              </div>

              {/* Custom Modern Styled Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">
                    Display on Live Portfolio
                  </span>
                  <span className="text-xs text-slate-500">
                    Visible to visitors on the inCognitus website Team section
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMemberIsActive(!memberIsActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    memberIsActive ? "bg-[var(--color-primary)]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      memberIsActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {teamFormMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-medium ${
                    teamFormMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {teamFormMessage.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTeamPending}
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-md shadow-purple-900/20 disabled:opacity-50 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #5D4FA0 0%, #4B3F87 100%)" }}
                >
                  {isTeamPending ? "Saving..." : editingMemberId ? "Update Officer" : "Add Officer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INTERACTIVE IMAGE CROP & RESIZE */}
      {/* ========================================================================= */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={(url) => {
          cropConfig.onSuccess(url);
          setIsCropModalOpen(false);
        }}
        aspectRatio={cropConfig.aspectRatio}
        circularCrop={cropConfig.circularCrop}
        bucketName={cropConfig.bucketName}
        folder={cropConfig.folder}
        title={cropConfig.title}
        targetWidth={cropConfig.targetWidth}
        targetHeight={cropConfig.targetHeight}
      />
    </div>
  );
}
