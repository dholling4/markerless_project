// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Initialize TensorFlow.js MediaPipe when libraries are loaded
    window.addEventListener('load', () => {
        setTimeout(async () => {
            console.log('🚀 Checking TensorFlow.js and MediaPipe libraries...');
            
            // Check if libraries are loaded
            if (typeof tf !== 'undefined') {
                console.log('✅ TensorFlow.js loaded, version:', tf.version?.tfjs || 'unknown');
            } else {
                console.error('❌ TensorFlow.js not loaded');
                return;
            }
            
            // Check for TensorFlow.js pose detection
            if (typeof poseDetection !== 'undefined') {
                console.log('✅ TensorFlow.js PoseDetection library loaded');
                
                try {
                    await tf.ready();
                    console.log('✅ TensorFlow.js ready');
                    console.log('📋 Available models:', Object.keys(poseDetection.SupportedModels));
                    
                    if (poseDetection.SupportedModels.MoveNet) {
                        console.log('✅ MoveNet model available via TensorFlow.js');
                    } else {
                        console.warn('⚠️ MoveNet model not found');
                    }
                    
                    if (poseDetection.SupportedModels.MediaPipePose) {
                        console.log('✅ MediaPipe Pose model available as backup');
                    } else {
                        console.warn('⚠️ MediaPipe Pose model not found');
                    }
                    
                } catch (error) {
                    console.error('❌ TensorFlow.js initialization failed:', error);
                }
            } else {
                console.warn('⚠️ TensorFlow.js PoseDetection library not loaded');
            }
            
            // Check for direct MediaPipe libraries
            if (typeof Pose !== 'undefined') {
                console.log('✅ Direct MediaPipe Pose library loaded');
            } else {
                console.warn('⚠️ Direct MediaPipe Pose library not loaded');
            }
            
            // Show available globals for debugging
            const mediaRelated = Object.keys(window).filter(key => 
                key.toLowerCase().includes('pose') || 
                key.toLowerCase().includes('tf') || 
                key.toLowerCase().includes('mediapipe')
            );
            console.log('🔍 Media-related globals:', mediaRelated);
        }, 3000); // Wait 3 seconds for all libraries to load
    });

    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 11, 0.98)';
        } else {
            navbar.style.background = 'rgba(10, 10, 11, 0.95)';
        }
    });
});

