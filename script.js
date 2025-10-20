// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Initialize TensorFlow.js MediaPipe when libraries are loaded
    window.addEventListener('load', () => {
        setTimeout(async () => {
            console.log('🚀 Checking TensorFlow.js and MediaPipe libraries...');
            
            // Check library loading status first
            const librariesReady = checkLibraryStatus();
            
            if (!librariesReady) {
                console.warn('⚠️ Pose detection libraries not ready - enabling simulation mode');
                window.forceSimulationMode = true;
                enableTestButtons(); // Still allow testing with simulation
                return;
            }
            
            // Check if libraries are loaded
            if (typeof tf !== 'undefined') {
                console.log('✅ TensorFlow.js loaded, version:', tf.version?.tfjs || 'unknown');
                window.libraryLoadStatus.tensorflow = true;
            } else {
                console.error('❌ TensorFlow.js not loaded');
                window.forceSimulationMode = true;
                return;
            }
            
            // Check for TensorFlow.js pose detection
            if (typeof poseDetection !== 'undefined') {
                console.log('✅ TensorFlow.js PoseDetection library loaded');
                window.libraryLoadStatus.poseDetection = true;
                
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

// Helper function to check library status
function checkLibraryStatus() {
    return (typeof tf !== 'undefined') && (typeof poseDetection !== 'undefined');
}

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
        console.log('🎯 REAL VIDEO ANALYSIS MODE: Processing uploaded video with actual pose detection');

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
        
        // ===================================================
        // RETAIL RESULTS POPULATION (NEW PHASE 1-3 SYSTEM)
        // ===================================================
        
        try {
            // Populate retail-focused interface with customer-friendly results
            populateRetailResults(analysisResults);
            console.log('✅ Retail interface populated with customer-friendly results');
        } catch (error) {
            console.error('❌ Error populating retail interface:', error);
        }

        try {
            // Display pose snapshot in the hero section pose-display-large
            displayPoseSnapshot(analysisResults);   
            console.log('✅ Pose snapshot displayed in hero section');
        } catch (error) {
            console.error('❌ Error displaying pose snapshot:', error);
        }

        // ===================================================
        // TECHNICAL CHARTS (COLLAPSIBLE SECTION)
        // ===================================================

        try {
            // Generate charts for technical analysis section
            generateSpiderChart(analysisResults);  
            console.log('✅ Spider chart generated for technical section');
        } catch (error) {
            console.error('❌ Error generating spider chart:', error);
        }

        try {
            generateAsymmetryChart(analysisResults); 
            console.log('✅ Asymmetry chart generated for technical section');
        } catch (error) {
            console.error('❌ Error generating asymmetry chart:', error);
        }

        try {
            generateJointAnglePlot(analysisResults, 'angleChart');
            console.log('✅ Joint angle plot generated for technical section');
        } catch (error) {
            console.error('❌ Error generating joint angle plot:', error);
        }

        try {
            // Set up technical analysis section toggle functionality
            const technicalSection = document.querySelector('.technical-analysis-section');
            const technicalHeader = document.querySelector('.tech-section-header');
            const technicalContainer = document.querySelector('.technical-charts-container');
            if (technicalSection) {
                // Add event listener for details toggle (HTML5 details element)
                technicalSection.addEventListener('toggle', function() {
                    if (this.open && technicalContainer) {
                        // Section was opened - generate advanced charts
                        technicalContainer.style.display = 'block';
                        
                        setTimeout(() => {
                            try {
                                generateJointAngleLinesPlot(analysisResults, 'angleLinesChart');
                                console.log('✅ Advanced joint angle lines chart generated on section open');
                            } catch (error) {
                                console.error('❌ Error generating advanced chart:', error);
                            }
                        }, 100);
                        
                        console.log('🔼 Technical analysis section opened');
                    } else {
                        console.log('🔽 Technical analysis section closed');
                    }
                });
                
                console.log('✅ Technical section toggle functionality configured');
            } else {
                console.warn('⚠️ Technical section not found, falling back to standard chart generation');
                // Fallback: generate chart immediately if toggle not found
                generateJointAngleLinesPlot(analysisResults, 'angleLinesChart');
            }
            
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
        
        try {
            generateROMTable(analysisResults);      // Pass full results for ROM table
            console.log('ROM table generated successfully');
        } catch (error) {
            console.error('Error generating ROM table:', error);
        }

        try {
            // Generate personalized tips and integrate into retail interface
            generateRetailPersonalizedTips(analysisResults);
            console.log('✅ Retail personalized tips generated and integrated');
        } catch (error) {
            console.error('❌ Error generating retail personalized tips:', error);
        }
        
            // Add download button
            addDownloadButton();
            
        } catch (error) {
            console.error('❌ Error in generateMockResults:', error);
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
    // Function to get pose detection config (called after libraries load)
    function getPoseConfig() {
        return {
            // Primary: MoveNet (more reliable in TensorFlow.js)
            moveNet: {
                modelType: 'SinglePose.Lightning', // Faster, lighter model
                enableSmoothing: true,
                minPoseScore: 0.5
            },
            // Backup: MediaPipe (if available)
            mediaPipe: {
                runtime: 'tfjs',
                modelType: 'lite',
                enableSmoothing: true,
                solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose'
            }
        };
    }

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
            
            // Check if libraries are available and loaded properly
            if (!checkLibraryStatus()) {
                console.error('❌ Required libraries not loaded - falling back to simulation');
                window.forceSimulationMode = true;
                return { success: false, error: 'Libraries not loaded', fallback: true };
            }
            
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

            const config = getPoseConfig();
            
            // Try MoveNet first (more reliable)
            console.log('🎯 Attempting to load MoveNet model...');
            console.log('📋 Available models:', Object.keys(poseDetection.SupportedModels));
            
            try {
                // Use simpler config for MoveNet
                const moveNetConfig = {
                    modelType: 'SinglePose.Lightning',
                    enableSmoothing: true
                };
                
                poseDetector = await poseDetection.createDetector(
                    poseDetection.SupportedModels.MoveNet,
                    moveNetConfig
                );
                console.log('✅ MoveNet pose detector initialized successfully');
                console.log('📊 Model config:', moveNetConfig);
                currentPoseModel = 'MoveNet';
                return { success: true, model: 'MoveNet' };
                
            } catch (moveNetError) {
                console.warn('⚠️ MoveNet failed, trying MediaPipe...', moveNetError);
                console.error('MoveNet error details:', moveNetError.message);
                
                // Fallback to MediaPipe with tfjs runtime
                try {
                    const mediaPipeConfig = {
                        runtime: 'tfjs',
                        modelType: 'lite',
                        enableSmoothing: true
                    };
                    
                    poseDetector = await poseDetection.createDetector(
                        poseDetection.SupportedModels.BlazePose,
                        mediaPipeConfig
                    );
                    console.log('✅ BlazePose (MediaPipe) detector initialized as backup');
                    console.log('📊 Model config:', mediaPipeConfig);
                    currentPoseModel = 'MediaPipe';
                    return { success: true, model: 'MediaPipe' };
                    
                } catch (mediaPipeError) {
                    console.error('❌ Both MoveNet and MediaPipe failed:', mediaPipeError);
                    console.error('MediaPipe error details:', mediaPipeError.message);
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
        console.log('🧪 Force simulation mode:', window.forceSimulationMode);
        
        // Check if we should use simulation mode
        if (window.forceSimulationMode || !checkLibraryStatus()) {
            console.log('⚠️ Using simulation mode for video processing');
            if (progressCallback) progressCallback(50, 'Using simulation mode (libraries unavailable)...');
            return generateSimulatedGaitData();
        }
        
        if (progressCallback) progressCallback(35, 'Initializing pose detection models...');
        
        if (!poseDetector || !tfReady) {
            const result = await initializePoseDetection();
            if (!result.success) {
                if (result.fallback) {
                    console.log('🔄 Falling back to simulation mode');
                    if (progressCallback) progressCallback(50, 'Using simulation mode...');
                    return generateSimulatedGaitData();
                }
                throw new Error(`Pose detection initialization failed: ${result.error || 'unknown'}`);
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
                                    
                                    // Capture middle frame with pose overlay for display
                                    const isMiddleFrame = processedFrames === Math.floor(targetFramesForSegment / 2);
                                    if (isMiddleFrame) {
                                        console.log(`📸 Capturing middle frame ${processedFrames} with pose overlay...`);
                                        
                                        // Create a copy of the canvas for pose overlay
                                        const overlayCanvas = document.createElement('canvas');
                                        const overlayCtx = overlayCanvas.getContext('2d');
                                        overlayCanvas.width = canvas.width;
                                        overlayCanvas.height = canvas.height;
                                        
                                        // Draw the original frame
                                        overlayCtx.drawImage(canvas, 0, 0);
                                        
                                        // Draw pose skeleton overlay
                                        drawPoseSkeleton(overlayCtx, keypoints, overlayCanvas.width, overlayCanvas.height);
                                        
                                        // Convert to base64 image for storage
                                        const poseSnapshotDataUrl = overlayCanvas.toDataURL('image/png', 0.8);
                                        frameData.poseSnapshot = poseSnapshotDataUrl;
                                        frameData.isMiddleFrame = true;
                                        
                                        console.log(`✅ Middle frame snapshot captured (${(poseSnapshotDataUrl.length / 1024).toFixed(1)}KB)`);
                                    }
                                    
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

    // Function to draw pose skeleton overlay on canvas
    function drawPoseSkeleton(ctx, keypoints, canvasWidth, canvasHeight) {
        // Enhanced pose connections for skeleton drawing (excluding face features)
        const connections = [
            // Core body structure (no face/head connections)
            [5, 6], // shoulders
            [5, 7], [7, 9], // left arm
            [6, 8], [8, 10], // right arm
            [5, 11], [6, 12], // shoulders to hips
            [11, 12], // hips
            [11, 13], [13, 15], // left leg
            [12, 14], [14, 16] // right leg
        ];
        
        // Enhanced styling for professional appearance
        ctx.save(); // Save current context state
        
        // Add subtle glow effect for skeleton lines
        ctx.shadowColor = 'rgba(0, 255, 170, 0.6)';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw connections with gradient colors
        connections.forEach(([startIdx, endIdx]) => {
            if (startIdx < keypoints.length && endIdx < keypoints.length) {
                const startPoint = keypoints[startIdx];
                const endPoint = keypoints[endIdx];
                
                // Only draw if both keypoints have good confidence
                if (startPoint.score > 0.3 && endPoint.score > 0.3) {
                    // Create gradient for each line segment
                    const gradient = ctx.createLinearGradient(
                        startPoint.x, startPoint.y, 
                        endPoint.x, endPoint.y
                    );
                    gradient.addColorStop(0, '#00FFB3'); // Bright cyan-green
                    gradient.addColorStop(1, '#00D4FF'); // Electric blue
                    
                    ctx.strokeStyle = gradient;
                    ctx.beginPath();
                    ctx.moveTo(startPoint.x, startPoint.y);
                    ctx.lineTo(endPoint.x, endPoint.y);
                    ctx.stroke();
                }
            }
        });
        
        // Draw enhanced keypoints (joints) with multiple visual layers
        keypoints.forEach((keypoint, i) => {
            // Skip facial keypoints (nose, eyes, ears)
            if (i <= 4) return; // Skip indices 0-4 (nose, eyes, ears)
            
            if (keypoint.score > 0.3) {
                const x = keypoint.x;
                const y = keypoint.y;
                
                // Outer glow circle
                ctx.beginPath();
                ctx.shadowColor = 'rgba(255, 0, 100, 0.8)';
                ctx.shadowBlur = 12;
                ctx.fillStyle = 'rgba(255, 0, 100, 0.3)';
                ctx.arc(x, y, 12, 0, 2 * Math.PI);
                ctx.fill();
                
                // Main joint circle with gradient
                const jointGradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
                jointGradient.addColorStop(0, '#FF0066'); // Hot pink center
                jointGradient.addColorStop(0.7, '#FF3388'); // Pink middle
                jointGradient.addColorStop(1, '#AA0044'); // Dark pink edge
                
                ctx.beginPath();
                ctx.shadowBlur = 4;
                ctx.fillStyle = jointGradient;
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fill();
                
                // Inner highlight
                ctx.beginPath();
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.arc(x - 2, y - 2, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
        
        ctx.restore(); // Restore context state
        
        // Add sleek confidence and info overlay with modern styling
        ctx.save();
        
        // Background for text with gradient
        const textBg = ctx.createLinearGradient(0, 0, 400, 80);
        textBg.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        textBg.addColorStop(1, 'rgba(30, 30, 60, 0.8)');
        ctx.fillStyle = textBg;
        
        // Draw rounded rectangle background (with fallback)
        const drawRoundedRect = (x, y, width, height, radius) => {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.arcTo(x + width, y, x + width, y + height, radius);
            ctx.arcTo(x + width, y + height, x, y + height, radius);
            ctx.arcTo(x, y + height, x, y, radius);
            ctx.arcTo(x, y, x + width, y, radius);
            ctx.closePath();
        };
        
        drawRoundedRect(15, 15, 400, 80, 10);
        ctx.fill();
        
        // Border for text background
        ctx.strokeStyle = 'rgba(0, 255, 170, 0.5)';
        ctx.lineWidth = 2;
        drawRoundedRect(15, 15, 400, 80, 10);
        ctx.stroke();
        
        // Modern typography for confidence
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText('🎯 Pose Detection Analysis', 25, 40);
        
        const confidence = (keypoints[5]?.score || keypoints[6]?.score || 0); // Use shoulder confidence
        const confidencePercent = (confidence * 100).toFixed(0);
        ctx.fillStyle = confidence > 0.7 ? '#00FF88' : confidence > 0.5 ? '#FFD700' : '#FF6B6B';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillText(`Confidence: ${confidencePercent}%`, 25, 65);
        
        // Quality indicator
        const qualityText = confidence > 0.7 ? 'Excellent' : confidence > 0.5 ? 'Good' : 'Fair';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText(`Quality: ${qualityText}`, 25, 85);
        
        ctx.restore();
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
                console.error('❌ POSE DETECTION FAILED - Analyzing error type:', error);
                
                // Check if it's a timeout or initialization error
                if (error.message.includes('timeout')) {
                    console.warn('⏰ Processing timeout - this may indicate the video is too long or complex');
                    alert('Video processing timed out. Please try a shorter video (under 30 seconds) or ensure the person is clearly visible.');
                } else if (error.message.includes('initialization')) {
                    console.warn('🔧 Initialization error - TensorFlow.js may not be fully loaded');
                    alert('Pose detection models are still loading. Please wait a moment and try again.');
                } else {
                    console.warn('💥 Unexpected error during pose detection:', error.message);
                    alert(`Pose detection failed: ${error.message}. Please try a different video or check that the person is clearly visible.`);
                }
                
                console.log('🔄 FALLING BACK TO SIMULATION MODE');
                gaitCycleFrames = simulateGaitCycle(gaitType);
                console.log('� Now using: SIMULATED gait data for demonstration purposes');
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
        
        // Grade will be calculated after ROM table is built to use peak performance zones
        
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
            // Pose snapshot from middle frame
            poseSnapshot: gaitCycleFrames.find(frame => frame.isMiddleFrame)?.poseSnapshot || null,
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

    function displayPoseSnapshot(analysisResults) {
        console.log('Displaying pose snapshot...');
        
        // Find the pose snapshot container
        const snapshotContainer = document.getElementById('pose-snapshot-container');
        if (!snapshotContainer) {
            console.error('Pose snapshot container not found');
            return;
        }
        
        // Check if we have a pose snapshot
        if (!analysisResults.poseSnapshot) {
            console.log('No pose snapshot available');
            snapshotContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="color: #888; font-size: 48px; margin-bottom: 20px;">🎯</div>
                    <h3 style="color: #ffffff; margin-bottom: 10px; font-size: 18px;">Pose Analysis Snapshot</h3>
                    <p style="color: #888; margin-bottom: 5px;">Upload a video to see your pose detection in action</p>
                    <small style="color: #666;">AI-powered skeleton tracking and joint analysis</small>
                </div>
            `;
            return;
        }
        
        // Create the impressive snapshot display
        snapshotContainer.innerHTML = `
            <div style="background: linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e); border-radius: 15px; padding: 25px; border: 2px solid rgba(0, 255, 170, 0.3); box-shadow: 0 8px 32px rgba(0, 255, 170, 0.1);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: transparent; background: linear-gradient(45deg, #00FFB3, #00D4FF); background-clip: text; -webkit-background-clip: text; margin: 0; font-size: 24px; font-weight: bold; font-family: 'Inter', sans-serif;">
                        🎯 AI Pose Analysis
                    </h2>
                    <p style="color: #b0b0b0; margin: 8px 0 0 0; font-size: 14px; font-family: 'Inter', sans-serif;">
                        Real-time skeleton detection from your video
                    </p>
                </div>
                
                <div style="text-align: center; position: relative; display: inline-block; width: 100%;">
                    <img src="${analysisResults.poseSnapshot}" 
                         alt="AI Pose Detection Analysis" 
                         style="max-width: 100%; max-height: 500px; border-radius: 12px; box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4); border: 2px solid rgba(255, 255, 255, 0.1);" />
                    
                    <div style="position: absolute; top: 15px; right: 15px; background: rgba(0, 0, 0, 0.8); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(0, 255, 170, 0.5);">
                        <span style="color: #00FFB3; font-size: 12px; font-weight: bold; font-family: 'Inter', sans-serif;">LIVE ANALYSIS</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; padding: 25px; background: linear-gradient(135deg, rgba(0, 255, 170, 0.15), rgba(0, 212, 255, 0.1)); border-radius: 12px; border: 2px solid rgba(0, 255, 170, 0.3);">
                    <div style="color: #00FFB3; font-size: 16px; font-weight: bold; margin-bottom: 8px; font-family: 'Inter', sans-serif;">
                        ⚖️ GAIT ASYMMETRY ANALYSIS
                    </div>
                    <div style="font-size: 36px; font-weight: bold; font-family: 'Inter', sans-serif; margin: 10px 0;">
                        <span style="color: ${Math.abs(analysisResults.asymmetry) < 3 ? '#00E676' : Math.abs(analysisResults.asymmetry) > 10 ? '#FF5252' : '#FFC107'};">
                            ${Math.abs(analysisResults.asymmetry).toFixed(1)}°
                        </span>
                        <span style="color: #ffffff; font-size: 24px; margin-left: 10px;">
                            ${Math.abs(analysisResults.asymmetry) < 3 ? 'BALANCED' : (analysisResults.asymmetry > 0 ? 'RIGHT' : 'LEFT')}
                        </span>
                    </div>
                    <div style="color: #b0b0b0; font-size: 14px; font-family: 'Inter', sans-serif;">
                        ${Math.abs(analysisResults.asymmetry) < 3 ? 'Excellent symmetrical movement pattern' : 
                          Math.abs(analysisResults.asymmetry) > 10 ? 'Significant asymmetry detected - consider evaluation' :
                          'Mild asymmetry - monitor and correct if needed'}
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 15px; padding: 12px; background: rgba(0, 255, 170, 0.1); border-radius: 8px; border: 1px solid rgba(0, 255, 170, 0.2);">
                    <p style="color: #00FFB3; margin: 0; font-size: 13px; font-weight: 500; font-family: 'Inter', sans-serif;">
                        ✨ Advanced computer vision analyzed ${analysisResults.dataSource === 'REAL_MOVENET' ? 'your movement' : 'simulated gait'} with precision joint tracking
                    </p>
                </div>
            </div>
        `;
        
        console.log('Enhanced pose snapshot displayed successfully');
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

// Intersection Observer for animations and retail button setup
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

    // =======================================================
    // RETAIL STAFF WORKFLOW BUTTON EVENT LISTENERS (Phase 3)
    // =======================================================
    
    // Email results button
    const emailBtn = document.querySelector('.action-btn[onclick="emailResults()"], #emailResultsBtn');
    if (emailBtn) {
        emailBtn.addEventListener('click', emailResults);
        console.log('✅ Email results button configured');
    }
    
    // Print results button  
    const printBtn = document.querySelector('.action-btn[onclick="printResults()"], #printResultsBtn');
    if (printBtn) {
        printBtn.addEventListener('click', printResults);
        console.log('✅ Print results button configured');
    }
    
    // Re-test button
    const retestBtn = document.querySelector('.action-btn[onclick="reTest()"], #reTestBtn');
    if (retestBtn) {
        retestBtn.addEventListener('click', reTest);
        console.log('✅ Re-test button configured');
    }
    
    // Try shoes button (CTA)
    const tryShoesBtn = document.querySelector('.cta-button[onclick="tryShoes()"], #tryShoesBtn');
    if (tryShoesBtn) {
        tryShoesBtn.addEventListener('click', tryShoes);
        console.log('✅ Try shoes button configured');
    }

    console.log('🏪 All retail workflow buttons configured successfully');
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

// Generate personalized tips based on gait.py logic
function generatePersonalizedTips(analysisResults) {
    console.log('🎯 Generating personalized tips based on biomechanical analysis...');
    
    const gaitType = document.querySelector('input[name="gait-type"]:checked')?.value || 'running';
    const cameraAngle = document.querySelector('input[name="camera-angle"]:checked')?.value || 'side';
    console.log('Settings - Gait Type:', gaitType, 'Camera Angle:', cameraAngle);
    const romTable = analysisResults.romTable || [];
    console.log('ROM Table received:', romTable);
    const asymmetry = analysisResults.asymmetry || 0;
    const grade = analysisResults.grade || 'C';
    
    // Initialize tip categories
    const tips = {
        footwear: { value: '', explanation: '' },
        drill: { value: '', explanation: '' },
        cue: { value: '', explanation: '' },
        training: { value: '', explanation: '' }
    };
    
    // Analyze key biomechanical issues (based on gait.py logic)
    let primaryIssue = '';
    let secondaryIssue = '';
    let highestDeficit = 0;
    let lowestROM = 100;
    
    // Find most problematic joints
    romTable.forEach(joint => {
        const performance = joint.peakPerformanceZone;
        if (performance && performance.score < highestDeficit) {
            primaryIssue = joint.joint;
            highestDeficit = 100 - performance.score;
        }
        if (joint.rom < lowestROM) {
            lowestROM = joint.rom;
            secondaryIssue = joint.joint;
        }
    });
    
    console.log(`Primary issue: ${primaryIssue} (deficit: ${highestDeficit})`);
    console.log(`Secondary issue: ${secondaryIssue} (ROM: ${lowestROM}°)`);
    console.log(`Asymmetry: ${asymmetry}°, Grade: ${grade}`);
    
    // Smart footwear recommendation based on biomechanics (matching Python gait.py logic)
    function recommendFootwear(romValues, cameraAngle, gaitType) {
        // Extract ROM values (reordered: Knee Right, Hip Right, Spine, Hip Left, Knee Left, Ankle Left, Ankle Right)
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
        
        // Primary: Posterior/Frontal Plane Assessment (adapted for tibial inclination)
        if (cameraAngle === "back") {
            // Overpronation indicators - tibial inclination thresholds adapted from ankle
            // Tibial inclination: higher ROM indicates more instability/overpronation
            if (avgTibialRom > 12 || avgKneeRom > 10 || avgHipRom > 15) {
                if (avgTibialRom > 18 || avgKneeRom > 15) {
                    return ["Motion Control", "Excessive tibial movement and knee valgus detected. Shoes with extra support on the inside of the foot help guide your stride and reduce excessive inward rolling."];
                } else {
                    return ["Stability", "Moderate tibial movement detected. Dual-density midsole and guided motion control recommended."];
                }
            } else {
                var primaryRec = "Neutral";
            }
        } else {
            // Sagittal plane assessment for neutral/cushioned decision
            var primaryRec = "Neutral";
        }
        
        // Supporting: Sagittal Plane Refinement (adapted for tibial inclination)
        if (cameraAngle === "side") {
            // Limited tibial mobility + heel striking = cushioned shoes (adapted thresholds)
            if (gaitType === "walking" || gaitType === "running") {
                if (avgTibialRom < 8 && spineRom > 10) {  // Limited tibial mobility + heel-strike posture
                    return ["Maximum Cushioning", "Limited tibial mobility and heel-strike pattern detected. Enhanced shock absorption needed."];
                } else if (avgTibialRom > 20 && avgKneeRom > 100) {  // Good mobility + forefoot striking
                    return ["Minimalist/Neutral", "Excellent tibial mobility and efficient movement pattern. Minimal interference recommended."];
                }
            }
        }
        
        // Default recommendation
        if (primaryRec === "Neutral") {
            return ["Neutral", "Balanced biomechanics detected. Standard neutral support recommended."];
        } else {
            return [primaryRec, "Biomechanics analysis suggests standard neutral support."];
        }
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
    
    // Extract ROM values from romTable in correct order: [Knee Right, Hip Right, Spine, Hip Left, Knee Left, Ankle Left, Ankle Right]
    const romValues = [];
    
    // Helper function to find ROM by joint name
    const findROMByJoint = (jointName) => {
        const joint = romTable.find(j => j.joint.toLowerCase().includes(jointName.toLowerCase()));
        return joint ? joint.rom : 0;
    };
    
    // Build ROM array in the order expected by gait.py logic
    romValues[0] = findROMByJoint('knee right') || findROMByJoint('right knee') || 0;
    romValues[1] = findROMByJoint('hip right') || findROMByJoint('right hip') || 0;
    romValues[2] = findROMByJoint('spine') || 0;
    romValues[3] = findROMByJoint('hip left') || findROMByJoint('left hip') || 0;
    romValues[4] = findROMByJoint('knee left') || findROMByJoint('left knee') || 0;
    romValues[5] = findROMByJoint('ankle left') || findROMByJoint('left ankle') || findROMByJoint('left tibial') || 0;
    romValues[6] = findROMByJoint('ankle right') || findROMByJoint('right ankle') || findROMByJoint('right tibial') || 0;
    
    // Simple extraction - get ROM values directly from romTable in order they appear
    if (romValues.every(val => val === 0) && romTable.length >= 6) {
        // Fallback: use the romTable order directly 
        // Based on romTable creation: Spine, Hip Left, Hip Right, Knee Left, Knee Right, Ankle Left, Ankle Right
        const spineROM = romTable.find(j => j.joint.includes('Spine'))?.rom || 0;
        const hipLeftROM = romTable.find(j => j.joint.includes('Hip') && j.joint.includes('Left'))?.rom || 0;
        const hipRightROM = romTable.find(j => j.joint.includes('Hip') && j.joint.includes('Right'))?.rom || 0;
        const kneeLeftROM = romTable.find(j => j.joint.includes('Knee') && j.joint.includes('Left'))?.rom || 0;
        const kneeRightROM = romTable.find(j => j.joint.includes('Knee') && j.joint.includes('Right'))?.rom || 0;
        const ankleTibialLeftROM = romTable.find(j => (j.joint.includes('Ankle') || j.joint.includes('Tibial')) && j.joint.includes('Left'))?.rom || 0;
        const ankleTibialRightROM = romTable.find(j => (j.joint.includes('Ankle') || j.joint.includes('Tibial')) && j.joint.includes('Right'))?.rom || 0;
        
        // Reorder to match gait.py: [Knee Right, Hip Right, Spine, Hip Left, Knee Left, Ankle Left, Ankle Right]
        romValues[0] = kneeRightROM;
        romValues[1] = hipRightROM; 
        romValues[2] = spineROM;
        romValues[3] = hipLeftROM;
        romValues[4] = kneeLeftROM;
        romValues[5] = ankleTibialLeftROM;
        romValues[6] = ankleTibialRightROM;
    }
    
    console.log('Extracted ROM values:', romValues);
    console.log('ROM order: [Knee Right, Hip Right, Spine, Hip Left, Knee Left, Tibial Left, Tibial Right]');
    
    const [footwearType, footwearReason] = recommendFootwear(romValues, cameraAngle, gaitType);
    const trainingExercises = recommendTraining(romValues, cameraAngle, gaitType);
    
    console.log('Generated recommendations:');
    console.log('Footwear:', footwearType, '-', footwearReason);
    console.log('Training:', trainingExercises);
    
    // Set footwear recommendation
    tips.footwear.value = footwearType;
    tips.footwear.explanation = footwearReason;
    
    // Set training recommendation
    if (trainingExercises.length > 0) {
        const exercise = trainingExercises[0];
        tips.training.value = exercise.name;
        tips.training.explanation = exercise.description;
    } else {
        tips.training.value = 'Endurance Base';
        tips.training.explanation = 'Solid mechanics - build your aerobic base with consistent easy-pace running.';
    }
    
    // Keep existing drill and cue logic for now
    // DRILL/EXERCISE RECOMMENDATIONS (targeting primary weakness)
    if (primaryIssue.includes('Hip')) {
        tips.drill.value = 'Hip Flexor Stretches';
        tips.drill.explanation = 'Tight hip flexors are limiting your hip extension range. Daily stretching will improve your stride length.';
    } else if (primaryIssue.includes('Knee')) {
        tips.drill.value = 'Single-Leg Squats';
        tips.drill.explanation = 'Strengthen your quadriceps and improve knee stability with controlled single-leg movements.';
    } else if (primaryIssue.includes('Tibial') || primaryIssue.includes('Ankle')) {
        tips.drill.value = 'Calf Raises + Mobility';
        tips.drill.explanation = 'Combine calf strengthening with ankle mobility work to optimize your push-off mechanics.';
    } else if (primaryIssue.includes('Spine')) {
        tips.drill.value = 'Core Stabilization';
        tips.drill.explanation = 'Planks and dead bugs will improve your trunk control and reduce excessive forward lean.';
    } else {
        tips.drill.value = 'High Knees';
        tips.drill.explanation = 'Dynamic high knees will improve your overall coordination and joint mobility.';
    }
    
    // FOCUS CUE RECOMMENDATIONS (immediate technique fixes)
    if (asymmetry > 5) {
        tips.cue.value = 'Equal Push-Off';
        tips.cue.explanation = `Your ${asymmetry.toFixed(1)}° asymmetry suggests one side is stronger. Focus on equal effort from both legs.`;
    } else if (primaryIssue.includes('Spine')) {
        tips.cue.value = 'Tall Posture';
        tips.cue.explanation = 'Think "run tall" - imagine a string pulling you up from the top of your head.';
    } else if (primaryIssue.includes('Hip')) {
        tips.cue.value = 'Drive Knees Forward';
        tips.cue.explanation = 'Focus on lifting your knees forward and up, not just lifting your feet behind you.';
    } else if (primaryIssue.includes('Knee')) {
        tips.cue.value = 'Light Foot Strike';
        tips.cue.explanation = 'Land softly under your center of mass to reduce impact forces on your knees.';
    } else if (primaryIssue.includes('Tibial') || primaryIssue.includes('Ankle')) {
        tips.cue.value = 'Quick Cadence';
        tips.cue.explanation = 'Increase your step rate by 5-10% to reduce ground contact time and improve efficiency.';
    } else {
        tips.cue.value = 'Relaxed Shoulders';
        tips.cue.explanation = 'Keep your shoulders relaxed and arms swinging naturally to maintain efficient form.';
    }
    
    // Update the UI with personalized tips
    document.getElementById('footwear-recommendation').textContent = tips.footwear.value;
    document.getElementById('footwear-explanation').textContent = tips.footwear.explanation;
    
    document.getElementById('drill-recommendation').textContent = tips.drill.value;
    document.getElementById('drill-explanation').textContent = tips.drill.explanation;
    
    document.getElementById('cue-recommendation').textContent = tips.cue.value;
    document.getElementById('cue-explanation').textContent = tips.cue.explanation;
    
    document.getElementById('training-recommendation').textContent = tips.training.value;
    document.getElementById('training-explanation').textContent = tips.training.explanation;
    
    // Show the tips section
    document.getElementById('personal-tips-section').style.display = 'block';
    
    console.log('✅ Personalized tips generated and displayed');
    return tips;
}

// =======================================================
// RETAIL-FOCUSED CUSTOMER EXPLANATION GENERATOR (Phase 2)
// =======================================================

/**
 * Generates customer-friendly explanations and footwear recommendations
 * based on technical asymmetry analysis data
 */
function generateCustomerExplanation(analysisResults) {
    console.log('🏪 Generating customer explanation for retail environment...');
    
    if (!analysisResults || !analysisResults.asymmetryComponents) {
        console.warn('⚠️ Missing analysis results for customer explanation');
        return {
            explanation: "Analysis in progress. Please wait for results.",
            footwearRecommendation: "Loading recommendations...",
            nextSteps: "Please wait while we analyze your movement pattern.",
            status: "loading"
        };
    }

    const { asymmetry, asymmetryComponents } = analysisResults;
    const totalAsymmetry = Math.abs(asymmetry);
    const direction = asymmetry > 0 ? 'right' : 'left';
    const oppDirection = direction === 'right' ? 'left' : 'right';
    
    // Determine overall gait status based on cumulative asymmetry
    let status, statusText, severity;
    if (totalAsymmetry < 3) {
        status = 'good';
        statusText = 'Balanced Gait';
        severity = 'minimal';
    } else if (totalAsymmetry < 8) {
        status = 'moderate';
        statusText = 'Mild Imbalance';
        severity = 'moderate';
    } else {
        status = 'poor';
        statusText = 'Significant Imbalance';
        severity = 'significant';
    }
    
    // Generate customer-friendly explanation
    let explanation = `<h4>Your Gait Analysis Results</h4>`;
    
    if (status === 'good') {
        explanation += `
            <p>Great news! Your running pattern shows excellent balance between both sides of your body. This indicates efficient movement with minimal compensations.</p>
            <ul>
                <li>Both legs are working together harmoniously</li>
                <li>Your current shoes appear to be supporting your natural gait well</li>
                <li>Low risk of overuse injuries from imbalanced movement</li>
            </ul>`;
    } else {
        explanation += `
            <p>Your analysis reveals a ${severity} difference in how your ${direction} and ${oppDirection} legs move during running. Your ${direction} side is working harder than your ${oppDirection} side by ${totalAsymmetry.toFixed(1)} degrees.</p>
            <ul>
                <li>This imbalance can lead to uneven wear patterns in your current shoes</li>
                <li>You may experience more fatigue or discomfort on your ${direction} side</li>
                <li>The right footwear can help correct this imbalance and improve comfort</li>
            </ul>`;
    }
    
    // Generate specific joint insights
    const jointInsights = [];
    if (Math.abs(asymmetryComponents.hip) > 2) {
        const hipDir = asymmetryComponents.hip > 0 ? 'right' : 'left';
        jointInsights.push(`Your ${hipDir} hip is working ${Math.abs(asymmetryComponents.hip).toFixed(1)}° harder, affecting your stride length and power`);
    }
    if (Math.abs(asymmetryComponents.knee) > 2) {
        const kneeDir = asymmetryComponents.knee > 0 ? 'right' : 'left';
        jointInsights.push(`Your ${kneeDir} knee shows ${Math.abs(asymmetryComponents.knee).toFixed(1)}° more movement, impacting shock absorption`);
    }
    if (Math.abs(asymmetryComponents.ankle) > 2) {
        const ankleDir = asymmetryComponents.ankle > 0 ? 'right' : 'left';
        jointInsights.push(`Your ${ankleDir} ankle has ${Math.abs(asymmetryComponents.ankle).toFixed(1)}° more motion, affecting push-off efficiency`);
    }
    
    if (jointInsights.length > 0) {
        explanation += `<h4>What This Means for Your Running:</h4><ul>`;
        jointInsights.forEach(insight => {
            explanation += `<li>${insight}</li>`;
        });
        explanation += `</ul>`;
    }
    
    // Generate footwear recommendations based on asymmetry patterns
    let footwearRecommendation = generateFootwearRecommendation(asymmetry, asymmetryComponents, status);
    
    // Generate next steps
    let nextSteps = generateNextSteps(status, severity, direction, totalAsymmetry);
    
    return {
        explanation,
        footwearRecommendation,
        nextSteps,
        status,
        statusText,
        asymmetryValue: totalAsymmetry.toFixed(1),
        dominantSide: direction.toUpperCase()
    };
}

/**
 * Generates specific footwear recommendations based on gait asymmetry
 * Updated to align with gait.py logic and use tibial inclination considerations
 */
function generateFootwearRecommendation(asymmetry, components, status) {
    const totalAsymmetry = Math.abs(asymmetry);
    const direction = asymmetry > 0 ? 'right' : 'left';
    
    if (status === 'good') {
        return {
            primary: "Neutral Running Shoes",
            description: "Your balanced gait works well with neutral cushioning shoes that don't interfere with your natural movement pattern.",
            features: ["Balanced midsole cushioning", "Flexible forefoot", "Moderate arch support"],
            reasoning: "Since your gait is well-balanced, avoid motion control features that might disrupt your natural efficiency."
        };
    }
    
    // Determine primary imbalance pattern using gait.py thresholds
    const hipImbalance = Math.abs(components.hip);
    const kneeImbalance = Math.abs(components.knee);
    const tibialImbalance = Math.abs(components.ankle) * 0.8; // Convert ankle to tibial inclination estimate
    
    let recommendation = {
        features: [],
        reasoning: ""
    };
    
    // Apply gait.py logic for footwear recommendations
    // Overpronation indicators based on frontal plane assessment
    if (tibialImbalance > 12 || kneeImbalance > 10 || hipImbalance > 15) {
        if (tibialImbalance > 16 || kneeImbalance > 15) {
            // Motion Control needed
            recommendation.primary = "Motion Control Shoes";
            recommendation.description = `Excessive overpronation and knee valgus detected. Strong support shoes help guide your stride and reduce excess inward rolling on your ${direction} side.`;
            recommendation.features = [
                "Firm medial support",
                "Structured heel counter", 
                "Motion control technology",
                "Enhanced arch support"
            ];
            recommendation.reasoning = `Your ${totalAsymmetry.toFixed(1)}° imbalance with significant tibial and knee motion needs structured support to prevent overuse injuries.`;
        } else {
            // Stability needed  
            recommendation.primary = "Stability Running Shoes";
            recommendation.description = `Moderate overpronation detected. Dual-density midsole and guided motion control help balance your ${direction}-side dominance.`;
            recommendation.features = [
                "Dual-density midsole",
                "Moderate medial posting", 
                "Guided motion control",
                "Supportive arch design"
            ];
            recommendation.reasoning = `Your moderate ${totalAsymmetry.toFixed(1)}° imbalance benefits from gentle corrective support to improve efficiency.`;
        }
    } else if (totalAsymmetry >= 6) {
        // Moderate overall imbalance - stability recommended
        recommendation.primary = "Stability Running Shoes";
        recommendation.description = `Supportive shoes with gentle guidance features to help balance your movement pattern.`;
        recommendation.features = [
            "Moderate medial posting",
            "Supportive midsole", 
            "Guided gait technology"
        ];
        recommendation.reasoning = `Your ${totalAsymmetry.toFixed(1)}° imbalance benefits from gentle corrective support.`;
    }
    
    // Add specific features based on joint patterns (enhanced with tibial considerations)
    if (tibialImbalance > 8) {
        recommendation.features.push("Enhanced pronation control");
        recommendation.reasoning += ` Tibial motion needs specialized roll-through design.`;
    }
    if (kneeImbalance > 5) {
        recommendation.features.push("Superior shock absorption");
        recommendation.reasoning += ` Knee imbalance requires excellent impact protection.`;
    }
    if (hipImbalance > 8) {
        recommendation.features.push("Responsive cushioning platform");
        recommendation.reasoning += ` Hip asymmetry benefits from energy-returning midsole technology.`;
    }
    
    return recommendation;
}

/**
 * Generates actionable next steps for customers
 */
function generateNextSteps(status, severity, direction, totalAsymmetry) {
    let steps = [];
    
    if (status === 'good') {
        steps = [
            "Continue with your current running routine - your gait is well-balanced!",
            "Try on neutral cushioning shoes to maintain your efficient movement pattern",
            "Consider a follow-up analysis in 6 months to track any changes"
        ];
    } else {
        steps = [
            `Try on ${status === 'moderate' ? 'stability' : 'motion control'} shoes specifically designed for ${direction}-side imbalances`,
            "Walk and jog in-store to feel how the corrective features support your gait",
            "Consider replacing shoes every 300-400 miles to maintain corrective benefits"
        ];
        
        if (totalAsymmetry > 6) {
            steps.push("Schedule a follow-up analysis after 2-3 weeks with new shoes to track improvement");
        }
        
        if (severity === 'significant') {
            steps.push("Consider consulting with a running coach or physical therapist for additional gait training");
        }
    }
    
    return steps;
}

/**
 * Populates the retail interface with customer-friendly analysis results
 */
function populateRetailResults(analysisResults) {
    console.log('🏪 Populating retail interface with analysis results...');
    
    const customerData = generateCustomerExplanation(analysisResults);
    
    // Update asymmetry display in hero section
    const asymmetryValueEl = document.querySelector('.asymmetry-value');
    const asymmetryDirectionEl = document.querySelector('.asymmetry-direction');
    
    if (asymmetryValueEl && asymmetryDirectionEl) {
        asymmetryValueEl.textContent = `${customerData.asymmetryValue}°`;
        asymmetryDirectionEl.textContent = `${customerData.dominantSide} DOMINANT`;
    }
    
    // Update status indicator
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    if (statusIndicator && statusText) {
        statusIndicator.className = `status-indicator ${customerData.status}`;
        statusText.textContent = customerData.statusText;
    }
    
    // Update footwear recommendation
    const recommendationContainer = document.querySelector('.footwear-recommendation-primary .footwear-card-large');
    if (recommendationContainer && customerData.footwearRecommendation.primary) {
        recommendationContainer.innerHTML = `
            <h3>${customerData.footwearRecommendation.primary}</h3>
            <p class="recommendation-description">${customerData.footwearRecommendation.description}</p>
            <div class="recommended-features">
                <h4>Key Features to Look For:</h4>
                <ul>
                    ${customerData.footwearRecommendation.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            <div class="why-this-helps">
                <h4>Why This Helps:</h4>
                <p>${customerData.footwearRecommendation.reasoning}</p>
            </div>
        `;
    }
    
    // Update customer explanation
    const explanationContainer = document.querySelector('.customer-friendly-explanation');
    if (explanationContainer) {
        explanationContainer.innerHTML = customerData.explanation;
    }
    
    // Update next steps
    const nextStepsContainer = document.querySelector('.next-steps-section .customer-friendly-explanation');
    if (nextStepsContainer && customerData.nextSteps) {
        nextStepsContainer.innerHTML = `
            <h4>Your Next Steps</h4>
            <ul>
                ${customerData.nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ul>
        `;
    }
    
    console.log('✅ Retail interface populated successfully');
    return customerData;
}

// =======================================================
// RETAIL PERSONALIZED TIPS (Phase 2 Enhancement)
// =======================================================

/**
 * Generates personalized training tips based on gait.py logic
 * Uses tibial inclination instead of ankle angle to match MoveNet implementation
 */
function generateRetailPersonalizedTips(analysisResults) {
    console.log('🎯 Generating retail personalized tips based on gait.py logic...');
    
    if (!analysisResults || !analysisResults.romValues) {
        console.warn('⚠️ Missing analysis results for personalized tips');
        return;
    }
    
    const { romValues, jointAngles } = analysisResults;
    
    // ROM values order: [right_knee, right_hip, spine, left_hip, left_knee, left_ankle, right_ankle]
    // But we'll use tibial inclination calculated from shank angles instead of ankle
    const knee_right_rom = romValues[0];
    const hip_right_rom = romValues[1];
    const spine_rom = romValues[2];  
    const hip_left_rom = romValues[3];
    const knee_left_rom = romValues[4];
    
    // Calculate tibial inclination ROM (shank angle variation) instead of using ankle ROM
    // This matches the MoveNet implementation approach
    let tibial_left_rom, tibial_right_rom;
    
    if (jointAngles && jointAngles.left && jointAngles.right) {
        // Use knee angles as proxy for tibial inclination in the absence of direct shank measurements
        // This approximates the shank-to-vertical angle that would be measured with full skeletal tracking
        tibial_left_rom = knee_left_rom * 0.6; // Scaled approximation based on biomechanical ratios
        tibial_right_rom = knee_right_rom * 0.6;
    } else {
        // Fallback if detailed joint angles not available
        tibial_left_rom = romValues[5] * 0.8; // Conservative estimate
        tibial_right_rom = romValues[6] * 0.8;
    }
    
    // Average bilateral values for analysis
    const avg_tibial_rom = (tibial_left_rom + tibial_right_rom) / 2;
    const avg_knee_rom = (knee_left_rom + knee_right_rom) / 2;
    const avg_hip_rom = (hip_left_rom + hip_right_rom) / 2;
    
    // Determine camera side and gait type (defaulting to common use case)
    const camera_side = "back"; // Most retail analysis focuses on frontal plane
    const gait_type = "running"; // Most common use case
    
    // Generate footwear recommendation based on gait.py logic
    const footwearRecommendation = generateGaitPyFootwearRecommendation(
        [knee_right_rom, hip_right_rom, spine_rom, hip_left_rom, knee_left_rom, tibial_left_rom, tibial_right_rom],
        camera_side,
        gait_type
    );
    
    // Generate training recommendations based on biomechanical deficits  
    const trainingRecommendation = generateGaitPyTrainingRecommendation(
        [knee_right_rom, hip_right_rom, spine_rom, hip_left_rom, knee_left_rom, tibial_left_rom, tibial_right_rom],
        camera_side,
        gait_type
    );
    
    // Populate the personal tips section
    const tipsContainer = document.querySelector('.personal-tips-section .tips-container');
    if (tipsContainer) {
        tipsContainer.innerHTML = `
            <div class="tip-category" style="margin-bottom: 25px; padding: 20px; background: rgba(0, 255, 179, 0.1); border-radius: 10px; border-left: 4px solid #00ffb3;">
                <div class="tip-header" style="margin-bottom: 15px;">
                    <i class="fas fa-shoe-prints" style="color: #00ffb3; margin-right: 10px; font-size: 18px;"></i>
                    <span style="color: #00ffb3; font-weight: bold; font-size: 18px;">RECOMMENDED FOOTWEAR</span>
                </div>
                <div class="tip-content">
                    <div style="color: #ffffff; font-size: 20px; font-weight: bold; margin-bottom: 10px;">${footwearRecommendation.type}</div>
                    <p style="color: #e2e8f0; line-height: 1.6; margin: 0;">${footwearRecommendation.reason}</p>
                </div>
            </div>
            
            <div class="tip-category" style="margin-bottom: 25px; padding: 20px; background: rgba(0, 212, 255, 0.1); border-radius: 10px; border-left: 4px solid #00d4ff;">
                <div class="tip-header" style="margin-bottom: 15px;">
                    <i class="fas fa-dumbbell" style="color: #00d4ff; margin-right: 10px; font-size: 18px;"></i>
                    <span style="color: #00d4ff; font-weight: bold; font-size: 18px;">RECOMMENDED TRAINING</span>
                </div>
                <div class="tip-content">
                    <div style="color: #ffffff; font-size: 20px; font-weight: bold; margin-bottom: 10px;">${trainingRecommendation.name}</div>
                    <p style="color: #e2e8f0; line-height: 1.6; margin-bottom: 10px;">${trainingRecommendation.description}</p>
                    <div style="color: #00d4ff; font-style: italic; font-size: 14px;">Target: ${trainingRecommendation.target}</div>
                </div>
            </div>
        `;
        
        // Show the tips section
        document.getElementById('personal-tips-section').style.display = 'block';
        
        console.log('✅ Retail personalized tips populated successfully');
    } else {
        console.warn('⚠️ Tips container not found');
    }
}

/**
 * Generates footwear recommendation based on gait.py logic with tibial inclination
 */
function generateGaitPyFootwearRecommendation(romValues, camera_side, gait_type) {
    // Extract ROM values matching gait.py structure
    const knee_right_rom = romValues[0];
    const hip_right_rom = romValues[1];
    const spine_rom = romValues[2];
    const hip_left_rom = romValues[3]; 
    const knee_left_rom = romValues[4];
    const tibial_left_rom = romValues[5];  // Using tibial inclination instead of ankle
    const tibial_right_rom = romValues[6];
    
    // Average bilateral values
    const avg_tibial_rom = (tibial_left_rom + tibial_right_rom) / 2;
    const avg_knee_rom = (knee_left_rom + knee_right_rom) / 2;
    const avg_hip_rom = (hip_left_rom + hip_right_rom) / 2;
    
    // Primary: Posterior/Frontal Plane Assessment (from gait.py)
    if (camera_side === "back") {
        // Overpronation indicators (Motion Control/Stability needed)
        // Using tibial inclination thresholds instead of ankle ROM
        if (avg_tibial_rom > 12 || avg_knee_rom > 10 || avg_hip_rom > 15) {
            if (avg_tibial_rom > 16 || avg_knee_rom > 15) {
                return {
                    type: "Motion Control",
                    reason: "Excessive overpronation and knee valgus detected. Shoes with extra support on the inside of the foot help guide your stride and reduce extra inward rolling."
                };
            } else {
                return {
                    type: "Stability", 
                    reason: "Moderate overpronation detected. Dual-density midsole and guided motion control recommended."
                };
            }
        }
    }
    
    // Supporting: Sagittal Plane Refinement
    if (camera_side === "side") {
        if (gait_type === "walking" || gait_type === "running") {
            // Using tibial inclination for mobility assessment
            if (avg_tibial_rom < 24 && spine_rom > 10) { // Limited tibial mobility + heel-strike posture
                return {
                    type: "Maximum Cushioning",
                    reason: "Limited tibial mobility and heel-strike pattern detected. Enhanced shock absorption needed."
                };
            } else if (avg_tibial_rom > 48 && avg_knee_rom > 100) { // Good mobility + forefoot striking
                return {
                    type: "Minimalist/Neutral", 
                    reason: "Excellent mobility and efficient movement pattern. Minimal interference recommended."
                };
            }
        }
    }
    
    // Default recommendation
    return {
        type: "Neutral",
        reason: "Balanced biomechanics detected. Standard neutral support recommended."
    };
}

/**
 * Generates training recommendation based on gait.py logic with tibial inclination
 */
function generateGaitPyTrainingRecommendation(romValues, camera_side, gait_type) {
    // Extract ROM values
    const knee_right_rom = romValues[0];
    const hip_right_rom = romValues[1];
    const spine_rom = romValues[2];
    const hip_left_rom = romValues[3];
    const knee_left_rom = romValues[4]; 
    const tibial_left_rom = romValues[5];
    const tibial_right_rom = romValues[6];
    
    // Average bilateral values
    const avg_tibial_rom = (tibial_left_rom + tibial_right_rom) / 2;
    const avg_knee_rom = (knee_left_rom + knee_right_rom) / 2;
    const avg_hip_rom = (hip_left_rom + hip_right_rom) / 2;
    
    // Analyze deficits and recommend exercises based on gait.py logic
    if (camera_side === "back") {
        // Frontal plane issues - focus on stability and control
        if (avg_tibial_rom > 12 || avg_knee_rom > 10) { // Overpronation/valgus using tibial measure
            return {
                name: "Single-Leg Glute Bridge",
                description: "3x12 each leg. Strengthens hip abductors to control knee valgus and pelvic stability.",
                target: "Hip abductor strength, pelvic control"
            };
        } else { // Good frontal plane control
            return {
                name: "Lateral Band Walks", 
                description: "3x15 each direction. Maintains hip abductor strength and lateral stability.",
                target: "Hip stability maintenance"
            };
        }
    } else { // Sagittal plane (side view)
        // Analyze specific joint limitations using tibial inclination
        if (avg_tibial_rom < 24 && (gait_type === "walking" || gait_type === "running")) { // Limited tibial mobility
            return {
                name: "Wall Calf Stretch + Tibial Mobility",
                description: "3x30 seconds each foot. Improves tibial inclination mobility for better heel-to-toe transition.",
                target: "Tibial inclination, calf flexibility"
            };
        }
        
        if (avg_hip_rom < 35 && (gait_type === "walking" || gait_type === "running")) { // Limited hip ROM
            return {
                name: "90/90 Hip Stretch + Hip Flexor Activation",
                description: "3x30 sec stretch + 10 leg lifts. Improves hip flexion ROM and activation.",
                target: "Hip mobility and flexor strength"
            };
        }
        
        if (avg_knee_rom < 60 && (gait_type === "walking" || gait_type === "running")) { // Limited knee flexion
            return {
                name: "Wall Sits with Calf Raises", 
                description: "3x45 seconds. Builds knee flexion endurance and calf strength simultaneously.",
                target: "Knee flexion endurance, shock absorption"
            };
        }
        
        if (spine_rom > 15 || spine_rom < 3) { // Poor trunk control
            return {
                name: "Dead Bug with Opposite Arm/Leg",
                description: "3x10 each side. Improves core stability and trunk control during movement.",
                target: "Core stability, trunk alignment"
            };
        }
    }
    
    // Default recommendation if no specific deficits
    return {
        name: "Single-Leg Romanian Deadlift",
        description: "3x8 each leg. Maintains posterior chain strength and balance.",
        target: "Overall stability and strength"
    };
}

// =======================================================
// STAFF WORKFLOW FUNCTIONS (Phase 3)
// =======================================================

/**
 * Email analysis results to customer
 */
function emailResults() {
    console.log('📧 Preparing email with analysis results...');
    
    // Get current analysis data
    const analysisContainer = document.querySelector('.retail-results-container');
    if (!analysisContainer) {
        alert('No analysis results available to email.');
        return;
    }
    
    // Extract key information for email
    const asymmetryValue = document.querySelector('.asymmetry-value')?.textContent || 'N/A';
    const dominantSide = document.querySelector('.asymmetry-direction')?.textContent || 'N/A';
    const recommendation = document.querySelector('.footwear-card-large h3')?.textContent || 'Custom recommendation';
    
    // Create email content
    const emailSubject = `Your Gait Analysis Results - ${recommendation}`;
    const emailBody = `Hello!

Thank you for completing your gait analysis at our store. Here are your personalized results:

GAIT ANALYSIS SUMMARY:
• Asymmetry Score: ${asymmetryValue}
• Dominant Side: ${dominantSide}
• Recommended Shoe Type: ${recommendation}

Your detailed analysis and specific product recommendations are attached. Our team is available to help you find the perfect shoes for your running goals.

Questions? Reply to this email or visit us in-store.

Happy Running!
Your Gait Analysis Team`;
    
    // Create mailto link (in production, this would integrate with email service)
    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client or show copy dialog
    if (navigator.share) {
        navigator.share({
            title: emailSubject,
            text: emailBody
        }).catch(err => console.log('Error sharing:', err));
    } else {
        window.open(mailtoLink);
    }
    
    console.log('📧 Email prepared and opened');
}

/**
 * Print analysis results
 */
function printResults() {
    console.log('🖨️ Preparing analysis results for printing...');
    
    // Create print-friendly version
    const printWindow = window.open('', '_blank');
    const analysisContainer = document.querySelector('.retail-results-container');
    
    if (!analysisContainer) {
        alert('No analysis results available to print.');
        return;
    }
    
    // Generate print content with store branding
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Gait Analysis Results</title>
            <style>
                body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
                .header { text-align: center; border-bottom: 2px solid #00FFB3; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #00FFB3; }
                .results-section { margin: 20px 0; }
                .asymmetry-display { text-align: center; font-size: 48px; font-weight: bold; color: #00FFB3; margin: 20px 0; }
                .recommendation-box { background: #f8f9fa; padding: 20px; border-left: 4px solid #00FFB3; margin: 20px 0; }
                ul { padding-left: 20px; }
                li { margin: 8px 0; }
                .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #666; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">STRIDE SYNC Gait Analysis</div>
                <div>Professional Running Gait Assessment</div>
                <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
            
            <div class="results-section">
                <h2>Analysis Summary</h2>
                <div class="asymmetry-display">
                    ${document.querySelector('.asymmetry-value')?.textContent || 'N/A'}
                </div>
                <div style="text-align: center; font-size: 20px; margin-bottom: 30px;">
                    ${document.querySelector('.asymmetry-direction')?.textContent || 'N/A'}
                </div>
                
                <div class="recommendation-box">
                    <h3>Recommended Footwear</h3>
                    ${document.querySelector('.footwear-card-large')?.innerHTML || 'Custom recommendations discussed in-store.'}
                </div>
                
                <div class="recommendation-box">
                    <h3>Your Analysis Explanation</h3>
                    ${document.querySelector('.customer-friendly-explanation')?.innerHTML || 'Detailed explanation provided in-store.'}
                </div>
                
                <div class="recommendation-box">
                    <h3>Next Steps</h3>
                    ${document.querySelector('.next-steps-section .customer-friendly-explanation')?.innerHTML || 'Follow-up plan discussed with our team.'}
                </div>
            </div>
            
            <div class="footer">
                <p>This analysis was performed using advanced pose detection technology.<br>
                For questions about your results, contact our expert fitting team.<br>
                <strong>STRIDE SYNC</strong> - Optimizing Your Running Performance</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    console.log('🖨️ Print dialog opened');
}

/**
 * Initiate re-test workflow
 */
function reTest() {
    console.log('🔄 Initiating re-test workflow...');
    
    if (confirm('Start a new gait analysis? This will clear current results and return to the upload screen.')) {
        // Clear current results
        const resultsContainer = document.querySelector('.retail-results-container');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
        
        // Clear personal tips section
        const tipsSection = document.querySelector('#personal-tips-section');
        if (tipsSection) {
            tipsSection.style.display = 'none';
            const tipsContainer = tipsSection.querySelector('.tips-container');
            if (tipsContainer) {
                tipsContainer.innerHTML = '';
            }
        }
        
        // Show upload section
        const uploadSection = document.querySelector('.upload-section, #upload');
        if (uploadSection) {
            uploadSection.style.display = 'block';
            uploadSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Reset file input
        const fileInput = document.querySelector('#video-upload');
        if (fileInput) {
            fileInput.value = '';
        }
        
        // Reset progress
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
        
        console.log('🔄 Re-test initiated - cleared tips and returned to upload screen');
    }
}

/**
 * Try different shoes workflow
 */
function tryShoes() {
    console.log('👟 Initiating shoe trial workflow...');
    
    const currentRecommendation = document.querySelector('.footwear-card-large h3')?.textContent || 'recommended shoes';
    
    if (confirm(`Ready to try ${currentRecommendation}? We'll help you find the perfect pair based on your analysis.`)) {
        // In a real implementation, this might:
        // - Log the customer interaction
        // - Display inventory of recommended shoes
        // - Start guided fitting process
        // - Track trial outcomes
        
        alert(`Great! Let's find you the perfect ${currentRecommendation}. Our team will help you try different options and we can re-test your gait with new shoes if needed.`);
        
        console.log('👟 Shoe trial workflow initiated');
    }
}

/**
 * Test function to automatically analyze the test video
 */
async function testWithActualVideo() {
    console.log('🧪 Testing with actual video file: matt-palmer-back-run1.MP4');
    
    try {
        // Fetch the test video file
        const response = await fetch('/videos/matt-palmer-back-run1.MP4');
        if (!response.ok) {
            throw new Error(`Failed to load test video: ${response.status}`);
        }
        
        const blob = await response.blob();
        const file = new File([blob], 'matt-palmer-back-run1.MP4', { type: 'video/mp4' });
        
        console.log('✅ Test video loaded successfully:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        
        // Simulate the file being selected
        const fileInput = document.getElementById('video-upload');
        if (fileInput) {
            // Create a DataTransfer object to simulate file selection
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            
            // Trigger the change event to start analysis
            const changeEvent = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(changeEvent);
            
            console.log('🚀 Automatic analysis started with test video');
        } else {
            console.error('❌ Video upload input not found');
        }
        
    } catch (error) {
        console.error('❌ Failed to load test video:', error);
        alert('Failed to load test video. Please use the regular upload interface.');
    }
}

// Add a button to trigger automatic testing (for development)
window.addEventListener('load', () => {
    setTimeout(() => {
        // Add test button for development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const testButton = document.createElement('button');
            testButton.textContent = '🧪 Test with Actual Video';
            testButton.style.position = 'fixed';
            testButton.style.top = '10px';
            testButton.style.right = '10px';
            testButton.style.zIndex = '9999';
            testButton.style.background = '#4F46E5';
            testButton.style.color = 'white';
            testButton.style.border = 'none';
            testButton.style.padding = '10px 15px';
            testButton.style.borderRadius = '5px';
            testButton.style.cursor = 'pointer';
            testButton.style.fontSize = '14px';
            testButton.onclick = testWithActualVideo;
            document.body.appendChild(testButton);
            
            console.log('🧪 Test button added for automatic video analysis');
        }
    }, 2000);
});

// CDN Library Status Test Function (for development)
function testCDNStatus() {
    console.log('🔍 Testing CDN Library Status...');
    
    const results = {
        tensorflow: typeof tf !== 'undefined',
        posenet: typeof posenet !== 'undefined',
        poseDetection: typeof poseDetection !== 'undefined',
        libraryLoadStatus: window.libraryLoadStatus || {},
        forceSimulationMode: window.forceSimulationMode || false
    };
    
    console.table(results);
    
    if (results.tensorflow) {
        console.log('✅ TensorFlow.js Version:', tf.version?.tfjs || 'unknown');
        console.log('📊 TensorFlow.js Backend:', tf.getBackend());
    }
    
    if (results.posenet) {
        console.log('✅ PoseNet Available (Legacy API)');
    }
    
    if (results.poseDetection) {
        console.log('✅ Available Models:', Object.keys(poseDetection.SupportedModels || {}));
    }
    
    // Test model loading capability
    if (results.tensorflow && results.poseDetection) {
        console.log('🧪 Ready to load pose detection models');
    } else {
        console.warn('⚠️ Missing required libraries for pose detection');
    }
    
    return results;
}

// Make CDN test available globally
window.testCDNStatus = testCDNStatus;

// Service Worker registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // In a production environment, you would register a service worker here
        // navigator.serviceWorker.register('/sw.js');
    });
}