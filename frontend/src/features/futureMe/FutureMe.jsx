
import { useState, useEffect } from "react";
import "./FutureMe.css";

function FutureMe() {
    // Load saved future letters
    const [letters, setLetters] = useState(() => {
        try {
            const savedLetters = localStorage.getItem("dearlyFutureLetters");
            return savedLetters ? JSON.parse(savedLetters) : [];
        } catch {
            return [];
        }
    });

    // Editor states
    const [showEditor, setShowEditor] = useState(false);
    const [editingLetterId, setEditingLetterId] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [unlockDate, setUnlockDate] = useState("");

    // View and filter states
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");

    // Today's local date in YYYY-MM-DD format
    const getToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    // Check whether a letter is unlocked
    const isUnlocked = (letter) => {
        return letter.unlockDate <= getToday();
    };

    // Save letters whenever they change
    useEffect(() => {
        localStorage.setItem(
            "dearlyFutureLetters",
            JSON.stringify(letters)
        );
    }, [letters]);

    // Filter and sort letters
    const filteredLetters = letters
        .filter((letter) => {
            const matchesSearch =
                letter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (isUnlocked(letter) &&
                    letter.content.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesFilter =
                activeFilter === "all" ||
                (activeFilter === "locked" && !isUnlocked(letter)) ||
                (activeFilter === "unlocked" && isUnlocked(letter));

            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            return sortOrder === "newest"
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt);
        });

    // Countdown calculation
    const getDaysRemaining = (date) => {
        const [year, month, day] = date.split("-").map(Number);

        const unlock = new Date(year, month - 1, day);
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const difference = unlock.getTime() - today.getTime();

        return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
    };

    // Format date
    const formatDate = (date) => {
        return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Open new letter editor
    const openEditor = () => {
        setTitle("");
        setContent("");
        setUnlockDate("");
        setEditingLetterId(null);
        setShowEditor(true);
    };

    // Close editor
    const closeEditor = () => {
        setShowEditor(false);
        setEditingLetterId(null);
        setTitle("");
        setContent("");
        setUnlockDate("");
    };

    // Edit existing letter
    const editLetter = (letter) => {
        setTitle(letter.title);
        setContent(letter.content);
        setUnlockDate(letter.unlockDate);
        setEditingLetterId(letter.id);
        setSelectedLetter(null);
        setShowEditor(true);
    };

    // Save or update letter
    const saveLetter = () => {
        if (!title.trim() || !content.trim() || !unlockDate) {
            alert("Please complete all fields before saving! 💗");
            return;
        }

        if (unlockDate < getToday()) {
            alert("Please choose today or a future date for unlocking.");
            return;
        }

        if (editingLetterId !== null) {
            setLetters((prevLetters) =>
                prevLetters.map((letter) =>
                    letter.id === editingLetterId
                        ? {
                              ...letter,
                              title: title.trim(),
                              content: content.trim(),
                              unlockDate,
                              updatedAt: new Date().toISOString(),
                          }
                        : letter
                )
            );
        } else {
            const newLetter = {
                id: Date.now(),
                title: title.trim(),
                content: content.trim(),
                unlockDate,
                createdAt: new Date().toISOString(),
            };

            setLetters((prevLetters) => [newLetter, ...prevLetters]);
        }

        closeEditor();
    };

    // Delete letter
    const deleteLetter = (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this future letter? 💔"
        );

        if (confirmed) {
            setLetters((prevLetters) =>
                prevLetters.filter((letter) => letter.id !== id)
            );

            if (selectedLetter?.id === id) {
                setSelectedLetter(null);
            }
        }
    };

    return (
        <div className="future-page">

            {/* Header */}
            <div className="future-header">
                <div>
                    <h1>Letters to Future Me 💌</h1>
                    <p>
                        Little messages from who you are today, for who
                        you will become tomorrow.
                    </p>
                </div>

                <button className="future-new-btn" onClick={openEditor}>
                    + Write to Future Me
                </button>
            </div>

            {/* Search, filters and sorting */}
            {letters.length > 0 && (
                <div className="future-tools">

                    <input
                        type="text"
                        placeholder="Search your letters..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                    />

                    <select
                        value={activeFilter}
                        onChange={(event) =>
                            setActiveFilter(event.target.value)
                        }
                    >
                        <option value="all">All Letters</option>
                        <option value="locked">🔒 Locked</option>
                        <option value="unlocked">🔓 Unlocked</option>
                    </select>

                    <select
                        value={sortOrder}
                        onChange={(event) =>
                            setSortOrder(event.target.value)
                        }
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>

                </div>
            )}

            {/* Letters */}
            {letters.length === 0 ? (
                <div className="future-empty">
                    <div className="future-empty-icon">💌</div>
                    <h2>Your future self is waiting...</h2>
                    <p>
                        Write a letter today. Let your future self
                        discover it someday.
                    </p>

                    <button className="future-new-btn" onClick={openEditor}>
                        Write my first letter
                    </button>
                </div>
            ) : filteredLetters.length === 0 ? (
                <div className="future-empty">
                    <div className="future-empty-icon">🔍</div>
                    <h2>No letters found</h2>
                    <p>Try another search or filter.</p>
                </div>
            ) : (
                <div className="future-grid">
                    {filteredLetters.map((letter) => {
                        const unlocked = isUnlocked(letter);

                        return (
                            <div className="future-card" key={letter.id}>

                                <div className="future-card-top">
                                    <span className="future-envelope">
                                        {unlocked ? "💌" : "✉️"}
                                    </span>

                                    <span
                                        className={`future-status ${
                                            unlocked ? "unlocked" : "locked"
                                        }`}
                                    >
                                        {unlocked
                                            ? "🔓 Unlocked"
                                            : "🔒 Locked"}
                                    </span>
                                </div>

                                <h3>{letter.title}</h3>

                                <p className="future-unlock-date">
                                    Opens on {formatDate(letter.unlockDate)}
                                </p>

                                {unlocked ? (
                                    <p className="future-preview">
                                        {letter.content.length > 110
                                            ? letter.content.substring(0, 110) + "..."
                                            : letter.content}
                                    </p>
                                ) : (
                                    <div className="future-countdown">
                                        <span>
                                            {getDaysRemaining(letter.unlockDate)}
                                        </span>
                                        <p>days until you can open this letter</p>
                                    </div>
                                )}

                                <div className="future-card-actions">
                                    {unlocked && (
                                        <button
                                            className="future-read-btn"
                                            onClick={() =>
                                                setSelectedLetter(letter)
                                            }
                                        >
                                            Read Letter →
                                        </button>
                                    )}

                                    <button
                                        className="future-edit-btn"
                                        onClick={() => editLetter(letter)}
                                    >
                                        ✏️ Edit
                                    </button>

                                    <button
                                        className="future-delete-btn"
                                        onClick={() =>
                                            deleteLetter(letter.id)
                                        }
                                    >
                                        🗑️
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create / Edit Letter Window */}
            {showEditor && (
                <div className="future-overlay">
                    <div className="future-editor-window">

                        <div className="future-titlebar">
                            <span>💌 A Letter Through Time</span>

                            <button
                                className="future-close-btn"
                                onClick={closeEditor}
                                aria-label="Close editor"
                            >
                                ×
                            </button>
                        </div>

                        <div className="future-editor-content">
                            <h2>
                                {editingLetterId !== null
                                    ? "Edit your letter"
                                    : "Dear Future Me..."}
                            </h2>

                            <p>
                                Write something your future self
                                will love to read. 💗
                            </p>

                            <label htmlFor="future-title">
                                Letter Title
                            </label>

                            <input
                                id="future-title"
                                type="text"
                                placeholder="A message for my future self..."
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                            />

                            <label htmlFor="future-content">
                                Your Letter
                            </label>

                            <textarea
                                id="future-content"
                                rows={10}
                                placeholder="Dear future me, I hope..."
                                value={content}
                                onChange={(event) =>
                                    setContent(event.target.value)
                                }
                            />

                            <label htmlFor="future-date">
                                When should this letter unlock?
                            </label>

                            <input
                                id="future-date"
                                type="date"
                                min={getToday()}
                                value={unlockDate}
                                onChange={(event) =>
                                    setUnlockDate(event.target.value)
                                }
                            />

                            <div className="future-editor-actions">
                                <button
                                    className="future-cancel-btn"
                                    onClick={closeEditor}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="future-save-btn"
                                    onClick={saveLetter}
                                >
                                    {editingLetterId !== null
                                        ? "Save Changes"
                                        : "Seal My Letter 💗"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Read Unlocked Letter */}
            {selectedLetter && isUnlocked(selectedLetter) && (
                <div className="future-overlay">
                    <div className="future-reader-window">

                        <div className="future-titlebar">
                            <span>💗 A Message From Your Past</span>

                            <button
                                className="future-close-btn"
                                onClick={() => setSelectedLetter(null)}
                                aria-label="Close letter"
                            >
                                ×
                            </button>
                        </div>

                        <div className="future-reader-content">
                            <span className="future-status unlocked">
                                🔓 Unlocked
                            </span>

                            <h2>{selectedLetter.title}</h2>

                            <p className="future-reader-date">
                                Written on{" "}
                                {new Date(selectedLetter.createdAt).toLocaleDateString()}
                            </p>

                            <p className="future-reader-date">
                                Unlock date: {formatDate(selectedLetter.unlockDate)}
                            </p>

                            <div className="future-full-content">
                                {selectedLetter.content}
                            </div>

                            <button
                                className="future-edit-btn"
                                onClick={() => editLetter(selectedLetter)}
                            >
                                ✏️ Edit Letter
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default FutureMe;