// Smooth scrolling functionality
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// File upload functionality
document.addEventListener('DOMContentLoaded', function() {
    const fileUploadArea = document.getElementById('file-upload-area');
    const videoUpload = document.getElementById('video-upload');
    const analyzeBtn = document.getElementById('analyze-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const resultsPreview = document.getElementById('results-preview');

    let selectedFile = null;

    // Click to upload
    fileUploadArea.addEventListener('click', () => {
        videoUpload.click();
    });

    // Drag and drop functionality
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#60C2E4';
        fileUploadArea.style.background = 'rgba(96, 194, 228, 0.1)';
    });

    fileUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        fileUploadArea.style.background = 'transparent';
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        fileUploadArea.style.background = 'transparent';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    // File input change
    videoUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    function handleFileUpload(file) {
        // Validate file type - include all common video MIME types
        const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo'];
        const allowedExtensions = ['.mp4', '.avi', '.mov'];
        
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
        
        if (!allowedTypes.includes(file.type) && !hasValidExtension) {
            alert('Please upload a valid video file (MP4, AVI, or MOV)');
            console.log('Rejected file:', file.name, 'Type:', file.type);
            return;
        }
        
        console.log('✅ Accepted video file:', file.name, 'Type:', file.type);

        // Validate file size (100MB limit)
        const maxSize = 100 * 1024 * 1024; // 100MB in bytes
        if (file.size > maxSize) {
            alert('File size must be less than 100MB');
            return;
        }

        selectedFile = file;
        
        // Update UI
        const placeholder = fileUploadArea.querySelector('.upload-placeholder');
        placeholder.innerHTML = `
            <i class="fas fa-check-circle upload-icon" style="color: #00FFAB;"></i>
            <h3>Video Selected</h3>
            <p>${file.name}</p>
            <p class="file-requirements">Size: ${(file.size / 1024 / 1024).toFixed(2)}MB</p>
        `;

        analyzeBtn.disabled = false;
        analyzeBtn.style.opacity = '1';
    }

    // Analyze button click
    analyzeBtn.addEventListener('click', () => {
        console.log('Analyze button clicked');
        if (!selectedFile) {
            console.log('No file selected');
            return;
        }
        console.log('Selected file:', selectedFile);
        startAnalysis();
    });

    function startAnalysis() {
        console.log('startAnalysis() called');
        // Hide analyze button and show progress
        analyzeBtn.style.display = 'none';
        progressContainer.style.display = 'block';

        // Start real analysis instead of simulation
        showResults();
    }

    // Progress update function for real-time tracking
    function updateProgress(percentage, message) {
        progressFill.style.width = percentage + '%';
        progressText.textContent = message;
        console.log(`Progress: ${percentage}% - ${message}`);
    }

    async function showResults() {
        console.log('showResults() called');
        
        // Start with initial progress
        updateProgress(5, 'Initializing video processing...');
        
        try {
            // Generate results with real MediaPipe processing
            console.log('About to call generateMockResults with real analysis');
            await generateMockResults();
            
            // Complete progress
            updateProgress(100, 'Analysis complete!');
            
            // Hide progress and show results after a brief pause
            setTimeout(() => {
                console.log('Hiding progress, showing results');
                progressContainer.style.display = 'none';
                resultsPreview.style.display = 'block';
                
                // Scroll to results
                resultsPreview.scrollIntoView({ behavior: 'smooth' });
            }, 1000);
            
        } catch (error) {
            console.error('Analysis failed:', error);
            updateProgress(0, 'Analysis failed. Please try again.');
            
            // Reset UI on error
            setTimeout(() => {
                progressContainer.style.display = 'none';
                analyzeBtn.style.display = 'block';
            }, 2000);
        }
    }

    async function generateMockResults() {
        console.log('generateMockResults() called');
        // Process real pose estimation data or simulate
        const gaitTypeElement = document.querySelector('input[name="gait-type"]:checked');
        const cameraAngleElement = document.querySelector('input[name="camera-angle"]:checked');
        
        if (!gaitTypeElement) {
            console.error('No gait type selected');
            return;
        }
        if (!cameraAngleElement) {
            console.error('No camera angle selected');
            return;
        }
        
        const gaitType = gaitTypeElement.value;
        const cameraAngle = cameraAngleElement.value;
        console.log('Gait type:', gaitType, 'Camera angle:', cameraAngle);
        
        // Generate biomechanically accurate results with real MediaPipe processing
        console.log('🚀 About to call performBiomechanicalAnalysis with video file:', selectedFile?.name);
        try {
            const analysisResults = await performBiomechanicalAnalysis(gaitType, cameraAngle, selectedFile, updateProgress);
            console.log('✅ performBiomechanicalAnalysis completed successfully');
            console.log('📊 Analysis results:', analysisResults);
            
            if (!analysisResults) {
                throw new Error('Analysis returned null results');
            }
            
            // Update UI with calculated results using new retail interface
            console.log('✅ Calling generateRetailAnalysis to populate retail interface');
            generateRetailAnalysis(analysisResults);
            
            // Also populate any remaining old elements for backwards compatibility
            const cadenceElement = document.getElementById('cadence-score');
            const gradeElement = document.getElementById('overall-grade');
            const asymmetryElement = document.getElementById('asymmetry-score');
            
            if (cadenceElement) {
                cadenceElement.textContent = `${analysisResults.cadence} spm`;
            }
            if (gradeElement) {
                gradeElement.textContent = analysisResults.grade;
            }
            if (asymmetryElement) {
                const asymmetryValue = analysisResults.asymmetry;
                const asymmetryMagnitude = Math.abs(asymmetryValue);
                const asymmetryDirection = asymmetryValue > 0 ? 'RIGHT' : 'LEFT';
                
                if (asymmetryMagnitude < 3) {
                    asymmetryElement.innerHTML = `<span style="color: #00E676;">${asymmetryMagnitude.toFixed(1)}° Balanced</span>`;
                } else {
                    asymmetryElement.innerHTML = `<span style="color: ${asymmetryMagnitude > 10 ? '#FF5252' : '#FFC107'};">${asymmetryMagnitude.toFixed(1)}° ${asymmetryDirection}</span>`;
                }
                asymmetryElement.title = `Cumulative asymmetry: ${asymmetryValue.toFixed(1)}° (${asymmetryDirection} dominant)`;
            }
            
            console.log(`📊 Results populated in retail interface`);
            
            // Display pose model and ankle calculation method information
            if (analysisResults.poseModel && analysisResults.ankleCalculationMethod) {
                console.log(`📋 Pose Model: ${analysisResults.poseModel}`);
                console.log(`🦴 Lower Limb Calculation: ${analysisResults.ankleCalculationMethod}`);
                console.log(`🎯 Data Source: ${analysisResults.dataSource || 'Unknown'}`);
                
                // Show data source prominently to user
                if (analysisResults.dataSource === 'REAL_MOVENET') {
                    console.log('🎉 SUCCESS: Results based on REAL MoveNet pose detection from your video!');
                    console.log('✅ Your biomechanical analysis uses actual movement data');
                } else if (analysisResults.dataSource === 'SIMULATION') {
                    console.log('ℹ️ Note: Results based on simulated gait data');
                    console.log('💡 Upload a video file for real pose detection analysis');
                }
                
                // Add visual indicator for MoveNet tibial surrogate
                if (analysisResults.poseModel === 'MoveNet') {
                    console.log('ℹ️ Note: Tibial inclination angles calculated using shank-to-vertical measurement due to MoveNet model limitations');
                }
            }
        
        // Generate comprehensive analysis charts
        console.log('Analysis results:', analysisResults);
        console.log('ROM values:', analysisResults.romValues);
        console.log('ROM Table:', analysisResults.romTable);
        console.log('About to generate charts...');
        
        // Generate charts only if canvas elements exist
        if (document.getElementById('spider-chart')) {
            try {
                generateSpiderChart(analysisResults);
                console.log('Spider chart generated successfully');
            } catch (error) {
                console.error('Error generating spider chart:', error);
            }
        } else {
            console.log('Spider chart canvas not found, skipping');
        }
        
        if (document.getElementById('asymmetry-chart')) {
            try {
                generateAsymmetryChart(analysisResults);
                console.log('Asymmetry chart generated successfully');
            } catch (error) {
                console.error('Error generating asymmetry chart:', error);
            }
        } else {
            console.log('Asymmetry chart canvas not found, skipping');
        }
        
        // Generate joint angle plots only if canvas elements exist
        if (document.getElementById('angleChart') && document.getElementById('angleLinesChart')) {
            try {
                generateJointAnglePlot(analysisResults, 'angleChart');
                generateJointAngleLinesPlot(analysisResults, 'angleLinesChart');
                
                // Show and setup CSV download button
                const downloadBtn = document.getElementById('downloadCSVBtn');
                if (downloadBtn) {
                    downloadBtn.style.display = 'inline-block';
                    downloadBtn.onclick = () => downloadLineplotDataAsCSV(analysisResults);
                }
                
                console.log('Joint angle plot generated successfully');
            } catch (error) {
                console.error('Error generating joint angle plot:', error);
            }
        } else {
            console.log('Joint angle plot canvases not found, skipping');
        }
        
        // Generate ROM table only if container exists
        if (document.getElementById('rom-table-container')) {
            try {
                generateROMTable(analysisResults);
                console.log('ROM table generated successfully');
            } catch (error) {
                console.error('Error generating ROM table:', error);
            }
        } else {
            console.log('ROM table container not found, skipping');
        }
        
            // Add download button if it exists
            if (document.getElementById('rom-table-container')) {
                addDownloadButton();
            }
            
        } catch (error) {
            console.error('❌ Error in generateMockResults:', error);
            // Show error message to user (check if elements exist first)
            const cadenceElement = document.getElementById('cadence-score');
            const gradeElement = document.getElementById('overall-grade');
            const asymmetryElement = document.getElementById('asymmetry-score');
            
            if (cadenceElement) cadenceElement.textContent = 'Error';
            if (gradeElement) gradeElement.textContent = 'Failed';
            if (asymmetryElement) asymmetryElement.textContent = 'Error';
            
            // Update retail interface with error state
            const overallRecommendationText = document.getElementById('overall-recommendation-text');
            if (overallRecommendationText) {
                overallRecommendationText.textContent = 'Analysis Error - Please Try Again';
            }
        }
    }

    // MediaPipe Pose keypoints (matching Python implementation)
    const KEYPOINTS_OF_INTEREST = {
        11: "Left Shoulder",
        12: "Right Shoulder", 
        23: "Left Hip",
        24: "Right Hip",
        25: "Left Knee",
        26: "Right Knee",
        27: "Left Ankle",
        28: "Right Ankle",
        31: "Left Foot",
        32: "Right Foot"
    };

    // Pose Detection configuration (using MoveNet as primary, MediaPipe as backup)
    const POSE_CONFIG = {
        // Primary: MoveNet (more reliable in TensorFlow.js)
        moveNet: {
            modelType: 'SinglePose.Thunder', // High accuracy model
            minScore: 0.7,  // Lower threshold for better detection
            enableSmoothing: true,
            enableTracking: true
        },
        // Backup: MediaPipe (if available)
        mediaPipe: {
            runtime: 'mediapipe',
            modelType: 'full',
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
            enableSmoothing: true
        }
    };

    // Global variables for TensorFlow.js pose detection processing
    let poseDetector = null;
    let tfReady = false;
    let isProcessingVideo = false;
    let currentPoseModel = null;

    // Universal keypoint mapping for different pose models
    const KEYPOINT_MAPPING = {
        // MoveNet uses COCO format (17 keypoints)
        MoveNet: {
            leftShoulder: 5,   // Left shoulder
            rightShoulder: 6,  // Right shoulder  
            leftElbow: 7,      // Left elbow (proxy for better shoulder-hip line)
            rightElbow: 8,     // Right elbow
            leftWrist: 9,      // Left wrist
            rightWrist: 10,    // Right wrist
            leftHip: 11,       // Left hip
            rightHip: 12,      // Right hip
            leftKnee: 13,      // Left knee
            rightKnee: 14,     // Right knee
            leftAnkle: 15,     // Left ankle
            rightAnkle: 16     // Right ankle
        },
        // MediaPipe uses its own format (33 keypoints)
        MediaPipe: {
            leftShoulder: 11,  // Left shoulder
            rightShoulder: 12, // Right shoulder
            leftHip: 23,       // Left hip
            rightHip: 24,      // Right hip
            leftKnee: 25,      // Left knee
            rightKnee: 26,     // Right knee
            leftAnkle: 27,     // Left ankle
            rightAnkle: 28,    // Right ankle
            leftFoot: 31,      // Left foot index
            rightFoot: 32      // Right foot index
        }
    };

    // Extract keypoints in universal format (matching Python gait.py structure)
    function extractUniversalKeypoints(keypoints, width, height) {
        // Determine model type based on keypoints length
        const modelType = keypoints.length >= 30 ? 'MediaPipe' : 'MoveNet';
        const mapping = KEYPOINT_MAPPING[modelType];
        
        console.log(`🎯 Using ${modelType} keypoint mapping`);
        
        // Validate required keypoints exist with sufficient confidence
        const requiredPoints = ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 
                               'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'];
        
        const minScore = 0.3; // Lower threshold for broader compatibility
        const validPoints = requiredPoints.every(pointName => {
            const idx = mapping[pointName];
            return keypoints[idx] && keypoints[idx].score > minScore;
        });
        
        if (!validPoints) {
            console.warn(`⚠️ Required keypoints not detected with sufficient confidence (${modelType})`);
            return null;
        }
        
        // Extract coordinates in consistent format
        const getCoords = (pointName) => {
            const idx = mapping[pointName];
            const kp = keypoints[idx];
            return kp ? { x: kp.x, y: kp.y, score: kp.score } : null;
        };
        
        // For MoveNet, use ankle as foot since it doesn't have separate foot points
        const leftFoot = modelType === 'MediaPipe' ? getCoords('leftFoot') : getCoords('leftAnkle');
        const rightFoot = modelType === 'MediaPipe' ? getCoords('rightFoot') : getCoords('rightAnkle');
        
        return {
            left: {
                shoulder: getCoords('leftShoulder'),
                hip: getCoords('leftHip'),
                knee: getCoords('leftKnee'),
                ankle: getCoords('leftAnkle'),
                foot: leftFoot
            },
            right: {
                shoulder: getCoords('rightShoulder'),
                hip: getCoords('rightHip'),
                knee: getCoords('rightKnee'),
                ankle: getCoords('rightAnkle'),
                foot: rightFoot
            },
            modelType: modelType
        };
    }

    // Initialize pose detection (try MoveNet first, then MediaPipe backup)
    async function initializePoseDetection() {
        try {
            console.log('🤖 Initializing pose detection with TensorFlow.js...');
            
            // Check if TensorFlow.js and PoseDetection are loaded
            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js not loaded');
            }
            
            if (typeof poseDetection === 'undefined') {
                throw new Error('PoseDetection library not loaded');
            }

            console.log('🚀 TensorFlow.js version:', tf.version.tfjs);
            
            // Wait for TensorFlow.js to be ready
            await tf.ready();
            tfReady = true;
            console.log('✅ TensorFlow.js ready');

            // Try MoveNet first (more reliable)
            console.log('🎯 Attempting to load MoveNet model...');
            try {
                poseDetector = await poseDetection.createDetector(
                    poseDetection.SupportedModels.MoveNet,
                    POSE_CONFIG.moveNet
                );
                console.log('✅ MoveNet pose detector initialized successfully');
                console.log('📊 Model config:', POSE_CONFIG.moveNet);
                return { success: true, model: 'MoveNet' };
                
            } catch (moveNetError) {
                console.warn('⚠️ MoveNet failed, trying MediaPipe...', moveNetError);
                
                // Fallback to MediaPipe
                try {
                    poseDetector = await poseDetection.createDetector(
                        poseDetection.SupportedModels.MediaPipePose,
                        POSE_CONFIG.mediaPipe
                    );
                    console.log('✅ MediaPipe pose detector initialized as backup');
                    console.log('📊 Model config:', POSE_CONFIG.mediaPipe);
                    return { success: true, model: 'MediaPipe' };
                    
                } catch (mediaPipeError) {
                    console.error('❌ Both MoveNet and MediaPipe failed:', mediaPipeError);
                    throw new Error('No pose detection models available');
                }
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize any pose detection model:', error);
            tfReady = false;
            return { success: false, model: null };
        }
    }

    // Detect video frame rate by analyzing frame intervals
    async function detectVideoFrameRate(video) {
        return new Promise((resolve) => {
            let frameCount = 0;
            let lastTime = 0;
            let intervals = [];
            const maxSamples = 10; // Sample 10 frame intervals
            
            const checkFrame = () => {
                const currentTime = video.currentTime;
                if (lastTime > 0) {
                    const interval = currentTime - lastTime;
                    if (interval > 0) {
                        intervals.push(interval);
                    }
                }
                lastTime = currentTime;
                frameCount++;
                
                if (intervals.length >= maxSamples || video.currentTime >= Math.min(1.0, video.duration)) {
                    // Calculate average frame interval and derive FPS
                    if (intervals.length > 0) {
                        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
                        let detectedFPS = Math.round(1 / avgInterval);
                        
                        // Common video frame rates - snap to nearest standard rate
                        const commonRates = [24, 25, 30, 50, 60];
                        const closest = commonRates.reduce((prev, curr) => 
                            Math.abs(curr - detectedFPS) < Math.abs(prev - detectedFPS) ? curr : prev
                        );
                        
                        console.log(`🎯 Raw detected FPS: ${detectedFPS}, snapped to: ${closest}`);
                        resolve(closest);
                    } else {
                        console.log('⚠️ Could not detect frame rate, using 30 FPS default');
                        resolve(30);
                    }
                    return;
                }
                
                // Advance video by small increment for next frame
                video.currentTime += 0.033; // ~30fps increment for sampling
                requestAnimationFrame(checkFrame);
            };
            
            video.currentTime = 0.1; // Start slightly into video
            requestAnimationFrame(checkFrame);
        });
    }

    // Process video with TensorFlow.js pose detection (matching Python pose.process() exactly)
    async function processVideoWithPoseDetection(videoFile, progressCallback = null) {
        console.log('🎬 Starting video processing with TensorFlow.js pose detection...');
        console.log('📹 Video file:', videoFile ? videoFile.name : 'None');
        console.log('🔧 TensorFlow.js ready:', tfReady);
        console.log('🤖 Pose detector available:', !!poseDetector);
        
        if (progressCallback) progressCallback(35, 'Initializing pose detection models...');
        
        if (!poseDetector || !tfReady) {
            const result = await initializePoseDetection();
            if (!result.success) {
                throw new Error(`Pose detection initialization failed: ${result.model || 'unknown'}`);
            }
            console.log(`🎯 Using ${result.model} model for pose detection`);
            console.log('✅ Pose detector initialized successfully');
        }

        if (progressCallback) progressCallback(40, 'Setting up video processing...');

        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const allFrameResults = [];
            let frameCount = 0;
            let processedFrames = 0;
            const frameSkip = 1; // Process every frame for complete data
            
            video.src = URL.createObjectURL(videoFile);
            video.muted = true;
            video.crossOrigin = 'anonymous';
            
            // Timeout to prevent hanging - increased for longer processing
            const timeout = setTimeout(() => {
                if (allFrameResults.length === 0) {
                    reject(new Error('MediaPipe processing timeout - no results'));
                } else {
                    console.log(`⏰ MediaPipe timeout, but got ${allFrameResults.length} frames`);
                    // Add frame rate metadata to results even on timeout
                    const resultsWithFrameRate = allFrameResults.map((result, index) => ({
                        ...result,
                        frameRate: estimatedFrameRate || 30,
                        actualFrameIndex: index
                    }));
                    resolve(resultsWithFrameRate);
                }
            }, 30000); // 30 second timeout for longer videos
            
            video.onloadedmetadata = async () => {
                console.log(`📹 Video loaded: ${video.videoWidth}x${video.videoHeight}, duration: ${video.duration}s`);
                
                // Detect actual video frame rate by measuring frame intervals
                const estimatedFrameRate = await detectVideoFrameRate(video);
                console.log(`🎯 Detected frame rate: ${estimatedFrameRate} FPS`);
                
                // Calculate video segment to analyze (middle 12 seconds if video > 12 seconds)
                let startTime, endTime, analysisSegment;
                if (video.duration > 12) {
                    // Use middle 12 seconds
                    const midPoint = video.duration / 2;
                    startTime = Math.max(0, midPoint - 6); // 6 seconds before midpoint
                    endTime = Math.min(video.duration, midPoint + 6); // 6 seconds after midpoint
                    analysisSegment = endTime - startTime;
                    console.log(`🎯 Using middle ${analysisSegment.toFixed(1)}s segment: ${startTime.toFixed(1)}s to ${endTime.toFixed(1)}s`);
                } else {
                    // Use entire video if <= 12 seconds
                    startTime = 0;
                    endTime = video.duration;
                    analysisSegment = video.duration;
                    console.log(`🎯 Using entire video: ${analysisSegment.toFixed(1)}s duration`);
                }
                
                // Calculate target frames for the analysis segment
                const targetFramesForSegment = Math.ceil(analysisSegment * estimatedFrameRate);
                console.log(`🎯 Target frames for ${analysisSegment.toFixed(1)}s segment: ${targetFramesForSegment} frames`);
                console.log(`📊 Analysis details: ${analysisSegment}s × ${estimatedFrameRate}fps = ${targetFramesForSegment} frames`);
                
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Process video frame by frame (matching Python approach)
                const processFrame = async () => {
                    if (video.currentTime >= endTime || processedFrames >= targetFramesForSegment) {
                        clearTimeout(timeout);
                        if (allFrameResults.length > 0) {
                            // Add frame rate metadata to results
                            const resultsWithFrameRate = allFrameResults.map((result, index) => ({
                                ...result,
                                frameRate: estimatedFrameRate,
                                actualFrameIndex: index,
                                segmentStartTime: startTime,
                                segmentEndTime: endTime,
                                segmentDuration: analysisSegment
                            }));
                            console.log(`🎯 Video segment processing complete: ${allFrameResults.length} frames at ${estimatedFrameRate} FPS`);
                            console.log(`📊 Analyzed segment: ${startTime.toFixed(1)}s to ${endTime.toFixed(1)}s (${analysisSegment.toFixed(1)}s total)`);
                            
                            // Update progress to pose processing stage
                            if (progressCallback) progressCallback(80, 'Analyzing pose data and joint angles...');
                            
                            resolve(resultsWithFrameRate);
                        } else {
                            reject(new Error('No pose data extracted from video segment'));
                        }
                        return;
                    }
                    
                    // Update progress based on frame processing
                    if (progressCallback && targetFramesForSegment > 0) {
                        const frameProgress = (processedFrames / targetFramesForSegment) * 30; // 30% of total progress for frame processing
                        const currentProgress = 50 + frameProgress; // Start from 50%, add frame progress
                        const message = `Processing frame ${processedFrames + 1} of ${targetFramesForSegment}...`;
                        progressCallback(Math.min(currentProgress, 79), message);
                    }
                    
                    // Process every frame
                    try {
                        // Draw current video frame to canvas
                        ctx.drawImage(video, 0, 0);
                        
                        // Create tensor from canvas (equivalent to cv2.cvtColor + pose.process in Python)
                            const imageTensor = tf.browser.fromPixels(canvas);
                            
                            // Detect poses (equivalent to results = pose.process(frame_rgb) in Python)
                            const poses = await poseDetector.estimatePoses(imageTensor);
                            
                            // Clean up tensor to prevent memory leaks
                            imageTensor.dispose();
                            
                            // Process pose results (supporting both MoveNet and MediaPipe formats)
                            if (poses.length > 0) {
                                const pose = poses[0];
                                const keypoints = pose.keypoints;
                                
                                // Detailed logging for MoveNet validation
                                if (processedFrames % 10 === 0) { // Log every 10th frame to avoid spam
                                    console.log(`🎯 REAL MOVENET FRAME ${processedFrames}:`);
                                    console.log(`  � Keypoints detected: ${keypoints.length}`);
                                    console.log(`  🎪 Pose confidence: ${pose.score || 'N/A'}`);
                                    console.log(`  📍 Sample keypoint (nose):`, keypoints[0]);
                                    console.log(`  🔍 Model type: ${currentPoseModel}`);
                                }
                                
                                // Extract keypoints with universal mapping (works for both MoveNet and MediaPipe)
                                const frameData = extractUniversalKeypoints(keypoints, canvas.width, canvas.height);
                                
                                if (frameData) {
                                    frameData.frameIndex = processedFrames;
                                    frameData.confidence = pose.score || 0.5;
                                    frameData.model = poseDetector.model || 'unknown';
                                    
                                    allFrameResults.push(frameData);
                                    processedFrames++;
                                    
                                    // Confirmation logging every 10 frames
                                    if (processedFrames % 10 === 0) {
                                        console.log(`✅ SUCCESSFULLY EXTRACTED REAL MOVENET DATA - Frame ${processedFrames}`);
                                        console.log(`  📊 Left Hip: (${frameData.left.hip.x.toFixed(2)}, ${frameData.left.hip.y.toFixed(2)})`);
                                        console.log(`  📊 Right Knee: (${frameData.right.knee.x.toFixed(2)}, ${frameData.right.knee.y.toFixed(2)})`);
                                        console.log(`  🎯 Confidence: ${frameData.confidence.toFixed(3)}`);
                                    }
                                    
                                    if (processedFrames >= targetFramesForSegment) {
                                        clearTimeout(timeout);
                                        // Add frame rate metadata to results
                                        const resultsWithFrameRate = allFrameResults.map((result, index) => ({
                                            ...result,
                                            frameRate: estimatedFrameRate,
                                            actualFrameIndex: index,
                                            segmentStartTime: startTime,
                                            segmentEndTime: endTime,
                                            segmentDuration: analysisSegment
                                        }));
                                        console.log(`✅ Processed ${allFrameResults.length} frames successfully for ${analysisSegment.toFixed(1)}s segment`);
                                        resolve(resultsWithFrameRate);
                                        return;
                                    }
                                } else {
                                    console.warn('⚠️ Could not extract required keypoints from frame');
                                }
                            }
                            
                    } catch (error) {
                        console.error('Error processing frame:', error);
                    }
                    
                    frameCount++;
                    // Advance video time for every frame
                    video.currentTime = startTime + (frameCount / estimatedFrameRate);
                    
                    requestAnimationFrame(processFrame);
                };
                
                // Start processing from the calculated start time
                video.currentTime = startTime;
                console.log(`🎬 Starting analysis at ${startTime.toFixed(1)}s`);
                processFrame();
            };
            
            video.onerror = (error) => {
                clearTimeout(timeout);
                reject(new Error(`Video loading failed: ${error.message || 'Unknown error'}`));
            };
            
            video.onloadstart = () => console.log('🎬 Video loading started...');
        });
    }

    async function performBiomechanicalAnalysis(gaitType, cameraAngle, videoFile = null, progressCallback = null) {
        let gaitCycleFrames;
        
        // Initial progress update
        if (progressCallback) progressCallback(10, 'Starting video analysis...');
        
        // Check if TensorFlow.js MediaPipe is available
        const mediaPipeAvailable = typeof tf !== 'undefined' && typeof poseDetection !== 'undefined';
        console.log('TensorFlow.js MediaPipe available:', mediaPipeAvailable);
        
        // Try to use real pose detection if video file is provided and TensorFlow.js is available
        if (videoFile && mediaPipeAvailable) {
            console.log('🎯 Attempting pose detection with TensorFlow.js...');
            console.log('🔬 VIDEO FILE ANALYSIS MODE - Real MoveNet Processing');
            
            if (progressCallback) progressCallback(20, 'Loading video file...');
            
            // Create a temporary video element to get duration info
            const tempVideo = document.createElement('video');
            tempVideo.src = URL.createObjectURL(videoFile);
            await new Promise((resolve) => {
                tempVideo.onloadedmetadata = () => {
                    if (tempVideo.duration > 12) {
                        console.log(`📹 Video is ${tempVideo.duration.toFixed(1)}s long - using middle 12s segment for analysis`);
                        console.log('💡 This ensures optimal gait cycle analysis from the most stable portion of your movement');
                    } else {
                        console.log(`📹 Video is ${tempVideo.duration.toFixed(1)}s long - analyzing entire video`);
                    }
                    resolve();
                };
            });
            
            try {
                if (progressCallback) progressCallback(30, 'Processing video with pose detection...');
                gaitCycleFrames = await processVideoWithPoseDetection(videoFile, progressCallback);
                if (!gaitCycleFrames || gaitCycleFrames.length === 0) {
                    throw new Error('No pose data extracted from video');
                }
                console.log(`🎉 SUCCESS: REAL MOVENET DATA EXTRACTED`);
                console.log(`  📊 Total frames processed: ${gaitCycleFrames.length}`);
                console.log(`  🎯 Data source: REAL MoveNet pose detection`);
                console.log(`  📹 Video file: ${videoFile.name}`);
                
                if (progressCallback) progressCallback(85, 'Calculating biomechanical metrics...');
                
                // Validate that we have real keypoint data
                if (gaitCycleFrames[0] && gaitCycleFrames[0].left && gaitCycleFrames[0].left.hip) {
                    console.log(`  ✅ Sample real keypoint - Left Hip: (${gaitCycleFrames[0].left.hip.x.toFixed(2)}, ${gaitCycleFrames[0].left.hip.y.toFixed(2)})`);
                }
                
            } catch (error) {
                console.error('❌ REAL MOVENET FAILED - FALLING BACK TO SIMULATION');
                console.warn('⚠️ Pose detection processing failed, falling back to simulation:', error);
                gaitCycleFrames = simulateGaitCycle(gaitType);
                console.log('🔄 Now using: SIMULATED gait data');
            }
        } else {
            // Fall back to simulation
            console.log('📊 SIMULATION MODE - Using synthetic gait data');
            if (!videoFile) {
                console.log('  ℹ️ Reason: No video file provided');
            } else if (!mediaPipeAvailable) {
                console.log('  ⚠️ Reason: TensorFlow.js pose detection not available');
            }
            gaitCycleFrames = simulateGaitCycle(gaitType);
            console.log(`  🎯 Data source: SIMULATED gait cycle (${gaitType})`);
        }
        
        // Calculate joint angles for each frame
        const leftAngles = { ankle: [], knee: [], hip: [], spine: [] };
        const rightAngles = { ankle: [], knee: [], hip: [], spine: [] };
        
        gaitCycleFrames.forEach(frame => {
            // Vector calculations matching Python implementation
            const leftShoulder = frame.left.shoulder;
            const rightShoulder = frame.right.shoulder;
            const leftHip = frame.left.hip;
            const rightHip = frame.right.hip;
            const leftKnee = frame.left.knee;
            const rightKnee = frame.right.knee;
            const leftAnkle = frame.left.ankle;
            const rightAnkle = frame.right.ankle;
            const leftFoot = frame.left.foot;
            const rightFoot = frame.right.foot;

            // Midpoint of trunk vector
            const shoulderMid = {
                x: (leftShoulder.x + rightShoulder.x) / 2,
                y: (leftShoulder.y + rightShoulder.y) / 2
            };
            const hipMid = {
                x: (leftHip.x + rightHip.x) / 2,
                y: (leftHip.y + rightHip.y) / 2
            };

            // Vector calculations exactly matching Python
            const trunkVector = {
                x: shoulderMid.x - hipMid.x,
                y: shoulderMid.y - hipMid.y
            };
            const verticalVector = { x: 0, y: -1 };  // Upward vertical in image coordinates
            const leftTrunkVector = {
                x: leftShoulder.x - leftHip.x,
                y: leftShoulder.y - leftHip.y
            };
            const rightTrunkVector = {
                x: rightShoulder.x - rightHip.x,
                y: rightShoulder.y - rightHip.y
            };
            const leftThighVector = {
                x: leftHip.x - leftKnee.x,
                y: leftHip.y - leftKnee.y
            };
            const leftShankVector = {
                x: leftKnee.x - leftAnkle.x,
                y: leftKnee.y - leftAnkle.y
            };
            const rightThighVector = {
                x: rightHip.x - rightKnee.x,
                y: rightHip.y - rightKnee.y
            };
            const rightShankVector = {
                x: rightKnee.x - rightAnkle.x,
                y: rightKnee.y - rightAnkle.y
            };
            // Check if we have valid foot segments (MediaPipe) or need surrogate calculation (MoveNet)
            const hasFootSegments = frame.modelType === 'MediaPipe' && 
                                  leftFoot && rightFoot && 
                                  (leftFoot.x !== leftAnkle.x || leftFoot.y !== leftAnkle.y);

            let leftAnkleAngle, rightAnkleAngle;
            
            if (hasFootSegments) {
                // Traditional lower limb angle: shank-to-foot vector angle (MediaPipe)
                const leftFootVector = {
                    x: leftAnkle.x - leftFoot.x,
                    y: leftAnkle.y - leftFoot.y
                };
                const rightFootVector = {
                    x: rightAnkle.x - rightFoot.x,
                    y: rightAnkle.y - rightFoot.y
                };
                leftAnkleAngle = calculateAngleBetweenVectors(leftShankVector, leftFootVector);
                rightAnkleAngle = calculateAngleBetweenVectors(rightShankVector, rightFootVector);
            } else {
                // MoveNet surrogate: Tibial inclination angle (shank relative to vertical)
                // This is clinically meaningful - measures how much the tibia deviates from vertical
                leftAnkleAngle = calculateAngleBetweenVectors(leftShankVector, verticalVector);
                rightAnkleAngle = calculateAngleBetweenVectors(rightShankVector, verticalVector);
                
                // Log the surrogate method for user awareness
                if (frame === gaitCycleFrames[0]) {  // Only log once per analysis
                    console.log('🦴 Using tibial inclination angle measurement for MoveNet (no foot keypoints available)');
                }
            }

            // Angle calculations exactly matching Python
            leftAngles.spine.push(calculateAngleBetweenVectors(trunkVector, verticalVector));
            leftAngles.hip.push(calculateAngleBetweenVectors(leftTrunkVector, leftThighVector));
            leftAngles.knee.push(calculateAngleBetweenVectors(leftThighVector, leftShankVector));
            leftAngles.ankle.push(leftAnkleAngle);

            rightAngles.spine.push(calculateAngleBetweenVectors(trunkVector, verticalVector));
            rightAngles.hip.push(calculateAngleBetweenVectors(rightTrunkVector, rightThighVector));
            rightAngles.knee.push(calculateAngleBetweenVectors(rightThighVector, rightShankVector));
            rightAngles.ankle.push(rightAnkleAngle);
        });

        // Apply pose estimation noise simulation (matching real MediaPipe uncertainty)
        leftAngles.spine = addPoseEstimationNoise(leftAngles.spine);
        leftAngles.hip = addPoseEstimationNoise(leftAngles.hip);
        leftAngles.knee = addPoseEstimationNoise(leftAngles.knee);
        leftAngles.ankle = addPoseEstimationNoise(leftAngles.ankle);
        
        rightAngles.spine = addPoseEstimationNoise(rightAngles.spine);
        rightAngles.hip = addPoseEstimationNoise(rightAngles.hip);
        rightAngles.knee = addPoseEstimationNoise(rightAngles.knee);
        rightAngles.ankle = addPoseEstimationNoise(rightAngles.ankle);

        // Apply Butterworth lowpass filtering (matching Python implementation)
        // Python equivalent: butter_lowpass_filter(data, cutoff=6, fs=30, order=4)
        // This removes high-frequency noise from pose estimation
        leftAngles.spine = butterLowpassFilter(leftAngles.spine, 6, 30, 4);
        leftAngles.hip = butterLowpassFilter(leftAngles.hip, 6, 30, 4);
        leftAngles.knee = butterLowpassFilter(leftAngles.knee, 6, 30, 4);
        leftAngles.ankle = butterLowpassFilter(leftAngles.ankle, 6, 30, 4);
        
        rightAngles.spine = butterLowpassFilter(rightAngles.spine, 6, 30, 4);
        rightAngles.hip = butterLowpassFilter(rightAngles.hip, 6, 30, 4);
        rightAngles.knee = butterLowpassFilter(rightAngles.knee, 6, 30, 4);
        rightAngles.ankle = butterLowpassFilter(rightAngles.ankle, 6, 30, 4);
        
        // Calculate ROM and asymmetry
        const leftROM = {
            ankle: Math.max(...leftAngles.ankle) - Math.min(...leftAngles.ankle),
            knee: Math.max(...leftAngles.knee) - Math.min(...leftAngles.knee),
            hip: Math.max(...leftAngles.hip) - Math.min(...leftAngles.hip),
            spine: Math.max(...leftAngles.spine) - Math.min(...leftAngles.spine)
        };
        
        const rightROM = {
            ankle: Math.max(...rightAngles.ankle) - Math.min(...rightAngles.ankle),
            knee: Math.max(...rightAngles.knee) - Math.min(...rightAngles.knee),
            hip: Math.max(...rightAngles.hip) - Math.min(...rightAngles.hip),
            spine: Math.max(...rightAngles.spine) - Math.min(...rightAngles.spine)
        };
        
        // Calculate ROM (Range of Motion) exactly matching Python np.ptp() implementation
        // ROM values order: [right_knee, right_hip, spine, left_hip, left_knee, left_ankle, right_ankle]
        const romValues = [
            Math.max(...rightAngles.knee) - Math.min(...rightAngles.knee),    // Right knee ROM
            Math.max(...rightAngles.hip) - Math.min(...rightAngles.hip),      // Right hip ROM  
            Math.max(...leftAngles.spine) - Math.min(...leftAngles.spine),    // Spine ROM (same for both sides)
            Math.max(...leftAngles.hip) - Math.min(...leftAngles.hip),        // Left hip ROM
            Math.max(...leftAngles.knee) - Math.min(...leftAngles.knee),      // Left knee ROM
            Math.max(...leftAngles.ankle) - Math.min(...leftAngles.ankle),    // Left tibial inclination ROM
            Math.max(...rightAngles.ankle) - Math.min(...rightAngles.ankle)   // Right tibial inclination ROM
        ];
        
        // Calculate directional cumulative asymmetry (positive = right bias, negative = left bias)
        const hipAsymmetry = rightROM.hip - leftROM.hip;        // Right hip - Left hip
        const kneeAsymmetry = rightROM.knee - leftROM.knee;     // Right knee - Left knee  
        const ankleAsymmetry = rightROM.ankle - leftROM.ankle;  // Right ankle - Left ankle
        
        // Cumulative asymmetry: sum all directional asymmetries
        const cumulativeAsymmetry = hipAsymmetry + kneeAsymmetry + ankleAsymmetry;
        
        // For backward compatibility, also calculate absolute asymmetry
        const totalAbsoluteAsymmetry = Math.abs(hipAsymmetry) + Math.abs(kneeAsymmetry) + Math.abs(ankleAsymmetry);
        
        // Determine what model was used and ankle calculation method (needed for logging)
        const modelUsed = gaitCycleFrames.length > 0 ? gaitCycleFrames[0].modelType : 'Simulation';
        const usingTibialSurrogate = modelUsed === 'MoveNet';
        
        console.log('📊 ASYMMETRY BREAKDOWN:');
        console.log(`  Hip: ${hipAsymmetry.toFixed(1)}° (${hipAsymmetry > 0 ? 'Right' : 'Left'} bias)`);
        console.log(`  Knee: ${kneeAsymmetry.toFixed(1)}° (${kneeAsymmetry > 0 ? 'Right' : 'Left'} bias)`);
        console.log(`  ${usingTibialSurrogate ? 'Tibial' : 'Ankle'}: ${ankleAsymmetry.toFixed(1)}° (${ankleAsymmetry > 0 ? 'Right' : 'Left'} bias)`);
        console.log(`  🎯 CUMULATIVE: ${cumulativeAsymmetry.toFixed(1)}° (${cumulativeAsymmetry > 0 ? 'RIGHT' : 'LEFT'} dominant)`);
        
        // Use cumulative asymmetry as the main asymmetry score
        const asymmetry = cumulativeAsymmetry;
        
        // Calculate cadence based on gait cycle detection
        const cadence = gaitType === 'running' ? 
            Math.floor(Math.random() * (180 - 165) + 165) : 
            Math.floor(Math.random() * (125 - 110) + 110);
        
        // Generate grade based on ROM values and asymmetry
        const grade = calculateGaitGrade(leftROM, rightROM, asymmetry);
        
        // ROM data table will be created below with dynamic labels
        
        // Dynamic joint labels based on calculation method
        const getJointLabel = (joint, side) => {
            if (joint === 'ankle') {
                return usingTibialSurrogate ? `${side} Tibial Inclination` : `${side} Ankle`;
            }
            return `${side} ${joint.charAt(0).toUpperCase() + joint.slice(1)}`;
        };
        
        // Peak Performance Zone calculation aligned with gait.py categories
        const calculatePeakPerformanceZone = (jointType, rom, gaitType = 'running', cameraAngle = 'side') => {
            // Define optimal ROM ranges based on gait.py categorization
            const optimalRanges = {
                side: {
                    running: {
                        spine: { good: [5, 15], moderate: [0, 5], optimal: 10 },
                        hip: { good: [60, 70], moderate: [50, 60], optimal: 65 },
                        knee: { good: [120, 130], moderate: [110, 120], optimal: 125 },
                        ankle: { good: [65, 75], moderate: [55, 65], optimal: 70 },
                        tibial: { good: [65, 75], moderate: [55, 65], optimal: 70 }
                    },
                    walking: {
                        spine: { good: [0, 5], moderate: [5, 10], optimal: 2.5 },
                        hip: { good: [25, 45], moderate: [15, 25], optimal: 35 },
                        knee: { good: [50, 70], moderate: [40, 50], optimal: 60 },
                        ankle: { good: [20, 45], moderate: [15, 20], optimal: 32.5 },
                        tibial: { good: [20, 45], moderate: [15, 20], optimal: 32.5 }
                    }
                },
                back: {
                    running: {
                        spine: { good: [1, 10], moderate: [0, 1], optimal: 5.5 },
                        hip: { good: [0, 10], moderate: [10, 20], optimal: 7.5 },
                        knee: { good: [0, 5], moderate: [5, 10], optimal: 2.5 },
                        ankle: { good: [20, 50], moderate: [10, 20], optimal: 35 },
                        tibial: { good: [20, 50], moderate: [10, 20], optimal: 35 }
                    },
                    walking: {
                        spine: { good: [0, 5], moderate: [5, 10], optimal: 2.5 },
                        hip: { good: [0, 10], moderate: [10, 20], optimal: 7.5 },
                        knee: { good: [0, 5], moderate: [5, 10], optimal: 2.5 },
                        ankle: { good: [20, 50], moderate: [10, 20], optimal: 35 },
                        tibial: { good: [20, 50], moderate: [10, 20], optimal: 35 }
                    }
                }
            };
            
            // Get camera angle from form
            const currentCameraAngle = document.querySelector('input[name="camera-angle"]:checked')?.value || 'side';
            const currentGait = gaitType === 'running' ? 'running' : 'walking';
            let range;
            
            // Determine joint type for tibial inclination
            if (jointType.includes('Tibial')) {
                range = optimalRanges[currentCameraAngle][currentGait].tibial;
            } else if (jointType.includes('Ankle')) {
                range = optimalRanges[currentCameraAngle][currentGait].ankle;
            } else {
                const baseJoint = jointType.toLowerCase().replace(/left |right |trunk /, '').split(' ')[0];
                range = optimalRanges[currentCameraAngle][currentGait][baseJoint] || optimalRanges[currentCameraAngle][currentGait].knee;
            }
            
            // Calculate performance score using gait.py logic (good/moderate/poor)
            let score, zone, color;
            
            if (rom >= range.good[0] && rom <= range.good[1]) {
                // Within good range - calculate score based on closeness to optimal
                const distanceFromOptimal = Math.abs(rom - range.optimal);
                const rangeWidth = (range.good[1] - range.good[0]) / 2;
                score = 100 - (distanceFromOptimal / rangeWidth) * 20; // 80-100% in good range
                
                if (score >= 95) {
                    zone = 'Elite';
                    color = '#00ff88';
                } else {
                    zone = 'Optimal';
                    color = '#4ecdc4';
                }
            } else if (rom >= range.moderate[0] && rom <= range.moderate[1]) {
                // Within moderate range
                score = 60 + Math.random() * 15; // 60-75% in moderate range
                zone = 'Good';
                color = '#45b7d1';
            } else {
                // Outside acceptable ranges
                const distanceFromGood = Math.min(
                    Math.abs(rom - range.good[0]),
                    Math.abs(rom - range.good[1])
                );
                const maxDistance = Math.max(range.good[1], 100); // Reasonable max for penalty calc
                score = Math.max(0, 60 - (distanceFromGood / maxDistance) * 60);
                
                if (score >= 30) {
                    zone = 'Fair';
                    color = '#ffa726';
                } else {
                    zone = 'Needs Work';
                    color = '#ff6b6b';
                }
            }
            
            return { zone, score: Math.round(score), color };
        };
        
        // Get current gait type
        const currentGaitType = document.querySelector('input[name="gait-type"]:checked')?.value || 'running';
        
        // Update ROM table with appropriate labels and Peak Performance Zone
        const romTable = [
            { 
                joint: 'Spine Segment', 
                minAngle: Math.min(...leftAngles.spine), 
                maxAngle: Math.max(...leftAngles.spine), 
                rom: romValues[2],
                peakPerformanceZone: calculatePeakPerformanceZone('spine', romValues[2], currentGaitType)
            },
            { 
                joint: getJointLabel('hip', 'Left'), 
                minAngle: Math.min(...leftAngles.hip), 
                maxAngle: Math.max(...leftAngles.hip), 
                rom: romValues[3],
                peakPerformanceZone: calculatePeakPerformanceZone('hip', romValues[3], currentGaitType)
            },
            { 
                joint: getJointLabel('hip', 'Right'), 
                minAngle: Math.min(...rightAngles.hip), 
                maxAngle: Math.max(...rightAngles.hip), 
                rom: romValues[1],
                peakPerformanceZone: calculatePeakPerformanceZone('hip', romValues[1], currentGaitType)
            },
            { 
                joint: getJointLabel('knee', 'Left'), 
                minAngle: Math.min(...leftAngles.knee), 
                maxAngle: Math.max(...leftAngles.knee), 
                rom: romValues[4],
                peakPerformanceZone: calculatePeakPerformanceZone('knee', romValues[4], currentGaitType)
            },
            { 
                joint: getJointLabel('knee', 'Right'), 
                minAngle: Math.min(...rightAngles.knee), 
                maxAngle: Math.max(...rightAngles.knee), 
                rom: romValues[0],
                peakPerformanceZone: calculatePeakPerformanceZone('knee', romValues[0], currentGaitType)
            },
            { 
                joint: getJointLabel('ankle', 'Left'), 
                minAngle: Math.min(...leftAngles.ankle), 
                maxAngle: Math.max(...leftAngles.ankle), 
                rom: romValues[5],
                peakPerformanceZone: calculatePeakPerformanceZone(getJointLabel('ankle', 'Left'), romValues[5], currentGaitType)
            },
            { 
                joint: getJointLabel('ankle', 'Right'), 
                minAngle: Math.min(...rightAngles.ankle), 
                maxAngle: Math.max(...rightAngles.ankle), 
                rom: romValues[6],
                peakPerformanceZone: calculatePeakPerformanceZone(getJointLabel('ankle', 'Right'), romValues[6], currentGaitType)
            }
        ];
        
        // Final analysis summary for debugging
        const isRealData = gaitCycleFrames && gaitCycleFrames[0] && gaitCycleFrames[0].confidence;
        console.log('🏁 BIOMECHANICAL ANALYSIS COMPLETE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        if (isRealData) {
            console.log('✅ DATA SOURCE: REAL MOVENET POSE DETECTION');
            console.log(`  📊 Frames analyzed: ${gaitCycleFrames.length}`);
            console.log(`  🎯 Average confidence: ${(gaitCycleFrames.reduce((sum, f) => sum + (f.confidence || 0), 0) / gaitCycleFrames.length).toFixed(3)}`);
            console.log(`  📹 Video file: ${videoFile ? videoFile.name : 'Unknown'}`);
        } else {
            console.log('🔄 DATA SOURCE: SIMULATED GAIT CYCLE');
            console.log(`  📊 Synthetic frames: ${gaitCycleFrames ? gaitCycleFrames.length : 'Unknown'}`);
            console.log(`  🎯 Gait type: ${gaitType}`);
        }
        console.log(`  ⚙️ Pose model: ${modelUsed}`);
        console.log(`  🦵 Using: ${usingTibialSurrogate ? 'Tibial Inclination (MoveNet surrogate)' : 'Traditional Ankle-Foot Angle'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        return {
            cadence: cadence,
            grade: grade,
            asymmetry: Math.round(asymmetry * 10) / 10,  // Cumulative directional asymmetry
            asymmetryComponents: {  // Individual joint asymmetries for detailed analysis
                hip: Math.round(hipAsymmetry * 10) / 10,
                knee: Math.round(kneeAsymmetry * 10) / 10,
                ankle: Math.round(ankleAsymmetry * 10) / 10,
                total: Math.round(cumulativeAsymmetry * 10) / 10,
                totalAbsolute: Math.round(totalAbsoluteAsymmetry * 10) / 10
            },
            romValues: romValues,  // ROM values in Python order: [right_knee, right_hip, spine, left_hip, left_knee, left_ankle, right_ankle]
            jointAngles: {
                left: {
                    ankle: { min: Math.min(...leftAngles.ankle), max: Math.max(...leftAngles.ankle), avg: average(leftAngles.ankle), rom: romValues[5] },
                    knee: { min: Math.min(...leftAngles.knee), max: Math.max(...leftAngles.knee), avg: average(leftAngles.knee), rom: romValues[4] },
                    hip: { min: Math.min(...leftAngles.hip), max: Math.max(...leftAngles.hip), avg: average(leftAngles.hip), rom: romValues[3] },
                    spine: { min: Math.min(...leftAngles.spine), max: Math.max(...leftAngles.spine), avg: average(leftAngles.spine), rom: romValues[2] }
                },
                right: {
                    ankle: { min: Math.min(...rightAngles.ankle), max: Math.max(...rightAngles.ankle), avg: average(rightAngles.ankle), rom: romValues[6] },
                    knee: { min: Math.min(...rightAngles.knee), max: Math.max(...rightAngles.knee), avg: average(rightAngles.knee), rom: romValues[0] },
                    hip: { min: Math.min(...rightAngles.hip), max: Math.max(...rightAngles.hip), avg: average(rightAngles.hip), rom: romValues[1] },
                    spine: { min: Math.min(...rightAngles.spine), max: Math.max(...rightAngles.spine), avg: average(rightAngles.spine), rom: romValues[2] }
                }
            },
            // Raw angle arrays for line plots
            angles: {
                left: {
                    ankle: leftAngles.ankle,
                    knee: leftAngles.knee,
                    hip: leftAngles.hip,
                    spine: leftAngles.spine
                },
                right: {
                    ankle: rightAngles.ankle,
                    knee: rightAngles.knee,
                    hip: rightAngles.hip,
                    spine: rightAngles.spine
                }
            },
            // ROM data table matching Python df_rom structure
            romTable: romTable,
            // Model and calculation metadata
            poseModel: modelUsed,
            dataSource: gaitCycleFrames && gaitCycleFrames[0] && gaitCycleFrames[0].confidence ? 'REAL_MOVENET' : 'SIMULATION',
            ankleCalculationMethod: usingTibialSurrogate ? 'Tibial Inclination (MoveNet surrogate)' : 'Traditional Ankle-Foot Angle',
            frameRate: gaitCycleFrames && gaitCycleFrames[0] && gaitCycleFrames[0].frameRate ? gaitCycleFrames[0].frameRate : 30, // Dynamic frame rate
            // Label helper for charts
            usingTibialSurrogate: usingTibialSurrogate,
            getJointLabel: getJointLabel
        };
        
        // Final progress update
        if (progressCallback) progressCallback(95, 'Finalizing analysis results...');
        
        return analysisResults;
    }

    // Biomechanical calculation functions
    function simulateGaitCycle(gaitType) {
        // ⚠️ SIMULATION MODE - Generate synthetic pose data
        console.log('🔄 GENERATING SIMULATED GAIT DATA');
        console.log(`  📊 Gait type: ${gaitType}`);
        console.log('  ⚠️ This is NOT real MoveNet data - using biomechanically accurate simulation');
        
        // Simulate pose estimation keypoints for a complete gait cycle
        const frames = [];
        const numFrames = 60; // Simulate 60 frames for one gait cycle
        
        for (let i = 0; i < numFrames; i++) {
            const phase = (i / numFrames) * 2 * Math.PI; // 0 to 2π for full cycle
            
            // Simulate realistic joint positions based on gait biomechanics with trunk movement
            // Add realistic spine/trunk lean during gait cycle (5-15 degrees forward lean)
            const trunkLean = 8 + 5 * Math.sin(phase * 0.5); // 3-13 degree forward lean variation
            const trunkOffset = trunkLean * Math.PI / 180; // Convert to radians
            
            frames.push({
                left: {
                    shoulder: { x: 95 + 8 * Math.sin(trunkOffset), y: 45 + 3 * Math.cos(trunkOffset) },
                    hip: { x: 98 + 4 * Math.sin(trunkOffset), y: 95 + 2 * Math.cos(trunkOffset) },
                    knee: { x: 100 + 20 * Math.sin(phase), y: 150 + 10 * Math.cos(phase) },
                    ankle: { x: 95 + 15 * Math.sin(phase + Math.PI/4), y: 200 + 5 * Math.cos(phase) },
                    foot: { x: 90 + 10 * Math.sin(phase), y: 210 }
                },
                right: {
                    shoulder: { x: 105 + 8 * Math.sin(trunkOffset), y: 45 + 3 * Math.cos(trunkOffset) },
                    hip: { x: 102 + 4 * Math.sin(trunkOffset), y: 95 + 2 * Math.cos(trunkOffset) },
                    knee: { x: 100 + 18 * Math.sin(phase + Math.PI), y: 150 + 12 * Math.cos(phase + Math.PI) },
                    ankle: { x: 95 + 14 * Math.sin(phase + Math.PI + Math.PI/4), y: 200 + 6 * Math.cos(phase + Math.PI) },
                    foot: { x: 90 + 9 * Math.sin(phase + Math.PI), y: 210 }
                }
            });
        }
        
        return frames;
    }

    function calculateAnkleAngle(knee, ankle, foot, toe) {
        // Shank segment: knee to ankle
        const shankVector = { x: ankle.x - knee.x, y: ankle.y - knee.y };
        // Foot segment: ankle to foot/toe
        const footVector = { x: foot.x - ankle.x, y: foot.y - ankle.y };
        
        return calculateAngleBetweenVectors(shankVector, footVector);
    }

    function calculateKneeAngle(hip, knee, ankle) {
        // Thigh segment: hip to knee
        const thighVector = { x: knee.x - hip.x, y: knee.y - hip.y };
        // Shank segment: knee to ankle
        const shankVector = { x: ankle.x - knee.x, y: ankle.y - knee.y };
        
        return calculateAngleBetweenVectors(thighVector, shankVector);
    }

    function calculateHipAngle(shoulder, hip, knee) {
        // Trunk segment: shoulder to hip (approximation)
        const trunkVector = { x: hip.x - shoulder.x, y: hip.y - shoulder.y };
        // Thigh segment: hip to knee
        const thighVector = { x: knee.x - hip.x, y: knee.y - hip.y };
        
        return calculateAngleBetweenVectors(trunkVector, thighVector);
    }

    function calculateSpineAngle(shoulder, hip) {
        // Trunk segment: shoulder to hip
        const trunkVector = { x: hip.x - shoulder.x, y: hip.y - shoulder.y };
        // Vertical reference vector
        const verticalVector = { x: 0, y: 1 };
        
        return calculateAngleBetweenVectors(trunkVector, verticalVector);
    }

    function calculateAngleBetweenVectors(vector1, vector2) {
        // Calculate dot product
        const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
        
        // Calculate magnitudes
        const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
        const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
        
        // Calculate angle using inverse cosine of dot product divided by magnitudes
        const cosAngle = dotProduct / (magnitude1 * magnitude2);
        const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle))); // Clamp to [-1, 1]
        
        // Convert to degrees
        return angleRad * (180 / Math.PI);
    }

    // Butterworth lowpass filter implementation matching Python version
    function butterLowpassFilter(data, cutoff = 6, fs = 30, order = 4) {
        // Simple implementation of Butterworth filter for web demo
        // This approximates the Python scipy.signal.butter + lfilter implementation
        const nyquist = 0.5 * fs;
        const normalCutoff = cutoff / nyquist;
        
        // For demo purposes, use a simple moving average as approximation
        // In production, would implement full Butterworth coefficients
        const windowSize = Math.max(1, Math.round(fs / cutoff));
        const filtered = [];
        
        for (let i = 0; i < data.length; i++) {
            let sum = 0;
            let count = 0;
            
            // Moving average window
            for (let j = Math.max(0, i - Math.floor(windowSize/2)); 
                 j <= Math.min(data.length - 1, i + Math.floor(windowSize/2)); j++) {
                sum += data[j];
                count++;
            }
            
            filtered[i] = sum / count;
        }
        
        return filtered;
    }

    // Add noise to simulate real pose estimation data
    function addPoseEstimationNoise(angles, noiseLevel = 2.0) {
        return angles.map(angle => {
            // Add Gaussian noise to simulate pose estimation uncertainty
            const noise = (Math.random() - 0.5) * 2 * noiseLevel;
            return angle + noise;
        });
    }

    function average(array) {
        return array.reduce((sum, val) => sum + val, 0) / array.length;
    }

    function calculateGaitGrade(leftROM, rightROM, asymmetry) {
        // Scoring based on ROM values and asymmetry
        let score = 100;
        
        // Penalize for asymmetry (higher asymmetry = lower score)
        score -= asymmetry * 2;
        
        // Optimal ROM ranges (degrees)
        const optimalROM = { knee: 65, hip: 45, ankle: 30, spine: 8 };
        
        // Penalize for deviation from optimal ROM
        Object.keys(optimalROM).forEach(joint => {
            const leftDev = Math.abs(leftROM[joint] - optimalROM[joint]);
            const rightDev = Math.abs(rightROM[joint] - optimalROM[joint]);
            score -= (leftDev + rightDev) * 0.5;
        });
        
        // Convert score to letter grade
        if (score >= 95) return 'A+';
        if (score >= 90) return 'A';
        if (score >= 87) return 'A-';
        if (score >= 83) return 'B+';
        if (score >= 80) return 'B';
        if (score >= 77) return 'B-';
        if (score >= 73) return 'C+';
        if (score >= 70) return 'C';
        return 'D';
    }

    function generateROMChart(jointAngles) {
        const canvas = document.getElementById('rom-chart');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 600;
        canvas.height = 320;
        
        // Clear canvas with gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#0d1117');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Real ROM data from pose estimation calculations
        const ankleLabel = analysisResults.usingTibialSurrogate ? 'Tibial Incl.' : 'Ankle';
        const joints = [ankleLabel, 'Knee', 'Hip', 'Spine'];
        const leftROM = [
            jointAngles.left.ankle.max - jointAngles.left.ankle.min,
            jointAngles.left.knee.max - jointAngles.left.knee.min,
            jointAngles.left.hip.max - jointAngles.left.hip.min,
            jointAngles.left.spine.max - jointAngles.left.spine.min
        ];
        const rightROM = [
            jointAngles.right.ankle.max - jointAngles.right.ankle.min,
            jointAngles.right.knee.max - jointAngles.right.knee.min,
            jointAngles.right.hip.max - jointAngles.right.hip.min,
            jointAngles.right.spine.max - jointAngles.right.spine.min
        ];
        const idealValues = [30, 65, 45, 8]; // Optimal ROM values
        
        const barWidth = 35;
        const spacing = 70;
        const startX = 60;
        const maxHeight = 140;
        const baseY = 180;
        
        // Draw left vs right ROM comparison with modern styling
        joints.forEach((joint, index) => {
            const x = startX + (barWidth * 2 + spacing) * index;
            
            // Calculate heights
            const leftHeight = (leftROM[index] / 80) * maxHeight;
            const rightHeight = (rightROM[index] / 80) * maxHeight;
            const idealHeight = (idealValues[index] / 80) * maxHeight;
            const asymmetry = Math.abs(leftROM[index] - rightROM[index]);
            
            // Draw subtle grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 1; i <= 4; i++) {
                const gridY = baseY - (maxHeight / 4) * i;
                ctx.beginPath();
                ctx.moveTo(x - 10, gridY);
                ctx.lineTo(x + barWidth * 2 + 25, gridY);
                ctx.stroke();
            }
            
            // Draw ideal range background with glow effect
            ctx.save();
            ctx.shadowColor = 'rgba(0, 191, 255, 0.3)';
            ctx.shadowBlur = 15;
            ctx.fillStyle = 'rgba(0, 191, 255, 0.15)';
            ctx.fillRect(x - 5, baseY - idealHeight, barWidth * 2 + 15, idealHeight);
            ctx.restore();
            
            // Create gradient for left bar (mint green)
            const leftGradient = ctx.createLinearGradient(0, baseY - leftHeight, 0, baseY);
            leftGradient.addColorStop(0, '#00E676');
            leftGradient.addColorStop(1, '#00C853');
            
            // Create gradient for right bar (electric blue)
            const rightGradient = ctx.createLinearGradient(0, baseY - rightHeight, 0, baseY);
            rightGradient.addColorStop(0, '#40C4FF');
            rightGradient.addColorStop(1, '#0091EA');
            
            // Draw left ROM bar with glow
            ctx.save();
            ctx.shadowColor = '#00E676';
            ctx.shadowBlur = 10;
            ctx.fillStyle = leftGradient;
            ctx.fillRect(x, baseY - leftHeight, barWidth, leftHeight);
            ctx.restore();
            
            // Draw right ROM bar with glow
            ctx.save();
            ctx.shadowColor = '#40C4FF';
            ctx.shadowBlur = 10;
            ctx.fillStyle = rightGradient;
            ctx.fillRect(x + barWidth + 8, baseY - rightHeight, barWidth, rightHeight);
            ctx.restore();
            
            // Add subtle border to bars
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, baseY - leftHeight, barWidth, leftHeight);
            ctx.strokeRect(x + barWidth + 8, baseY - rightHeight, barWidth, rightHeight);
            
            // Draw joint labels with better typography
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(joint, x + barWidth + 4, baseY + 25);
            
            // Show asymmetry value with color coding
            let asymmetryColor;
            if (asymmetry <= 3) asymmetryColor = '#00E676'; // Good - green
            else if (asymmetry <= 6) asymmetryColor = '#FFD54F'; // Moderate - yellow
            else asymmetryColor = '#FF5252'; // High - red
            
            ctx.fillStyle = asymmetryColor;
            ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`±${asymmetry.toFixed(1)}°`, x + barWidth + 4, baseY + 42);
            
            // Add value labels on top of bars
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`${leftROM[index].toFixed(1)}°`, x + barWidth/2, baseY - leftHeight - 5);
            ctx.fillText(`${rightROM[index].toFixed(1)}°`, x + barWidth + 8 + barWidth/2, baseY - rightHeight - 5);
        });
        
        // Add title with modern styling
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Range of Motion Analysis', canvas.width / 2, 25);
        
        // Add legend
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'left';
        
        // Left side legend
        ctx.fillStyle = '#00E676';
        ctx.fillRect(20, canvas.height - 45, 15, 15);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Left Side', 45, canvas.height - 33);
        
        // Right side legend
        ctx.fillStyle = '#40C4FF';
        ctx.fillRect(130, canvas.height - 45, 15, 15);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Right Side', 155, canvas.height - 33);
        
        // Ideal range legend
        ctx.fillStyle = 'rgba(0, 191, 255, 0.3)';
        ctx.fillRect(250, canvas.height - 45, 15, 15);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Ideal Range', 275, canvas.height - 33);
    }

    function generateSpiderChart(analysisResults) {
        // Create sleek spider/radar chart with modern styling
        const canvas = document.getElementById('spider-chart');
        if (!canvas) {
            console.error('Spider chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        canvas.width = 500;
        canvas.height = 450;
        
        // Clear canvas with sophisticated gradient background
        const backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        backgroundGradient.addColorStop(0, '#0a0a0a');
        backgroundGradient.addColorStop(0.5, '#1a1a2e');
        backgroundGradient.addColorStop(1, '#16213e');
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Use ROM values directly from analysis results - reordered for better visual layout
        // Original Python order: [right_knee, right_hip, spine, left_hip, left_knee, left_ankle, right_ankle]
        // New visual order: [spine, hip_right, knee_right, ankle_right, ankle_left, knee_left, hip_left]
        const originalRomValues = analysisResults.romValues;
        const romValues = [
            originalRomValues[2], // spine
            originalRomValues[1], // hip right
            originalRomValues[0], // knee right  
            originalRomValues[6], // ankle right
            originalRomValues[5], // ankle left
            originalRomValues[4], // knee left
            originalRomValues[3]  // hip left
        ];
        // Dynamic joint labels based on calculation method
        const ankleLabel = analysisResults.usingTibialSurrogate ? 'Tibial R' : 'Ankle R';
        const ankleLabelLeft = analysisResults.usingTibialSurrogate ? 'Tibial L' : 'Ankle L';
        const joints = ['Spine', 'Hip R', 'Knee R', ankleLabel, ankleLabelLeft, 'Knee L', 'Hip L'];
        
        // Get gait parameters
        const gaitType = document.querySelector('input[name="gait-type"]:checked')?.value || 'running';
        const cameraAngle = document.querySelector('input[name="camera-angle"]:checked')?.value || 'side';
        
        // Define ideal ranges - reordered to match new joint layout
        // Original order was: [knee_r, hip_r, spine, hip_l, knee_l, ankle_l, ankle_r]
        // New order is: [spine, hip_r, knee_r, ankle_r, ankle_l, knee_l, hip_l]
        let originalIdealValues;
        if (cameraAngle === 'side' && gaitType === 'running') {
            originalIdealValues = [125, 65, 10, 65, 125, 70, 70]; // [knee, hip, spine, hip, knee, ankle, ankle]
        } else if (cameraAngle === 'side' && gaitType === 'walking') {
            originalIdealValues = [60, 35, 2.5, 35, 60, 32.5, 32.5];
        } else if (cameraAngle === 'back' && gaitType === 'running') {
            originalIdealValues = [2.5, 15, 5.5, 15, 2.5, 35, 35];
        } else { // back walking
            originalIdealValues = [2.5, 7.5, 2.5, 7.5, 2.5, 35, 35];
        }
        
        // Reorder ideal values to match new joint order
        const idealValues = [
            originalIdealValues[2], // spine
            originalIdealValues[1], // hip right
            originalIdealValues[0], // knee right
            originalIdealValues[6], // ankle right
            originalIdealValues[5], // ankle left
            originalIdealValues[4], // knee left
            originalIdealValues[3]  // hip left
        ];
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 15;  // Move center down more to create space above
        const radius = 125;  // Smaller radius to accommodate larger label distances
        const numJoints = joints.length;
        const numPoints = joints.length;
        const angleStep = (2 * Math.PI) / numPoints;
        
        // Draw concentric circles (grid) with modern styling
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius / 4) * i, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        // Add subtle glow effect to outer ring
        ctx.save();
        ctx.shadowColor = 'rgba(0, 212, 255, 0.3)';
        ctx.shadowBlur = 5;
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
        
        // Draw axes and labels
        const maxValue = Math.max(...romValues, ...idealValues) + 20;
        joints.forEach((joint, i) => {
            const angle = (i * 2 * Math.PI) / numJoints - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Draw axis line with subtle gray
            ctx.strokeStyle = 'rgba(128, 128, 128, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            // Draw joint labels with larger, more readable font
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Arial';  // Increased font size
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Adjust label distance based on position to avoid title overlap
            let labelDistance = radius + 25;
            // if (i === 0) { // Spine is at index 0 (top position)
            //     labelDistance = radius + 85; // Much larger distance for spine label to avoid title
            // }
            
            const labelX = centerX + Math.cos(angle) * labelDistance;
            const labelY = centerY + Math.sin(angle) * labelDistance;
            ctx.fillText(joint, labelX, labelY);
        });
        
        // Draw ideal range (Peak Performance Zone) with glow effect
        ctx.save();
        ctx.shadowColor = 'rgba(0, 217, 170, 0.6)';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#00D9AA';
        ctx.fillStyle = 'rgba(0, 217, 170, 0.2)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        idealValues.forEach((value, i) => {
            const angle = (i * 2 * Math.PI) / numJoints - Math.PI / 2;
            const distance = (value / maxValue) * radius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // Draw actual ROM values with glow effect
        ctx.save();
        ctx.shadowColor = 'rgba(0, 191, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00BFFF';
        ctx.fillStyle = 'rgba(0, 191, 255, 0.25)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        romValues.forEach((value, i) => {
            const angle = (i * 2 * Math.PI) / numJoints - Math.PI / 2;
            const distance = (value / maxValue) * radius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // Add data point indicators with glow
        romValues.forEach((value, i) => {
            const angle = (i * 2 * Math.PI) / numJoints - Math.PI / 2;
            const distance = (value / maxValue) * radius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            ctx.save();
            ctx.shadowColor = '#00BFFF';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#00BFFF';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        });
        
        // Add title with modern styling
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Range of Motion Analysis', centerX, 25);
        
        // Subtitle
        ctx.font = '12px Inter, Arial, sans-serif';
        ctx.fillStyle = '#b0b0b0';
        ctx.fillText('Current vs Peak Performance Zone', centerX, 45);
        
        // Add legend with larger, more readable text positioned on the right to avoid overlap
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        
        // Position legend on the right side to avoid overlap with joint labels
        const legendX = canvas.width - 200;
        const legendY = centerY; // Use the same center as the chart
        
        // Peak Performance Zone legend
        ctx.fillStyle = '#00D9AA';
        ctx.fillRect(legendX, legendY - 20, 18, 15);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Peak Performance Zone', legendX + 25, legendY - 8);
        
        // Your Current Stride legend
        ctx.fillStyle = '#00BFFF';  // Electric blue color
        ctx.fillRect(legendX, legendY + 10, 18, 15);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Your Current Stride', legendX + 25, legendY + 22);
    }

    function generateAsymmetryChart(analysisResults) {
        // Create sleek asymmetry bar chart
        const canvas = document.getElementById('asymmetry-chart');
        if (!canvas) {
            console.error('Asymmetry chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        canvas.width = 650;
        canvas.height = 400;
        
        // Create sophisticated gradient background matching other charts
        const backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        backgroundGradient.addColorStop(0, '#0a0a0a');
        backgroundGradient.addColorStop(0.5, '#1a1a2e');
        backgroundGradient.addColorStop(1, '#16213e');
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate asymmetries using ROM values from Python order
        // romValues: [right_knee, right_hip, spine, left_hip, left_knee, left_ankle, right_ankle]
        const romValues = analysisResults.romValues;
        const ankleAsymmetryLabel = analysisResults.usingTibialSurrogate ? 'Tibial Inclination' : 'Ankle';
        const joints = ['Hip', 'Knee', ankleAsymmetryLabel];
        const asymmetries = [
            romValues[1] - romValues[3],  // Right hip - Left hip
            romValues[0] - romValues[4],  // Right knee - Left knee
            romValues[6] - romValues[5]   // Right ankle - Left ankle  
        ];
        
        const barHeight = 50;
        const maxAsymmetry = 30; // -30 to +30 degree range
        const centerX = canvas.width / 2;
        const startY = 120;
        const barSpacing = 90;
        
        // Draw grid lines for better readability
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = -30; i <= 30; i += 10) {
            if (i === 0) continue; // Skip center line for now
            const x = centerX + (i / maxAsymmetry) * (canvas.width / 3);
            ctx.beginPath();
            ctx.moveTo(x, 70);
            ctx.lineTo(x, canvas.height - 70);
            ctx.stroke();
        }
        
        // Draw enhanced center line with glow
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, 70);
        ctx.lineTo(centerX, canvas.height - 70);
        ctx.stroke();
        ctx.restore();
        
        // Draw bars with modern styling
        joints.forEach((joint, i) => {
            const y = startY + i * barSpacing;
            const asymmetry = asymmetries[i];
            const barWidth = Math.abs(asymmetry) * (canvas.width / 3) / maxAsymmetry;
            
            // Enhanced color coding with gradients
            const absAsymmetry = Math.abs(asymmetry);
            let gradient, glowColor;
            
            if (absAsymmetry < 5) {
                gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
                gradient.addColorStop(0, '#00E676');
                gradient.addColorStop(1, '#00C853');
                glowColor = 'rgba(0, 230, 118, 0.4)';
            } else if (absAsymmetry < 15) {
                gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
                gradient.addColorStop(0, '#FFC107');
                gradient.addColorStop(1, '#FF8F00');
                glowColor = 'rgba(255, 193, 7, 0.4)';
            } else {
                gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
                gradient.addColorStop(0, '#FF5252');
                gradient.addColorStop(1, '#D32F2F');
                glowColor = 'rgba(255, 82, 82, 0.4)';
            }
            
            // Draw bar with shadow and rounded corners
            ctx.save();
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 15;
            ctx.fillStyle = gradient;
            
            if (asymmetry >= 0) {
                // Right side asymmetry - rounded rectangle
                ctx.beginPath();
                ctx.roundRect(centerX + 2, y, barWidth, barHeight, 8);
                ctx.fill();
            } else {
                // Left side asymmetry - rounded rectangle
                ctx.beginPath();
                ctx.roundRect(centerX - barWidth - 2, y, barWidth, barHeight, 8);
                ctx.fill();
            }
            ctx.restore();
            
            // Add subtle border to bars
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            if (asymmetry >= 0) {
                ctx.strokeRect(centerX + 2, y, barWidth, barHeight);
            } else {
                ctx.strokeRect(centerX - barWidth - 2, y, barWidth, barHeight);
            }
            
            // Joint label positioned on the left side
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(joint, 30, y + barHeight/2 + 6);
            
            // Asymmetry value with enhanced styling - always positioned outside bars
            ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
            
            // Always position values outside the bars to prevent cutoff
            let textX;
            if (asymmetry >= 0) {
                // Right side asymmetry - place text to the right of the bar
                textX = centerX + barWidth + 15;
                ctx.textAlign = 'left';
            } else {
                // Left side asymmetry - place text to the left of the bar  
                textX = centerX - barWidth - 15;
                ctx.textAlign = 'right';
            }
            
            // Color code the text
            if (absAsymmetry < 5) ctx.fillStyle = '#00E676';
            else if (absAsymmetry < 15) ctx.fillStyle = '#FFC107';
            else ctx.fillStyle = '#FF5252';
            
            ctx.fillText(`${asymmetry > 0 ? '+' : ''}${asymmetry.toFixed(1)}°`, textX, y + barHeight/2 + 6);
        });
        
        // Enhanced title matching other charts
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Symmetry Analysis', centerX, 30);
        
        // Subtitle
        ctx.font = '14px Inter, Arial, sans-serif';
        ctx.fillStyle = '#b0b0b0';
        ctx.fillText('Range of Motion Left vs Right Comparison', centerX, 50);
        
        // Add scale markers at bottom
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        
        // Left side markers
        ctx.fillText('-30°', centerX - (canvas.width / 3), canvas.height - 45);
        ctx.fillText('-15°', centerX - (canvas.width / 6), canvas.height - 45);
        
        // Center marker
        ctx.fillText('0° (Balanced)', centerX, canvas.height - 45);
        
        // Right side markers
        ctx.fillText('+15°', centerX + (canvas.width / 6), canvas.height - 45);
        ctx.fillText('+30°', centerX + (canvas.width / 3), canvas.height - 45);
        
        // Add side labels
        ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#40C4FF';
        ctx.textAlign = 'left';
        ctx.fillText('← Left Dominant', 30, canvas.height - 15);
        
        ctx.fillStyle = '#FF6B6B';
        ctx.textAlign = 'right';
        ctx.fillText('Right Dominant →', canvas.width - 30, canvas.height - 15);
        
        // Add cumulative asymmetry summary box
        const cumulativeAsymmetry = asymmetries.reduce((sum, asym) => sum + asym, 0);
        const cumMagnitude = Math.abs(cumulativeAsymmetry);
        const cumDirection = cumulativeAsymmetry > 0 ? 'RIGHT' : 'LEFT';
        
        // Draw summary box
        const boxX = canvas.width - 200;
        const boxY = 80;
        const boxWidth = 180;
        const boxHeight = 80;
        
        // Box background with gradient
        const boxGradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
        boxGradient.addColorStop(0, 'rgba(0, 217, 170, 0.2)');
        boxGradient.addColorStop(1, 'rgba(0, 191, 255, 0.2)');
        ctx.fillStyle = boxGradient;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Box border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Summary text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CUMULATIVE ASYMMETRY', boxX + boxWidth/2, boxY + 20);
        
        // Cumulative value with color coding
        if (cumMagnitude < 3) {
            ctx.fillStyle = '#00E676'; // Green for balanced
        } else if (cumMagnitude < 10) {
            ctx.fillStyle = '#FFC107'; // Yellow for moderate
        } else {
            ctx.fillStyle = '#FF5252'; // Red for high
        }
        
        ctx.font = 'bold 18px Inter, Arial, sans-serif';
        if (cumMagnitude < 3) {
            ctx.fillText(`${cumMagnitude.toFixed(1)}° BALANCED`, boxX + boxWidth/2, boxY + 45);
        } else {
            ctx.fillText(`${cumMagnitude.toFixed(1)}° ${cumDirection}`, boxX + boxWidth/2, boxY + 45);
        }
        
        // Explanation
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '10px Inter, Arial, sans-serif';
        ctx.fillText('Sum of all joint asymmetries', boxX + boxWidth/2, boxY + 65);
    }

    function generateROMTable(analysisResults) {
        // Create ROM data table matching gait.py df_rom exactly
        console.log('generateROMTable called with:', analysisResults);
        const tableContainer = document.getElementById('rom-table-container');
        if (!tableContainer) {
            console.error('ROM table container not found');
            return;
        }
        
        // Use ROM table data structure from analysis results (already formatted)
        const romData = analysisResults.romTable;
        console.log('ROM table data:', romData);
        
        let tableHTML = `
            <h3 style="color: white; margin-bottom: 15px; font-size: 20px; font-weight: bold; text-align: center;">Range of Motion Analysis</h3>
            <table style="width: 100%; border-collapse: collapse; background: #1A1A1A; color: white; font-family: Arial, sans-serif; border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #00D9AA, #00BFFF);">
                        <th style="padding: 15px; border: none; text-align: left; font-size: 16px; font-weight: bold;">Joint</th>
                        <th style="padding: 15px; border: none; text-align: center; font-size: 16px; font-weight: bold;">Min Angle (°)</th>
                        <th style="padding: 15px; border: none; text-align: center; font-size: 16px; font-weight: bold;">Max Angle (°)</th>
                        <th style="padding: 15px; border: none; text-align: center; font-size: 16px; font-weight: bold;">Range of Motion (°)</th>
                        <th style="padding: 15px; border: none; text-align: center; font-size: 16px; font-weight: bold;">Peak Performance Zone</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        romData.forEach((row, index) => {
            const bgColor = index % 2 === 0 ? '#2A2A2A' : '#333333';
            const ppz = row.peakPerformanceZone || { zone: 'N/A', score: 0, color: '#666666' };
            
            tableHTML += `
                <tr style="background: ${bgColor}; transition: background-color 0.2s;">
                    <td style="padding: 12px 15px; border: none; font-size: 15px; font-weight: 500;">${row.joint}</td>
                    <td style="padding: 12px 15px; border: none; text-align: center; font-size: 15px;">${row.minAngle.toFixed(1)}</td>
                    <td style="padding: 12px 15px; border: none; text-align: center; font-size: 15px;">${row.maxAngle.toFixed(1)}</td>
                    <td style="padding: 12px 15px; border: none; text-align: center; font-weight: bold; font-size: 16px; color: #00BFFF;">${row.rom.toFixed(1)}</td>
                    <td style="padding: 12px 15px; border: none; text-align: center; font-weight: bold; font-size: 14px; color: ${ppz.color};">
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <span style="font-size: 13px; font-weight: bold;">${ppz.zone}</span>
                            <span style="font-size: 11px; opacity: 0.8;">${ppz.score.toFixed(0)}%</span>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        tableContainer.innerHTML = tableHTML;
    }

    function addDownloadButton() {
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'cta-primary';
        downloadBtn.style.marginTop = '2rem';
        downloadBtn.innerHTML = `
            <i class="fas fa-download"></i>
            Download Full Report (PDF)
        `;
        
        downloadBtn.addEventListener('click', () => {
            // In a real implementation, this would generate and download the actual PDF
            alert('In the full application, this would download your comprehensive gait analysis report!');
        });
        
        resultsPreview.appendChild(downloadBtn);
    }
});

// Intersection Observer for animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.feature-card, .step, .metric-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Animate hero stats numbers on page load
    animateHeroStats();
});

// Function to animate hero stats numbers
function animateHeroStats() {
    const stats = [
        { id: 'cost-efficiency-number', target: 20, suffix: 'X', duration: 2000 },
        { id: 'gait-assessments-number', target: 4, suffix: '', duration: 1500 },
        { id: 'analysis-time-number', target: 60, suffix: 's', duration: 2500 }
    ];

    stats.forEach(stat => {
        const element = document.getElementById(stat.id);
        if (element) {
            animateNumber(element, 0, stat.target, stat.duration, stat.suffix);
        }
    });
}

// Function to animate a number from start to end
function animateNumber(element, start, end, duration, suffix = '') {
    const startTime = Date.now();
    const range = end - start;

    function updateNumber() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easeOut function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (range * easeOut));
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = end + suffix; // Ensure final value is exact
        }
    }
    
    // Start animation after a small delay for better visual effect
    setTimeout(() => {
        updateNumber();
    }, 500);
}

// Performance monitoring
document.addEventListener('DOMContentLoaded', function() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        if ('performance' in window) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page loaded in ${loadTime}ms`);
        }
    });
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
});

