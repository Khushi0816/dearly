
import { useEffect, useRef, useState } from "react";
import "./Letterbox.css";

const STORAGE_KEY = "dearlyLetters";

function loadLetters() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Could not load letters:", error);
        return [];
    }
}

function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function Letterbox() {
    const [letters, setLetters] = useState(loadLetters);

    // Editor state
    const [showEditor, setShowEditor] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [status, setStatus] = useState("completed");
    const [editingLetterId, setEditingLetterId] = useState(null);

    // Reader state
    const [selectedLetter, setSelectedLetter] = useState(null);

    // Search, filter and sorting
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");

    // Draggable editor window
    const [windowPosition, setWindowPosition] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Persist letters
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
    }, [letters]);

    // Drag the editor window using its title bar
    useEffect(() => {
        if (!isDragging) return;

        function handleMouseMove(event) {
            setWindowPosition({
                x: Math.max(
                    0,
                    Math.min(
                        window.innerWidth - 180,
                        event.clientX - dragOffset.current.x
                    )
                ),
                y: Math.max(
                    0,
                    Math.min(
                        window.innerHeight - 100,
                        event.clientY - dragOffset.current.y
                    )
                ),
            });
        }

        function handleMouseUp() {
            setIsDragging(false);
        }

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    function openEditor() {
        setTitle("");
        setContent("");
        setStatus("completed");
        setEditingLetterId(null);
        setWindowPosition(null);
        setShowEditor(true);
    }

    function closeEditor() {
        setShowEditor(false);
        setEditingLetterId(null);
        setWindowPosition(null);
    }

    function startEditing(letter) {
        setTitle(letter.title || "");
        setContent(letter.content || "");
        setStatus(letter.status || "completed");
        setEditingLetterId(letter.id);
        setSelectedLetter(null);
        setWindowPosition(null);
        setShowEditor(true);
    }

    function saveLetter(event) {
        event.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert("Please add a title and write something in your letter. ♡");
            return;
        }

        const now = new Date().toISOString();

        if (editingLetterId) {
            setLetters((previousLetters) =>
                previousLetters.map((letter) =>
                    letter.id === editingLetterId
                        ? {
                              ...letter,
                              title: title.trim(),
                              content: content.trim(),
                              status,
                              updatedAt: now,
                          }
                        : letter
                )
            );
        } else {
            const newLetter = {
                id: crypto.randomUUID(),
                title: title.trim(),
                content: content.trim(),
                status,
                createdAt: now,
                updatedAt: now,
            };

            setLetters((previousLetters) => [
                newLetter,
                ...previousLetters,
            ]);
        }

        closeEditor();
    }

    function deleteLetter(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this letter? 💔"
        );

        if (!confirmed) return;

        setLetters((previousLetters) =>
            previousLetters.filter((letter) => letter.id !== id)
        );

        if (selectedLetter?.id === id) {
            setSelectedLetter(null);
        }
    }

    function startDragging(event) {
        // Only start dragging with the left mouse button.
        if (event.button !== 0) return;

        const rect = event.currentTarget.parentElement.getBoundingClientRect();

        dragOffset.current = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };

        setWindowPosition({
            x: rect.left,
            y: rect.top,
        });

        setIsDragging(true);
    }

    const filteredLetters = letters
        .filter((letter) => {
            const search = searchTerm.toLowerCase();

            const matchesSearch =
                (letter.title || "").toLowerCase().includes(search) ||
                (letter.content || "").toLowerCase().includes(search);

            const matchesFilter =
                activeFilter === "all" ||
                letter.status === activeFilter;

            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();

            return sortOrder === "newest"
                ? dateB - dateA
                : dateA - dateB;
        });

    return (
        <div className="letterbox-page">

            {/* PAGE HEADER */}
            <div className="letterbox-heading">
                <div>
                    <p className="letterbox-eyebrow">
                        YOUR PRIVATE LITTLE CORNER
                    </p>

                    <h1>My Letterbox <span>♡</span></h1>

                    <p>
                        A place for all the things you want to say,
                        even if you only say them to yourself.
                    </p>
                </div>

                <button
                    className="new-letter-button"
                    onClick={openEditor}
                >
                    + New Letter
                </button>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="letterbox-toolbar">
                <input
                    type="text"
                    placeholder="Search your letters..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />

                <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                </select>
            </div>

            <div className="letter-filter-buttons">
                {[
                    { value: "all", label: "All Letters" },
                    { value: "draft", label: "Drafts" },
                    { value: "completed", label: "Completed" },
                ].map((filter) => (
                    <button
                        key={filter.value}
                        className={
                            activeFilter === filter.value
                                ? "active-filter"
                                : ""
                        }
                        onClick={() => setActiveFilter(filter.value)}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* LETTER CARDS */}
            {filteredLetters.length === 0 ? (
                <div className="empty-letterbox">
                    <div className="empty-letter-icon">💌</div>

                    <h2>
                        {letters.length === 0
                            ? "Your letterbox is waiting..."
                            : "No letters found"}
                    </h2>

                    <p>
                        {letters.length === 0
                            ? "Write your first little letter. It can be about anything."
                            : "Try a different search or filter."}
                    </p>

                    {letters.length === 0 && (
                        <button onClick={openEditor}>
                            Write your first letter ♡
                        </button>
                    )}
                </div>
            ) : (
                <div className="letter-grid">
                    {filteredLetters.map((letter) => (
                        <article className="letter-card" key={letter.id}>
                            <div className="letter-card-titlebar">
                                <span>💌 {letter.title}</span>

                                <span
                                    className={`letter-status ${
                                        letter.status === "draft"
                                            ? "draft-status"
                                            : "completed-status"
                                    }`}
                                >
                                    {letter.status === "draft"
                                        ? "DRAFT"
                                        : "COMPLETED"}
                                </span>
                            </div>

                            <div className="letter-card-content">
                                <p className="letter-card-date">
                                    {formatDate(letter.createdAt)}
                                </p>

                                <p className="letter-card-preview">
                                    {letter.content}
                                </p>

                                <div className="letter-card-actions">
                                    <button
                                        className="read-letter-btn"
                                        onClick={() =>
                                            setSelectedLetter(letter)
                                        }
                                    >
                                        Read Letter →
                                    </button>

                                    <button
                                        className="edit-letter-btn"
                                        onClick={() => startEditing(letter)}
                                    >
                                        Edit ✏️
                                    </button>

                                    <button
                                        className="delete-letter-btn"
                                        onClick={() =>
                                            deleteLetter(letter.id)
                                        }
                                    >
                                        Delete 🗑️
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* NEW LETTER / EDIT LETTER WINDOW */}
            {showEditor && (
                <div
                    className="letter-editor-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeEditor();
                        }
                    }}
                >
                    <div
                        className={`letter-editor-window ${
                            isDragging ? "dragging" : ""
                        }`}
                        style={
                            windowPosition
                                ? {
                                      left: `${windowPosition.x}px`,
                                      top: `${windowPosition.y}px`,
                                      transform: "none",
                                  }
                                : {}
                        }
                    >
                        <div
                            className="letter-editor-titlebar"
                            onMouseDown={startDragging}
                        >
                            <span>
                                💌{" "}
                                {editingLetterId
                                    ? "Edit Your Letter"
                                    : "A Little Letter"}
                            </span>

                            <button
                                type="button"
                                className="letter-window-close"
                                onMouseDown={(event) =>
                                    event.stopPropagation()
                                }
                                onClick={closeEditor}
                                aria-label="Close letter editor"
                            >
                                X
                            </button>
                        </div>

                        <form
                            className="letter-editor-form"
                            onSubmit={saveLetter}
                        >
                            <div className="letter-editor-intro">
                                <h2>Write a little something...</h2>
                                <p>
                                    Your personal space, just for you. 💗
                                </p>
                            </div>

                            <label htmlFor="letter-title">
                                Letter Title
                            </label>

                            <input
                                id="letter-title"
                                type="text"
                                placeholder="Give your letter a little title..."
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                required
                                autoFocus
                            />

                            <label htmlFor="letter-content">
                                Your Letter
                            </label>

                            <textarea
                                id="letter-content"
                                placeholder="Dear me..."
                                value={content}
                                onChange={(event) =>
                                    setContent(event.target.value)
                                }
                                required
                            />

                            <label htmlFor="letter-status">
                                Letter Status
                            </label>

                            <select
                                id="letter-status"
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                            >
                                <option value="completed">
                                    Completed
                                </option>
                                <option value="draft">
                                    Save as Draft
                                </option>
                            </select>

                            <div className="letter-editor-actions">
                                <button
                                    type="button"
                                    className="cancel-letter-btn"
                                    onClick={closeEditor}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-letter-btn"
                                >
                                    {editingLetterId
                                        ? "Save Changes ♡"
                                        : "Save Letter ♡"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* READ LETTER WINDOW */}
            {selectedLetter && (
                <div
                    className="letter-reader-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedLetter(null);
                        }
                    }}
                >
                    <div className="letter-reader-window">
                        <div className="letter-reader-titlebar">
                            <span>💌 A Letter for Me</span>

                            <button
                                onClick={() => setSelectedLetter(null)}
                                aria-label="Close letter"
                            >
                                X
                            </button>
                        </div>

                        <div className="letter-reader-content">
                            <p className="letter-reader-date">
                                {formatDate(selectedLetter.createdAt)}
                            </p>

                            <h2>{selectedLetter.title}</h2>

                            <div className="letter-reader-body">
                                {selectedLetter.content}
                            </div>

                            <p className="letter-reader-signoff">
                                With love, me. ♡
                            </p>

                            <div className="letter-reader-actions">
                                <button
                                    onClick={() =>
                                        startEditing(selectedLetter)
                                    }
                                >
                                    Edit Letter ✏️
                                </button>

                                <button
                                    onClick={() => setSelectedLetter(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Letterbox;
