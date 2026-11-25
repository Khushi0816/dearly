import { useEffect, useState } from "react";
import PhotoBooth from "./components/photobooth/PhotoBooth";
import "./Memories.css";

const DB_NAME = "DearlyMemoriesDB";
const STORE_NAME = "memories";

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveMemory(memory) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        transaction.objectStore(STORE_NAME).put(memory);

        transaction.oncomplete = () => {
            db.close();
            resolve();
        };

        transaction.onerror = () => {
            db.close();
            reject(transaction.error);
        };
    });
}

async function getMemories() {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const request = db
            .transaction(STORE_NAME, "readonly")
            .objectStore(STORE_NAME)
            .getAll();

        request.onsuccess = () => {
            db.close();
            resolve(request.result || []);
        };

        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}

async function deleteMemory(id) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        transaction.objectStore(STORE_NAME).delete(id);

        transaction.oncomplete = () => {
            db.close();
            resolve();
        };

        transaction.onerror = () => {
            db.close();
            reject(transaction.error);
        };
    });
}

function Memories() {
    const [activeTab, setActiveTab] = useState("gallery");
    const [memories, setMemories] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedAlbum, setSelectedAlbum] = useState("All");
    const [sortOrder, setSortOrder] = useState("newest");
    const [loading, setLoading] = useState(true);

    const [imageUrls, setImageUrls] = useState({});

    async function loadMemories() {
        try {
            const savedMemories = await getMemories();
            setMemories(savedMemories);
        } catch (error) {
            console.error("Could not load memories:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMemories();
    }, []);

    // Create temporary browser URLs for saved image blobs.
    useEffect(() => {
        const urls = {};

        memories.forEach((memory) => {
            urls[memory.id] = URL.createObjectURL(memory.image);
        });

        setImageUrls(urls);

        return () => {
            Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [memories]);

    async function handleSavePhoto(imageBlob, type = "photo") {
        const newMemory = {
            id: crypto.randomUUID(),
            image: imageBlob,
            type,
            caption: "",
            album: "My Moments",
            createdAt: new Date().toISOString(),
        };

        try {
            await saveMemory(newMemory);
            await loadMemories();
            setActiveTab("gallery");
        } catch (error) {
            console.error("Could not save photo:", error);
            alert("Sorry, your photo could not be saved.");
        }
    }

    async function handleDelete(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this memory?"
        );

        if (!confirmed) return;

        try {
            await deleteMemory(id);
            await loadMemories();
        } catch (error) {
            console.error("Could not delete memory:", error);
        }
    }

    async function handleEdit(memory) {
        const newCaption = window.prompt(
            "Write a caption for this memory:",
            memory.caption || ""
        );

        if (newCaption === null) return;

        try {
            await saveMemory({
                ...memory,
                caption: newCaption,
            });

            await loadMemories();
        } catch (error) {
            console.error("Could not update caption:", error);
        }
    }

    const albums = [
        "All",
        ...new Set(memories.map((memory) => memory.album || "My Moments")),
    ];

    const filteredMemories = memories
        .filter((memory) => {
            const matchesSearch = (memory.caption || "")
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesAlbum =
                selectedAlbum === "All" ||
                (memory.album || "My Moments") === selectedAlbum;

            return matchesSearch && matchesAlbum;
        })
        .sort((a, b) => {
            return sortOrder === "newest"
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt);
        });

    return (
        <div className="memories-page">
            <div className="memories-heading">
                <div>
                    <p className="memories-eyebrow">A LITTLE BOX OF HAPPINESS</p>
                    <h1>My Memories <span>♡</span></h1>
                    <p className="memories-subtitle">
                        Little moments, lovely photographs, and pieces of life.
                    </p>
                </div>

                <div className="memories-count">
                    <span>{memories.length}</span>
                    <small>saved moments</small>
                </div>
            </div>

            <div className="memories-tabs">
                <button
                    className={activeTab === "gallery" ? "active" : ""}
                    onClick={() => setActiveTab("gallery")}
                >
                    ♡ My Memories
                </button>

                <button
                    className={activeTab === "booth" ? "active" : ""}
                    onClick={() => setActiveTab("booth")}
                >
                    📸 Photo Booth
                </button>
            </div>

            {activeTab === "booth" ? (
                <PhotoBooth onSavePhoto={handleSavePhoto} />
            ) : (
                <div className="memories-gallery">
                    <div className="gallery-toolbar">
                        <input
                            type="text"
                            placeholder="Search your memories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            value={selectedAlbum}
                            onChange={(e) => setSelectedAlbum(e.target.value)}
                        >
                            {albums.map((album) => (
                                <option key={album} value={album}>
                                    {album === "All" ? "All albums" : album}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                        </select>
                    </div>

                    {loading ? (
                        <p className="gallery-message">Opening your memory box...</p>
                    ) : filteredMemories.length === 0 ? (
                        <div className="empty-memories">
                            <div className="empty-memory-icon">♡</div>
                            <h2>Your memory box is waiting</h2>
                            <p>
                                Capture a little moment in the Photo Booth
                                and it will appear here.
                            </p>
                            <button onClick={() => setActiveTab("booth")}>
                                Open Photo Booth
                            </button>
                        </div>
                    ) : (
                        <div className="memory-grid">
                            {filteredMemories.map((memory) => (
                                <article className="memory-card" key={memory.id}>
                                    {imageUrls[memory.id] && (
                                        <img
                                            src={imageUrls[memory.id]}
                                            alt={memory.caption || "Saved memory"}
                                        />
                                    )}

                                    <div className="memory-card-content">
                                        <p className="memory-date">
                                            {new Date(memory.createdAt).toLocaleDateString(
                                                undefined,
                                                {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                }
                                            )}
                                        </p>

                                        <p className="memory-caption">
                                            {memory.caption || "A moment to remember ♡"}
                                        </p>

                                        <div className="memory-card-actions">
                                            <button onClick={() => handleEdit(memory)}>
                                                Edit caption
                                            </button>

                                            <button
                                                className="delete-memory"
                                                onClick={() => handleDelete(memory.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Memories;