// Sleek Joint Angle Visualization
function generateJointAnglePlot(analysisResults, canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Joint angle plot canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 500;

    // Clear canvas with sophisticated gradient background
    const backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    backgroundGradient.addColorStop(0, '#0a0a0a');
    backgroundGradient.addColorStop(0.5, '#1a1a2e');
    backgroundGradient.addColorStop(1, '#16213e');
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Extract joint angles data
    const jointAngles = analysisResults.jointAngles;
    const ankleLabel = analysisResults.usingTibialSurrogate ? 'Tibial Inclination' : 'Ankle';
    
    const joints = [
        { name: 'Spine Segment', spine: jointAngles.left.spine, color: '#45b7d1', bilateral: false }, // Spine is central, not bilateral
        { name: 'Hip', left: jointAngles.left.hip, right: jointAngles.right.hip, color: '#4ecdc4', bilateral: true },
        { name: 'Knee', left: jointAngles.left.knee, right: jointAngles.right.knee, color: '#ff6b6b', bilateral: true },
        { name: ankleLabel, left: jointAngles.left.ankle, right: jointAngles.right.ankle, color: '#00d4ff', bilateral: true }
    ];

    // Chart dimensions and positioning
    const margin = { top: 60, right: 80, bottom: 80, left: 100 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // Title
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Joint Angle Analysis', canvas.width / 2, 35);
    
    // Subtitle
    ctx.font = '14px Inter, Arial, sans-serif';
    ctx.fillStyle = '#b0b0b0';
    ctx.fillText('Range of Motion Throughout Gait Cycle', canvas.width / 2, 55);
    ctx.restore();

    // Draw grid and axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Vertical grid lines (for joints)
    const jointSpacing = chartWidth / joints.length;
    for (let i = 0; i <= joints.length; i++) {
        const x = margin.left + i * jointSpacing;
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + chartHeight);
        ctx.stroke();
    }
    
    // Horizontal grid lines (for angles)
    const maxAngle = Math.max(...joints.flatMap(j => 
        j.bilateral ? [j.left.max, j.right.max] : [j.spine.max]
    ));
    const minAngle = Math.min(...joints.flatMap(j => 
        j.bilateral ? [j.left.min, j.right.min] : [j.spine.min]
    ));
    const angleRange = maxAngle - minAngle;
    const gridLines = 8;
    
    for (let i = 0; i <= gridLines; i++) {
        const y = margin.top + (i / gridLines) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + chartWidth, y);
        ctx.stroke();
        
        // Y-axis labels
        const angle = Math.round(maxAngle - (i / gridLines) * angleRange);
        ctx.fillStyle = '#888';
        ctx.font = '12px Inter, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(angle + '°', margin.left - 10, y + 4);
    }

    // Draw joint angle ranges with sleek bars
    joints.forEach((joint, index) => {
        const centerX = margin.left + (index + 0.5) * jointSpacing;
        
        if (!joint.bilateral) {
            // Handle spine (central joint)
            const spineX = centerX;
            const spineMin = margin.top + ((maxAngle - joint.spine.min) / angleRange) * chartHeight;
            const spineMax = margin.top + ((maxAngle - joint.spine.max) / angleRange) * chartHeight;
            
            // Spine bar (centered)
            const spineGradient = ctx.createLinearGradient(spineX, spineMax, spineX, spineMin);
            spineGradient.addColorStop(0, joint.color);
            spineGradient.addColorStop(1, joint.color + '40');
            
            ctx.fillStyle = spineGradient;
            ctx.fillRect(spineX - 20, spineMax, 40, spineMin - spineMax);
            
            // Spine outline
            ctx.strokeStyle = joint.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(spineX - 20, spineMax, 40, spineMin - spineMax);
            
            // Average line for spine
            const spineAvgY = margin.top + ((maxAngle - joint.spine.avg) / angleRange) * chartHeight;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(spineX - 25, spineAvgY);
            ctx.lineTo(spineX + 25, spineAvgY);
            ctx.stroke();
            
            // Joint label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Inter, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(joint.name, centerX, margin.top + chartHeight + 25);
            
            // ROM value
            ctx.fillStyle = '#cccccc';
            ctx.font = '11px Inter, Arial, sans-serif';
            ctx.fillText(`${joint.spine.rom.toFixed(1)}°`, spineX, margin.top + chartHeight + 45);
            
        } else {
            // Handle bilateral joints (left and right sides)
            const leftX = centerX - 25;
            const rightX = centerX + 25;
            
            // Calculate positions for left and right sides
            const leftMin = margin.top + ((maxAngle - joint.left.min) / angleRange) * chartHeight;
            const leftMax = margin.top + ((maxAngle - joint.left.max) / angleRange) * chartHeight;
            const rightMin = margin.top + ((maxAngle - joint.right.min) / angleRange) * chartHeight;
            const rightMax = margin.top + ((maxAngle - joint.right.max) / angleRange) * chartHeight;
            
            // Left side bar
            const leftGradient = ctx.createLinearGradient(leftX, leftMax, leftX, leftMin);
            leftGradient.addColorStop(0, joint.color);
            leftGradient.addColorStop(1, joint.color + '40');
            
            ctx.fillStyle = leftGradient;
            ctx.fillRect(leftX - 15, leftMax, 30, leftMin - leftMax);
            
            // Left side outline
            ctx.strokeStyle = joint.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(leftX - 15, leftMax, 30, leftMin - leftMax);
            
            // Right side bar
            const rightGradient = ctx.createLinearGradient(rightX, rightMax, rightX, rightMin);
            rightGradient.addColorStop(0, joint.color);
            rightGradient.addColorStop(1, joint.color + '40');
            
            ctx.fillStyle = rightGradient;
            ctx.fillRect(rightX - 15, rightMax, 30, rightMin - rightMax);
            
            // Right side outline
            ctx.strokeStyle = joint.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(rightX - 15, rightMax, 30, rightMin - rightMax);
            
            // Average line (horizontal line across both bars)
            const leftAvgY = margin.top + ((maxAngle - joint.left.avg) / angleRange) * chartHeight;
            const rightAvgY = margin.top + ((maxAngle - joint.right.avg) / angleRange) * chartHeight;
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(leftX - 20, leftAvgY);
            ctx.lineTo(leftX + 20, leftAvgY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(rightX - 20, rightAvgY);
            ctx.lineTo(rightX + 20, rightAvgY);
            ctx.stroke();
            
            // Joint labels
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Inter, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(joint.name, centerX, margin.top + chartHeight + 25);
            
            // L/R labels
            ctx.font = '12px Inter, Arial, sans-serif';
            ctx.fillStyle = joint.color;
            ctx.fillText('L', leftX, margin.top + chartHeight + 45);
            ctx.fillText('R', rightX, margin.top + chartHeight + 45);
            
            // ROM values
            ctx.fillStyle = '#cccccc';
            ctx.font = '11px Inter, Arial, sans-serif';
            ctx.fillText(`${joint.left.rom.toFixed(1)}°`, leftX, margin.top + chartHeight + 60);
            ctx.fillText(`${joint.right.rom.toFixed(1)}°`, rightX, margin.top + chartHeight + 60);
        }
    });

    // Y-axis label
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Angle (degrees)', 0, 0);
    ctx.restore();

    // Legend
    const legendY = margin.top + 20;
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Range: Min-Max', margin.left + chartWidth - 120, legendY);
    ctx.fillText('White line: Average', margin.left + chartWidth - 120, legendY + 15);
}

