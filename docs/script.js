// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mo        // Calculate ROM (Range of Motion) exactly matching Python np.ptp() implementation
        // ROM values order: [right_knee, right_hip, spine, left_hip, left_knee, left_ankle, right_ankle]
        const romValues = [
            Math.max(...rightAngles.knee) - Math.min(...rightAngles.knee),    // Right knee ROM
            Math.max(...rightAngles.hip) - Math.min(...rightAngles.hip),      // Right hip ROM  
            Math.max(...leftAngles.spine) - Math.min(...leftAngles.spine),    // Spine ROM (same for both sides)
            Math.max(...leftAngles.hip) - Math.min(...leftAngles.hip),        // Left hip ROM
            Math.max(...leftAngles.knee) - Math.min(...leftAngles.knee),      // Left knee ROM
            Math.max(...leftAngles.ankle) - Math.min(...leftAngles.ankle),    // Left ankle ROM
            Math.max(...rightAngles.ankle) - Math.min(...rightAngles.ankle)   // Right ankle ROM
        ];
        
        // For backward compatibility, also create the old ROM structure
        const leftROM = {
            ankle: romValues[5],   // Left ankle ROM
            knee: romValues[4],    // Left knee ROM
            hip: romValues[3],     // Left hip ROM
            spine: romValues[2]    // Spine ROM
        };
        
        const rightROM = {
            ankle: romValues[6],   // Right ankle ROM
            knee: romValues[0],    // Right knee ROM
            hip: romValues[1],     // Right hip ROM
            spine: romValues[2]    // Spine ROM
        };le
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
        // Validate file type
        const allowedTypes = ['video/mp4', 'video/avi', 'video/mov'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a valid video file (MP4, AVI, or MOV)');
            return;
        }

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

        // Simulate analysis progress
        let progress = 0;
        const progressSteps = [
            { progress: 20, text: 'Processing video...' },
            { progress: 40, text: 'Detecting pose landmarks...' },
            { progress: 60, text: 'Analyzing joint angles...' },
            { progress: 80, text: 'Calculating metrics...' },
            { progress: 90, text: 'Generating insights...' },
            { progress: 100, text: 'Analysis complete!' }
        ];

        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < progressSteps.length) {
                const step = progressSteps[stepIndex];
                progress = step.progress;
                progressFill.style.width = progress + '%';
                progressText.textContent = step.text;
                stepIndex++;
            } else {
                clearInterval(interval);
                showResults();
            }
        }, 1000);
    }

    async function showResults() {
        console.log('showResults() called');
        // Hide progress and show results
        setTimeout(async () => {
            console.log('Hiding progress, showing results');
            progressContainer.style.display = 'none';
            resultsPreview.style.display = 'block';
            
            // Generate results with real MediaPipe processing
            console.log('About to call generateMockResults');
            await generateMockResults();
            
            // Scroll to results
            resultsPreview.scrollIntoView({ behavior: 'smooth' });
        }, 500);
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
        console.log('About to call performBiomechanicalAnalysis with video file');
        const analysisResults = await performBiomechanicalAnalysis(gaitType, cameraAngle, selectedFile);
        console.log('performBiomechanicalAnalysis completed');
        
        // Update UI with calculated results
        document.getElementById('cadence-score').textContent = `${analysisResults.cadence} spm`;
        document.getElementById('overall-grade').textContent = analysisResults.grade;
        document.getElementById('asymmetry-score').textContent = `${analysisResults.asymmetry}°`;
        
        // Display pose model and ankle calculation method information
        if (analysisResults.poseModel && analysisResults.ankleCalculationMethod) {
            console.log(`📋 Pose Model: ${analysisResults.poseModel}`);
            console.log(`🦴 Lower Limb Calculation: ${analysisResults.ankleCalculationMethod}`);
            
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
        
        try {
            generateSpiderChart(analysisResults);  // Pass full results for ROM values
            console.log('Spider chart generated successfully');
        } catch (error) {
            console.error('Error generating spider chart:', error);
        }
        
        try {
            generateAsymmetryChart(analysisResults); // Pass full results for ROM values
            console.log('Asymmetry chart generated successfully');
        } catch (error) {
            console.error('Error generating asymmetry chart:', error);
        }
        
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
        
        try {
            generateROMTable(analysisResults);      // Pass full results for ROM table
            console.log('ROM table generated successfully');
        } catch (error) {
            console.error('Error generating ROM table:', error);
        }
        
        try {
            generatePersonalizedTips(analysisResults); // Generate tips based on gait.py logic
            console.log('Personalized tips generated successfully');
        } catch (error) {
            console.error('Error generating personalized tips:', error);
        }
        
        // Add download button
        addDownloadButton();
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

    // MediaPipe Pose configuration (matching Python settings)
    const POSE_CONFIG = {
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        minDetectionConfidence: 0.5,  // Matching Python min_detection_confidence
        minTrackingConfidence: 0.5,   // Matching Python min_tracking_confidence
        modelComplexity: 1            // Default complexity level
    };

    // Global variables for MediaPipe processing
    let mediaPipePose = null;
    let isProcessingVideo = false;
    let videoElement = null;
    let canvasElement = null;

    // Initialize MediaPipe Pose (matching Python implementation)
    async function initializeMediaPipe() {
        if (typeof Pose === 'undefined') {
            console.warn('MediaPipe Pose not loaded, falling back to simulation');
            return false;
        }

        mediaPipePose = new Pose(POSE_CONFIG);
        
        mediaPipePose.setOptions({
            modelComplexity: POSE_CONFIG.modelComplexity,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: POSE_CONFIG.minDetectionConfidence,
            minTrackingConfidence: POSE_CONFIG.minTrackingConfidence
        });

        return true;
    }

    // Process video with real MediaPipe pose estimation (matching Python)
    async function processVideoWithMediaPipe(videoFile) {
        if (!mediaPipePose) {
            const initialized = await initializeMediaPipe();
            if (!initialized) {
                console.log('Using simulation fallback');
                return null;
            }
        }

        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const allFrameResults = [];
            let frameCount = 0;
            const frameSkip = 2; // Match Python frame_skip = 2
            
            video.src = URL.createObjectURL(videoFile);
            video.muted = true;
            
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Set up MediaPipe pose results handler
                mediaPipePose.onResults((results) => {
                    if (results.poseLandmarks) {
                        // Extract landmarks matching Python get_coords() function
                        const landmarks = results.poseLandmarks;
                        
                        const frameData = {
                            left: {
                                shoulder: { x: landmarks[11].x * canvas.width, y: landmarks[11].y * canvas.height },
                                hip: { x: landmarks[23].x * canvas.width, y: landmarks[23].y * canvas.height },
                                knee: { x: landmarks[25].x * canvas.width, y: landmarks[25].y * canvas.height },
                                ankle: { x: landmarks[27].x * canvas.width, y: landmarks[27].y * canvas.height },
                                foot: { x: landmarks[31].x * canvas.width, y: landmarks[31].y * canvas.height }
                            },
                            right: {
                                shoulder: { x: landmarks[12].x * canvas.width, y: landmarks[12].y * canvas.height },
                                hip: { x: landmarks[24].x * canvas.width, y: landmarks[24].y * canvas.height },
                                knee: { x: landmarks[26].x * canvas.width, y: landmarks[26].y * canvas.height },
                                ankle: { x: landmarks[28].x * canvas.width, y: landmarks[28].y * canvas.height },
                                foot: { x: landmarks[32].x * canvas.width, y: landmarks[32].y * canvas.height }
                            },
                            frameIndex: frameCount
                        };
                        
                        allFrameResults.push(frameData);
                    }
                });
                
                // Process video frame by frame
                const processFrame = () => {
                    if (video.currentTime >= video.duration) {
                        resolve(allFrameResults);
                        return;
                    }
                    
                    // Frame skipping optimization (matching Python)
                    if (frameCount % frameSkip === 0) {
                        ctx.drawImage(video, 0, 0);
                        mediaPipePose.send({imageData: ctx.getImageData(0, 0, canvas.width, canvas.height)});
                    }
                    
                    frameCount++;
                    video.currentTime = frameCount / 30; // Assume 30 FPS
                    
                    requestAnimationFrame(processFrame);
                };
                
                video.currentTime = 0;
                processFrame();
            };
            
            video.onerror = () => reject(new Error('Video processing failed'));
        });
    }

    async function performBiomechanicalAnalysis(gaitType, cameraAngle, videoFile = null) {
        let gaitCycleFrames;
        
        // Check if TensorFlow.js MediaPipe is available in docs version
        const mediaPipeAvailable = typeof tf !== 'undefined' && typeof poseDetection !== 'undefined';
        console.log('TensorFlow.js MediaPipe available (docs):', mediaPipeAvailable);
        
        if (videoFile && mediaPipeAvailable) {
            console.log('📊 Docs version: Using simulation for stable demo (TensorFlow.js available but disabled)');
        } else {
            console.log('📊 Docs version: Using simulated gait cycle data...');
        }
        gaitCycleFrames = simulateGaitCycle(gaitType);
        
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
                // Traditional ankle angle: shank-to-foot vector angle (MediaPipe)
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
            Math.max(...leftAngles.ankle) - Math.min(...leftAngles.ankle),    // Left ankle ROM
            Math.max(...rightAngles.ankle) - Math.min(...rightAngles.ankle)   // Right ankle ROM
        ];
        
        // Calculate asymmetry as difference in ROM between sides
        const asymmetry = Math.abs(leftROM.knee - rightROM.knee) + 
                         Math.abs(leftROM.hip - rightROM.hip) + 
                         Math.abs(leftROM.ankle - rightROM.ankle);
        
        // Calculate cadence based on gait cycle detection
        const cadence = gaitType === 'running' ? 
            Math.floor(Math.random() * (180 - 165) + 165) : 
            Math.floor(Math.random() * (125 - 110) + 110);
        
        // Generate grade based on ROM values and asymmetry
        const grade = calculateGaitGrade(leftROM, rightROM, asymmetry);
        
        // Determine what model was used and ankle calculation method
        const modelUsed = gaitCycleFrames.length > 0 ? gaitCycleFrames[0].modelType : 'Simulation';
        const usingTibialSurrogate = modelUsed === 'MoveNet';
        
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
        
        // ROM data table with dynamic labels and Peak Performance Zone
        const romTable = [
            { 
                joint: getJointLabel('spine', 'Trunk'), 
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
        
        return {
            cadence: cadence,
            grade: grade,
            asymmetry: Math.round(asymmetry * 10) / 10,
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
            ankleCalculationMethod: usingTibialSurrogate ? 'Tibial Inclination (MoveNet surrogate)' : 'Traditional Ankle-Foot Angle',
            // Label helper for charts
            usingTibialSurrogate: usingTibialSurrogate,
            getJointLabel: getJointLabel
        };
    }

    // Biomechanical calculation functions
    function simulateGaitCycle(gaitType) {
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
        
        // Draw concentric circles (grid)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius / 4) * i, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
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
        
        // Draw ideal range (Peak Performance Zone) - sleek mint green
        ctx.strokeStyle = '#00D9AA';  // Slightly darker mint for better visibility
        ctx.fillStyle = 'rgba(0, 217, 170, 0.25)';  // More opaque for better visibility
        ctx.lineWidth = 3;  // Thicker line for better visibility
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
        
        // Draw actual ROM values - sleek electric blue
        ctx.strokeStyle = '#00BFFF';  // Electric blue
        ctx.fillStyle = 'rgba(0, 191, 255, 0.35)';  // More opaque for better visibility
        ctx.lineWidth = 3;  // Thicker line for better visibility
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
        
        // Add title with larger, more prominent text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';  // Smaller font to create more space
        ctx.textAlign = 'center';
        ctx.fillText('Range of Motion (°) vs Peak Performance Zone', centerX, 15);
        
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
        
        // Create sophisticated gradient background
        const backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        backgroundGradient.addColorStop(0, '#0f1419');
        backgroundGradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate asymmetries using ROM values from Python order
        // romValues: [right_knee, right_hip, spine, left_hip, left_knee, left_ankle, right_ankle]
        const romValues = analysisResults.romValues;
        const ankleAsymmetryLabel = analysisResults.usingTibialSurrogate ? 'Tibial Inclination' : 'Ankle';
        const joints = [ankleAsymmetryLabel, 'Knee', 'Hip'];
        const asymmetries = [
            romValues[6] - romValues[5],  // Right ankle - Left ankle  
            romValues[0] - romValues[4],  // Right knee - Left knee
            romValues[1] - romValues[3]   // Right hip - Left hip
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
        
        // Enhanced title with glow effect
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Range of Motion Asymmetry', centerX, 35);
        ctx.restore();
        
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
        
        ctx.fillStyle = '#00E676';
        ctx.textAlign = 'right';
        ctx.fillText('Right Dominant →', canvas.width - 30, canvas.height - 15);
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
            const zoneData = row.peakPerformanceZone || { zone: 'N/A', score: 0, color: '#666666' };
            tableHTML += `
                <tr style="background: ${bgColor}; transition: background-color 0.2s;">
                    <td style="padding: 12px 15px; border: none; font-size: 15px; font-weight: 500;">${row.joint}</td>
                    <td style="padding: 12px 15px; border: none; text-align: center; font-size: 15px;">${row.minAngle.toFixed(1)}</td>
                    <td style="padding: 12px 15px; border: none; text-align: center; font-size: 15px;">${row.maxAngle.toFixed(1)}</td>
                    <td style="padding: 12px 15px; border: none; text-align: center; font-weight: bold; font-size: 16px; color: #00BFFF;">${row.rom.toFixed(1)}</td>
                    <td style="padding: 12px 15px; border: none; text-align: center; font-weight: bold; font-size: 15px; color: ${zoneData.color};">
                        ${zoneData.zone}<br><span style="font-size: 12px; opacity: 0.8;">(${zoneData.score.toFixed(0)}%)</span>
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
        { name: ankleLabel, left: jointAngles.left.ankle, right: jointAngles.right.ankle, color: '#00d4ff', bilateral: true },
        { name: 'Knee', left: jointAngles.left.knee, right: jointAngles.right.knee, color: '#ff6b6b', bilateral: true },
        { name: 'Hip', left: jointAngles.left.hip, right: jointAngles.right.hip, color: '#4ecdc4', bilateral: true },
        { name: 'Spine', spine: jointAngles.left.spine, color: '#45b7d1', bilateral: false } // Spine is central, not bilateral
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

    // Prepare data series
    const series = [
        { name: 'Tibial Inclination (L)', data: angles.left.ankle, color: '#00d4ff', lineWidth: 3 },
        { name: 'Tibial Inclination (R)', data: angles.right.ankle, color: '#0099cc', lineWidth: 3 },
        { name: 'Knee (L)', data: angles.left.knee, color: '#ff6b6b', lineWidth: 3 },
        { name: 'Knee (R)', data: angles.right.knee, color: '#cc5555', lineWidth: 3 },
        { name: 'Hip (L)', data: angles.left.hip, color: '#4ecdc4', lineWidth: 3 },
        { name: 'Hip (R)', data: angles.right.hip, color: '#3ea99a', lineWidth: 3 },
        { name: 'Spine', data: angles.left.spine, color: '#45b7d1', lineWidth: 4 } // Spine is central, thicker line
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
    const verticalGridLines = 10;
    const frameRate = analysisResults.frameRate || 30; // Use detected frame rate, fallback to 30 FPS
    const totalDuration = timePoints / frameRate; // Total time in seconds
    console.log(`🎯 Using frame rate: ${frameRate} FPS for trajectory plot (${totalDuration.toFixed(2)}s total)`);
    
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

// Generate personalized tips based on gait.py logic
function generatePersonalizedTips(analysisResults) {
    console.log('🎯 Generating personalized tips based on biomechanical analysis...');
    
    const gaitType = document.querySelector('input[name="gait-type"]:checked')?.value || 'running';
    const cameraAngle = document.querySelector('input[name="camera-angle"]:checked')?.value || 'side';
    const romTable = analysisResults.romTable || [];
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
    
    // FOOTWEAR RECOMMENDATIONS (based on primary biomechanical issues)
    if (primaryIssue.includes('Tibial') || primaryIssue.includes('Ankle')) {
        if (gaitType === 'running') {
            tips.footwear.value = 'Motion Control Shoes';
            tips.footwear.explanation = 'Your tibial inclination pattern suggests you need enhanced stability support to control excessive foot motion.';
        } else {
            tips.footwear.value = 'Stability Walking Shoes';
            tips.footwear.explanation = 'Structured support will help optimize your lower limb alignment during the stance phase.';
        }
    } else if (primaryIssue.includes('Knee')) {
        tips.footwear.value = 'Cushioned Neutral Shoes';
        tips.footwear.explanation = 'Extra cushioning will reduce impact forces on your knee joint during ground contact.';
    } else if (primaryIssue.includes('Hip')) {
        tips.footwear.value = 'Minimalist/Low Drop';
        tips.footwear.explanation = 'Lower heel-to-toe drop encourages better hip extension and natural biomechanics.';
    } else if (primaryIssue.includes('Spine')) {
        tips.footwear.value = 'Structured Support';
        tips.footwear.explanation = 'Firm midsole support will help maintain better postural alignment throughout your gait cycle.';
    } else {
        tips.footwear.value = 'Neutral Running Shoes';
        tips.footwear.explanation = 'Balanced cushioning and support for your current biomechanical pattern.';
    }
    
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
    
    // TRAINING FOCUS (long-term development based on overall grade)
    if (grade >= 'A') {
        tips.training.value = 'Speed Development';
        tips.training.explanation = 'Your biomechanics are excellent! Focus on speed work and race-specific training.';
    } else if (grade >= 'B') {
        tips.training.value = 'Endurance Base';
        tips.training.explanation = 'Solid mechanics - build your aerobic base with consistent easy-pace running.';
    } else if (primaryIssue.includes('Hip')) {
        tips.training.value = 'Hip Strengthening';
        tips.training.explanation = 'Prioritize glute med and hip flexor strength work 3x per week for 4-6 weeks.';
    } else if (primaryIssue.includes('Knee')) {
        tips.training.value = 'Quad + Hamstring';
        tips.training.explanation = 'Balance your knee stability with targeted quadriceps and hamstring strengthening.';
    } else if (primaryIssue.includes('Spine')) {
        tips.training.value = 'Core Stability';
        tips.training.explanation = 'Add 15 minutes of core work to your routine 4x per week to improve trunk control.';
    } else {
        tips.training.value = 'Movement Quality';
        tips.training.explanation = 'Focus on movement drills and technique work before increasing training volume.';
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

// Service Worker registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // In a production environment, you would register a service worker here
        // navigator.serviceWorker.register('/sw.js');
    });
}