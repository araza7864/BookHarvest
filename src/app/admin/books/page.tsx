"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

interface Book {
  id: string;
  title: string;
  author: string | null;
  gradeMin: number;
  gradeMax: number;
  genre: string | null;
  stock: number;
  bundleSize: number;
}

const CATEGORY_ALL = "__all__";
const GRADE_ALL = "__all__";
const GRADE_OPTIONS = [
  { value: GRADE_ALL, label: "All grades" },
  { value: "1", label: "K–2" },
  { value: "3", label: "3–5" },
  { value: "6", label: "6–8" },
  { value: "9", label: "9–12" },
];

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>(CATEGORY_ALL);
  const [gradeFilter, setGradeFilter] = useState<string>(GRADE_ALL);
  const [deduping, setDeduping] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    gradeMin: 1,
    gradeMax: 3,
    genre: "",
    theme: "",
    stock: 100,
    bundleSize: 40,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showListForm, setShowListForm] = useState(false);
  const [listText, setListText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    added: number;
    updated: number;
    failed: { title: string; error: string }[];
    titles: string[];
  } | null>(null);
  const [recentAdditions, setRecentAdditions] = useState<Record<string, number>>({});
  const listFileInputRef = useRef<HTMLInputElement>(null);

  function refresh() {
    fetch("/api/books", { cache: "no-store", headers: { "Cache-Control": "no-cache" } })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setBooks(Array.isArray(d) ? d : []))
      .catch(() => setBooks([]));
  }
  useEffect(() => {
    refresh();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 3000);
    return () => clearInterval(id);
  }, []);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setAnalyzeError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setPhotoPreview(data);
      setPhotoBase64(data);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function analyzePhoto() {
    if (!photoBase64) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("/api/books/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: photoBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setForm((f) => ({
        ...f,
        title: data.title ?? f.title,
        author: data.author ?? f.author,
        genre: data.genre ?? f.genre,
        theme: data.theme ?? f.theme,
        gradeMin: data.gradeMin ?? f.gradeMin,
        gradeMax: data.gradeMax ?? f.gradeMax,
      }));
      setPhotoPreview(null);
      setPhotoBase64(null);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Could not analyze photo");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleListFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (![".csv", ".txt", ".json"].some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setAnalyzeError("Use .csv, .txt, or .json");
      e.target.value = "";
      return;
    }
    setAnalyzeError(null);
    const reader = new FileReader();
    reader.onload = () => setListText(String(reader.result ?? ""));
    reader.readAsText(file);
    e.target.value = "";
  }

  async function importList() {
    const text = listText.trim();
    if (!text) return;
    setImporting(true);
    setImportResult(null);
    setAnalyzeError(null);
    try {
      let payload: { books: unknown };
      if (text.startsWith("[")) {
        payload = { books: JSON.parse(text) };
      } else {
        payload = { books: text };
      }
      const res = await fetch("/api/books/import-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setImportResult({
        added: data.added ?? 0,
        updated: data.updated ?? 0,
        failed: data.failed ?? [],
        titles: data.titles ?? [],
      });
      if (data.toppedUp?.length) {
        const map: Record<string, number> = {};
        for (const u of data.toppedUp)
          map[u.id] = (map[u.id] ?? 0) + u.addedStock;
        setRecentAdditions((prev) => ({ ...prev, ...map }));
        setTimeout(() => setRecentAdditions((p) => {
          const next = { ...p };
          for (const u of data.toppedUp) delete next[u.id];
          return next;
        }), 30000);
      }
      setListText("");
      refresh();
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  async function mergeDuplicates() {
    setDeduping(true);
    try {
      const res = await fetch("/api/books/dedupe", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      refresh();
    } catch {
      // ignore
    } finally {
      setDeduping(false);
    }
  }

  const filteredBooks = books
    .filter((b) => categoryFilter === CATEGORY_ALL || (b.genre || "Other") === categoryFilter)
    .filter((b) => {
      if (gradeFilter === GRADE_ALL) return true;
      const g = parseInt(gradeFilter, 10);
      return b.gradeMin <= g && b.gradeMax >= g;
    });

  function dedupeForDisplay(list: Book[]): Book[] {
    const byKey = new Map<string, Book>();
    for (const b of list) {
      const key = `${(b.title || "").toLowerCase()}|${(b.author || "").toLowerCase()}`;
      const existing = byKey.get(key);
      if (existing) {
        byKey.set(key, { ...existing, stock: existing.stock + b.stock });
      } else {
        byKey.set(key, { ...b });
      }
    }
    return Array.from(byKey.values());
  }

  async function addBook(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        author: form.author || undefined,
        genre: form.genre || undefined,
        theme: form.theme || undefined,
      }),
    });
    if (res.ok) {
      const book = await res.json();
      setBooks((prev) => [book, ...prev]);
      setForm({
        title: "",
        author: "",
        gradeMin: 1,
        gradeMax: 3,
        genre: "",
        theme: "",
        stock: 100,
        bundleSize: 40,
      });
      setShowForm(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 flex items-center gap-2 text-2xl font-bold text-harvest-800">
        Book catalog
        <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" title="Live inventory updates" />
      </h1>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Button onClick={() => { setShowForm(!showForm); setShowListForm(false); setImportResult(null); }}>
          {showForm ? "Cancel" : "+ Add book"}
        </Button>
        <Button
          variant="outline"
          onClick={() => { setShowListForm(!showListForm); setShowForm(false); setImportResult(null); setAnalyzeError(null); setListText(""); }}
        >
          {showListForm ? "Cancel" : "Add from list"}
        </Button>
        <label className="flex items-center gap-2">
          <span className="text-sm text-harvest-600">Category</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-harvest-200 bg-white px-3 py-2 text-sm text-harvest-800"
          >
            <option value={CATEGORY_ALL}>All</option>
            {Array.from(
              new Set(books.map((b) => b.genre || "Other").filter(Boolean))
            )
              .sort()
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm text-harvest-600">Grade</span>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="rounded-lg border border-harvest-200 bg-white px-3 py-2 text-sm text-harvest-800"
          >
            {GRADE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <Button
          variant="outline"
          size="sm"
          onClick={mergeDuplicates}
          disabled={deduping}
          title="Merge duplicate books (same title + author)"
        >
          {deduping ? "Merging…" : "Merge duplicates"}
        </Button>
      </div>

      {showListForm && (
        <div className="mb-8 rounded-xl border border-harvest-200 bg-white p-6">
          <h3 className="mb-2 font-semibold text-harvest-800">Add from list</h3>
          <p className="mb-4 text-sm text-harvest-600">
            Upload a file or paste text. AI will categorize each book and add to the catalog. Catalog updates in real time.
          </p>
          <p className="mb-2 text-xs font-medium text-harvest-700">Accepted files: .csv, .txt, .json</p>
          <p className="mb-4 text-xs text-harvest-500">
            Format: one book per line with columns <strong>Title | Author | Description | Quantity</strong> (pipe or tab separated).
            Quantity is optional (default 100); sets initial stock. Header row optional.
            JSON: <code className="rounded bg-harvest-100 px-1">[{`{"title":"","author":"","description":"","quantity":50}`}, ...]</code>
          </p>
          <div className="mb-4 flex gap-3">
            <input
              ref={listFileInputRef}
              type="file"
              accept=".csv,.txt,.json,text/csv,text/plain,application/json"
              onChange={handleListFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => listFileInputRef.current?.click()}
            >
              Choose file
            </Button>
          </div>
          <textarea
            value={listText}
            onChange={(e) => setListText(e.target.value)}
            placeholder={"Title | Author | Description | Quantity\nThe Hobbit | J.R.R. Tolkien | A hobbit is swept into an epic quest. | 50\n..."}
            rows={8}
            className="mb-4 w-full rounded-lg border border-harvest-200 px-3 py-2 font-mono text-sm"
          />
          <div className="flex items-center gap-3">
            <Button onClick={importList} disabled={importing || !listText.trim()}>
              {importing ? "Importing…" : "Import & categorize"}
            </Button>
            {importResult && (
              <span className="text-sm text-harvest-600">
                Added {importResult.added}
                {importResult.updated > 0 && `, topped up ${importResult.updated}`}
                {importResult.failed.length > 0 && `, ${importResult.failed.length} failed`}
              </span>
            )}
          </div>
          {analyzeError && (
            <p className="mt-2 text-sm text-red-600">{analyzeError}</p>
          )}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={addBook}
          className="mb-8 rounded-xl border border-harvest-200 bg-white p-6"
        >
          <h3 className="mb-4 font-semibold text-harvest-800">New book</h3>

          <div className="mb-6 rounded-xl border border-dashed border-harvest-200 bg-harvest-50/50 p-4">
            <p className="mb-2 text-sm font-medium text-harvest-700">Add from photo (AI vision)</p>
            <p className="mb-3 text-xs text-harvest-500">
              Take a picture of the book cover or back—AI extracts title, description, and suggests a category.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview ? "Change photo" : "Choose / take photo"}
              </Button>
              {photoPreview && (
                <>
                  <div className="h-16 w-12 overflow-hidden rounded border border-harvest-200 bg-white">
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <Button
                    type="button"
                    onClick={analyzePhoto}
                    disabled={analyzing}
                  >
                    {analyzing ? "Scanning…" : "Scan with AI"}
                  </Button>
                </>
              )}
            </div>
            {analyzeError && (
              <p className="mt-2 text-sm text-red-600">{analyzeError}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-harvest-600">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-harvest-200 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-harvest-600">Author</label>
              <input
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                className="w-full rounded-lg border border-harvest-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-harvest-600">Grade min</label>
              <input
                type="number"
                min={1}
                max={12}
                value={form.gradeMin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gradeMin: parseInt(e.target.value, 10) || 1 }))
                }
                className="w-full rounded-lg border border-harvest-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-harvest-600">Grade max</label>
              <input
                type="number"
                min={1}
                max={12}
                value={form.gradeMax}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gradeMax: parseInt(e.target.value, 10) || 3 }))
                }
                className="w-full rounded-lg border border-harvest-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-harvest-600">Genre</label>
              <input
                value={form.genre}
                onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
                placeholder="fiction, nonfiction"
                className="w-full rounded-lg border border-harvest-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-harvest-600">Theme</label>
              <input
                value={form.theme}
                onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
                placeholder="STEM, adventure, culture"
                className="w-full rounded-lg border border-harvest-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-harvest-600">Stock</label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: parseInt(e.target.value, 10) || 0 }))
                }
                className="w-full rounded-lg border border-harvest-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-harvest-600">Bundle size</label>
              <select
                value={form.bundleSize}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bundleSize: parseInt(e.target.value, 10) }))
                }
                className="w-full rounded-lg border border-harvest-200 px-3 py-2"
              >
                <option value={40}>40</option>
                <option value={80}>80</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="mt-4">
            Add book
          </Button>
        </form>
      )}

      <div className="space-y-6">
        {Object.entries(
          dedupeForDisplay(filteredBooks).reduce((acc, b) => {
            const cat = b.genre || "Other";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(b);
            return acc;
          }, {} as Record<string, Book[]>)
        )
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, categoryBooks]) => (
            <div
              key={category}
              className="overflow-hidden rounded-xl border-2 border-harvest-200 bg-white shadow-md"
            >
              <h3 className="bg-gradient-to-r from-harvest-500 to-harvest-600 px-5 py-4 text-lg font-bold uppercase tracking-wide text-white shadow-sm">
                {category}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-harvest-200 bg-harvest-50">
                    <th className="px-4 py-3 text-left font-semibold text-harvest-800">Title</th>
                    <th className="px-4 py-3 text-left font-semibold text-harvest-800">Grade</th>
                    <th className="px-4 py-3 text-right font-semibold text-harvest-800">Stock</th>
                    <th className="px-4 py-3 text-right font-semibold text-harvest-800">Bundle</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBooks.map((b) => (
                    <tr key={b.id} className="border-t border-harvest-100 hover:bg-harvest-50/50">
                      <td className="px-4 py-2">{b.title}</td>
                      <td className="px-4 py-2">
                        {b.gradeMin}-{b.gradeMax}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className={b.stock < 20 ? "font-medium text-citrus-600" : ""}>
                          {b.stock}
                        </span>
                        {recentAdditions[b.id] != null && (
                          <span className="ml-1 font-medium text-green-600">
                            +{recentAdditions[b.id]}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">{b.bundleSize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </main>
  );
}