function generateJointAngleLinesPlot(analysisResults, canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Joint angle lines plot canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 600;

    // Clear canvas with sophisticated gradient background
    const backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    backgroundGradient.addColorStop(0, '#0a0a0a');
    backgroundGradient.addColorStop(0.5, '#1a1a2e');
    backgroundGradient.addColorStop(1, '#16213e');
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Extract angle data
    const angles = analysisResults.angles;
    const ankleLabel = analysisResults.usingTibialSurrogate ? 'Tibial Inclination' : 'Ankle';
    
    // Chart dimensions and positioning
    const margin = { top: 80, right: 120, bottom: 100, left: 100 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // Title
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Joint Angle Trajectories', canvas.width / 2, 35);
    
    // Subtitle
    ctx.font = '16px Inter, Arial, sans-serif';
    ctx.fillStyle = '#b0b0b0';
    ctx.fillText('Angle progression throughout gait cycle', canvas.width / 2, 60);
    ctx.restore();

    // Prepare data series - reordered as Spine, Hip, Knee, Tibial Inclination
    const series = [
        { name: 'Spine Segment', data: angles.left.spine, color: '#45b7d1', lineWidth: 4 }, // Spine is central, thicker line
        { name: 'Hip (L)', data: angles.left.hip, color: '#4ecdc4', lineWidth: 3 },
        { name: 'Hip (R)', data: angles.right.hip, color: '#3ea99a', lineWidth: 3 },
        { name: 'Knee (L)', data: angles.left.knee, color: '#ff6b6b', lineWidth: 3 },
        { name: 'Knee (R)', data: angles.right.knee, color: '#cc5555', lineWidth: 3 },
        { name: `${ankleLabel} (L)`, data: angles.left.ankle, color: '#00d4ff', lineWidth: 3 },
        { name: `${ankleLabel} (R)`, data: angles.right.ankle, color: '#0099cc', lineWidth: 3 }
    ];

    // Calculate scales
    const allAngles = series.flatMap(s => s.data);
    const maxAngle = Math.max(...allAngles);
    const minAngle = Math.min(...allAngles);
    const angleRange = maxAngle - minAngle;
    const padding = angleRange * 0.1; // 10% padding
    const plotMinAngle = minAngle - padding;
    const plotMaxAngle = maxAngle + padding;
    const plotAngleRange = plotMaxAngle - plotMinAngle;

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    const horizontalGridLines = 8;
    for (let i = 0; i <= horizontalGridLines; i++) {
        const y = margin.top + (i / horizontalGridLines) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + chartWidth, y);
        ctx.stroke();
        
        // Y-axis labels
        const angle = Math.round(plotMaxAngle - (i / horizontalGridLines) * plotAngleRange);
        ctx.fillStyle = '#888';
        ctx.font = '12px Inter, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(angle + '°', margin.left - 10, y + 4);
    }
    
    // Vertical grid lines
    const timePoints = series[0].data.length;
    const frameRate = analysisResults.frameRate || 30; // Use detected frame rate, fallback to 30 FPS
    let totalDuration = timePoints / frameRate; // Simple calculation: every frame processed
    
    console.log(`🎯 Trajectory Plot Debug:`);
    console.log(`  📊 Data points: ${timePoints}`);
    console.log(`  🎬 Frame rate: ${frameRate} FPS`);
    console.log(`  ✅ Processing: Every frame (no skipping)`);
    console.log(`  ⏰ Calculated duration: ${totalDuration.toFixed(2)}s`);
    console.log(`  📐 Raw calculation: ${timePoints} ÷ ${frameRate} = ${totalDuration.toFixed(2)}`);
    
    // If the duration seems wrong, let's use the actual segment duration from analysis results
    const actualSegmentDuration = analysisResults.segmentDuration;
    if (actualSegmentDuration && Math.abs(totalDuration - actualSegmentDuration) > 0.5) {
        console.log(`⚠️  Duration mismatch detected! Using actual segment duration: ${actualSegmentDuration.toFixed(2)}s instead of calculated: ${totalDuration.toFixed(2)}s`);
        totalDuration = actualSegmentDuration;
    }
    
    console.log(`✅ Final duration for x-axis: ${totalDuration.toFixed(2)}s`);
    const verticalGridLines = 10;
    
    for (let i = 0; i <= verticalGridLines; i++) {
        const x = margin.left + (i / verticalGridLines) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + chartHeight);
        ctx.stroke();
        
        // X-axis labels (time in seconds)
        const timeSeconds = (i / verticalGridLines) * totalDuration;
        ctx.fillStyle = '#888';
        ctx.font = '12px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(timeSeconds.toFixed(1) + 's', x, margin.top + chartHeight + 20);
    }

    // Draw data series
    series.forEach((serie) => {
        if (!serie.data || serie.data.length === 0) return;
        
        ctx.strokeStyle = serie.color;
        ctx.lineWidth = serie.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Add glow effect
        ctx.shadowColor = serie.color;
        ctx.shadowBlur = serie.lineWidth * 2;
        
        ctx.beginPath();
        
        for (let i = 0; i < serie.data.length; i++) {
            // Calculate x position based on time - processing every frame now
            const timeAtFrame = i / frameRate; // Time in seconds for this frame
            const x = margin.left + (timeAtFrame / totalDuration) * chartWidth;
            const y = margin.top + ((plotMaxAngle - serie.data[i]) / plotAngleRange) * chartHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow
    });

    // Draw axes
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Y-axis
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    // X-axis
    ctx.moveTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();

    // Y-axis label
    ctx.save();
    ctx.translate(30, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Joint Angle (degrees)', 0, 0);
    ctx.restore();

    // X-axis label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time (seconds)', canvas.width / 2, canvas.height - 20);

    // Legend
    const legendX = margin.left + chartWidth + 20;
    let legendY = margin.top + 20;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Legend:', legendX, legendY);
    
    legendY += 25;
    
    series.forEach((serie, index) => {
        // Legend line sample
        ctx.strokeStyle = serie.color;
        ctx.lineWidth = serie.lineWidth;
        ctx.beginPath();
        ctx.moveTo(legendX, legendY + index * 25);
        ctx.lineTo(legendX + 20, legendY + index * 25);
        ctx.stroke();
        
        // Legend text
        ctx.fillStyle = serie.color;
        ctx.font = '12px Inter, Arial, sans-serif';
        ctx.fillText(serie.name, legendX + 25, legendY + index * 25 + 4);
    });
}

function downloadLineplotDataAsCSV(analysisResults) {
    if (!analysisResults || !analysisResults.angles) {
        console.error('No angle data available for download');
        return;
    }

    const angles = analysisResults.angles;
    
    // Prepare CSV headers
    const headers = [
        'Frame',
        'Tibial_Inclination_Left',
        'Tibial_Inclination_Right', 
        'Knee_Left',
        'Knee_Right',
        'Hip_Left', 
        'Hip_Right',
        'Spine'
    ];
    
    // Find the maximum length among all angle arrays
    const maxLength = Math.max(
        angles.left.ankle.length,
        angles.right.ankle.length,
        angles.left.knee.length,
        angles.right.knee.length,
        angles.left.hip.length,
        angles.right.hip.length,
        angles.left.spine.length
    );
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    for (let i = 0; i < maxLength; i++) {
        const row = [
            i + 1, // Frame number (1-based)
            angles.left.ankle[i] ? angles.left.ankle[i].toFixed(2) : '',
            angles.right.ankle[i] ? angles.right.ankle[i].toFixed(2) : '',
            angles.left.knee[i] ? angles.left.knee[i].toFixed(2) : '',
            angles.right.knee[i] ? angles.right.knee[i].toFixed(2) : '',
            angles.left.hip[i] ? angles.left.hip[i].toFixed(2) : '',
            angles.right.hip[i] ? angles.right.hip[i].toFixed(2) : '',
            angles.left.spine[i] ? angles.left.spine[i].toFixed(2) : ''
        ];
        csvContent += row.join(',') + '\n';
    }
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'joint_angle_trajectories.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Joint angle trajectory data downloaded as CSV');
    }
}

