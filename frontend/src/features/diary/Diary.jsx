
import { useState, useEffect } from "react";
import "./Diary.css";

const moods = [
    "😊 Happy",
    "🥰 Loved",
    "✨ Excited",
    "😌 Calm",
    "🥺 Sad",
    "😰 Anxious",
    "😴 Tired",
    "😤 Frustrated",
    "🌸 Grateful",
];

function Diary() {
    // Load saved diary entries
    const [entries, setEntries] = useState(() => {
        try {
            const savedEntries = localStorage.getItem("dearlyDiary");
            return savedEntries ? JSON.parse(savedEntries) : [];
        } catch {
            return [];
        }
    });

    // Editor states
    const [showEditor, setShowEditor] = useState(false);
    const [editingEntryId, setEditingEntryId] = useState(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [mood, setMood] = useState("😊 Happy");

    // Search, filter and sorting states
    const [searchTerm, setSearchTerm] = useState("");
    const [activeMood, setActiveMood] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");

    // Read entry state
    const [selectedEntry, setSelectedEntry] = useState(null);

    // Save entries whenever they change
    useEffect(() => {
        localStorage.setItem("dearlyDiary", JSON.stringify(entries));
    }, [entries]);

    // Filter and sort entries
    const filteredEntries = entries
        .filter((entry) => {
            const matchesSearch =
                entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.content.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesMood =
                activeMood === "all" || entry.mood === activeMood;

            return matchesSearch && matchesMood;
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();

            return sortOrder === "newest"
                ? dateB - dateA
                : dateA - dateB;
        });

    // Open editor for a new entry
    const openEditor = () => {
        setTitle("");
        setContent("");
        setMood("😊 Happy");
        setEditingEntryId(null);
        setShowEditor(true);
    };

    // Close editor
    const closeEditor = () => {
        setShowEditor(false);
        setEditingEntryId(null);
        setTitle("");
        setContent("");
    };

    // Edit existing entry
    const editEntry = (entry) => {
        setTitle(entry.title);
        setContent(entry.content);
        setMood(entry.mood);
        setEditingEntryId(entry.id);
        setSelectedEntry(null);
        setShowEditor(true);
    };

    // Save or update entry
    const saveEntry = () => {
        if (!title.trim() || !content.trim()) {
            alert("Please add a title and write about your day! 💗");
            return;
        }

        if (editingEntryId !== null) {
            setEntries((prevEntries) =>
                prevEntries.map((entry) =>
                    entry.id === editingEntryId
                        ? {
                              ...entry,
                              title: title.trim(),
                              content: content.trim(),
                              mood,
                              updatedAt: new Date().toISOString(),
                          }
                        : entry
                )
            );
        } else {
            const newEntry = {
                id: Date.now(),
                title: title.trim(),
                content: content.trim(),
                mood,
                createdAt: new Date().toISOString(),
            };

            setEntries((prevEntries) => [newEntry, ...prevEntries]);
        }

        closeEditor();
    };

    // Delete entry
    const deleteEntry = (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this diary entry? 💔"
        );

        if (confirmDelete) {
            setEntries((prevEntries) =>
                prevEntries.filter((entry) => entry.id !== id)
            );

            if (selectedEntry?.id === id) {
                setSelectedEntry(null);
            }
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleString([], {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="diary-page">

            {/* Header */}
            <div className="diary-header">
                <div>
                    <h1>My Little Diary 📔</h1>
                    <p>
                        A little space to remember the moments that make up your life.
                    </p>
                </div>

                <button className="diary-new-btn" onClick={openEditor}>
                    + New Entry
                </button>
            </div>

            {/* Diary Tools */}
            {entries.length > 0 && (
                <div className="diary-tools">

                    <input
                        type="text"
                        placeholder="Search your memories..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />

                    <select
                        value={activeMood}
                        onChange={(event) => setActiveMood(event.target.value)}
                    >
                        <option value="all">All Moods</option>
                        {moods.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortOrder}
                        onChange={(event) => setSortOrder(event.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>

                </div>
            )}

            {/* Diary Entries */}
            {entries.length === 0 ? (
                <div className="diary-empty">
                    <div className="diary-empty-icon">📖</div>
                    <h2>Your diary is waiting...</h2>
                    <p>
                        Every day has a story. Start writing yours!
                    </p>
                    <button className="diary-new-btn" onClick={openEditor}>
                        Write my first entry
                    </button>
                </div>
            ) : filteredEntries.length === 0 ? (
                <div className="diary-empty">
                    <div className="diary-empty-icon">🔍</div>
                    <h2>No entries found</h2>
                    <p>Try another search or mood filter.</p>
                </div>
            ) : (
                <div className="diary-entry-grid">
                    {filteredEntries.map((entry) => (
                        <div className="diary-entry-card" key={entry.id}>

                            <div className="diary-card-top">
                                <span className="diary-mood">
                                    {entry.mood}
                                </span>

                                <span className="diary-card-date">
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h3>{entry.title}</h3>

                            <p className="diary-preview">
                                {entry.content.length > 130
                                    ? entry.content.substring(0, 130) + "..."
                                    : entry.content}
                            </p>

                            <div className="diary-card-actions">
                                <button
                                    className="diary-read-btn"
                                    onClick={() => setSelectedEntry(entry)}
                                >
                                    Read Entry →
                                </button>

                                <button
                                    className="diary-edit-btn"
                                    onClick={() => editEntry(entry)}
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    className="diary-delete-btn"
                                    onClick={() => deleteEntry(entry.id)}
                                >
                                    🗑️
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Entry Window */}
            {showEditor && (
                <div className="diary-overlay">
                    <div className="diary-editor-window">

                        <div className="diary-titlebar">
                            <span>📔 My Diary</span>

                            <button
                                className="diary-close-btn"
                                onClick={closeEditor}
                            >
                                ×
                            </button>
                        </div>

                        <div className="diary-editor-content">
                            <h2>
                                {editingEntryId !== null
                                    ? "Edit your entry"
                                    : "How was your day?"}
                            </h2>

                            <p>
                                This space is yours. Write whatever is on your mind. 💗
                            </p>

                            <label htmlFor="diary-title">Entry Title</label>
                            <input
                                id="diary-title"
                                type="text"
                                placeholder="Give today a little title..."
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                            />

                            <label htmlFor="diary-mood">How are you feeling?</label>
                            <select
                                id="diary-mood"
                                value={mood}
                                onChange={(event) => setMood(event.target.value)}
                            >
                                {moods.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>

                            <label htmlFor="diary-content">Your thoughts</label>
                            <textarea
                                id="diary-content"
                                placeholder="Dear Diary, today..."
                                value={content}
                                onChange={(event) => setContent(event.target.value)}
                                rows={10}
                            />

                            <div className="diary-editor-actions">
                                <button
                                    className="diary-cancel-btn"
                                    onClick={closeEditor}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="diary-save-btn"
                                    onClick={saveEntry}
                                >
                                    {editingEntryId !== null
                                        ? "Save Changes"
                                        : "Save Entry 💗"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Read Entry Window */}
            {selectedEntry && (
                <div className="diary-overlay">
                    <div className="diary-reader-window">

                        <div className="diary-titlebar">
                            <span>🌸 A Little Memory</span>

                            <button
                                className="diary-close-btn"
                                onClick={() => setSelectedEntry(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="diary-reader-content">
                            <span className="diary-mood">
                                {selectedEntry.mood}
                            </span>

                            <h2>{selectedEntry.title}</h2>

                            <p className="diary-reader-date">
                                {formatDate(selectedEntry.createdAt)}
                            </p>

                            <div className="diary-full-content">
                                {selectedEntry.content}
                            </div>

                            <div className="diary-reader-actions">
                                <button
                                    className="diary-edit-btn"
                                    onClick={() => editEntry(selectedEntry)}
                                >
                                    ✏️ Edit Entry
                                </button>

                                <button
                                    className="diary-delete-btn"
                                    onClick={() => deleteEntry(selectedEntry.id)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default Diary;
