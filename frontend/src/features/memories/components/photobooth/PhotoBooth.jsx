
import { useEffect, useRef, useState } from "react";
import "./PhotoBooth.css";

const FILTERS = {
    Original: "none",
    "Soft Pink": "sepia(18%) saturate(115%) hue-rotate(310deg)",
    Vintage: "sepia(45%) contrast(90%)",
    "Black & White": "grayscale(100%)",
    "Warm Film": "sepia(25%) saturate(125%)",
};

function PhotoBooth({ onSavePhoto }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const countdownRef = useRef(null);
    const previewUrlRef = useRef(null);

    const [cameraOn, setCameraOn] = useState(false);
    const [cameraError, setCameraError] = useState("");
    const [facingMode, setFacingMode] = useState("user");

    const [filter, setFilter] = useState("Original");
    const [countdown, setCountdown] = useState(0);

    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [capturedKind, setCapturedKind] = useState("photo");

    const [stripPhotos, setStripPhotos] = useState([]);
    const [isCreatingStrip, setIsCreatingStrip] = useState(false);

    const [previewUrl, setPreviewUrl] = useState("");

    // Create and clean up the captured image preview URL.
    useEffect(() => {
        if (!capturedPhoto) {
            setPreviewUrl("");
            return;
        }

        const url = URL.createObjectURL(capturedPhoto);
        previewUrlRef.current = url;
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
            previewUrlRef.current = null;
        };
    }, [capturedPhoto]);

    // Stop the camera and countdown when leaving this component.
    useEffect(() => {
        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    async function startCamera(mode = facingMode) {
        setCameraError("");

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError(
                "Camera access is unavailable. Please open Dearly in Chrome using localhost or HTTPS."
            );
            return;
        }

        stopCamera();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: mode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setCameraOn(true);
        } catch (error) {
            console.error("Camera error:", error);

            const messages = {
                NotAllowedError:
                    "Camera permission denied. Please allow camera access in your browser settings.",
                NotFoundError:
                    "No camera was found on this device.",
                NotReadableError:
                    "Your camera may already be in use by another application.",
                OverconstrainedError:
                    "This camera does not support the requested settings.",
            };

            setCameraError(
                messages[error.name] ||
                "Could not start your camera. Please check your camera connection."
            );

            setCameraOn(false);
        }
    }

    function stopCamera() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraOn(false);
    }

    async function switchCamera() {
        const nextMode =
            facingMode === "user" ? "environment" : "user";

        setFacingMode(nextMode);
        await startCamera(nextMode);
    }

    function captureImage() {
        const video = videoRef.current;

        if (!video || !video.videoWidth) {
            setCameraError("Please wait for your camera preview to load.");
            return Promise.resolve(null);
        }

        const canvas = document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");

        if (!context) {
            setCameraError("Could not capture the image.");
            return Promise.resolve(null);
        }

        context.filter = FILTERS[filter];

        // Mirror the front-camera photo.
        if (facingMode === "user") {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => resolve(blob),
                "image/jpeg",
                0.92
            );
        });
    }

    function takePhoto() {
        if (!cameraOn || capturedPhoto) return;

        setCameraError("");

        if (countdownRef.current) {
            clearInterval(countdownRef.current);
        }

        let remaining = 3;
        setCountdown(remaining);

        countdownRef.current = setInterval(async () => {
            remaining -= 1;
            setCountdown(remaining);

            if (remaining <= 0) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;

                const blob = await captureImage();

                if (blob) {
                    setCapturedPhoto(blob);
                    setCapturedKind("photo");
                }

                setCountdown(0);
            }
        }, 1000);
    }

    function retakePhoto() {
        setCapturedPhoto(null);
        setCapturedKind("photo");
    }

    function addToStrip() {
        if (!capturedPhoto || stripPhotos.length >= 4) return;

        const updatedPhotos = [...stripPhotos, capturedPhoto];

        setStripPhotos(updatedPhotos);
        setCapturedPhoto(null);

        if (updatedPhotos.length === 4) {
            setCameraError("");
        }
    }

    function clearStrip() {
        setStripPhotos([]);
        setIsCreatingStrip(false);
    }

    async function createPhotoStrip() {
        if (stripPhotos.length !== 4) return;

        setIsCreatingStrip(true);
        setCameraError("");

        try {
            const images = await Promise.all(
                stripPhotos.map((blob) => {
                    return new Promise((resolve, reject) => {
                        const image = new Image();
                        const url = URL.createObjectURL(blob);

                        image.onload = () => {
                            URL.revokeObjectURL(url);
                            resolve(image);
                        };

                        image.onerror = () => {
                            URL.revokeObjectURL(url);
                            reject(new Error("Could not load a strip photo."));
                        };

                        image.src = url;
                    });
                })
            );

            const canvas = document.createElement("canvas");

            const width = 600;
            const photoHeight = 380;
            const gap = 16;
            const topPadding = 20;
            const footerHeight = 85;

            canvas.width = width;
            canvas.height =
                topPadding * 2 +
                photoHeight * 4 +
                gap * 3 +
                footerHeight;

            const context = canvas.getContext("2d");

            context.fillStyle = "#fff1f5";
            context.fillRect(0, 0, canvas.width, canvas.height);

            images.forEach((image, index) => {
                const x = 20;
                const y = topPadding + index * (photoHeight + gap);
                const boxWidth = width - 40;

                const ratio = Math.max(
                    boxWidth / image.width,
                    photoHeight / image.height
                );

                const drawWidth = image.width * ratio;
                const drawHeight = image.height * ratio;

                context.save();
                context.beginPath();
                context.rect(x, y, boxWidth, photoHeight);
                context.clip();

                context.drawImage(
                    image,
                    x + (boxWidth - drawWidth) / 2,
                    y + (photoHeight - drawHeight) / 2,
                    drawWidth,
                    drawHeight
                );

                context.restore();
            });

            context.fillStyle = "#9c627b";
            context.font = "22px Georgia";
            context.textAlign = "center";
            context.fillText(
                "a little moment with dearly ♡",
                width / 2,
                canvas.height - 28
            );

            canvas.toBlob((blob) => {
                if (blob) {
                    setCapturedPhoto(blob);
                    setCapturedKind("strip");
                } else {
                    setCameraError("Could not create your photo strip.");
                }

                setIsCreatingStrip(false);
            }, "image/jpeg", 0.92);
        } catch (error) {
            console.error(error);
            setCameraError("Something went wrong while creating your photo strip.");
            setIsCreatingStrip(false);
        }
    }

    function savePhoto() {
        if (!capturedPhoto) return;

        if (typeof onSavePhoto !== "function") {
            setCameraError("The Memories save function is not connected yet.");
            return;
        }

        onSavePhoto(capturedPhoto, capturedKind);

        setCapturedPhoto(null);
        setCapturedKind("photo");

        if (capturedKind === "strip") {
            setStripPhotos([]);
        }
    }

    function downloadPhoto() {
        if (!capturedPhoto) return;

        const url = URL.createObjectURL(capturedPhoto);
        const link = document.createElement("a");

        link.href = url;
        link.download =
            capturedKind === "strip"
                ? `dearly-photo-strip-${Date.now()}.jpg`
                : `dearly-memory-${Date.now()}.jpg`;

        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    return (
        <div className="photobooth">

            {/* Heading */}
            <div className="photobooth-heading">
                <span className="photobooth-eyebrow">
                    A LITTLE PLACE FOR HAPPY MOMENTS
                </span>

                <h2>Your Photo Booth <span>♡</span></h2>

                <p>
                    A picture today, a memory forever.
                </p>
            </div>

            {/* Main workspace */}
            <div className="photobooth-workspace">

                {/* Camera */}
                <section className="camera-panel">

                    <div className="camera-topbar">
                        <div>
                            <span className={`camera-status-dot ${cameraOn ? "active" : ""}`} />
                            {cameraOn ? "CAMERA READY" : "CAMERA OFF"}
                        </div>

                        <span>DEARLY CAMERA ♡</span>
                    </div>

                    <div className="camera-screen">

                        {capturedPhoto && previewUrl ? (
                            <img
                                className="captured-preview"
                                src={previewUrl}
                                alt="Your captured memory"
                            />
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={
                                        facingMode === "user"
                                            ? "mirrored-video"
                                            : ""
                                    }
                                    style={{
                                        filter: FILTERS[filter],
                                        display: cameraOn ? "block" : "none",
                                    }}
                                />

                                {!cameraOn && (
                                    <div className="camera-placeholder">
                                        <span>♡</span>
                                        <h3>Your little moment starts here</h3>
                                        <p>Start your camera to see yourself.</p>
                                    </div>
                                )}
                            </>
                        )}

                        {countdown > 0 && (
                            <div className="camera-countdown">
                                {countdown}
                            </div>
                        )}

                        {capturedPhoto && (
                            <div className="photo-taken-label">
                                PHOTO CAPTURED ♡
                            </div>
                        )}
                    </div>

                    {cameraError && (
                        <div className="camera-error">
                            {cameraError}
                        </div>
                    )}

                    {/* Camera buttons */}
                    <div className="camera-controls">

                        {!cameraOn ? (
                            <button
                                className="start-camera-button"
                                onClick={() => startCamera()}
                            >
                                ♡ Start Camera
                            </button>
                        ) : (
                            <>
                                <button
                                    className="secondary-camera-button"
                                    onClick={stopCamera}
                                >
                                    Stop
                                </button>

                                <button
                                    className="secondary-camera-button"
                                    onClick={switchCamera}
                                    disabled={!!capturedPhoto || countdown > 0}
                                >
                                    ⇄ Switch Camera
                                </button>

                                {!capturedPhoto && (
                                    <button
                                        className="capture-button"
                                        onClick={takePhoto}
                                        disabled={countdown > 0}
                                    >
                                        ● Take Photo
                                    </button>
                                )}
                            </>
                        )}

                    </div>

                    <p className="camera-note">
                        Your camera is only used when you choose to start it.
                    </p>
                </section>

                {/* Right-side options */}
                <aside className="photobooth-sidebar">

                    {/* Filters */}
                    <section className="booth-card">
                        <div className="card-heading">
                            <span>01</span>
                            <h3>Choose your vibe</h3>
                        </div>

                        <p className="card-description">
                            Pick a look for your picture.
                        </p>

                        <div className="filter-list">
                            {Object.keys(FILTERS).map((filterName) => (
                                <button
                                    key={filterName}
                                    className={
                                        filter === filterName
                                            ? "selected-filter"
                                            : ""
                                    }
                                    onClick={() => setFilter(filterName)}
                                >
                                    <span>{filterName}</span>
                                    <span>
                                        {filter === filterName ? "✓" : "♡"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Photo strip */}
                    <section className="booth-card strip-card">
                        <div className="card-heading">
                            <span>02</span>
                            <h3>Photo strip</h3>
                        </div>

                        <p className="card-description">
                            Four pictures. One lovely little keepsake.
                        </p>

                        <div className="strip-progress">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className={
                                        index < stripPhotos.length
                                            ? "strip-slot filled"
                                            : "strip-slot"
                                    }
                                >
                                    {index < stripPhotos.length ? "♥" : "+"}
                                </div>
                            ))}
                        </div>

                        <p className="strip-count">
                            {stripPhotos.length} / 4 pictures
                        </p>

                        {stripPhotos.length === 4 && !capturedPhoto && (
                            <button
                                className="create-strip-button"
                                onClick={createPhotoStrip}
                                disabled={isCreatingStrip}
                            >
                                {isCreatingStrip
                                    ? "Creating..."
                                    : "Create Photo Strip ♡"}
                            </button>
                        )}

                        {stripPhotos.length > 0 && (
                            <button
                                className="clear-strip-button"
                                onClick={clearStrip}
                            >
                                Clear strip
                            </button>
                        )}
                    </section>

                    <div className="booth-note">
                        <span>✿</span>
                        <p>
                            Take your time. The little moments matter too.
                        </p>
                    </div>
                </aside>
            </div>

            {/* Captured photo actions */}
            {capturedPhoto && (
                <section className="photo-result">

                    <div className="result-heading">
                        <div>
                            <span className="photobooth-eyebrow">
                                YOUR MOMENT IS READY
                            </span>

                            <h3>
                                {capturedKind === "strip"
                                    ? "Your photo strip is ready! ♡"
                                    : "Looking lovely! ♡"}
                            </h3>
                        </div>

                        <span className="result-heart">♥</span>
                    </div>

                    <p>
                        Happy with your picture? Keep it in your Memories.
                    </p>

                    <div className="photo-result-actions">
                        <button
                            className="secondary-result-button"
                            onClick={retakePhoto}
                        >
                            ↻ Retake
                        </button>

                        {capturedKind === "photo" && stripPhotos.length < 4 && (
                            <button
                                className="secondary-result-button"
                                onClick={addToStrip}
                            >
                                + Add to strip
                            </button>
                        )}

                        <button
                            className="secondary-result-button"
                            onClick={downloadPhoto}
                        >
                            ↓ Download
                        </button>

                        <button
                            className="save-memory-button"
                            onClick={savePhoto}
                        >
                            ♡ Save to Memories
                        </button>
                    </div>
                </section>
            )}

        </div>
    );
}

export default PhotoBooth;