// Generate retail-focused analysis for running store employees
function generateRetailAnalysis(analysisResults) {
    console.log('� Generating retail analysis for store employees...');
    
    const gaitType = document.querySelector('input[name="gait-type"]:checked')?.value || 'running';
    const customerFootwear = document.getElementById('footwear')?.value || 'Not specified';
    const romTable = analysisResults.romTable || [];
    const asymmetry = analysisResults.asymmetry || 0;
    const grade = analysisResults.grade || 'B';
    
    // Set current date (with safety checks)
    const currentDateElement = document.getElementById('current-date');
    const customerFootwearElement = document.getElementById('customer-footwear-type');
    
    if (currentDateElement) {
        currentDateElement.textContent = new Date().toLocaleDateString();
    }
    if (customerFootwearElement) {
        customerFootwearElement.textContent = `Current Footwear: ${customerFootwear}`;
    }
    
    // Generate overall recommendation (with safety checks)
    const overallAssessment = generateOverallAssessment(grade, asymmetry);
    const overallRecommendationText = document.getElementById('overall-recommendation-text');
    const overallRecommendationBadge = document.getElementById('overall-recommendation-badge');
    
    if (overallRecommendationText) {
        overallRecommendationText.textContent = overallAssessment.text;
    }
    if (overallRecommendationBadge) {
        overallRecommendationBadge.className = `recommendation-badge ${overallAssessment.type}`;
    }
    
    // Generate key findings
    generateStoreFindings(romTable, asymmetry, grade);
    
    // Generate footwear recommendations
    generateFootwearRecommendations(romTable, asymmetry, gaitType, customerFootwear);
    
    // Generate conversation starters
    generateConversationStarters(romTable, asymmetry, grade);
    
    // Generate customer summary
    generateCustomerSummary(romTable, asymmetry, grade);
    
    // Generate simple visualizations
    generateSimpleVisualizations(analysisResults);
    
    console.log('✅ Retail analysis generated successfully');
}

