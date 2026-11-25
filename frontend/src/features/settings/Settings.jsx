
import { useEffect, useRef, useState } from "react";
import "./Settings.css";

const SETTINGS_KEY = "dearlySettings";

const defaultSettings = {
    displayName: "",
    theme: "pink",
    confirmBeforeDelete: true,
    compactMode: false,
};

const themes = [
    { id: "pink", name: "Cotton Candy", color: "#d98eaa" },
    { id: "lavender", name: "Lavender Dreams", color: "#a995c9" },
    { id: "peach", name: "Peach Blossom", color: "#e6a27e" },
    { id: "mint", name: "Mint Garden", color: "#91b99d" },
];

function Settings() {
    const [activeTab, setActiveTab] = useState("appearance");
    const [settings, setSettings] = useState(defaultSettings);
    const [statusMessage, setStatusMessage] = useState("");
    const [storageInfo, setStorageInfo] = useState({
        letters: 0,
        diary: 0,
        future: 0,
        memories: 0,
        total: 0,
    });

    const importInputRef = useRef(null);

    // Load saved settings
    useEffect(() => {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);

            if (saved) {
                const parsed = JSON.parse(saved);
                setSettings({
                    ...defaultSettings,
                    ...parsed,
                });
            }
        } catch (error) {
            console.error("Could not load settings:", error);
        }
    }, []);

    // Apply the selected theme to the entire document
    useEffect(() => {
        document.documentElement.dataset.dearlyTheme = settings.theme;
        document.documentElement.dataset.dearlyCompact =
            settings.compactMode ? "true" : "false";
    }, [settings.theme, settings.compactMode]);

    // Calculate saved data counts
    const updateStorageInfo = () => {
        const letters = readArray("dearlyLetters");
        const diary = readArray("dearlyDiary");
        const future = readArray("dearlyFutureLetters");

        // Memories are stored in IndexedDB, so count its records separately.
        setStorageInfo({
            letters: letters.length,
            diary: diary.length,
            future: future.length,
            memories: 0,
            total: letters.length + diary.length + future.length,
        });
    };

    useEffect(() => {
        updateStorageInfo();
    }, []);

    function readArray(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    const saveSettings = (updatedSettings) => {
        setSettings(updatedSettings);

        try {
            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(updatedSettings)
            );
            setStatusMessage("Settings saved successfully! ♡");
        } catch (error) {
            console.error("Could not save settings:", error);
            setStatusMessage("Could not save your settings.");
        }

        window.setTimeout(() => setStatusMessage(""), 2500);
    };

    const handleSettingChange = (name, value) => {
        const updatedSettings = {
            ...settings,
            [name]: value,
        };

        saveSettings(updatedSettings);
    };

    // Export Dearly data as a JSON file
    const exportData = () => {
        const dearlyData = {};

        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("dearly")) {
                dearlyData[key] = localStorage.getItem(key);
            }
        });

        const exportObject = {
            application: "Dearly",
            exportedAt: new Date().toISOString(),
            version: 1,
            data: dearlyData,
        };

        const blob = new Blob(
            [JSON.stringify(exportObject, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `dearly-backup-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        setStatusMessage("Your Dearly backup is ready! ♡");
        window.setTimeout(() => setStatusMessage(""), 2500);
    };

    // Import a previous Dearly backup
    const importData = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        try {
            const fileText = await file.text();
            const backup = JSON.parse(fileText);

            if (
                backup.application !== "Dearly" ||
                !backup.data ||
                typeof backup.data !== "object" ||
                Array.isArray(backup.data)
            ) {
                throw new Error("This is not a valid Dearly backup.");
            }

            const entries = Object.entries(backup.data);

            if (
                entries.length === 0 ||
                entries.some(
                    ([key, value]) =>
                        !key.startsWith("dearly") ||
                        typeof value !== "string"
                )
            ) {
                throw new Error("The backup file contains invalid data.");
            }

            const confirmed = window.confirm(
                "Importing this backup will replace matching Dearly data saved in this browser. Continue?"
            );

            if (!confirmed) {
                event.target.value = "";
                return;
            }

            entries.forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });

            // Refresh the settings displayed on screen
            const savedSettings = localStorage.getItem(SETTINGS_KEY);

            if (savedSettings) {
                setSettings({
                    ...defaultSettings,
                    ...JSON.parse(savedSettings),
                });
            }

            updateStorageInfo();

            setStatusMessage("Your backup has been imported! ♡");
        } catch (error) {
            console.error("Import failed:", error);
            setStatusMessage(
                error.message || "Could not import this backup."
            );
        }

        event.target.value = "";
        window.setTimeout(() => setStatusMessage(""), 3500);
    };

    // Clear only Dearly data saved in localStorage
    const clearAllData = () => {
        const confirmed = window.confirm(
            "Are you sure you want to clear all Dearly data stored in this browser? Export a backup first if you want to keep it."
        );

        if (!confirmed) return;

        Object.keys(localStorage)
            .filter((key) => key.startsWith("dearly"))
            .forEach((key) => localStorage.removeItem(key));

        setSettings(defaultSettings);
        localStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify(defaultSettings)
        );

        updateStorageInfo();
        setStatusMessage(
            "Dearly's local browser data has been cleared."
        );

        window.setTimeout(() => setStatusMessage(""), 3500);
    };

    const tabs = [
        { id: "appearance", icon: "🎨", label: "Appearance" },
        { id: "personal", icon: "♡", label: "Personalisation" },
        { id: "privacy", icon: "🔒", label: "Privacy" },
        { id: "data", icon: "💾", label: "Data & Storage" },
        { id: "about", icon: "🌷", label: "About Dearly" },
    ];

    return (
        <div className="settings-page">

            {/* HEADER */}
            <header className="settings-heading">
                <div>
                    <p className="settings-eyebrow">
                        YOUR LITTLE CONTROL CENTRE
                    </p>

                    <h1>Settings <span>⚙</span></h1>

                    <p>Make Dearly feel a little more like you.</p>
                </div>
            </header>

            {statusMessage && (
                <div className="settings-status">
                    {statusMessage}
                </div>
            )}

            <div className="settings-layout">

                {/* SIDEBAR */}
                <aside className="settings-sidebar">
                    <p className="settings-sidebar-label">
                        SETTINGS MENU
                    </p>

                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`settings-tab ${
                                activeTab === tab.id ? "active" : ""
                            }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="settings-tab-arrow">
                                    ›
                                </span>
                            )}
                        </button>
                    ))}
                </aside>

                {/* CONTENT */}
                <main className="settings-content">

                    {activeTab === "appearance" && (
                        <section>
                            <div className="settings-section-title">
                                <span>🎨</span>
                                <div>
                                    <h2>Appearance</h2>
                                    <p>Choose the look and feel of Dearly.</p>
                                </div>
                            </div>

                            <div className="settings-card">
                                <h3>Choose your theme</h3>
                                <p className="settings-description">
                                    Pick a colour palette for your little world.
                                </p>

                                <div className="settings-theme-grid">
                                    {themes.map((theme) => (
                                        <button
                                            key={theme.id}
                                            className={`settings-theme-option ${
                                                settings.theme === theme.id
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleSettingChange(
                                                    "theme",
                                                    theme.id
                                                )
                                            }
                                        >
                                            <span
                                                className="settings-theme-swatch"
                                                style={{
                                                    background: theme.color,
                                                }}
                                            />

                                            <span>{theme.name}</span>

                                            {settings.theme === theme.id && (
                                                <span>✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="settings-card">
                                <div className="settings-option-row">
                                    <div>
                                        <h3>Compact mode</h3>
                                        <p className="settings-description">
                                            Use a little less spacing in supported
                                            Dearly sections.
                                        </p>
                                    </div>

                                    <label className="settings-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.compactMode}
                                            onChange={(event) =>
                                                handleSettingChange(
                                                    "compactMode",
                                                    event.target.checked
                                                )
                                            }
                                        />
                                        <span />
                                    </label>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === "personal" && (
                        <section>
                            <div className="settings-section-title">
                                <span>♡</span>
                                <div>
                                    <h2>Personalisation</h2>
                                    <p>Make this space yours.</p>
                                </div>
                            </div>

                            <div className="settings-card">
                                <h3>Display name</h3>
                                <p className="settings-description">
                                    Choose the name Dearly should use for you.
                                </p>

                                <input
                                    className="settings-text-input"
                                    value={settings.displayName}
                                    onChange={(event) =>
                                        handleSettingChange(
                                            "displayName",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your display name..."
                                    maxLength={40}
                                />

                                <p className="settings-helper">
                                    This preference is saved in this browser.
                                </p>
                            </div>

                            <div className="settings-card">
                                <h3>A little reminder</h3>
                                <p className="settings-description">
                                    Dearly is your personal space. You can
                                    change these preferences whenever you like.
                                </p>
                            </div>
                        </section>
                    )}

                    {activeTab === "privacy" && (
                        <section>
                            <div className="settings-section-title">
                                <span>🔒</span>
                                <div>
                                    <h2>Privacy</h2>
                                    <p>Manage how Dearly behaves on this device.</p>
                                </div>
                            </div>

                            <div className="settings-card">
                                <div className="settings-option-row">
                                    <div>
                                        <h3>Confirm before deleting</h3>
                                        <p className="settings-description">
                                            Ask for confirmation before a
                                            supported delete action.
                                        </p>
                                    </div>

                                    <label className="settings-switch">
                                        <input
                                            type="checkbox"
                                            checked={
                                                settings.confirmBeforeDelete
                                            }
                                            onChange={(event) =>
                                                handleSettingChange(
                                                    "confirmBeforeDelete",
                                                    event.target.checked
                                                )
                                            }
                                        />
                                        <span />
                                    </label>
                                </div>
                            </div>

                            <div className="settings-warning">
                                <strong>Important privacy note</strong>
                                <p>
                                    Your current letters, diary entries and
                                    preferences are stored in this browser.
                                    This prototype does not provide account
                                    authentication or encrypted cloud storage.
                                    Anyone with access to this browser profile
                                    may be able to inspect its local data.
                                </p>
                            </div>
                        </section>
                    )}

                    {activeTab === "data" && (
                        <section>
                            <div className="settings-section-title">
                                <span>💾</span>
                                <div>
                                    <h2>Data & Storage</h2>
                                    <p>Your memories deserve a backup.</p>
                                </div>
                            </div>

                            <div className="settings-card">
                                <h3>Your saved content</h3>

                                <div className="settings-storage-grid">
                                    <div>
                                        <strong>{storageInfo.letters}</strong>
                                        <span>Letters</span>
                                    </div>

                                    <div>
                                        <strong>{storageInfo.diary}</strong>
                                        <span>Diary entries</span>
                                    </div>

                                    <div>
                                        <strong>{storageInfo.future}</strong>
                                        <span>Future letters</span>
                                    </div>

                                    <div>
                                        <strong>{storageInfo.memories}</strong>
                                        <span>Memories</span>
                                    </div>
                                </div>

                                <p className="settings-helper">
                                    Counts include localStorage entries.
                                    Memories stored in IndexedDB are not yet
                                    included in this count.
                                </p>
                            </div>

                            <div className="settings-card">
                                <h3>Export your data</h3>
                                <p className="settings-description">
                                    Download a JSON backup of Dearly data
                                    stored in localStorage.
                                </p>

                                <button
                                    className="settings-action-button"
                                    onClick={exportData}
                                >
                                    ↓ Export Dearly Backup
                                </button>
                            </div>

                            <div className="settings-card">
                                <h3>Import a backup</h3>
                                <p className="settings-description">
                                    Restore data from a Dearly JSON backup.
                                    Matching saved keys will be replaced.
                                </p>

                                <input
                                    ref={importInputRef}
                                    type="file"
                                    accept=".json,application/json"
                                    hidden
                                    onChange={importData}
                                />

                                <button
                                    className="settings-action-button secondary"
                                    onClick={() =>
                                        importInputRef.current?.click()
                                    }
                                >
                                    ↑ Import Backup
                                </button>
                            </div>

                            <div className="settings-danger-card">
                                <h3>Clear local Dearly data</h3>
                                <p>
                                    This removes Dearly keys stored in
                                    localStorage. It does not clear IndexedDB
                                    photo memories.
                                </p>

                                <button
                                    className="settings-danger-button"
                                    onClick={clearAllData}
                                >
                                    Clear Local Data
                                </button>
                            </div>
                        </section>
                    )}

                    {activeTab === "about" && (
                        <section>
                            <div className="settings-section-title">
                                <span>🌷</span>
                                <div>
                                    <h2>About Dearly</h2>
                                    <p>A little corner of the internet.</p>
                                </div>
                            </div>

                            <div className="settings-about-card">
                                <div className="settings-about-logo">
                                    ♡
                                </div>

                                <h2>DEARLY.EXE</h2>

                                <p>
                                    Your personal collection of letters,
                                    memories, thoughts and little moments.
                                </p>

                                <div className="settings-about-details">
                                    <div>
                                        <span>Application</span>
                                        <strong>Dearly</strong>
                                    </div>

                                    <div>
                                        <span>Version</span>
                                        <strong>1.0.0</strong>
                                    </div>

                                    <div>
                                        <span>Made with</span>
                                        <strong>♡ and React</strong>
                                    </div>
                                </div>

                                <p className="settings-about-footer">
                                    Made for the things you want to remember. ♡
                                </p>
                            </div>
                        </section>
                    )}

                </main>
            </div>
        </div>
    );
}

export default Settings;
