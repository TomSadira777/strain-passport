import { useState, useEffect, useRef } from "react";

// Load Public Sans font
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600&display=swap";
document.head.appendChild(fontLink);

const STORAGE_KEY = "strain_passport_entries";

const METHODS = ["Flower", "Vape", "Edible", "Concentrate", "Tincture", "Topical", "Other"];

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const LEAF_URI = "data:image/png;base64,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";

function StarRating({ value, onChange, size = 24 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange && onChange(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{
            background: "none", border: "none", padding: 0,
            cursor: onChange ? "pointer" : "default",
            width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center",
            opacity: n <= (hover || value) ? 1 : 0.2,
            transition: "opacity 0.12s",
          }}
        >
          <img src={LEAF_URI} alt="leaf" style={{ width: size, height: size, display: "block" }} />
        </button>
      ))}
    </div>
  );
}

function EntryCard({ entry, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "var(--color-background-primary)",
      border: "1.5px solid #e7e7e7",
      borderRadius: 14,
      padding: "16px 18px",
      cursor: "pointer",
      transition: "border-color 0.15s, transform 0.12s",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "#a0a09a"; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e7e7e7"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <p style={{ margin: 0, fontWeight: 500, fontSize: 16, color: "var(--color-text-primary)", lineHeight: 1.3 }}>{entry.strain_name}</p>
        {entry.consumption_method && (
          <span style={{
            fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20,
            background: "rgba(0,197,132,0.12)", color: "#00a86b",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>{entry.consumption_method}</span>
        )}
      </div>
      <StarRating value={entry.rating} size={16} />
      <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>{formatDate(entry.date_consumed)}</p>
      {entry.notes && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic",
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          "{entry.notes}"
        </p>
      )}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <img src={LEAF_URI} alt="leaf" style={{ width: 56, height: 56, display: "block", opacity: 0.85 }} />
      <p style={{ margin: 0, fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)", fontFamily: "'Public Sans', sans-serif" }}>Your passport awaits</p>
      <p style={{ margin: 0, fontSize: 15, color: "var(--color-text-secondary)", maxWidth: 260, lineHeight: 1.6, fontFamily: "'Public Sans', sans-serif" }}>
        Log the strains you've tried and build your personal cannabis journey.
      </p>
      <button onClick={onAdd} style={{
        marginTop: 8, background: "#017c6b", color: "#fff", border: "none",
        borderRadius: 24, padding: "10px 28px", fontSize: 14, fontWeight: 500, cursor: "pointer",
      }}>Add your first strain</button>
    </div>
  );
}

function AddEditModal({ entry, onSave, onClose }) {
  const isEdit = !!entry?.id;
  const [form, setForm] = useState({
    strain_name: entry?.strain_name || "",
    date_consumed: entry?.date_consumed || new Date().toISOString().split("T")[0],
    rating: entry?.rating || 0,
    consumption_method: entry?.consumption_method || "",
    notes: entry?.notes || "",
  });
  const nameRef = useRef();

  useEffect(() => { nameRef.current?.focus(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.strain_name.trim()) { nameRef.current?.focus(); return; }
    if (!form.rating) return;
    onSave({ ...form, strain_name: form.strain_name.trim() });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px",
      zIndex: 100,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        width: "100%", maxWidth: 520,
        padding: "24px 24px 40px",
        display: "flex", flexDirection: "column", gap: 20,
        maxHeight: "85vh", overflowY: "auto",
        color: "#111",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontWeight: 500, fontSize: 18, color: "#111" }}>{isEdit ? "Edit entry" : "What'd you try?"}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#888", padding: 4 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>Strain name *</label>
          <input ref={nameRef} value={form.strain_name} onChange={e => set("strain_name", e.target.value)}
            placeholder="e.g. Blue Dream" style={{ width: "100%", boxSizing: "border-box", background: "#f7f7f5", border: "1px solid #e0e0de", borderRadius: 8, padding: "10px 12px", fontSize: 15, color: "#111", outline: "none" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>Date consumed *</label>
          <input type="date" value={form.date_consumed} onChange={e => set("date_consumed", e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", background: "#f7f7f5", border: "1px solid #e0e0de", borderRadius: 8, padding: "12px 14px", fontSize: 16, color: "#111", outline: "none", WebkitAppearance: "none", minHeight: 48 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>Your rating *</label>
          <StarRating value={form.rating} onChange={v => set("rating", v)} size={32} />
          {!form.rating && <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Tap a star to rate</p>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>Method</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {METHODS.map(m => (
              <button key={m} onClick={() => set("consumption_method", form.consumption_method === m ? "" : m)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                background: form.consumption_method === m ? "#017c6b" : "#f0f0ee",
                color: form.consumption_method === m ? "#fff" : "#333",
                border: form.consumption_method === m ? "none" : "1px solid #e0e0de",
                fontWeight: form.consumption_method === m ? 500 : 400,
              }}>{m}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>Notes</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
            placeholder="How'd it make you feel? Any effects worth remembering?"
            rows={3} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: "#f7f7f5", border: "1px solid #e0e0de", borderRadius: 8, padding: "10px 12px", fontSize: 15, color: "#111", outline: "none" }} />
        </div>

        <button onClick={handleSave} disabled={!form.strain_name.trim() || !form.rating} style={{
          background: !form.strain_name.trim() || !form.rating ? "#ccc" : "#017c6b",
          color: "#fff",
          border: "none", borderRadius: 24, padding: "12px 28px", fontSize: 14, fontWeight: 500,
          cursor: !form.strain_name.trim() || !form.rating ? "default" : "pointer",
          transition: "background 0.15s", alignSelf: "flex-start",
        }}>{isEdit ? "Save changes" : "Add to passport"}</button>
      </div>
    </div>
  );
}

function DetailModal({ entry, onEdit, onDelete, onClose }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px",
      zIndex: 100,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        width: "100%", maxWidth: 520,
        padding: "24px 24px 48px",
        display: "flex", flexDirection: "column", gap: 20,
        color: "#111",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontWeight: 500, fontSize: 18, color: "#111" }}>{entry.strain_name}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#888", padding: 4 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <StarRating value={entry.rating} size={24} />
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, color: "#555" }}>📅 {formatDate(entry.date_consumed)}</span>
            {entry.consumption_method && (
              <span style={{ fontSize: 14, color: "#555" }}>💨 {entry.consumption_method}</span>
            )}
          </div>
          {entry.notes && (
            <div style={{ background: "#f7f7f5", borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ margin: 0, fontSize: 14, color: "#333", lineHeight: 1.7, fontStyle: "italic" }}>
                "{entry.notes}"
              </p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onEdit} style={{
            flex: 1, padding: "12px", borderRadius: 20, fontSize: 14, fontWeight: 500,
            background: "#f0f0ee", border: "1px solid #e0e0de",
            cursor: "pointer", color: "#333",
          }}>Edit</button>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} style={{
              flex: 1, padding: "12px", borderRadius: 20, fontSize: 14, fontWeight: 500,
              background: "#f0f0ee", border: "1px solid #e0e0de",
              cursor: "pointer", color: "#c0392b",
            }}>Delete</button>
          ) : (
            <button onClick={onDelete} style={{
              flex: 1, padding: "12px", borderRadius: 20, fontSize: 14, fontWeight: 500,
              background: "#fde8e8", border: "none",
              cursor: "pointer", color: "#c0392b",
            }}>Confirm delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

const SORTS = [
  { label: "Newest", key: "date_desc" },
  { label: "Oldest", key: "date_asc" },
  { label: "A–Z", key: "alpha_asc" },
  { label: "Highest rated", key: "rating_desc" },
  { label: "Lowest rated", key: "rating_asc" },
];

function sortEntries(entries, sort) {
  return [...entries].sort((a, b) => {
    if (sort === "date_desc") return b.date_consumed.localeCompare(a.date_consumed);
    if (sort === "date_asc") return a.date_consumed.localeCompare(b.date_consumed);
    if (sort === "alpha_asc") return a.strain_name.localeCompare(b.strain_name);
    if (sort === "rating_desc") return b.rating - a.rating;
    if (sort === "rating_asc") return a.rating - b.rating;
    return 0;
  });
}

export default function App() {
  const [entries, setEntries] = useState(() => loadEntries().filter(e => !e.deleted));
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  const persist = (updated) => {
    const all = loadEntries();
    const merged = all.map(e => {
      const found = updated.find(u => u.id === e.id);
      return found || e;
    });
    updated.forEach(u => { if (!merged.find(e => e.id === u.id)) merged.push(u); });
    saveEntries(merged);
    setEntries(merged.filter(e => !e.deleted));
  };

  const handleAdd = (form) => {
    const entry = {
      ...form,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted: false,
    };
    persist([...loadEntries(), entry]);
    setShowAdd(false);
  };

  const handleEdit = (form) => {
    const all = loadEntries();
    const updated = all.map(e => e.id === editingEntry.id
      ? { ...e, ...form, updated_at: new Date().toISOString() }
      : e
    );
    saveEntries(updated);
    setEntries(updated.filter(e => !e.deleted));
    setEditingEntry(null);
    setSelectedEntry(null);
  };

  const handleDelete = (id) => {
    const all = loadEntries();
    const updated = all.map(e => e.id === id ? { ...e, deleted: true } : e);
    saveEntries(updated);
    setEntries(updated.filter(e => !e.deleted));
    setSelectedEntry(null);
  };

  const filtered = sortEntries(
    entries.filter(e => e.strain_name.toLowerCase().includes(search.toLowerCase())),
    sort
  );

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 0 80px", fontFamily: "'Public Sans', var(--font-sans)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="data:image/png;base64,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" alt="Leafly" style={{ height: 28, width: "auto", display: "block" }} />
          <span style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)", letterSpacing: "-0.2px" }}>Strain Passport</span>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          background: "#017c6b", color: "#fff", border: "none",
          borderRadius: 24, padding: "10px 18px", fontSize: 14, fontWeight: 500,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        }}>＋ Add</button>
      </div>

      {entries.length > 0 && (
        <div style={{ padding: "0 20px 16px", display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search strains…"
            style={{ flex: 1, boxSizing: "border-box" }}
          />
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            flexShrink: 0, padding: "8px 12px", borderRadius: 8, fontSize: 13,
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)", cursor: "pointer",
          }}>
            {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      )}

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {entries.length === 0 ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "40px 0", margin: 0 }}>
            No strains match "{search}"
          </p>
        ) : (
          filtered.map(entry => (
            <EntryCard key={entry.id} entry={entry} onClick={() => setSelectedEntry(entry)} />
          ))
        )}
      </div>

      {showAdd && (
        <AddEditModal onSave={handleAdd} onClose={() => setShowAdd(false)} />
      )}

      {selectedEntry && !editingEntry && (
        <DetailModal
          entry={selectedEntry}
          onEdit={() => setEditingEntry(selectedEntry)}
          onDelete={() => handleDelete(selectedEntry.id)}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      {editingEntry && (
        <AddEditModal
          entry={editingEntry}
          onSave={handleEdit}
          onClose={() => { setEditingEntry(null); setSelectedEntry(null); }}
        />
      )}
    </div>
  );
}