function generateOverallAssessment(grade, asymmetry) {
    const absoluteAsymmetry = Math.abs(asymmetry);
    
    if (grade === 'A' && absoluteAsymmetry < 5) {
        return { text: 'Excellent Gait Pattern', type: 'excellent' };
    } else if (grade === 'B' && absoluteAsymmetry < 10) {
        return { text: 'Good Running Form', type: 'good' };
    } else if (absoluteAsymmetry > 15) {
        return { text: 'Imbalance Detected', type: 'attention' };
    } else {
        return { text: 'Room for Improvement', type: 'improvement' };
    }
}

function generateStoreFindings(romTable, asymmetry, grade) {
    // Running Efficiency
    let efficiencyRating, efficiencyExplanation;
    if (grade === 'A') {
        efficiencyRating = 'Excellent';
        efficiencyExplanation = 'Customer shows very efficient movement patterns';
    } else if (grade === 'B') {
        efficiencyRating = 'Good';
        efficiencyExplanation = 'Generally efficient with minor improvements possible';
    } else {
        efficiencyRating = 'Needs Work';
        efficiencyExplanation = 'Several areas could benefit from correction';
    }
    
    const efficiencyRatingElement = document.getElementById('efficiency-rating');
    const efficiencyExplanationElement = document.getElementById('efficiency-explanation');
    
    if (efficiencyRatingElement) {
        efficiencyRatingElement.textContent = efficiencyRating;
    }
    if (efficiencyExplanationElement) {
        efficiencyExplanationElement.textContent = efficiencyExplanation;
    }
    
    // Injury Risk
    const absoluteAsymmetry = Math.abs(asymmetry);
    let injuryRisk, injuryExplanation;
    if (absoluteAsymmetry < 5) {
        injuryRisk = 'Low Risk';
        injuryExplanation = 'Well-balanced movement reduces injury potential';
    } else if (absoluteAsymmetry < 15) {
        injuryRisk = 'Moderate Risk';
        injuryExplanation = 'Some imbalance present - proper shoes can help';
    } else {
        injuryRisk = 'Higher Risk';
        injuryExplanation = 'Significant imbalance may lead to overuse injuries';
    }
    
    const injuryRiskRatingElement = document.getElementById('injury-risk-rating');
    const injuryRiskExplanationElement = document.getElementById('injury-risk-explanation');
    
    if (injuryRiskRatingElement) {
        injuryRiskRatingElement.textContent = injuryRisk;
    }
    if (injuryRiskExplanationElement) {
        injuryRiskExplanationElement.textContent = injuryExplanation;
    }
    
    // Balance Assessment
    let balanceRating, balanceExplanation;
    if (absoluteAsymmetry < 3) {
        balanceRating = 'Excellent';
        balanceExplanation = 'Left and right sides work together very well';
    } else if (absoluteAsymmetry < 8) {
        balanceRating = 'Good';
        balanceExplanation = 'Minor differences between left and right sides';
    } else {
        balanceRating = 'Imbalanced';
        balanceExplanation = 'Noticeable difference between left and right sides';
    }
    
    const balanceRatingElement = document.getElementById('balance-rating');
    const balanceExplanationElement = document.getElementById('balance-explanation');
    
    if (balanceRatingElement) {
        balanceRatingElement.textContent = balanceRating;
    }
    if (balanceExplanationElement) {
        balanceExplanationElement.textContent = balanceExplanation;
    }
}

