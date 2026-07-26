import { useEffect, useState } from "hono/jsx";

interface PortfolioDocument {
  id: string;
  title: string | null;
  category: string | null;
  content: string | null;
  created_at: string | null;
}

const ALL_TAB = "All";
const CATEGORY_OPTIONS = [
  "experience",
  "projects",
  "education",
  "skills",
  "contact",
];

const categoryOf = (doc: PortfolioDocument) => doc.category ?? "uncategorized";

export default function AdminApp() {
  const [documents, setDocuments] = useState<PortfolioDocument[]>([]);
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [status, setStatus] = useState("");
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const loadDocuments = async () => {
    try {
      const res = await fetch("/api/admin/documents");
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const body = (await res.json()) as { documents: PortfolioDocument[] };
      setDocuments(body.documents);
      setLoadError("");
    } catch (err) {
      setLoadError((err as Error).message);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const t = title.trim();
    const cat = category.trim();
    const cont = content.trim();
    if (!t || !cat || !cont) return;

    setSubmitting(true);
    setStatus("Generating embedding & saving…");
    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: t, category: cat, content: cont }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error ?? `Request failed (${res.status})`);
      }
      setTitle("");
      setContent("");
      setStatus("Added ✓");
      setActiveTab(cat); // Jump to the tab the new document landed in.
      await loadDocuments();
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "/cdn-cgi/access/logout";
  };

  const categories = Array.from(new Set(documents.map(categoryOf))).sort();
  const tabs = [ALL_TAB, ...categories];
  const visible =
    activeTab === ALL_TAB
      ? documents
      : documents.filter((doc) => categoryOf(doc) === activeTab);

  return (
    <main class="admin">
      <div class="admin-header">
        <h1>Portfolio Vector DB</h1>
        <button type="button" class="logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
      <p class="subtitle">
        Add context the AI agent can retrieve when answering questions.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          maxlength={200}
          placeholder="Title, e.g. TNG Digital Work Experience"
          value={title}
          onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
          required
        />
        <input
          type="text"
          list="category-options"
          maxlength={50}
          placeholder="Category, e.g. experience"
          value={category}
          onInput={(e) => setCategory((e.target as HTMLInputElement).value)}
          required
        />
        <datalist id="category-options">
          {CATEGORY_OPTIONS.map((c) => (
            <option value={c}></option>
          ))}
        </datalist>
        <textarea
          rows={5}
          maxlength={5000}
          placeholder="e.g. Jia Wei built a real-time expense tracker API using Hono on Cloudflare Workers..."
          value={content}
          onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
          required
        ></textarea>
        <button type="submit" disabled={submitting}>
          Add to Vector DB
        </button>
      </form>
      <p class="status">{status}</p>

      <h2>Stored context</h2>
      <div class="tabs">
        {tabs.map((tab) => {
          const count =
            tab === ALL_TAB
              ? documents.length
              : documents.filter((doc) => categoryOf(doc) === tab).length;
          return (
            <button
              type="button"
              key={tab}
              class={`tab${tab === activeTab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} <span class="tab-count">{count}</span>
            </button>
          );
        })}
      </div>
      <ul class="list">
        {loadError ? (
          <li class="error">Failed to load: {loadError}</li>
        ) : visible.length === 0 ? (
          <li>
            {documents.length === 0
              ? "No context added yet."
              : "No context in this category yet."}
          </li>
        ) : (
          visible.map((doc) => (
            <li key={doc.id}>
              <div class="doc-meta">
                <strong>{doc.title}</strong>
                <span class="doc-category">{doc.category}</span>
              </div>
              <span>{doc.content}</span>
              <small>
                {doc.created_at
                  ? new Date(doc.created_at).toLocaleString()
                  : ""}
              </small>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
