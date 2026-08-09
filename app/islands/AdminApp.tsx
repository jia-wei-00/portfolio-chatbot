import { useEffect, useState } from "hono/jsx";

type DocumentStatus = "processing" | "completed" | "failed";

interface PortfolioDocument {
  id: string | number;
  creation_key?: string | null;
  title: string | null;
  category: string | null;
  content: string | null;
  status?: DocumentStatus | null;
  created_at?: string | null;
}

interface DocumentStatusResult {
  id: string | number;
  creationKey: string;
  status: DocumentStatus;
}

interface ApiError {
  error?: string;
  message?: string;
}

const ALL_TAB = "All";
const CATEGORY_OPTIONS = [
  "experience",
  "projects",
  "education",
  "skills",
  "contact",
];
const POLL_TIMEOUT_MS = 90_000;

const categoryOf = (doc: PortfolioDocument) => doc.category ?? "uncategorized";
const idOf = (doc: PortfolioDocument) => String(doc.id);
const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const responseError = async (response: Response) => {
  const body = (await response.json().catch(() => null)) as ApiError | null;
  return body?.error ?? body?.message ?? `Request failed (${response.status})`;
};

const fetchDocuments = async (): Promise<PortfolioDocument[]> => {
  const response = await fetch("/api/admin/documents", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(await responseError(response));

  const body = (await response.json()) as { data?: PortfolioDocument[] };
  return body.data ?? [];
};

const waitForDocumentCreations = async (creationKeys: string[]) => {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let delay = 1_000;

  while (Date.now() < deadline) {
    const query = new URLSearchParams();
    creationKeys.forEach((key) => query.append("creationKey", key));

    const response = await fetch(
      `/api/admin/document-chunks/status?${query.toString()}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );

    if (!response.ok) throw new Error(await responseError(response));

    const body = (await response.json()) as {
      data?: DocumentStatusResult[];
    };
    const statusByKey = new Map(
      (body.data ?? []).map((document) => [
        document.creationKey,
        document.status,
      ]),
    );

    if (creationKeys.some((key) => statusByKey.get(key) === "failed")) {
      throw new Error("Document processing failed");
    }

    if (
      creationKeys.every((key) => statusByKey.get(key) === "completed")
    ) {
      return;
    }

    await wait(delay);
    delay = Math.min(Math.round(delay * 1.5), 5_000);
  }

  throw new Error("Document processing timed out");
};

const waitForDocumentDeletions = async (documentIds: string[]) => {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let delay = 1_000;

  while (Date.now() < deadline) {
    const documents = await fetchDocuments();
    const remainingIds = new Set(documents.map(idOf));

    if (documentIds.every((id) => !remainingIds.has(id))) {
      return documents;
    }

    await wait(delay);
    delay = Math.min(Math.round(delay * 1.5), 5_000);
  }

  throw new Error("Document deletion timed out");
};

export default function AdminApp() {
  const [documents, setDocuments] = useState<PortfolioDocument[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [status, setStatus] = useState("");
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const loadDocuments = async () => {
    try {
      const nextDocuments = await fetchDocuments();
      setDocuments(nextDocuments);
      setLoadError("");
      return nextDocuments;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setLoadError(message);
      throw error;
    }
  };

  useEffect(() => {
    void loadDocuments().catch(() => undefined);
  }, []);

  const handleSubmit = async (event: Event) => {
    event.preventDefault();

    const nextTitle = title.trim();
    const nextCategory = category.trim();
    const nextContent = content.trim();
    if (!nextTitle || !nextCategory || !nextContent) return;

    const idempotencyKey = crypto.randomUUID();
    setSubmitting(true);
    setStatus("Queueing document creation…");

    try {
      const response = await fetch("/api/admin/document-chunks", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          title: nextTitle,
          category: nextCategory,
          content: nextContent,
        }),
      });

      if (!response.ok) throw new Error(await responseError(response));

      const queued = (await response.json()) as {
        status: "queued";
        creationKey: string;
      };

      setStatus("Creating embedding and storing document…");
      await waitForDocumentCreations([
        queued.creationKey || idempotencyKey,
      ]);
      await loadDocuments();

      setTitle("");
      setContent("");
      setActiveTab(nextCategory);
      setStatus("Document added ✓");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`Error: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelection = (documentId: string) => {
    setSelectedIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId],
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected document(s)?`)) {
      return;
    }

    const idsToDelete = [...selectedIds];
    setDeleting(true);
    setStatus("Queueing document deletion…");

    try {
      const response = await fetch("/api/admin/document-chunks", {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: idsToDelete }),
      });

      if (!response.ok) throw new Error(await responseError(response));

      setStatus("Deleting selected documents…");
      const remainingDocuments = await waitForDocumentDeletions(idsToDelete);
      setDocuments(remainingDocuments);
      setSelectedIds([]);
      setLoadError("");
      setStatus("Documents deleted ✓");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`Error: ${message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "/cdn-cgi/access/logout";
  };

  const busy = submitting || deleting;
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
          onInput={(event) =>
            setTitle((event.target as HTMLInputElement).value)
          }
          required
        />
        <input
          type="text"
          list="category-options"
          maxlength={50}
          placeholder="Category, e.g. experience"
          value={category}
          onInput={(event) =>
            setCategory((event.target as HTMLInputElement).value)
          }
          required
        />
        <datalist id="category-options">
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}></option>
          ))}
        </datalist>
        <textarea
          rows={5}
          maxlength={5000}
          placeholder="e.g. Jia Wei built a real-time expense tracker API using Hono on Cloudflare Workers..."
          value={content}
          onInput={(event) =>
            setContent((event.target as HTMLTextAreaElement).value)
          }
          required
        ></textarea>
        <button type="submit" disabled={busy}>
          {submitting ? "Adding…" : "Add to Vector DB"}
        </button>
      </form>
      <p class="status" aria-live="polite">
        {status}
      </p>

      <div class="list-heading">
        <h2>Stored context</h2>
        <button
          type="button"
          class="delete-selected"
          disabled={busy || selectedIds.length === 0}
          onClick={handleDeleteSelected}
        >
          {deleting
            ? "Deleting…"
            : `Delete selected${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
        </button>
      </div>

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
          visible.map((doc) => {
            const documentId = idOf(doc);
            return (
              <li key={documentId}>
                <div class="document-row">
                  <input
                    class="document-select"
                    type="checkbox"
                    aria-label={`Select ${doc.title ?? "document"}`}
                    checked={selectedIds.includes(documentId)}
                    disabled={busy}
                    onChange={() => toggleSelection(documentId)}
                  />
                  <div class="document-content">
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
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </main>
  );
}