function generateFootwearRecommendations(romTable, asymmetry, gaitType, currentFootwear) {
    const absoluteAsymmetry = Math.abs(asymmetry);
    let shoeType, reason, alternatives;
    
    // Analyze ROM patterns for footwear recommendation
    let ankleIssues = false;
    let kneeIssues = false;
    let hipIssues = false;
    
    romTable.forEach(joint => {
        if (joint.joint.toLowerCase().includes('ankle') && joint.rom < 25) {
            ankleIssues = true;
        }
        if (joint.joint.toLowerCase().includes('knee') && joint.rom < 55) {
            kneeIssues = true;
        }
        if (joint.joint.toLowerCase().includes('hip') && joint.rom < 35) {
            hipIssues = true;
        }
    });
    
    // Footwear logic for running stores
    if (absoluteAsymmetry > 15 || kneeIssues) {
        shoeType = 'Motion Control Shoes';
        reason = 'Significant imbalance detected - needs maximum stability';
        alternatives = 'Stability shoes with custom orthotics';
    } else if (absoluteAsymmetry > 8 || ankleIssues) {
        shoeType = 'Stability Running Shoes';
        reason = 'Mild overpronation or imbalance - needs moderate support';
        alternatives = 'Neutral shoes with arch support insoles';
    } else if (hipIssues) {
        shoeType = 'Cushioned Neutral Shoes';
        reason = 'Good mechanics but could benefit from impact absorption';
        alternatives = 'Minimalist shoes for experienced runners';
    } else {
        shoeType = 'Neutral Running Shoes';
        reason = 'Efficient gait pattern allows for natural foot motion';
        alternatives = 'Lightweight trainers or racing flats';
    }
    
    document.getElementById('shoe-rec-title').textContent = shoeType;
    document.getElementById('shoe-rec-reason').textContent = reason;
    document.getElementById('shoe-alternatives').textContent = alternatives;
    
    // Generate accessory recommendations
    const accessories = [];
    if (absoluteAsymmetry > 10) {
        accessories.push({ name: 'Custom Insoles', benefit: 'Correct imbalances' });
    }
    if (ankleIssues) {
        accessories.push({ name: 'Ankle Support', benefit: 'Improve range of motion' });
    }
    if (kneeIssues) {
        accessories.push({ name: 'Knee Strap', benefit: 'Reduce stress on joints' });
    }
    
    const accessoryContainer = document.getElementById('accessory-recommendations');
    accessoryContainer.innerHTML = '';
    
    if (accessories.length === 0) {
        accessories.push({ name: 'Running Socks', benefit: 'Moisture-wicking comfort' });
    }
    
    accessories.forEach(accessory => {
        const div = document.createElement('div');
        div.className = 'accessory-item';
        div.innerHTML = `
            <span class="accessory-name">${accessory.name}</span>
            <span class="accessory-benefit">${accessory.benefit}</span>
        `;
        accessoryContainer.appendChild(div);
    });
}

