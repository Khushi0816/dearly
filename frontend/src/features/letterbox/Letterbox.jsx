
import { useState } from "react";
import "./Letterbox.css";

function Letterbox() {
    const [letters, setLetters] = useState([]);
    const [showEditor, setShowEditor] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [editingLetterId, setEditingLetterId] = useState(null);

    const openEditor = () => {
        setTitle("");
        setContent("");
        setShowEditor(true);
        setEditingLetterId(null);
    };

    const closeEditor = () => {
        setShowEditor(false);
    };
    const editLetter = (letter) => {
        setEditingLetterId(letter.id);
        setTitle(letter.title);
        setContent(letter.content);
        setShowEditor(true);
    };
    const deleteLetter = (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this letter? 💔"
        );

        if (confirmDelete) {
            setLetters((prevLetters) =>
                prevLetters.filter((letter) => letter.id !== id)
            );
        }
    };
    const saveLetter = (status) => {
        if (!title.trim() || !content.trim()) {
            alert("Please add a title and write something first! 💗");
            return;
        }

        if (editingLetterId !== null) {
            // Update an existing letter
            setLetters((prevLetters) =>
                prevLetters.map((letter) =>
                    letter.id === editingLetterId
                        ? {
                            ...letter,
                            title: title,
                            content: content,
                            status: status,
                        }
                        : letter
                )
            );
        } else {
            // Create a new letter
            const newLetter = {
                id: Date.now(),
                title: title,
                content: content,
                status: status,
                createdAt: new Date().toLocaleDateString(),
            };

            setLetters((prevLetters) => [...prevLetters, newLetter]);
        }

        setTitle("");
        setContent("");
        setEditingLetterId(null);
        setShowEditor(false);
    };

    return (
        <div className="letterbox">

            {/* Main Letterbox */}
            <div className="letterbox-header">
                <div>
                    <h1>My Letterbox 💌</h1>
                    <p>A little home for all the words you keep to yourself.</p>
                </div>

                <button
                    className="new-letter-btn"
                    onClick={openEditor}
                >
                    + New Letter
                </button>
            </div>

            <div className="letterbox-content">
                {letters.length === 0 ? (
                    <div className="empty-letterbox">
                        <div className="empty-letter-icon">💌</div>
                        <h2>Your letterbox is waiting</h2>
                        <p>
                            Every beautiful thought deserves a place.
                            Write your first letter!
                        </p>

                        <button
                            className="new-letter-btn"
                            onClick={openEditor}
                        >
                            Write my first letter
                        </button>
                    </div>
                ) : (
                    <div className="saved-letters">
                        {letters.map((letter) => (
                            <div className="letter-card" key={letter.id}>
                                <div className="letter-card-header">
                                    <h3>{letter.title}</h3>

                                    <span className={`letter-status ${letter.status}`}>
                                        {letter.status === "draft" ? "Draft" : "Completed"}
                                    </span>
                                </div>

                                <p className="letter-date">{letter.createdAt}</p>

                                <p className="letter-preview">
                                    {letter.content.length > 100
                                        ? letter.content.substring(0, 100) + "..."
                                        : letter.content}
                                </p>
                                <button
                                    className="read-letter-btn"
                                    onClick={() => setSelectedLetter(letter)}
                                >
                                    Read Letter →
                                </button>
                                <button
                                    className="edit-letter-btn"
                                    onClick={() => editLetter(letter)}
                                >
                                    Edit ✏️
                                </button>
                                <button
                                    className="delete-letter-btn"
                                    onClick={() => deleteLetter(letter.id)}
                                >
                                    Delete 🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Separate Letter Writing Popup */}
            {showEditor && (
                <div className="letter-editor-overlay">
                    <div className="letter-editor-window">

                        <div className="letter-editor-titlebar">
                            <span>💌 A Little Letter</span>

                            <button
                                className="editor-close-btn"
                                onClick={closeEditor}
                                aria-label="Close editor"
                            >
                                ×
                            </button>
                        </div>

                        <div className="letter-editor">
                            <h2>Write a little something...</h2>
                            <p>Your personal space, just for you. 💗</p>

                            <div className="letter-form">

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
                                    rows={10}
                                />
                                <div className="letter-editor-actions">
                                    <button
                                        className="cancel-letter-btn"
                                        onClick={closeEditor}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="save-letter-btn"
                                        onClick={() => saveLetter("draft")}
                                    >
                                        {editingLetterId !== null ? "Save Changes" : "Save as Draft"}
                                    </button>

                                    <button
                                        className="complete-letter-btn"
                                        onClick={() => saveLetter("completed")}
                                    >
                                        {editingLetterId !== null ? "Save Changes" : "Mark as Completed"}
                                    </button>

                                </div>
                            </div>


                        </div>

                    </div>
                </div>
            )}
            {selectedLetter && (
                <div className="letter-reader-overlay">
                    <div className="letter-reader-window">

                        <div className="letter-reader-titlebar">
                            <span>💌 A Little Memory</span>

                            <button
                                className="reader-close-btn"
                                onClick={() => setSelectedLetter(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="letter-reader-content">
                            <span className={`letter-status ${selectedLetter.status}`}>
                                {selectedLetter.status === "draft"
                                    ? "Draft"
                                    : "Completed"}
                            </span>

                            <h2>{selectedLetter.title}</h2>

                            <p className="letter-date">
                                Written on {selectedLetter.createdAt}
                            </p>

                            <div className="full-letter-content">
                                {selectedLetter.content}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default Letterbox;
