
import { useEffect, useRef, useState } from "react";
import "./AboutMe.css";

const STORAGE_KEY = "dearlyAboutMe";

const emptyProfile = {
    name: "",
    nickname: "",
    bio: "",
    location: "",
    favouriteColor: "",
    favouriteSong: "",
    favouriteBook: "",
    favouriteMovie: "",
    favouriteFood: "",
    favouriteHobby: "",
    currentChapter: "",
    currentGoal: "",
    favouriteQuote: "",
    quoteAuthor: "",
    profileImage: "",
};

const favouriteItems = [
    { key: "favouriteColor", label: "Favourite Colour", icon: "🎨" },
    { key: "favouriteSong", label: "Favourite Song", icon: "🎧" },
    { key: "favouriteBook", label: "Favourite Book", icon: "📖" },
    { key: "favouriteMovie", label: "Favourite Movie", icon: "🎬" },
    { key: "favouriteFood", label: "Favourite Food", icon: "🍓" },
    { key: "favouriteHobby", label: "Favourite Hobby", icon: "🌷" },
];

function AboutMe() {
    const [profile, setProfile] = useState(emptyProfile);
    const [formData, setFormData] = useState(emptyProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState("");

    const imageInputRef = useRef(null);

    // Load saved profile
    useEffect(() => {
        try {
            const savedProfile = localStorage.getItem(STORAGE_KEY);

            if (savedProfile) {
                const parsedProfile = JSON.parse(savedProfile);

                const loadedProfile = {
                    ...emptyProfile,
                    ...parsedProfile,
                };

                setProfile(loadedProfile);
                setFormData(loadedProfile);
            }
        } catch (error) {
            console.error("Could not load About Me profile:", error);
        }
    }, []);

    // Check whether the user has added any details
    const hasPersonalDetails = Object.entries(profile).some(
        ([key, value]) =>
            key !== "profileImage" &&
            typeof value === "string" &&
            value.trim() !== ""
    );

    // Open editing mode
    const startEditing = () => {
        setFormData({ ...profile });
        setIsEditing(true);
        setMessage("");
    };

    // Close editing mode
    const cancelEditing = () => {
        setFormData({ ...profile });
        setIsEditing(false);
    };

    // Update form fields
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Upload profile picture
    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setMessage("Please select a valid image file.");
            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setMessage("Please choose an image smaller than 2 MB.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setFormData((previous) => ({
                ...previous,
                profileImage: reader.result,
            }));

            setMessage("");
        };

        reader.onerror = () => {
            setMessage("Could not read that image. Please try again.");
        };

        reader.readAsDataURL(file);
        event.target.value = "";
    };

    // Remove profile picture
    const removeProfileImage = () => {
        setFormData((previous) => ({
            ...previous,
            profileImage: "",
        }));
    };

    // Save profile
    const saveProfile = (event) => {
        event.preventDefault();

        const cleanedProfile = {};

        Object.keys(emptyProfile).forEach((key) => {
            cleanedProfile[key] =
                typeof formData[key] === "string"
                    ? formData[key].trim()
                    : "";
        });

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(cleanedProfile)
            );

            setProfile(cleanedProfile);
            setFormData(cleanedProfile);
            setIsEditing(false);
            setMessage("Your little world has been saved! ♡");

            window.setTimeout(() => {
                setMessage("");
            }, 3000);
        } catch (error) {
            console.error("Could not save profile:", error);
            setMessage(
                "Could not save your profile. Try using a smaller image."
            );
        }
    };

    return (
        <div className="aboutme-page">

            {/* PAGE HEADER */}
            <div className="aboutme-heading">
                <div>
                    <p className="aboutme-eyebrow">
                        A LITTLE SPACE ABOUT YOU
                    </p>

                    <h1>
                        About Me <span>♡</span>
                    </h1>

                    <p>
                        Your story, your little world.
                    </p>
                </div>

                {!isEditing && (
                    <button
                        className="aboutme-edit-button"
                        onClick={startEditing}
                    >
                        ✏️ {hasPersonalDetails ? "Edit Profile" : "Create Profile"}
                    </button>
                )}
            </div>

            {/* SAVE MESSAGE */}
            {message && (
                <div className="aboutme-save-message">
                    {message}
                </div>
            )}

            {/* EDIT PROFILE FORM */}
            {isEditing ? (
                <form
                    className="aboutme-edit-form"
                    onSubmit={saveProfile}
                >
                    <div className="aboutme-form-header">
                        <h2>Let's get to know you ♡</h2>
                        <p>
                            Fill in whatever you feel like sharing.
                            You can always change it later.
                        </p>
                    </div>

                    {/* PROFILE PHOTO */}
                    <div className="aboutme-form-section">
                        <h3>01. Your Profile Picture</h3>

                        <div className="aboutme-photo-editor">
                            <div className="aboutme-avatar">
                                {formData.profileImage ? (
                                    <img
                                        src={formData.profileImage}
                                        alt="Your profile"
                                    />
                                ) : (
                                    <span>♡</span>
                                )}
                            </div>

                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={imageInputRef}
                                    onChange={handleImageUpload}
                                    hidden
                                />

                                <button
                                    type="button"
                                    className="aboutme-photo-button"
                                    onClick={() =>
                                        imageInputRef.current?.click()
                                    }
                                >
                                    📷 Choose Photo
                                </button>

                                {formData.profileImage && (
                                    <button
                                        type="button"
                                        className="aboutme-remove-photo"
                                        onClick={removeProfileImage}
                                    >
                                        Remove
                                    </button>
                                )}

                                <p>JPG, PNG or WEBP. Maximum 2 MB.</p>
                            </div>
                        </div>
                    </div>

                    {/* BASIC DETAILS */}
                    <div className="aboutme-form-section">
                        <h3>02. The Basics</h3>

                        <div className="aboutme-form-grid">
                            <div className="aboutme-field">
                                <label>Your Name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="What should we call you?"
                                />
                            </div>

                            <div className="aboutme-field">
                                <label>Nickname</label>
                                <input
                                    name="nickname"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                    placeholder="Your little nickname..."
                                />
                            </div>

                            <div className="aboutme-field">
                                <label>Location</label>
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Your little corner of the world"
                                />
                            </div>

                            <div className="aboutme-field">
                                <label>A Little About You</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Introduce yourself..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* FAVOURITES */}
                    <div className="aboutme-form-section">
                        <h3>03. Your Favourite Things</h3>

                        <div className="aboutme-form-grid">
                            {favouriteItems.map((item) => (
                                <div
                                    className="aboutme-field"
                                    key={item.key}
                                >
                                    <label>
                                        {item.icon} {item.label}
                                    </label>

                                    <input
                                        name={item.key}
                                        value={formData[item.key]}
                                        onChange={handleChange}
                                        placeholder={`Your ${item.label.toLowerCase()}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CURRENT CHAPTER */}
                    <div className="aboutme-form-section">
                        <h3>04. Your Current Chapter 🌷</h3>

                        <div className="aboutme-field">
                            <label>What is happening in your life right now?</label>

                            <textarea
                                name="currentChapter"
                                value={formData.currentChapter}
                                onChange={handleChange}
                                placeholder="Tell your story..."
                            />
                        </div>

                        <div className="aboutme-field">
                            <label>What are you working towards?</label>

                            <textarea
                                name="currentGoal"
                                value={formData.currentGoal}
                                onChange={handleChange}
                                placeholder="Your dreams, goals and little plans..."
                            />
                        </div>
                    </div>

                    {/* QUOTE */}
                    <div className="aboutme-form-section">
                        <h3>05. Words to Remember</h3>

                        <div className="aboutme-field">
                            <label>Your Favourite Quote</label>

                            <textarea
                                name="favouriteQuote"
                                value={formData.favouriteQuote}
                                onChange={handleChange}
                                placeholder="A quote that means something to you..."
                            />
                        </div>

                        <div className="aboutme-field">
                            <label>Quote Author</label>

                            <input
                                name="quoteAuthor"
                                value={formData.quoteAuthor}
                                onChange={handleChange}
                                placeholder="Who said it?"
                            />
                        </div>
                    </div>

                    {/* FORM BUTTONS */}
                    <div className="aboutme-form-actions">
                        <button
                            type="button"
                            className="aboutme-cancel-button"
                            onClick={cancelEditing}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="aboutme-save-button"
                        >
                            Save My Profile ♡
                        </button>
                    </div>
                </form>
            ) : hasPersonalDetails ? (

                /* PROFILE VIEW */
                <>
                    {/* PROFILE CARD */}
                    <section className="aboutme-profile-card">
                        <div className="aboutme-profile-top">

                            <div className="aboutme-avatar">
                                {profile.profileImage ? (
                                    <img
                                        src={profile.profileImage}
                                        alt={profile.name || "Profile"}
                                    />
                                ) : (
                                    <span>♡</span>
                                )}
                            </div>

                            <div className="aboutme-profile-intro">
                                <p className="aboutme-eyebrow">
                                    HELLO, WORLD!
                                </p>

                                <h2>
                                    {profile.name || "A Little Mystery"}
                                </h2>

                                {profile.nickname && (
                                    <p className="aboutme-nickname">
                                        Also known as {profile.nickname} ♡
                                    </p>
                                )}

                                {profile.bio && (
                                    <p className="aboutme-bio">
                                        {profile.bio}
                                    </p>
                                )}

                                {profile.location && (
                                    <p className="aboutme-location">
                                        📍 {profile.location}
                                    </p>
                                )}
                            </div>

                            <span className="aboutme-heart-decoration">
                                ♡
                            </span>
                        </div>
                    </section>

                    {/* FAVOURITES GRID */}
                    {favouriteItems.some((item) =>
                        profile[item.key]?.trim()
                    ) && (
                        <section className="aboutme-view-section">
                            <div className="aboutme-section-heading">
                                <h2>A Few Favourite Things</h2>
                                <span>✿</span>
                            </div>

                            <div className="aboutme-favourites-grid">
                                {favouriteItems
                                    .filter((item) =>
                                        profile[item.key]?.trim()
                                    )
                                    .map((item) => (
                                        <div
                                            className="aboutme-favourite-card"
                                            key={item.key}
                                        >
                                            <span>{item.icon}</span>
                                            <p>{item.label}</p>
                                            <h3>{profile[item.key]}</h3>
                                        </div>
                                    ))}
                            </div>
                        </section>
                    )}

                    {/* CURRENT CHAPTER */}
                    {(profile.currentChapter || profile.currentGoal) && (
                        <section className="aboutme-chapter-card">
                            <div className="aboutme-section-heading">
                                <h2>My Current Chapter</h2>
                                <span>🌷</span>
                            </div>

                            <div className="aboutme-chapter-content">
                                {profile.currentChapter && (
                                    <div>
                                        <h3>Right Now</h3>
                                        <p>{profile.currentChapter}</p>
                                    </div>
                                )}

                                {profile.currentGoal && (
                                    <div>
                                        <h3>Dreaming Of</h3>
                                        <p>{profile.currentGoal}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* QUOTE CARD */}
                    {profile.favouriteQuote && (
                        <section className="aboutme-quote-card">
                            <span>“</span>

                            <p>{profile.favouriteQuote}</p>

                            {profile.quoteAuthor && (
                                <small>
                                    — {profile.quoteAuthor}
                                </small>
                            )}

                            {!profile.quoteAuthor && (
                                <small>A LITTLE REMINDER FOR MYSELF ♡</small>
                            )}
                        </section>
                    )}

                    <p className="aboutme-footer">
                        Made of little things that make you, YOU. ♡
                    </p>
                </>

            ) : (

                /* EMPTY PROFILE */
                <div className="aboutme-empty-note">
                    <span>🌷</span>

                    <h2>Your story starts here</h2>

                    <p>
                        Add a little introduction, your favourite things
                        and the dreams you're working towards.
                        This space belongs entirely to you.
                    </p>

                    <button onClick={startEditing}>
                        Create My Profile ♡
                    </button>
                </div>
            )}
        </div>
    );
}

export default AboutMe;