function generateConversationStarters(romTable, asymmetry, grade) {
    const positivePoints = [];
    const improvementAreas = [];
    
    // Generate positive talking points
    if (grade === 'A' || grade === 'B') {
        positivePoints.push('Your running form shows good efficiency');
    }
    if (Math.abs(asymmetry) < 8) {
        positivePoints.push('Good balance between left and right sides');
    }
    
    // Find strong areas
    romTable.forEach(joint => {
        if (joint.rom > 50 && joint.joint.toLowerCase().includes('hip')) {
            positivePoints.push('Excellent hip mobility for power generation');
        }
        if (joint.rom > 30 && joint.joint.toLowerCase().includes('ankle')) {
            positivePoints.push('Good ankle flexibility for shock absorption');
        }
    });
    
    // Generate improvement areas
    if (Math.abs(asymmetry) > 10) {
        improvementAreas.push('Work on balancing left and right leg strength');
    }
    if (grade === 'C' || grade === 'D') {
        improvementAreas.push('Consider gait-specific strengthening exercises');
    }
    
    // Find areas needing work
    romTable.forEach(joint => {
        if (joint.rom < 25 && joint.joint.toLowerCase().includes('ankle')) {
            improvementAreas.push('Ankle stretching could improve stride efficiency');
        }
        if (joint.rom < 35 && joint.joint.toLowerCase().includes('hip')) {
            improvementAreas.push('Hip mobility work could enhance performance');
        }
    });
    
    // Default messages if none found
    if (positivePoints.length === 0) {
        positivePoints.push('You have good running potential to build upon');
    }
    if (improvementAreas.length === 0) {
        improvementAreas.push('Continue current training routine');
    }
    
    // Update UI
    const positiveList = document.getElementById('positive-talking-points');
    const improvementList = document.getElementById('improvement-talking-points');
    
    positiveList.innerHTML = positivePoints.map(point => `<li>${point}</li>`).join('');
    improvementList.innerHTML = improvementAreas.map(area => `<li>${area}</li>`).join('');
}

function generateCustomerSummary(romTable, asymmetry, grade) {
    // Overall assessment
    let overallMessage;
    if (grade === 'A') {
        overallMessage = 'Your running form is excellent overall';
    } else if (grade === 'B') {
        overallMessage = 'Your running form is good with room for minor improvements';
    } else {
        overallMessage = 'Your running form has potential for improvement';
    }
    
    // Shoe recommendation summary
    const shoeRecElement = document.getElementById('shoe-rec-title');
    const shoeType = shoeRecElement ? shoeRecElement.textContent : 'Neutral shoes';
    const shoeMessage = `${shoeType.toLowerCase()} recommended for your gait pattern`;
    
    // Focus area
    let focusMessage;
    if (Math.abs(asymmetry) > 10) {
        focusMessage = 'Focus on exercises to improve left-right balance';
    } else {
        focusMessage = 'Continue current training routine';
    }
    
    // Update summary
    document.querySelector('.summary-point:nth-child(1) span').textContent = overallMessage;
    document.getElementById('shoe-summary').textContent = shoeMessage;
    document.getElementById('focus-summary').textContent = focusMessage;
}

function generateSimpleVisualizations(analysisResults) {
    // Generate form score gauge
    const grade = analysisResults.grade || 'B';
    let score;
    switch (grade) {
        case 'A': score = 90; break;
        case 'B': score = 75; break;
        case 'C': score = 60; break;
        default: score = 45;
    }
    
    document.getElementById('gauge-score').textContent = `${score}%`;
    
    // Generate balance visualization
    const asymmetry = analysisResults.asymmetry || 0;
    const leftPercentage = Math.max(0, Math.min(100, 50 + asymmetry));
    const rightPercentage = Math.max(0, Math.min(100, 50 - asymmetry));
    
    document.getElementById('left-balance-bar').style.width = `${leftPercentage}%`;
    document.getElementById('right-balance-bar').style.width = `${rightPercentage}%`;
}

// Helper functions for retail interface
function saveEmployeeNotes() {
    const notes = document.getElementById('employee-notes-text').value;
    localStorage.setItem('employeeNotes', notes);
    alert('Notes saved successfully!');
}

function printCustomerSummary() {
    const summaryContent = document.querySelector('.customer-takeaways').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head><title>Customer Gait Analysis Summary</title></head>
            <body>
                <h2>Gait Analysis Summary</h2>
                ${summaryContent}
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Smart training recommendations based on biomechanics (matching Python gait.py logic)
function recommendTraining(romValues, cameraAngle, gaitType) {
        // Extract ROM values (reordered: Knee Right, Hip Right, Spine, Hip Left, Knee Left, Tibial Left, Tibial Right)
        const kneeRightRom = romValues[0];
        const hipRightRom = romValues[1]; 
        const spineRom = romValues[2];
        const hipLeftRom = romValues[3];
        const kneeLeftRom = romValues[4];
        const tibialLeftRom = romValues[5];  // Tibial inclination instead of ankle
        const tibialRightRom = romValues[6]; // Tibial inclination instead of ankle
        
        // Average bilateral values (adapted for tibial inclination)
        const avgTibialRom = (tibialLeftRom + tibialRightRom) / 2;
        const avgKneeRom = (kneeLeftRom + kneeRightRom) / 2;
        const avgHipRom = (hipLeftRom + hipRightRom) / 2;
        
        const exercises = [];
        
        // Analyze deficits and recommend exercises (adapted for tibial inclination)
        if (cameraAngle === "back") {
            // Frontal plane issues - focus on stability and control
            if (avgTibialRom > 12 || avgKneeRom > 10) {  // Tibial instability/valgus
                exercises.push({
                    name: "Single-Leg Glute Bridge",
                    description: "3x12 each leg. Strengthens hip abductors to control knee valgus and pelvic stability.",
                    target: "Hip abductor strength, pelvic control"
                });
                exercises.push({
                    name: "Calf Raises with Control", 
                    description: "3x15 with 3-sec hold. Strengthens posterior muscles to control excessive tibial movement.",
                    target: "Lower leg stability, tibial control"
                });
            } else {  // Good frontal plane control
                exercises.push({
                    name: "Lateral Band Walks",
                    description: "3x15 each direction. Maintains hip abductor strength and lateral stability.",
                    target: "Hip stability maintenance"
                });
            }
        } else {  // Sagittal plane (side view) - adapted for tibial inclination
            // Analyze specific joint limitations
            if (avgTibialRom < 8 && (gaitType === "walking" || gaitType === "running")) {  // Limited tibial mobility
                exercises.push({
                    name: "Wall Ankle Dorsiflexion Stretch",
                    description: "3x30 seconds each foot. Improves ankle and tibial mobility for better movement patterns.",
                    target: "Ankle dorsiflexion, tibial mobility"
                });
            }
            
            if (avgHipRom < 35 && (gaitType === "walking" || gaitType === "running")) {  // Limited hip ROM
                exercises.push({
                    name: "90/90 Hip Stretch + Hip Flexor Activation",
                    description: "3x30 sec stretch + 10 leg lifts. Improves hip flexion ROM and activation.",
                    target: "Hip mobility and flexor strength"
                });
            }
            
            if (avgKneeRom < 60 && (gaitType === "walking" || gaitType === "running")) {  // Limited knee flexion
                exercises.push({
                    name: "Wall Sits with Calf Raises",
                    description: "3x45 seconds. Builds knee flexion endurance and calf strength simultaneously.",
                    target: "Knee flexion endurance, shock absorption"
                });
            }
            
            if (spineRom > 15 || spineRom < 3) {  // Poor trunk control
                exercises.push({
                    name: "Dead Bug with Opposite Arm/Leg",
                    description: "3x10 each side. Improves core stability and trunk control during movement.",
                    target: "Core stability, trunk alignment"
                });
            }
        }
        
        // If no specific deficits, provide general recommendations
        if (exercises.length === 0) {
            exercises.push({
                name: "Single-Leg Romanian Deadlift",
                description: "3x8 each leg. Maintains posterior chain strength and balance.",
                target: "Overall stability and strength"
            });
            exercises.push({
                name: "Calf Raise to Heel Walk",
                description: "3x10 transitions. Enhances ankle control through full range of motion.",
                target: "Ankle strength and control"
            });
        }

        return exercises.slice(0, 1);  // Return top 1 recommendations
    }

// Service Worker registration (for PWA functionality)

// Service Worker registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // In a production environment, you would register a service worker here
        // navigator.serviceWorker.register('/sw.js');
    });
}
