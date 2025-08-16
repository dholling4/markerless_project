import streamlit as st
import cv2
import mediapipe as mp
from mediapipe import solutions
import numpy as np
import tempfile
import os
from matplotlib import pyplot as plt
import plotly.graph_objects as go
import pandas as pd
from scipy.signal import butter, lfilter
from sklearn.decomposition import PCA
from scipy.signal import find_peaks
import tempfile
import requests
from io import BytesIO
from fpdf import FPDF
import matplotlib.colors as mcolors
from PIL import Image, ImageOps
from datetime import datetime
import gc  # For memory management
import qrcode
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from email.message import EmailMessage
from dotenv import load_dotenv
import streamlit as st
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import LinearSegmentedColormap

# # GENERAL
# - Fix when video is uploaded 90 deg sideways (gives wrong results, uh oh!) --> it should be vertical, not landscape recording
# - Try to merge the side and back videos into one report (if feasible)
# - Add more personliazed insights based on the data (text and exercise recommendations as decision trees)

class CustomPDF(FPDF):
    def header(self):
        # Set black background on every page automatically
        self.set_fill_color(0, 0, 0)
        self.rect(0, 0, 210, 297, 'F')
        
def get_color(value, good_range, moderate_range):
    """Assigns a color based on the ROM classification."""

    if good_range[0] <= value <= good_range[1]:
        # return a light green color
        return "lightgreen"        
    elif moderate_range[0] <= value <= moderate_range[1]:
        return 'yellow'
    else:
        return "lightcoral"
    
def create_spider_matplotlib(camera_side, gait_type, rom_values, joint_labels, save_path,
                            bad_rom_outer=None, bad_rom_inner=None, moderate_rom_outer=None, 
                            moderate_rom_inner=None, ideal_rom_outer=None, ideal_rom_inner=None):
    if camera_side == "side" and gait_type == "walking": 
        ankle_good = (20, 45)
        ankle_moderate = (15, 20)
        ankle_bad = (0, 55) #(0, 10)

        knee_good = (50, 70)
        knee_moderate = (40, 50)
        knee_bad = (0, 80) #(0, 40)

        hip_good = (25, 45)
        hip_moderate = (15, 25)
        hip_bad = (0, 15)

        spine_good = (0, 5)
        spine_moderate = (5, 10)
        spine_bad = (10, 30)

    if camera_side == "back" and gait_type == "walking": 
        ankle_good = (20, 50)
        ankle_moderate = (15, 20)
        ankle_bad = (0, 15)

        knee_good = (0, 5)
        knee_moderate = (5, 10)
        knee_bad = (10, 30)

        hip_good = (0, 10)
        hip_moderate = (10, 15)
        hip_bad = (15, 50)

        spine_good = (0, 5)
        spine_moderate = (5, 10)
        spine_bad = (10, 30)

    if camera_side == "side" and gait_type == "running": 
        ankle_good = (65, 75)
        ankle_moderate = (55, 85)
        ankle_bad = (55, 95)

        knee_good = (120, 130)
        knee_moderate = (90, 175)
        knee_bad = (90, 175)

        hip_good = (60, 70)
        hip_moderate = (40, 90)
        hip_bad = (40, 90)

        spine_good = (5, 15)
        spine_moderate = (2, 20)
        spine_bad = (0, 30)

    if camera_side == "back" and gait_type == "running":
        ankle_good = (20, 50)
        ankle_moderate = (15, 20)
        ankle_bad = (0, 15)

        knee_good = (0, 5)
        knee_moderate = (5, 12)
        knee_bad = (12, 30)

        hip_good = (0, 10)
        hip_moderate = (10, 20)
        hip_bad = (20, 40)

        spine_good = (1, 10)
        spine_moderate = (10, 20)
        spine_bad = (20, 30)

    if camera_side == "side" and gait_type == "pickup pen":
        # Spine (Trunk Flexion from neutral upright)
        spine_good = (30, 60)
        spine_moderate = (20, 30) # Too little flexion
        spine_moderate_upper = (60, 75) # Too much flexion
        spine_bad = (0, 20) # Very little flexion
        spine_bad_upper = (75, 90) # Excessive flexion

        # Hip Flexion
        hip_good = (50, 90)
        hip_moderate = (40, 50) # Not enough hip flexion
        hip_moderate_upper = (90, 100) # Deeper than expected
        hip_bad = (0, 40) # Primarily back bending
        hip_bad_upper = (100, 120) # Very deep / potentially unstable

        # Knee Flexion
        knee_good = (20, 70)
        knee_moderate = (10, 20) # Stiff legs
        knee_moderate_upper = (70, 90) # Deeper squat
        knee_bad = (0, 10) # Straight-legged
        knee_bad_upper = (90, 120) # Uncontrolled deep squat

        # Ankle Dorsiflexion (Positive angle means dorsiflexion from neutral)
        ankle_good = (10, 25)
        ankle_moderate = (5, 10) # Limited dorsiflexion
        ankle_moderate_upper = (25, 35) # Excessive dorsiflexion / instability
        ankle_bad = (0, 5) # Very limited mobility
        ankle_bad_upper = (35, 45) # Significant instability

    if camera_side == "back" and gait_type == "pickup pen":
        # Spine Lateral Flexion / Rotation (Deviation from central axis)
        spine_good = (0, 5)
        spine_moderate = (5, 10)
        spine_bad = (10, 20)

        # Hip Abduction/Adduction (Pelvic Tilt/Shift)
        hip_good = (0, 5)
        hip_moderate = (5, 10)
        hip_bad = (10, 20)

        # Knee Valgus/Varus (Deviation from straight alignment)
        knee_good = (0, 5)
        knee_moderate = (5, 10)
        knee_bad = (10, 20)

        # Ankle Inversion/Eversion (Foot Rolling)
        ankle_good = (0, 5)
        ankle_moderate = (5, 10)
        ankle_bad = (10, 20)        
 
    # Reorder data to match the counter-clockwise arrangement starting at 3 o'clock
    # Order: Knee Right, Hip Right, Spine, Hip Left, Knee Left, Ankle Left, Ankle Right
    reordered_rom_values = [
        rom_values[0],  # Knee Right (was index 0)
        rom_values[1],  # Hip Right (was index 1) 
        rom_values[2],  # Spine (was index 2)
        rom_values[3],  # Hip Left (was index 3)
        rom_values[4],  # Knee Left (was index 4)
        rom_values[5],  # Ankle Left (was index 5)
        rom_values[6]   # Ankle Right (was index 6)
    ]
    
    reordered_joint_labels = [
        "Knee Right", "Hip Right", "Spine", "Hip Left", "Knee Left", "Ankle Left", "Ankle Right"
    ]
    
    # Reorder the target ranges to match
    reordered_bad_rom_outer = [bad_rom_outer[0], bad_rom_outer[1], bad_rom_outer[2], bad_rom_outer[3], bad_rom_outer[4], bad_rom_outer[5], bad_rom_outer[6]]
    reordered_bad_rom_inner = [bad_rom_inner[0], bad_rom_inner[1], bad_rom_inner[2], bad_rom_inner[3], bad_rom_inner[4], bad_rom_inner[5], bad_rom_inner[6]]
    reordered_moderate_rom_outer = [moderate_rom_outer[0], moderate_rom_outer[1], moderate_rom_outer[2], moderate_rom_outer[3], moderate_rom_outer[4], moderate_rom_outer[5], moderate_rom_outer[6]]
    reordered_moderate_rom_inner = [moderate_rom_inner[0], moderate_rom_inner[1], moderate_rom_inner[2], moderate_rom_inner[3], moderate_rom_inner[4], moderate_rom_inner[5], moderate_rom_inner[6]]
    reordered_ideal_rom_outer = [ideal_rom_outer[0], ideal_rom_outer[1], ideal_rom_outer[2], ideal_rom_outer[3], ideal_rom_outer[4], ideal_rom_outer[5], ideal_rom_outer[6]]
    reordered_ideal_rom_inner = [ideal_rom_inner[0], ideal_rom_inner[1], ideal_rom_inner[2], ideal_rom_inner[3], ideal_rom_inner[4], ideal_rom_inner[5], ideal_rom_inner[6]]
    
    N = len(reordered_joint_labels)
    values = reordered_rom_values + [reordered_rom_values[0]]  # close the loop
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    angles += [angles[0]]

    fig, ax = plt.subplots(figsize=(18, 18), 
                           subplot_kw=dict(polar=True),
                           dpi=300) 
    ax.set_facecolor('black')
    fig.patch.set_facecolor('black')

    # Plot only the ideal range (Stride Sweet Spot) - removing Poor and Moderate bands
    alpha=0.3
    lw=2
    if reordered_ideal_rom_outer is not None and reordered_ideal_rom_inner is not None:
        ideal_outer = list(reordered_ideal_rom_outer) + [reordered_ideal_rom_outer[0]]
        ideal_inner = list(reordered_ideal_rom_inner) + [reordered_ideal_rom_inner[0]]
        ax.plot(angles, ideal_outer, color='#00FFAB', linewidth=lw, linestyle='-', label='Stride Sweet Spot')
        ax.plot(angles, ideal_inner, color='#00FFAB', linewidth=lw, linestyle='-', label='')
        ax.fill_between(angles, ideal_inner, ideal_outer, color='#00FFAB', alpha=alpha)

    ax.plot(angles, values, color='deepskyblue', linewidth=lw, label='Your Current Stride')
    ax.fill(angles, values, color='deepskyblue', alpha=alpha)

    LABEL_SIZE  = 32         
    TICK_SIZE   = 32
    LEGEND_SIZE = 32

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(reordered_joint_labels, color='white', fontsize=LABEL_SIZE, zorder=10)
    max_value = max(max(values), max(ideal_rom_outer) if ideal_rom_outer else 0) + 10
    tick_values = [0, 30, 60, 90, 120, 150]
    tick_values = [val for val in tick_values if val <= max_value]
    
    ax.set_ylim(0, max_value)
    ax.set_yticks(tick_values)
    ax.set_yticklabels([str(val) for val in tick_values], color='white', fontsize=28, zorder=10)

    ax.tick_params(axis="x", pad=45, colors="white", labelsize=LABEL_SIZE, which='major', zorder=10)
    ax.tick_params(axis="y", colors="white", labelsize=28, which='major', zorder=10)

    ax.spines['polar'].set_color('white')
    ax.grid(color='gray', linestyle='dotted', linewidth=1, alpha=0.9, zorder=0)

    ax.set_title(f"Range of Motion (°) vs. Stride Sweet Spot", 
                 color='white', fontsize=42,  fontweight='bold', pad=20, zorder=10)

    # Move legend outside to the right
    leg = ax.legend(
            loc='center left',
            bbox_to_anchor=(1.25, 0.5),  # Position outside the plot on the right
            fontsize=LEGEND_SIZE,
            frameon=False
        )
    for t in leg.get_texts():
        t.set_color('white')

    plt.tight_layout()
    fig.savefig(save_path, dpi=300, facecolor=fig.get_facecolor(), bbox_inches="tight")    
    plt.close(fig)

def create_asymmetry_bar_matplotlib(asymmetry_dict, save_path):
    """Create & save a horizontal bar chart for asymmetry with a green-yellow-red scale."""
    joints  = list(asymmetry_dict.keys())
    values  = list(asymmetry_dict.values())

    # ── 1.  Build a continuous colormap (0→40) -------------------------------
    cmap = LinearSegmentedColormap.from_list(
        "asym_map",
        ["#00C853",  # vivid green
         "#FFD600",  # bright yellow
         "#D50000"]  # red
    )

    # normalise abs(value) into 0–1 range where 0 → green, 0.5 → yellow, 1 → red
    norm_vals = np.clip(np.abs(values) / 40.0, 0, 1)   # 40° == reddest red
    bar_cols  = [cmap(v) for v in norm_vals]

    # ── 2.  Figure / axes -----------------------------------------------------
    fig, ax = plt.subplots(figsize=(5, 2.5), dpi=300)
    fig.patch.set_facecolor("black")
    ax.set_facecolor("black")

    bars = ax.barh(joints, values, color=bar_cols, edgecolor='white')
    ax.axvline(0, color='white', linewidth=1)

    ax.set_xlim(-30, 30)                                 # keep your fixed range
    ax.set_xlabel("← Left Asymmetry          Right Asymmetry →", color="white")
    ax.set_title("Range of Motion Asymmetry",
                 color="white", fontweight="bold", fontsize=14)
    ax.tick_params(axis='x', colors='white')
    ax.tick_params(axis='y', colors='white')

    # value labels ------------------------------------------------------------
    for bar, val in zip(bars, values):
        ax.text(bar.get_width(),
                bar.get_y() + bar.get_height()/2,
                f"{val:+.1f}°",
                va='center',
                ha='left' if val >= 0 else 'right',
                color='white',
                fontsize=14,
                fontweight='bold')

    # ── 3.  Gradient legend (same colormap) ----------------------------------
    grad   = np.linspace(0, 1, 256).reshape(-1, 1)        # vertical gradient
    bbox   = ax.get_position()
    ax_grad = fig.add_axes([bbox.x1 + 0.22, bbox.y0, 0.03, bbox.height])
    ax_grad.imshow(grad, aspect='auto', cmap=cmap, origin='lower')
    ax_grad.set_xticks([])
    ax_grad.set_yticks([0, 128, 255])
    ax_grad.set_yticklabels(["0°", "20°", "40°+"], color='white', fontsize=10)
    for spine in ax_grad.spines.values():
        spine.set_visible(False)

    plt.tight_layout()
    fig.savefig(save_path,
                bbox_inches='tight',
                dpi=300,
                facecolor=fig.get_facecolor())
    plt.close(fig)

def generate_pdf(pose_image_path, df_rom, spider_plot, asymmetry_plot, text_info, camera_side, gait_type, user_footwear):
    """Generates a PDF with the pose estimation, given plots, and text. FPDF document (A4 size, 210mm width x 297mm height)"""
    pdf = CustomPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # ✅ Add Date and Location (Top Left)
    pdf.set_text_color(255, 255, 255)  # White text
    pdf.set_font("Arial", size=9)  # Small font
    current_date = datetime.today().strftime("%m/%d/%Y")  # Automatically fetch today's date
    location_text = f"Date: {current_date}\nLocation: Run-N-Tri Mobile, AL\nGait Type: {gait_type.capitalize()} ({camera_side.capitalize()})\nFootwear: {user_footwear}"
    pdf.multi_cell(0, 3.5, location_text)  # Multi-line cell to properly format text

    # ✅ Report Title (Centered)
    pdf.set_xy(10, 10)  # Reset cursor
    pdf.set_font("Arial", style='BU', size=20)
    pdf.set_text_color(96, 194, 228) # blue color
    pdf.cell(190, 10, "Stride Sync Report", ln=True, align='C')

    # add logo in the top right corner
    github_url = "https://raw.githubusercontent.com/dholling4/markerless_project/main/"
    logo_path = github_url + "stride sycn logo stacked white.png"
    logo = requests.get(logo_path)
    logo_img = Image.open(BytesIO(logo.content))
    logo_img_path = tempfile.mktemp(suffix=".png")
    logo_img.save(logo_img_path)
    pdf.image(logo_img_path, x=175, y=10, w=15)  # Adjusted placement

    pdf.ln(10)  # Spacing before the next section

    # Add padding to the image
    if pose_image_path:
        pose_img = Image.open(pose_image_path)
        width, height = pose_img.size

        # Create a new image with padding
        padded_img = ImageOps.expand(pose_img, border=(0, 1, 0, 1), fill=(0, 0, 0))  # Add black padding
        padded_pose_path = tempfile.mktemp(suffix=".png")
        padded_img.save(padded_pose_path)

        # 🔹 Reduce image size in the PDF
        pdf.image(padded_pose_path, x=10, y=25, h=75, w=42)  # Make it smaller - reduced from h=88, w=49

      # --- Matplotlib Spider/Radar Plot ---
    # --- Matplotlib Spider/Radar Plot ---
    spider_plot_path = tempfile.mktemp(suffix=".png")
    rom_values = [float(x) for x in df_rom['Range of Motion (°)']]
    rom_values = [rom_values[4], rom_values[2], rom_values[0], 
                  rom_values[1], rom_values[3], rom_values[5], rom_values[6]]  # Reorder to match the plot   
    joint_labels = ["Knee Right", "Hip Right", "Spine", "Hip Left", "Knee Left", "Ankle Left", "Ankle Right"]


    # Define ranges for color classification
    if camera_side == "side" and gait_type == "walking": 
        ankle_good = (20, 45)
        ankle_moderate = (15, 20)
        ankle_bad = (0, 55) #(0, 10)

        knee_good = (50, 70)
        knee_moderate = (40, 50)
        knee_bad = (0, 80) #(0, 40)

        hip_good = (25, 45)
        hip_moderate = (15, 25)
        hip_bad = (0, 15)

        spine_good = (0, 5)
        spine_moderate = (5, 10)
        spine_bad = (10, 30)

    if camera_side == "back" and gait_type == "walking": 
        ankle_good = (20, 50)
        ankle_moderate = (15, 20)
        ankle_bad = (0, 15)

        knee_good = (0, 5)
        knee_moderate = (5, 10)
        knee_bad = (10, 30)

        hip_good = (0, 10)
        hip_moderate = (10, 15)
        hip_bad = (15, 50)

        spine_good = (0, 5)
        spine_moderate = (5, 10)
        spine_bad = (10, 30)

    if camera_side == "side" and gait_type == "running": 
        ankle_good = (65, 75)
        ankle_moderate = (55, 85)
        ankle_bad = (55, 95)

        knee_good = (120, 130)
        knee_moderate = (90, 175)
        knee_bad = (90, 175)

        hip_good = (60, 70)
        hip_moderate = (40, 90)
        hip_bad = (40, 90)

        spine_good = (5, 15)
        spine_moderate = (2, 20)
        spine_bad = (0, 30)

    if camera_side == "back" and gait_type == "running":
        ankle_good = (20, 50)
        ankle_moderate = (15, 20)
        ankle_bad = (0, 15)

        knee_good = (0, 5)
        knee_moderate = (5, 12)
        knee_bad = (12, 30)

        hip_good = (0, 10)
        hip_moderate = (10, 20)
        hip_bad = (20, 40)

        spine_good = (1, 10)
        spine_moderate = (10, 20)
        spine_bad = (20, 30)

    if camera_side == "side" and gait_type == "pickup pen":
        # Spine (Trunk Flexion from neutral upright)
        spine_good = (30, 60)
        spine_moderate = (20, 30) # Too little flexion
        spine_moderate_upper = (60, 75) # Too much flexion
        spine_bad = (0, 20) # Very little flexion
        spine_bad_upper = (75, 90) # Excessive flexion

        # Hip Flexion
        hip_good = (50, 90)
        hip_moderate = (40, 50) # Not enough hip flexion
        hip_moderate_upper = (90, 100) # Deeper than expected
        hip_bad = (0, 40) # Primarily back bending
        hip_bad_upper = (100, 120) # Very deep / potentially unstable

        # Knee Flexion
        knee_good = (20, 70)
        knee_moderate = (10, 20) # Stiff legs
        knee_moderate_upper = (70, 90) # Deeper squat
        knee_bad = (0, 10) # Straight-legged
        knee_bad_upper = (90, 120) # Uncontrolled deep squat

        # Ankle Dorsiflexion (Positive angle means dorsiflexion from neutral)
        ankle_good = (10, 25)
        ankle_moderate = (5, 10) # Limited dorsiflexion
        ankle_moderate_upper = (25, 35) # Excessive dorsiflexion / instability
        ankle_bad = (0, 5) # Very limited mobility
        ankle_bad_upper = (35, 45) # Significant instability

    if camera_side == "back" and gait_type == "pickup pen":
        # Spine Lateral Flexion / Rotation (Deviation from central axis)
        spine_good = (0, 5)
        spine_moderate = (5, 10)
        spine_bad = (10, 20)

        # Hip Abduction/Adduction (Pelvic Tilt/Shift)
        hip_good = (0, 5)
        hip_moderate = (5, 10)
        hip_bad = (10, 20)

        # Knee Valgus/Varus (Deviation from straight alignment)
        knee_good = (0, 5)
        knee_moderate = (5, 10)
        knee_bad = (10, 20)

        # Ankle Inversion/Eversion (Foot Rolling)
        ankle_good = (0, 5)
        ankle_moderate = (5, 10)
        ankle_bad = (10, 20)        

    
        ideal_rom_outer = [knee_good[1], hip_good[1], spine_good[1], hip_good[1], knee_good[1], ankle_good[1], ankle_good[1]]
    ideal_rom_outer = [knee_good[1], hip_good[1], spine_good[1], hip_good[1], knee_good[1], ankle_good[1], ankle_good[1]]
    ideal_rom_inner = [knee_good[0], hip_good[0], spine_good[0], hip_good[0], knee_good[0], ankle_good[0], ankle_good[0]]
    moderate_rom_outer = [knee_moderate[1], hip_moderate[1], spine_moderate[1], hip_moderate[1], knee_moderate[1], ankle_moderate[1], ankle_moderate[1]]
    moderate_rom_inner = [knee_moderate[0], hip_moderate[0], spine_moderate[0], hip_moderate[0], knee_moderate[0], ankle_moderate[0], ankle_moderate[0]]
    bad_rom_outer = [knee_bad[1], hip_bad[1], spine_bad[1], hip_bad[1], knee_bad[1], ankle_bad[1], ankle_bad[1]]
    bad_rom_inner = [knee_bad[0], hip_bad[0], spine_bad[0], hip_bad[0], knee_bad[0], ankle_bad[0], ankle_bad[0]]
    
    create_spider_matplotlib(
        camera_side, gait_type,
        rom_values, joint_labels, spider_plot_path,
        bad_rom_outer=bad_rom_outer,
        bad_rom_inner=bad_rom_inner,
        moderate_rom_outer=moderate_rom_outer,
        moderate_rom_inner=moderate_rom_inner,
        ideal_rom_outer=ideal_rom_outer,
        ideal_rom_inner=ideal_rom_inner
    )
    pdf.image(spider_plot_path, x=80, y=25, w=120)   # Move right, make smaller (w=80)

    # --- Matplotlib Asymmetry Bar Chart ---
    asymmetry_plot_path = tempfile.mktemp(suffix=".png")
    try:
        left_ankle = float(df_rom.loc[df_rom['Joint'] == 'Left Ankle', 'Range of Motion (°)'].values[0])
        right_ankle = float(df_rom.loc[df_rom['Joint'] == 'Right Ankle', 'Range of Motion (°)'].values[0])
        left_knee = float(df_rom.loc[df_rom['Joint'] == 'Left Knee', 'Range of Motion (°)'].values[0])
        right_knee = float(df_rom.loc[df_rom['Joint'] == 'Right Knee', 'Range of Motion (°)'].values[0])
        left_hip = float(df_rom.loc[df_rom['Joint'] == 'Left Hip', 'Range of Motion (°)'].values[0])
        right_hip = float(df_rom.loc[df_rom['Joint'] == 'Right Hip', 'Range of Motion (°)'].values[0])
    except Exception as e:
        left_ankle = right_ankle = left_knee = right_knee = left_hip = right_hip = 0

    asymmetry_dict = {
        "Ankle": right_ankle - left_ankle,
        "Knee": right_knee - left_knee,
        "Hip": right_hip - left_hip
    }
    create_asymmetry_bar_matplotlib(asymmetry_dict, asymmetry_plot_path)
    pdf.image(asymmetry_plot_path, x=10, y=115, w=130)

    pdf.ln(1)  # Extra spacing before next plot

    # ✅ Generate Styled ROM Table (Middle Right)
    rom_chart_path = tempfile.mktemp(suffix=".png")

    fig, ax = plt.subplots(figsize=(4.5, 2.3), dpi=300)
    fig.patch.set_facecolor("black")        # whole figure background

    ax.axis("off")
    table = ax.table(
        cellText=df_rom.values,
        colLabels=df_rom.columns,
        cellLoc="center",
        loc="center"
    )

    # -- styling ---------------------------------------------------------------
    table.auto_set_font_size(False)
    table.set_fontsize(11)
    table.scale(1.25, 1.25)
    table.auto_set_column_width([0, 1, 2, 3])

    for (row, col), cell in table.get_celld().items():
        cell.set_edgecolor("white")
        cell.set_facecolor("black")
        # header row white & bold
        if row == 0:
            cell.get_text().set_color("white")
            cell.get_text().set_weight("bold")

    # colour first / last columns according to ROM value
    for i, joint in enumerate(df_rom["Joint"]):
        if joint == "Spine Segment":
            good_range, moderate_range = spine_good, spine_moderate
        elif "Hip" in joint:
            good_range, moderate_range = hip_good, hip_moderate
        elif "Knee" in joint:
            good_range, moderate_range = knee_good, knee_moderate
        else:
            good_range, moderate_range = ankle_good, ankle_moderate

        rom_val = float(df_rom["Range of Motion (°)"].iloc[i])
        col_color = get_color(rom_val, good_range, moderate_range)

        # Color ALL columns for this joint (0=Joint, 1=Min, 2=Max, 3=ROM)
        table[(i + 1, 0)].get_text().set_color(col_color)  # Joint name
        table[(i + 1, 1)].get_text().set_color(col_color)  # Min Angle
        table[(i + 1, 2)].get_text().set_color(col_color)  # Max Angle  
        table[(i + 1, 3)].get_text().set_color(col_color)  # Range of Motion

    # -- SAVE ONCE, *after* everything is styled -------------------------------
    plt.tight_layout(pad=0.1)
    fig.savefig(rom_chart_path,
                bbox_inches="tight",
                facecolor=fig.get_facecolor())

    # Place ROM Table
    pdf.image(rom_chart_path, x=10, y=175, w=130) 

    pdf.ln(195)  # Adjust based on vertical layout
   
    joint_color_map = {
        "spine": (200, 162, 200),  # Purple
        "left hip": (144, 238, 144),    # Green
        "right hip": (144, 238, 144),    # Green
        "left knee": (173, 216, 230),   # Blue
        "right knee": (173, 216, 230),   # Blue
        "left ankle": (255, 182, 193),   # Red
        "right ankle": (255, 182, 193)   # Red
    }
    font_size=12

    # Group joints by their summary status
    stride_sweet_spots = []
    major_opportunities = []
    minor_opportunities = []
    moderate_opportunities = []
    
    joint_name_mapping = {
        "spine segment summary": "Spine Segment",
        "left hip summary": "Left Hip", 
        "right hip summary": "Right Hip",
        "left knee summary": "Left Knee",
        "right knee summary": "Right Knee", 
        "left ankle summary": "Left Ankle",
        "right ankle summary": "Right Ankle"
    }
    
    for joint in ["spine segment summary", "left hip summary", "right hip summary", "left knee summary", "right knee summary", "left ankle summary", "right ankle summary"]:
        summary = text_info.get(joint, "")
        joint_display_name = joint_name_mapping.get(joint, joint.title())
        
        if summary:
            summary_upper = summary.upper()
            if "STRIDE SWEET SPOT" in summary_upper or "GOOD" in summary_upper:
                stride_sweet_spots.append(joint_display_name)
            elif "MAJOR OPPORTUNITY" in summary_upper or "BAD" in summary_upper:
                major_opportunities.append(joint_display_name)
            elif "MINOR OPPORTUNITY" in summary_upper or "MODERATE" in summary_upper:
                minor_opportunities.append(joint_display_name)
    
    # Print grouped summaries
    if stride_sweet_spots:
        pdf.set_text_color(150, 255, 150)  # Light green
        pdf.set_font("Arial", style='B', size=font_size)
        pdf.write(font_size / 2, "STRIDE SWEET SPOT: ")
        pdf.set_font("Arial", size=font_size)
        pdf.write(font_size / 2, ", ".join(stride_sweet_spots) + "\n")
        pdf.ln(1)
    
    if major_opportunities:
        pdf.set_text_color(255, 100, 100)  # Light red
        pdf.set_font("Arial", style='B', size=font_size)
        pdf.write(font_size / 2, "MAJOR OPPORTUNITIES TO IMPROVE: ")
        pdf.set_font("Arial", size=font_size)
        pdf.write(font_size / 2, ", ".join(major_opportunities) + "\n")
        pdf.ln(1)
    
    if minor_opportunities:
        pdf.set_text_color(255, 200, 100)  # Light orange/yellow
        pdf.set_font("Arial", style='B', size=font_size)
        pdf.write(font_size / 2, "MINOR OPPORTUNITIES TO IMPROVE: ")
        pdf.set_font("Arial", size=font_size)
        pdf.write(font_size / 2, ", ".join(minor_opportunities) + "\n")
        pdf.ln(3)
   
    # Smart footwear recommendation based on biomechanics
    def recommend_footwear(rom_values, camera_side, gait_type):
        """Recommend footwear based on posterior/frontal and sagittal plane biomechanics"""
        
        # Extract ROM values (reordered: Knee Right, Hip Right, Spine, Hip Left, Knee Left, Ankle Left, Ankle Right)
        knee_right_rom = rom_values[0]
        hip_right_rom = rom_values[1] 
        spine_rom = rom_values[2]
        hip_left_rom = rom_values[3]
        knee_left_rom = rom_values[4]
        ankle_left_rom = rom_values[5]
        ankle_right_rom = rom_values[6]
        
        # Average bilateral values
        avg_ankle_rom = (ankle_left_rom + ankle_right_rom) / 2
        avg_knee_rom = (knee_left_rom + knee_right_rom) / 2
        avg_hip_rom = (hip_left_rom + hip_right_rom) / 2
        
        # Primary: Posterior/Frontal Plane Assessment
        if camera_side == "back":
            # Overpronation indicators (Motion Control/Stability needed)
            if avg_ankle_rom > 15 or avg_knee_rom > 10 or avg_hip_rom > 15:
                if avg_ankle_rom > 20 or avg_knee_rom > 15:
                    return "Motion Control", "Excessive overpronation and knee valgus detected. Shoes with extra support on the inside of the foot help guide your stride and reduce extra inward rolling."
                else:
                    return "Stability", "Moderate overpronation detected. Dual-density midsole and guided motion control recommended."
            else:
                primary_rec = "Neutral"
        else:
            # Sagittal plane assessment for neutral/cushioned decision
            primary_rec = "Neutral"
        
        # Supporting: Sagittal Plane Refinement
        if camera_side == "side":
            # Limited ankle dorsiflexion + heel striking = cushioned shoes
            if gait_type in ["walking", "running"]:
                if avg_ankle_rom < 30 and spine_rom > 10:  # Limited ankle ROM + heel-strike posture
                    return "Maximum Cushioning", "Limited ankle mobility and heel-strike pattern detected. Enhanced shock absorption needed."
                elif avg_ankle_rom > 60 and avg_knee_rom > 100:  # Good mobility + forefoot striking
                    return "Minimalist/Neutral", "Excellent mobility and efficient movement pattern. Minimal interference recommended."
        
        # Default recommendation
        if primary_rec == "Neutral":
            return "Neutral", "Balanced biomechanics detected. Standard neutral support recommended."
        else:
            return primary_rec, "Biomechanics analysis suggests standard neutral support."
    
    # Get footwear recommendation
    footwear_type, footwear_reason = recommend_footwear(rom_values, camera_side, gait_type)

    pdf.set_text_color(96, 194, 228)  # Light blue color for the title
    pdf.set_font("Arial", style='B', size=12)
    pdf.write(6, f"Recommended Footwear: ")
    
    # Color-code the recommendation
    if footwear_type == "Motion Control":
        pdf.set_text_color(255, 100, 100)  # Red
    elif footwear_type == "Stability": 
        pdf.set_text_color(255, 200, 100)  # Orange
    elif footwear_type == "Maximum Cushioning":
        pdf.set_text_color(150, 200, 255)  # Light blue
    else:
        pdf.set_text_color(150, 255, 150)  # Light green
    
    pdf.set_font("Arial", style='B', size=12)
    pdf.write(6, f"{footwear_type}\n")
    
    pdf.set_text_color(255, 255, 255)  # White text
    pdf.set_font("Arial", size=10)
    pdf.ln(1)
    pdf.multi_cell(0, 5, f"Reason: {footwear_reason}")
    
    pdf.set_text_color(96, 194, 228)  # Light blue color for the title
    pdf.set_font("Arial", style='B', size=12)  # Bold and slightly larger
    pdf.write(6, "Recommended Training: ")
    pdf.ln(3)
    
    # Smart training recommendations based on biomechanics
    def recommend_training(rom_values, camera_side, gait_type, text_info):
        """Recommend targeted exercises based on biomechanical deficits"""
        
        # Extract ROM values (reordered: Knee Right, Hip Right, Spine, Hip Left, Knee Left, Ankle Left, Ankle Right)
        knee_right_rom = rom_values[0]
        hip_right_rom = rom_values[1] 
        spine_rom = rom_values[2]
        hip_left_rom = rom_values[3]
        knee_left_rom = rom_values[4]
        ankle_left_rom = rom_values[5]
        ankle_right_rom = rom_values[6]
        
        # Average bilateral values
        avg_ankle_rom = (ankle_left_rom + ankle_right_rom) / 2
        avg_knee_rom = (knee_left_rom + knee_right_rom) / 2
        avg_hip_rom = (hip_left_rom + hip_right_rom) / 2
        
        exercises = []
        
        # Analyze deficits and recommend exercises
        if camera_side == "back":
            # Frontal plane issues - focus on stability and control
            if avg_ankle_rom > 15 or avg_knee_rom > 10:  # Overpronation/valgus
                exercises.append({
                    "name": "   Single-Leg Glute Bridge",
                    "description": "3x12 each leg. Strengthens hip abductors to control knee valgus and pelvic stability.",
                    "target": "Hip abductor strength, pelvic control"
                })
                exercises.append({
                    "name": "   Calf Raises with Inversion Hold", 
                    "description": "3x15 with 3-sec hold. Strengthens posterior tibialis to control excessive pronation.",
                    "target": "Ankle stability, pronation control"
                })
            else:  # Good frontal plane control
                exercises.append({
                    "name": "   Lateral Band Walks",
                    "description": "3x15 each direction. Maintains hip abductor strength and lateral stability.",
                    "target": "Hip stability maintenance"
                })
        
        else:  # Sagittal plane (side view)
            # Analyze specific joint limitations
            if avg_ankle_rom < 30 and gait_type in ["walking", "running"]:  # Limited ankle mobility
                exercises.append({
                    "name": "   Wall Ankle Dorsiflexion Stretch",
                    "description": "3x30 seconds each foot. Improves ankle mobility for better heel-to-toe transition.",
                    "target": "Ankle dorsiflexion, calf flexibility"
                })
            
            if avg_hip_rom < 35 and gait_type in ["walking", "running"]:  # Limited hip ROM
                exercises.append({
                    "name": "   90/90 Hip Stretch + Hip Flexor Activation",
                    "description": "3x30 sec stretch + 10 leg lifts. Improves hip flexion ROM and activation.",
                    "target": "Hip mobility and flexor strength"
                })
            
            if avg_knee_rom < 60 and gait_type in ["walking", "running"]:  # Limited knee flexion
                exercises.append({
                    "name": "   Wall Sits with Calf Raises",
                    "description": "3x45 seconds. Builds knee flexion endurance and calf strength simultaneously.",
                    "target": "Knee flexion endurance, shock absorption"
                })
            
            if spine_rom > 15 or spine_rom < 3:  # Poor trunk control
                exercises.append({
                    "name": "   Dead Bug with Opposite Arm/Leg",
                    "description": "3x10 each side. Improves core stability and trunk control during movement.",
                    "target": "Core stability, trunk alignment"
                })
        
        # If no specific deficits, provide general recommendations
        if not exercises:
            exercises.append({
                "name": "   Single-Leg Romanian Deadlift",
                "description": "3x8 each leg. Maintains posterior chain strength and balance.",
                "target": "Overall stability and strength"
            })
            exercises.append({
               "name": "   Calf Raise to Heel Walk",
               "description": "3x10 transitions. Enhances ankle control through full range of motion.",
               "target": "Ankle strength and control"
           })

        return exercises[:1]  # Return top 1 recommendations
    
    # Get training recommendations
    training_exercises = recommend_training(rom_values, camera_side, gait_type, text_info)
    
    pdf.ln(3)
    for i, exercise in enumerate(training_exercises):
        # Exercise name in colored text
        pdf.set_text_color(150, 255, 150)  # Light green
        pdf.set_font("Arial", style='B', size=11)
        pdf.write(5, f"{i+1}. {exercise['name']}: ")
        
        # Exercise description in white
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Arial", size=10)
        pdf.write(5, f"{exercise['description']}\n")
        
        # Target area in light blue
        pdf.set_text_color(150, 200, 255)
        pdf.set_font("Arial", style='I', size=9)
        pdf.write(4, f"Target: {exercise['target']}\n")
        pdf.ln(2)

   # pdf.ln(12)  # Spacing before bottom text section
    # go to next page 
    pdf.add_page()
    
    pdf.set_text_color(96, 194, 228)  # blue Text for Highlights
    pdf.set_font("Arial", style='B', size=14)
    pdf.cell(0, 10, "Key Insights from Your Gait", ln=True)
    
    for joint in ["spine", "left hip", "right hip", "left knee", "right knee", "left ankle", "right ankle"]:
        insight = text_info.get(joint, "")
        if insight:
            color = joint_color_map[joint]
            pdf.set_text_color(*color)
            pdf.set_font("Arial", style='B', size=font_size)
            label = joint.title() + ": "
            pdf.write(font_size / 2, label)
            pdf.set_font("Arial", size=font_size)
            pdf.write(font_size / 2, insight + "\n")
            pdf.ln(2)
    
    if camera_side == "side" and gait_type == "running":        
        spine_text = '''A key indicator of your posture and alignment. A consistent angle of about 5-15 degrees throughout your stride is ideal, and any significant deviations may indicate potential issues with your core stability or posture.'''
        hip_text = '''A critical joint for power generation and stability. A consistent angle of about 30-50 degrees throughout your stride is ideal, and any significant deviations may indicate potential issues with your hip flexor or glute strength.'''
        knee_text = 'A key joint for shock absorption and propulsion. A consistent angle of about 160-180 degrees at heel strike and 120-140 degrees at toe-off is ideal, and any significant deviations may indicate potential issues with your quadriceps or hamstrings.'
        ankle_text = 'Plays an essential roll for push-off and stability. A consistent angle of about 90-100 degrees at heel strike and 20-30 degrees at toe-off is ideal, and any significant deviations may indicate potential issues with your calf or Achilles tendon.'
    elif camera_side == "back" and gait_type == "running":
        spine_text = '''A key indicator of your posture and alignment. A consistent angle of about 5-10 degrees throughout your stride is ideal, and any significant deviations may indicate potential issues with your core stability or posture.'''
        hip_text = '''A critical joint for power generation and stability. A consistent angle of about 5-10 degrees throughout your stride is ideal, and any significant deviations may indicate potential issues with your hip flexor or glute strength.'''
        knee_text = 'A key joint for shock absorption and propulsion. A consistent angle of <5 degrees at heel strike and 5-12 degrees at toe-off is ideal, and any significant deviations may indicate potential issues with your quadriceps or hamstrings.'
        ankle_text = 'Plays an essential roll for push-off and stability. A consistent angle of <5 degrees at heel strike and >20 degrees at toe-off is ideal, and any significant deviations may indicate potential issues with your calf or Achilles tendon.'
    elif camera_side == "side" and gait_type == "walking":
        spine_text = '''A key indicator of your posture and alignment. A consistent angle of <5 degrees throughout your stride is ideal, and any significant deviations may indicate potential issues with your core stability or posture.'''
        hip_text = '''A critical joint for power generation and stability. A consistent angle of about 25-45 degrees throughout your stride is ideal, and any significant deviations may indicate potential issues with your hip flexor or glute strength.'''
        knee_text = 'A key joint for shock absorption and propulsion. A consistent angle of about 50-70 degrees at heel strike and 20-30 degrees at toe-off is ideal, and any significant deviations may indicate potential issues with your quadriceps or hamstrings.'
        ankle_text = 'Plays an essential roll for push-off and stability. A consistent angle of about 10-25 degrees at heel strike and 20-30 degrees at toe-off is ideal, and any significant deviations may indicate potential issues with your calf or Achilles tendon.'
    elif camera_side == "back" and gait_type == "walking":
        spine_text = '''A key indicator of your posture and alignment. A consistent angle of <5 degrees throughout your stride is ideal, and any significant deviations may indicate potential issues with your core stability or posture.'''
        hip_text = '''A critical joint for power generation and stability. A consistent angle of <10 degrees throughout your stride is ideal, and any significant deviations may indicate potential issues with your hip flexor or glute strength.'''
        knee_text = 'A key joint for shock absorption and propulsion. A consistent angle of <5 degrees at heel strike and 5-10 degrees at toe-off is ideal, and any significant deviations may indicate potential issues with your quadriceps or hamstrings.'
        ankle_text = 'Plays an essential roll for push-off and stability. A consistent angle of <5 degrees at heel strike and >20 degrees at toe-off is ideal, and any significant deviations may indicate potential issues with your calf or Achilles tendon.'

    pdf.ln(5)

    pdf.set_text_color(96, 194, 228)  # blue for Header
    pdf.set_font("Arial", 'b', size=14)
    pdf.cell(0, 10, "Stride Sweet Spot", ln=True)

    joint_targets = {
    "Spine Segment Angle": {
        "text": spine_text,
        "color": (200, 162, 200),  # Purple
        "study_url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC1896074/" if camera_side == "side" and gait_type == "running" else "https://pubmed.ncbi.nlm.nih.gov/26618444/" if camera_side == "back" and gait_type == "running" else None
    },
    "Hips": {
        "text": hip_text,
        "color": (144, 238, 144),  # Green
        "study_url": "https://www.niccostiff.co.uk/wp-content/uploads/2020/02/Biomechanics-of-running-gait.pdf" if camera_side == "side" and gait_type == "running" else "https://pubmed.ncbi.nlm.nih.gov/26364243/" if camera_side == "back" and gait_type == "running" else None
    },
    "Knees": {
        "text": knee_text,
        "color": (173, 216, 230),  # Blue
        "study_url": "https://www.niccostiff.co.uk/wp-content/uploads/2020/02/Biomechanics-of-running-gait.pdf" if camera_side == "side" and gait_type == "running" else "https://pmc.ncbi.nlm.nih.gov/articles/PMC3537459/" if camera_side == "back" and gait_type == "running" else None
    },
    "Ankles": {
        "text": ankle_text,
        "color": (255, 182, 193),  # Red
        "study_url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4994968/" if camera_side == "side" and gait_type == "running" else "https://pmc.ncbi.nlm.nih.gov/articles/PMC9310770/" if camera_side == "back" and (gait_type == "running" or gait_type == "walking") else None
    }
}

    for joint_label, data in joint_targets.items():
        pdf.set_text_color(*data["color"])
        pdf.set_font("Arial", style='B', size=font_size)        
        pdf.write(font_size / 2, f"{joint_label}: ")
        pdf.set_font("Arial", size=font_size)
        pdf.write(font_size / 2, data["text"])
        
        # Add hyperlink if study URL is provided
        if data.get("study_url"):
            pdf.write(font_size / 2, " ")  # Add space before link
            # Store current position for link
            x_start = pdf.get_x()
            y_start = pdf.get_y()
            
            # Write link text in blue
            pdf.set_text_color(0, 100, 200)  # Blue color for link
            pdf.set_font("Arial", style='U', size=font_size-1)  # Underlined, slightly smaller
            link_text = "(study)"
            pdf.write(font_size / 2, link_text)
            
            # Get link dimensions
            link_width = pdf.get_string_width(link_text)
            link_height = font_size / 2
            
            # Add the actual hyperlink
            pdf.link(x_start, y_start, link_width, link_height, data["study_url"])
            
            # Reset text color
            pdf.set_text_color(*data["color"])
        
        pdf.write(font_size / 2, "\n")
        pdf.ln(1)

    pdf.ln(3)

    # ✅ Invitation to Optional Coaching Session
    coaching_invite = "Get expert-level insights from a biomechanist (Stride Syncer) to fine-tune your stride."
    
    pdf.ln(3)

    pdf.set_text_color(96, 194, 228)  # blue color for the title
    pdf.set_font("Arial", style='B', size=13)  # Bold and slightly larger
    pdf.cell(0, 10, "Coaching & Gait Review", ln=True)

    pdf.set_text_color(255, 255, 255)  # White text for readability
    pdf.set_font("Arial", size=font_size)
    pdf.multi_cell(0, 5, coaching_invite)

    # Highlight Contact Info with Bigger, Bold White Text
    pdf.set_text_color(255, 255, 255)  # Bright green for attention
    pdf.set_font("Arial", style='B', size=11)  # Bigger and bold

    pdf.ln(2)

    pdf.cell(0, 10, "Contact a Stride Syncer: dholling4@gmail.com", ln=True)

    pdf.set_text_color(255, 255, 255)  
    pdf.set_font("Arial", style='B', size=11)
    # Add clickable website link
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Arial", style='U', size=11)
    link_text = "Website: stride-sync.b12sites.com"
    pdf.cell(0, 10, link_text, ln=True, link="https://stride-sync.b12sites.com")
    pdf.set_text_color(96, 194, 228) 

    # Place at bottom of page
    pdf.set_xy(150, 254)  # Near the bottom of A4 (297mm height)
    pdf.set_text_color(96, 194, 228)
    pdf.set_font("Arial", style='B', size=9)
    pdf.cell(0, 10, "Stride into peak gait performance", ln=True)
    #  A smarter stride with every step.
    # ✅ Add a QR Code for the Website
    qr_code_url = "https://stride-sync.b12sites.com/index"
    qr_code_path = tempfile.mktemp(suffix=".png")
    qr_code = qrcode.make(qr_code_url)
    qr_code.save(qr_code_path)
    # place text directly above the qr code image
    pdf.set_font("Arial", style='B', size=9)
    pdf.set_text_color(96, 194, 228)  
    pdf.set_xy(160, 260)  # Position above the QR code
    pdf.cell(0, 5, "Scan QR code for more info.", align='C')
    pdf.image(qr_code_path, x=161, y=265, w=30)

    # ✅ Save PDF
    pdf_file_path = tempfile.mktemp(suffix=".pdf")
    pdf.output(pdf_file_path)
    
    return pdf_file_path

def detect_peaks(data, column, prominence, distance):
    peaks, _ = find_peaks(data[column], prominence=prominence, distance=distance)
    return peaks

def detect_mins(data, column, prominence, distance):
    mins, _ = find_peaks(-data[column], prominence=prominence, distance=distance)
    return mins

def compute_stats(data, peaks, column):
    cycle_stats = []
    for i in range(len(peaks) - 1):
        cycle_data = data[column][peaks[i]:peaks[i + 1]]
        cycle_stats.append({
            "Cycle": i + 1,
            "Mean": np.mean(cycle_data),
            "Std Dev": np.std(cycle_data),
            "Max": np.max(cycle_data),
            "Min": np.min(cycle_data)
        })
    return pd.DataFrame(cycle_stats)

# Setup MediaPipe Pose model
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

KEYPOINTS_OF_INTEREST = {
    23: "Left Hip",
    24: "Right Hip",
    25: "Left Knee",
    26: "Right Knee",
    27: "Left Ankle",
    28: "Right Ankle",
    29: "Left Heel",
    30: "Right Heel",
    31: "Left Foot",
    32: "Right Foot"
}

def process_first_frame_report(video_path, video_index):
    """Use pose estimation overlay for generate pdf report."""
    neon_green = (57, 255, 20)
    cool_blue = (0, 91, 255)

    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps

    # ➕ Check if video is rotated based on first frame
    ret, test_frame = cap.read()
    if not ret:
        raise ValueError("Couldn't read from video.")
    
    rotated = False
    if (test_frame.shape[0] < test_frame.shape[1]) and ("pickup" not in video_path):  # height < width → probably rotated
        rotated = True
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # Reset back to start

    # If the video is longer than 10 seconds, capture only the middle 5 seconds
    # if duration > 10:
    #     start_frame = total_frames // 2 - (5 * fps)
    #     end_frame = total_frames // 2 + (5 * fps)
    #     cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
    #     total_frames = int(end_frame - start_frame)
    #     duration = total_frames / fps
    # else:
    #     start_frame = total_frames // 2 
    start_frame = 0
    end_frame = int(total_frames - start_frame)

    frame_number = start_frame
    time = frame_number / fps
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
    
    ret, frame = cap.read()
    if rotated:
        frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)

    if not ret:
        st.error("Failed to read the selected frame.")
        cap.release()
        return None, None, None  # Return None if no valid frame

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        results = pose.process(frame_rgb)
        if results.pose_landmarks:
            annotated_frame = frame.copy()
            mp_drawing.draw_landmarks(
                annotated_frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=solutions.drawing_styles.DrawingSpec(color=neon_green, thickness=10, circle_radius=7),
                connection_drawing_spec=solutions.drawing_styles.DrawingSpec(color=cool_blue, thickness=10)
            )

            # Save the processed frame as an image
            image_path = tempfile.mktemp(suffix=".png")
            cv2.imwrite(image_path, annotated_frame)
            
            # st.image(cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB), caption=f"Frame {frame_number}")
            
            cap.release()
            return frame_number, time, image_path  # Return image path

    cap.release()
    return None, None, None

def process_first_frame(video_path, video_index):
    """Processes a selected frame from a video and shows frame number and timestamp with pose overlay."""

    neon_green = (57, 255, 20)
    cool_blue = (0, 91, 255)

    # Open video file
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        st.error("Unable to open video file.")
        return None, None, None

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps

    # Read first frame to check if rotated
    ret, test_frame = cap.read()
    if not ret:
        st.error("Couldn't read video for orientation check.")
        cap.release()
        return None, None, None
    rotated = test_frame.shape[0] < test_frame.shape[1]
    cap.release()

    st.markdown(f"**Video Info:**  \nFrames: `{total_frames}`  |  FPS: `{fps:.1f}`  |  Duration: `{duration:.2f}s`")

    # ✅ Create a frame selector
    frame_number_selected = st.slider(
        "🎞️ Select video frame",
        min_value=0,
        max_value=total_frames - 1,
        value=min(5, total_frames - 1),
        key=f"frame_slider_{video_index}_{hash(video_path)}"
    )

    time = frame_number_selected / fps
    st.markdown(f"**🕒 Frame:** `{frame_number_selected}` → `{time:.2f}s`")

    # ✅ Re-open and set frame
    cap = cv2.VideoCapture(video_path)
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number_selected)
    ret, frame = cap.read()
    cap.release()

    if not ret:
        st.error("❌ Failed to read the selected frame.")
        return frame_number_selected, time, None

    if rotated:
        frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # ✅ Run pose detection
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        results = pose.process(frame_rgb)
        if results.pose_landmarks:
            annotated_frame = frame.copy()
            mp_drawing.draw_landmarks(
                annotated_frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=solutions.drawing_styles.DrawingSpec(color=neon_green, thickness=10, circle_radius=7),
                connection_drawing_spec=solutions.drawing_styles.DrawingSpec(color=cool_blue, thickness=10)
            )
            # Save and display
            image_path = tempfile.mktemp(suffix=".png")
            cv2.imwrite(image_path, annotated_frame)

            st.image(cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB), caption=f"📸 Frame {frame_number_selected}")

            return frame_number_selected, time, image_path
        else:
            st.warning("Pose landmarks not detected.")
            return frame_number_selected, time, None

def calculate_angle(v1, v2):
    """
    Calculate the angle between two vectors using the dot product.
    """
    dot_product = np.dot(v1, v2)
    magnitude_v1 = np.linalg.norm(v1)
    magnitude_v2 = np.linalg.norm(v2)
    angle_radians = np.arccos(dot_product / (magnitude_v1 * magnitude_v2))
    angle_degrees = np.degrees(angle_radians)
    return angle_degrees

###
def plot_joint_angles(time, angles, label, frame_time):
    fig = go.Figure()
    
    # Add the joint angle curve
    fig.add_trace(go.Scatter(x=time, y=angles, mode='lines', name=label))
    
    # Add vertical line for selected frame
    fig.add_trace(go.Scatter(
        x=[frame_time, frame_time],
        y=[min(angles), max(angles)],
        mode='lines',
        line=dict(color='red', dash='dash'),
        name='Selected Frame'
    ))
    
    fig.update_layout(
        title=f"{label} Joint Angles",
        xaxis_title="Time (s)",
        yaxis_title="Angle (degrees)"
    )
    
    st.plotly_chart(fig)


def perform_pca(df, video_index):
    st.write("### Principal Component Analysis (PCA)")

    # Extract numerical joint angle data
    X = df.iloc[:, 1:].values
    
    # User selects number of principal components
    pcs = st.slider('Select the number of Principal Components:', 1, min(30, X.shape[1]), 3)
    st.write(f"Number of Principal Components Selected: {pcs}")
    
    # Perform PCA
    pca = PCA(n_components=pcs)
    principal_components = pca.fit_transform(X)

    # Explained variance
    explained_variance = pca.explained_variance_ratio_ 
    cumulative_variance = np.cumsum(explained_variance) 

    # dataframe for explained variance
    pca_df = pd.DataFrame({
        "Principal Component": [f"PC{i+1}" for i in range(len(explained_variance))],
        "Explained Variance (%)": explained_variance * 100,
        "Cumulative Variance (%)": cumulative_variance * 100
    })

    # Get absolute loadings (importance of each feature in each PC)
    loadings = np.abs(pca.components_)

    # Get top contributing features for each PC
    feature_labels = ["Left Hip", "Right Hip", "Left Knee", "Right Knee", "Left Ankle", "Right Ankle", "Spine Angle"]

    top_features_per_pc = []
    for i in range(pcs):
        top_feature_idx = np.argsort(-loadings[i])  # Sort in descending order
        top_features_per_pc.append([feature_labels[j] for j in top_feature_idx])

    # Create DataFrame
    pca_feature_df = pd.DataFrame(top_features_per_pc, index=[f"PC{i+1}" for i in range(pcs)])
    pca_feature_df.columns = [f"Rank {i+1}" for i in range(len(feature_labels))]  # Rank features

        
    top_features_per_pc = []
    for i in range(pcs):
        top_feature_idx = np.argsort(-loadings[i])  # Sort in descending order
        top_features_per_pc.append([feature_labels[j] for j in top_feature_idx])

    # Create DataFrame
    pca_feature_df = pd.DataFrame(top_features_per_pc, 
                                index=[f"PC{i+1}" for i in range(pcs)])
    pca_feature_df.columns = [f"Rank {i+1}" for i in range(len(feature_labels))]  # Rank features
    top_features = pca_feature_df

    fig = go.Figure()
    for i, feature in enumerate(top_features.iloc[:, 0]):  # Use only the top contributing feature
        fig.add_trace(go.Bar(
            x=[f"PC{i+1} ({feature})"],  # Label PC with the top feature
            y=[explained_variance[i] * 100],
            name=f"PC{i+1} ({feature})"
        ))

    explained_variance = pca.explained_variance_ratio_ 
    cumulative_variance = np.cumsum(explained_variance) 
    feature_labels = ["Left Hip", "Right Hip", "Left Knee", "Right Knee", "Left Ankle", "Right Ankle", "Spine Angle"]
    loadings = np.abs(pca.components_)
    top_features_ = [feature_labels[np.argmax(loadings[i])] for i in range(pcs)]

    pca_df = pd.DataFrame({
        "Principal Component": [f"PC{i+1} ({top_features_[i]})" for i in range(len(explained_variance))],
        "Explained Variance (%)": explained_variance * 100,
        "Cumulative Variance (%)": cumulative_variance * 100,
    })

   
    fig.add_trace(go.Scatter(
        x=[f"PC{i+1} ({feature})" for i, feature in enumerate(top_features.iloc[:, 0])],
        y=cumulative_variance * 100,
        mode="lines+markers",
        name="Cumulative Variance (%)",
        line=dict(color='red', dash="dash")
    ))

    fig.update_layout(
        title="Explained Variance with Top Contributing Feature",
        xaxis_title="Principal Components",
        yaxis_title="Explained Variance (%)",
        legend_title="Legend"
    )
    st.plotly_chart(fig)
    # download plot data 
    pca_plot_csv = pca_df.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="Download PCA Plot Data",
        data=pca_plot_csv,
        file_name="pca_plot_data.csv",
        mime="text/csv",
        key=f"pca_{video_index}"
    )

    # st.dataframe(top_features)

    st.dataframe(pca_df)

    # combine the two dataframes and download
    pca_data = pd.concat([pca_df, top_features], axis=1)
    pca_feature_csv = pca_data.to_csv(index=False).encode('utf-8')

  
    # 2D PCA Scatter Plot (Only if at least 2 PCs are selected)
    if pcs >= 2:
        fig_2d = go.Figure()
        fig_2d.add_trace(go.Scatter(
            x=principal_components[:, 0],
            y=principal_components[:, 1],
            mode='markers',
            marker=dict(size=6, color=df["Time"], colorscale='Blues', showscale=True, colorbar=dict(title="Time", tickmode="array", tickvals=[df["Time"].min(), df["Time"].max()], ticktext=["Start", "End"])),
            text=df["Time"]
        ))

        fig_2d.update_layout(title="PCA Projection (2D)", xaxis_title="PC1", yaxis_title="PC2")
        st.plotly_chart(fig_2d)

        # download plot button
        pca_2d_csv = pd.DataFrame(principal_components[:, :2], columns=[f"PC{i+1}" for i in range(2)]).to_csv(index=False).encode('utf-8')
        
        st.download_button(
            label="Download 2D PCA Data",
            data=pca_2d_csv,
            file_name="pca_2d_data.csv",
            mime="text/csv",
            key=f"pca_2d_{video_index}"
        )

    # 3D PCA Scatter Plot (Only if at least 3 PCs are selected)
    if pcs >= 3:
        fig_3d = go.Figure(data=[go.Scatter3d(
            x=principal_components[:, 0], 
            y=principal_components[:, 1], 
            z=principal_components[:, 2],
            mode='markers', 
            marker=dict(size=4, color=df["Time"], colorscale='Blues', showscale=True, colorbar=dict(title="Time", tickmode="array", tickvals=[df["Time"].min(), df["Time"].max()], ticktext=["Start", "End"])),
            text=df["Time"]
        )])
        fig_3d.update_layout(title="PCA Projection (3D)",
                             scene_xaxis_title="PC1",
                             scene_yaxis_title="PC2",
                             scene_zaxis_title="PC3")
        st.plotly_chart(fig_3d)
        # download plot button
        pca_3d_csv = pd.DataFrame(principal_components, columns=[f"PC{i+1}" for i in range(pcs)]).to_csv(index=False).encode('utf-8')
        st.download_button(
            label="Download 3D PCA Data",
            data=pca_3d_csv,
            file_name="pca_3d_data.csv",
            mime="text/csv",
            key=f"pca_3d_{video_index}"
        )

def plot_asymmetry_bar_chart(left_hip, right_hip, left_knee, right_knee, left_ankle, right_ankle):
    # Calculate the range of motion differences (right - left)
    hip_asymmetry = right_hip - left_hip
    knee_asymmetry = right_knee - left_knee
    ankle_asymmetry = right_ankle - left_ankle
    
    # Create a dictionary to hold the values for each joint
    asymmetry_data = {
        "Ankle": ankle_asymmetry,
        "Knee": knee_asymmetry,
        "Hip": hip_asymmetry
    }

    # Set thresholds for excessive asymmetry
    threshold = 10  # degrees

    # Create a color scale based on the absolute difference
    colors = []
    for value in asymmetry_data.values():
        abs_value = abs(value)  # Use absolute value to determine the color
        if abs_value > threshold:
            colors.append('red')  # If the absolute difference is larger than threshold, color red
        else:
            colors.append('green')  # If the difference is smaller, color green
    
    # Create the plot
    fig = go.Figure()

    fig.add_trace(go.Bar(
        y=list(asymmetry_data.keys()),
        x=list(asymmetry_data.values()),
        orientation='h',
        marker=dict(
            color=[abs(value) for value in asymmetry_data.values()],  # Color by absolute difference
            colorscale='RdYlGn',  # Red to Green color scale, but will reverse it to make higher values red
            colorbar=dict(title="Asymmetry (°)"),  # Add colorbar
            cmin=0,  # Minimum value for color scale
            cmax=40,  # Maximum value for color scale
            reversescale=True,  # Reverse the color scale
            colorbar_tickfont=dict(size=18)
        ),
        name="Left vs Right Asymmetry",
        text=[f"{value:.1f}°" for value in asymmetry_data.values()],  # Add text labels
        textfont=dict(size=16),  # Increase font size for text labels
        textposition='outside'  # Position text labels outside the bars
    ))

    fig.update_layout(
        title="Range of Motion",
        # increaes title fontsize
        title_font_size=42,
        xaxis_title="← Left Asymmetry (°)           Right Asymmetry (°) →",
        xaxis_title_font_size=22,
        yaxis_title="",
        showlegend=False,
        xaxis=dict(
            zeroline=True,
            zerolinecolor="white",
            zerolinewidth=2,
            range=[-30, 30],  # Fixed range from -30 to 30 for the x-axis
            tickvals=[-30, -20, -10, 0, 10, 20, 30],  # Tick labels for the fixed range
            ticktext=["-30", "-20", "-10", "0", "10", "20", "30"],  # Custom tick labels
            tickfont=dict(size=22)  # Increase tick font size

        ),
        yaxis=dict(tickvals=[0, 1, 2], ticktext=["Ankle", "Knee", "Hip"], tickfont=dict(size=22)),
        height=310,  # Shorten the graph height
        bargap=0.1
    )

    return fig

# Butterworth lowpass filter functions
def butter_lowpass_filter(data, cutoff=6, fs=30, order=4):
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    return lfilter(b, a, data)

def process_video(user_footwear, gait_type, camera_side, video_path, output_txt_path, frame_time, video_index):
    # OPTIMIZATION: Clear memory before processing large videos
    gc.collect()
    
    # add after uploading 
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps  

    # ➕ Check if video is rotated based on first frame
    ret, test_frame = cap.read()
    if not ret:
        raise ValueError("Couldn't read from video.")

    rotated = False
    if (test_frame.shape[0] < test_frame.shape[1]) and (gait_type != "pickup pen"):  # height < width → probably rotated
        rotated = True
 
    # cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # Reset back to start
    ### done add after uploading
  
    # start_frame = 0
    # end_frame = total_frames
    
    # Arrays will be initialized in optimized processing section
    thorax_angles, lumbar_angles = [], []

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # If the video is longer than 12 seconds, capture only the middle 12 seconds
    if duration > 12:
        start_frame_crop = int(total_frames // 2 - (6 * fps))  # 6 seconds before center
        end_frame_crop = int(total_frames // 2 + (6 * fps))    # 6 seconds after center
    else:
        # If video is 12 seconds or shorter, use the entire video
        start_frame_crop = 0
        end_frame_crop = total_frames
    
    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame_crop)
    total_frames = int(end_frame_crop - start_frame_crop)
    duration = total_frames / fps

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        # OPTIMIZATION 1: Sample every Nth frame instead of processing all frames
        frame_skip = max(1, int(fps // 10))  # Process ~10 frames per second maximum
        
        # OPTIMIZATION 2: Pre-allocate arrays with known size
        expected_frames = (end_frame_crop - start_frame_crop) // frame_skip
        left_knee_angles = []
        right_knee_angles = []
        left_hip_angles = []
        right_hip_angles = []
        left_ankle_angles = []
        right_ankle_angles = []
        spine_segment_angles = []
        
        frame_idx = 0
        for frame_pos in range(start_frame_crop, end_frame_crop, frame_skip):
            # OPTIMIZATION 3: Jump directly to target frames
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_pos)
            ret, frame = cap.read()
            
            if not ret:
                break
                
            # OPTIMIZATION 4: Only rotate if actually rotated
            if rotated:
                frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)
            
            # OPTIMIZATION 5: Process frame
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(frame_rgb)
            
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                def get_coords(landmark):
                    return np.array([landmark.x, landmark.y])
                
                left_shoulder = get_coords(landmarks[11])
                right_shoulder = get_coords(landmarks[12])                 
                
                left_hip = get_coords(landmarks[23])
                right_hip = get_coords(landmarks[24])
                left_knee = get_coords(landmarks[25])
                right_knee = get_coords(landmarks[26])
                left_ankle = get_coords(landmarks[27])
                right_ankle = get_coords(landmarks[28])
                left_foot = get_coords(landmarks[31])
                right_foot = get_coords(landmarks[32])

                # midpoint of trunk vector
                shoulder_mid = (left_shoulder + right_shoulder) / 2
                hip_mid = (left_hip + right_hip) / 2
                
                trunk_vector = shoulder_mid - hip_mid

                # Upward vertical in image coordinates
                vertical_vector = np.array([0, -1])  
                left_trunk_vector = left_shoulder - left_hip
                right_trunk_vector = right_shoulder - right_hip
                left_thigh_vector = left_hip - left_knee
                left_shank_vector = left_knee - left_ankle
                right_thigh_vector = right_hip - right_knee
                right_shank_vector = right_knee - right_ankle
                left_foot_vector = left_ankle - left_foot
                right_foot_vector = right_ankle - right_foot

                # spine segment angle
                spine_segment_angles.append(calculate_angle(trunk_vector, vertical_vector))                
                left_hip_angles.append(calculate_angle(left_trunk_vector, left_thigh_vector))
                right_hip_angles.append(calculate_angle(right_trunk_vector, right_thigh_vector))
                left_knee_angles.append(calculate_angle(left_thigh_vector, left_shank_vector))
                right_knee_angles.append(calculate_angle(right_thigh_vector, right_shank_vector))
                left_ankle_angles.append(calculate_angle(left_shank_vector, left_foot_vector))
                right_ankle_angles.append(calculate_angle(right_shank_vector, right_foot_vector))
                
            frame_idx += 1
            
            # OPTIMIZATION 7: Periodic memory cleanup for very long videos
            if frame_idx % 50 == 0:  # Every 50 processed frames
                gc.collect()

    # OPTIMIZATION 6: Adjust time array for frame skipping
    time = np.arange(0, len(left_hip_angles)) * frame_skip / fps  # Time in seconds accounting for frame skip
    cap.release()

    # OPTIMIZATION 8: Batch apply lowpass filters for efficiency
    cutoff_frequency = 6  # Adjust cutoff frequency based on signal characteristics
    angles_dict = {
        'left_hip': left_hip_angles,
        'right_hip': right_hip_angles,
        'left_knee': left_knee_angles,
        'right_knee': right_knee_angles,
        'left_ankle': left_ankle_angles,
        'right_ankle': right_ankle_angles,
        'spine_segment': spine_segment_angles
    }
    
    # Apply filters in batch
    for key, angles in angles_dict.items():
        angles_dict[key] = butter_lowpass_filter(angles, cutoff_frequency, fps)
    
    # Extract filtered angles
    left_hip_angles = angles_dict['left_hip']
    right_hip_angles = angles_dict['right_hip']
    left_knee_angles = angles_dict['left_knee']
    right_knee_angles = angles_dict['right_knee']
    left_ankle_angles = angles_dict['left_ankle']
    right_ankle_angles = angles_dict['right_ankle']
    spine_segment_angles = angles_dict['spine_segment'] 

    ### CROP HERE ###
    start_time, end_time = st.slider(
    "Select time range",
    min_value=float(0),
    max_value=float(total_frames/fps - 1),
    value=(float(0), float(total_frames/fps - 1)),
    key=f"side_time_range_{video_index}_{camera_side}_{hash(video_path)}")
    
    start_frame_crop = int(start_time * fps)
    end_frame_crop = int(end_time * fps)
    st.write(f"Selected frame range: {start_frame_crop} to {end_frame_crop}")
    st.write(f"Selected time range: {start_frame_crop/fps:.2f}s to {end_frame_crop/fps:.2f}s")

    mask = (time >= start_frame_crop) & (time <= end_frame_crop)
    filtered_time = time[mask]

    filtered_spine_segment_angles = np.array(spine_segment_angles)[mask]
    filtered_left_hip_angles = np.array(left_hip_angles)[mask]
    filtered_right_hip_angles = np.array(right_hip_angles)[mask]
    filtered_left_knee_angles = np.array(left_knee_angles)[mask]
    filtered_right_knee_angles = np.array(right_knee_angles)[mask]
    filtered_left_ankle_angles = np.array(left_ankle_angles)[mask]
    filtered_right_ankle_angles = np.array(right_ankle_angles)[mask]

    hip_data = {
    "Time (s)": filtered_time,
    "Left Hip Angle (degrees)": filtered_left_hip_angles,
    "Right Hip Angle (degrees)": filtered_right_hip_angles
    }

    knee_data = {
        "Time (s)": filtered_time,
        "Left Knee Angle (degrees)": filtered_left_knee_angles,
        "Right Knee Angle (degrees)": filtered_right_knee_angles
    }

    ankle_data = {
        "Time (s)": filtered_time,
        "Left Ankle Angle (degrees)": filtered_left_ankle_angles,
        "Right Ankle Angle (degrees)": filtered_right_ankle_angles
    }

    # Create a DataFrame
    hip_df = pd.DataFrame(hip_data)
    knee_df = pd.DataFrame(knee_data)
    ankle_df = pd.DataFrame(ankle_data)

     # HIP RANGES
    column_left = "Left Hip Angle (degrees)"
    prominence = 4
    distance = fps / 2  # Assuming fps/2 equivalent    
    peaks_left = detect_peaks(hip_df, column_left, prominence, distance)
    mins_left = detect_mins(hip_df, column_left, prominence, distance)
    hip_left_mins_mean = np.mean(hip_df[column_left].iloc[mins_left])
    hip_left_mins_std = np.std(hip_df[column_left].iloc[mins_left])
    hip_left_peaks_mean = np.mean(hip_df[column_left].iloc[peaks_left])
    hip_left_peaks_std = np.std(hip_df[column_left].iloc[peaks_left])    
    column_right = "Right Hip Angle (degrees)"
    peaks_right = detect_peaks(hip_df, column_right, prominence, distance)
    mins_right = detect_mins(hip_df, column_right, prominence, distance)
    hip_right_mins_mean = np.mean(hip_df[column_right].iloc[mins_right])
    hip_right_mins_std = np.std(hip_df[column_right].iloc[mins_right])
    hip_right_peaks_mean = np.mean(hip_df[column_right].iloc[peaks_right])
    hip_right_peaks_std = np.std(hip_df[column_right].iloc[peaks_right])
        
    # KNEE CYCLES
    column_left = "Left Knee Angle (degrees)"
    prominence = 4
    distance = fps / 2
    peaks_left = detect_peaks(knee_df, column_left, prominence, distance)
    mins_left = detect_mins(knee_df, column_left, prominence, distance)
    knee_left_mins_mean = np.mean(knee_df[column_left].iloc[mins_left])
    knee_left_mins_std = np.std(knee_df[column_left].iloc[mins_left])
    knee_left_peaks_mean = np.mean(knee_df[column_left].iloc[peaks_left])
    knee_left_peaks_std = np.std(knee_df[column_left].iloc[peaks_left])
    column_right = "Right Knee Angle (degrees)"
    peaks_right = detect_peaks(knee_df, column_right, prominence, distance)
    mins_right = detect_mins(knee_df, column_right, prominence, distance)
    knee_right_mins_mean = np.mean(knee_df[column_right].iloc[mins_right])
    knee_right_mins_std = np.std(knee_df[column_right].iloc[mins_right])
    knee_right_peaks_mean = np.mean(knee_df[column_right].iloc[peaks_right])
    knee_right_peaks_std = np.std(knee_df[column_right].iloc[peaks_right])
    
    # ANKLE CYCLES
    column_left = "Left Ankle Angle (degrees)"
    prominence = 4
    distance = fps / 2
    peaks_left = detect_peaks(ankle_df, column_left, prominence, distance)
    mins_left = detect_mins(ankle_df, column_left, prominence, distance)
    ankle_left_mins_mean = np.mean(ankle_df[column_left].iloc[mins_left])
    ankle_left_mins_std = np.std(ankle_df[column_left].iloc[mins_left])
    ankle_left_peaks_mean = np.mean(ankle_df[column_left].iloc[peaks_left])
    ankle_left_peaks_std = np.std(ankle_df[column_left].iloc[peaks_left])
    column_right = "Right Ankle Angle (degrees)"
    peaks_right = detect_peaks(ankle_df, column_right, prominence, distance)
    mins_right = detect_mins(ankle_df, column_right, prominence, distance)
    ankle_right_mins_mean = np.mean(ankle_df[column_right].iloc[mins_right])
    ankle_right_mins_std = np.std(ankle_df[column_right].iloc[mins_right])
    ankle_right_peaks_mean = np.mean(ankle_df[column_right].iloc[peaks_right])
    ankle_right_peaks_std = np.std(ankle_df[column_right].iloc[peaks_right])
   
    rom_values = [
    np.ptp(filtered_right_knee_angles),
    np.ptp(filtered_right_hip_angles),
    np.ptp(filtered_spine_segment_angles),
    np.ptp(filtered_left_hip_angles),
    np.ptp(filtered_left_knee_angles),
    np.ptp(filtered_left_ankle_angles),
    np.ptp(filtered_right_ankle_angles)
        ]
    
    joint_labels = ['Right Joint Knee', 'Right Joint Hip', 'Spine Segment', 'Left Joint Hip', 'Left Joint Knee', 'Left Joint Ankle', 'Right Joint Ankle']
    knee_right_rom_mean = knee_right_peaks_mean - knee_right_mins_mean
    knee_left_rom_mean = knee_left_peaks_mean - knee_left_mins_mean
    hip_right_rom_mean = hip_right_peaks_mean - hip_right_mins_mean
    hip_left_rom_mean = hip_left_peaks_mean - hip_left_mins_mean
    ankle_right_rom_mean = ankle_right_peaks_mean - ankle_right_mins_mean
    ankle_left_rom_mean = ankle_left_peaks_mean - ankle_left_mins_mean
    spine_segment_rom_mean = np.ptp(filtered_spine_segment_angles)
# HIP JOINT: 
    # 1. https://pmc.ncbi.nlm.nih.gov/articles/PMC9325808/ 
    # 2. https://puresportsmed.com/blog/posts/what-long-distance-runners-can-do-to-avoid-overuse-injuries
    # Hip adduction: 
        # Increased peak hip adduction during stance is associated with tibial stress fractures and other overuse injuries (1).
        # Excessive pelvic drop (linked to weak hip abductors) further compounds this risk (1)
    # Hip Flexion/extension:
        # Limited hip ROM (<60° total flexion-extension) can lead to compensatory mechanics, increasing the likelihood of injuries such as hamstring strains or lower back pain (2)

# KNEE JOINT: https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0288814
# Frontal Plane KNEE Motion:
    # Excessive valgus or varus motion during stance increases patellofemoral stress and risk of overuse injuries like patellofemoral pain syndrome (PFPS)3.
    # Greater knee valgus-varus excursion (i.e., instability) during stance is linked to increased odds of injury.
# Sagittal Plane KNEE Motion:
    # Reduced knee flexion during initial contact and stance compromises shock absorption, potentially increasing injury risk. However, there is no direct association between sagittal knee flexion angles and general running-related injuries (RRIs) https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0288814 

    # source for rom values: https://pmc.ncbi.nlm.nih.gov/articles/PMC4994968/
    # ankle, knee, and hip ROM values: https://www.physio-pedia.com/Running_Biomechanics
    # spine: https://pmc.ncbi.nlm.nih.gov/articles/PMC1896074/
        # Excessive forward lean (>15° relative to the vertical axis) may increase strain on the lumbar spine and reduce efficiency. https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0288814
        # However, no specific sagittal plane thresholds for spine angle are directly linked to running injuries in the results
        # While no injury-specific ROM is quantified, excessive forward lean or reduced lumbar mobility may impair shock absorption:
        # Sagittal lumbar ROM increases during downhill running, potentially straining passive spinal structures6.
        # Maintaining a 5–15° forward lean (relative to vertical) optimizes balance and force distribution https://pmc.ncbi.nlm.nih.gov/articles/PMC1896074/
    spine_rom_good = 10 # 5 to 15 
    ankle_plantar_good = 55 # 40 to 55
    ankle_dorsi_good = 20 # 15 to 25 (<15 is moderate (https://www.runnersworld.com/uk/health/injury/a41329624/dorsiflexion/) <10 is bad)
    # Excessive eversion during stance, or prolonged time spent in an everted position, is associated with medial tibial stress syndrome (MTSS) and tibial stress fractures https://pmc.ncbi.nlm.nih.gov/articles/PMC9325808/.
    # Increased peak inversion at initial contact is a biomechanical risk factor for Achilles tendinopathy https://pmc.ncbi.nlm.nih.gov/articles/PMC9325808/
    ankle_inv_good = 23
    ankle_evert_good = 12
    ankle_rom_good = 70 # 65 to 75; another study said 86
    ankle_rom_walk_good = 30

    # No direct ROM thresholds are established, but restricted motion during loading phases increases joint stress:
    # Reduced knee flexion during stance phase elevates patellofemoral pain risk (https://pubmed.ncbi.nlm.nih.gov/36150753/).
    # Soft landing strategies (reducing peak knee forces) lower injury risk by ~67% (https://pubmed.ncbi.nlm.nih.gov/36150753/).
    knee_flex_good = 125
    knee_ext_good = 0
    knee_rom_good = 125

    # Injured runners averaged 59.4° hip ROM vs. 68.1° in non-injured runners
    # Restricted hip mobility correlates with compensatory knee and pelvic motion, increasing injury likelihood
    # https://pubmed.ncbi.nlm.nih.gov/1487346/

    hip_flex_good = 55
    hip_ext_good = 10
    hip_rom_good = 65 # <60 deg total flexion-extension ROM is bad

    def get_color(value, good_range, moderate_range):
        """Assigns a gradient color based on the ROM classification."""
        norm = mcolors.Normalize(vmin=good_range[0] - 20, vmax=good_range[1] + 20)  # Normalize scale
        cmap = plt.cm.RdYlGn  # Red-Yellow-Green colormap
        return mcolors.to_hex(cmap(norm(value)))

    # Define ranges for color classification
    if camera_side == "side" and gait_type == "walking": 
        ankle_good = (20, 45)
        ankle_moderate = (15, 20)
        ankle_bad = (0, 55)#(0, 10)

        knee_good = (50, 70)
        knee_moderate = (40, 50)
        knee_bad = (0, 80) #(0, 40)

        hip_good = (25, 45)
        hip_moderate = (15, 25)
        hip_bad = (0, 15)

        spine_good = (0, 5)
        spine_moderate = (5, 10)
        spine_bad = (10, 30)

    if camera_side == "back" and gait_type == "walking": 
        ankle_good = (20, 50)
        ankle_moderate = (15, 20)
        ankle_bad = (0, 15)

        knee_good = (0, 5)
        knee_moderate = (5, 10)
        knee_bad = (10, 30)

        hip_good = (0, 10)
        hip_moderate = (10, 15)
        hip_bad = (15, 50)

        spine_good = (0, 5)
        spine_moderate = (5, 10)
        spine_bad = (10, 30)

    if camera_side == "side" and gait_type == "running": 
        ankle_good = (65, 75)
        ankle_moderate = (55, 85)
        ankle_bad = (55, 95)

        knee_good = (120, 130)
        knee_moderate = (90, 175)
        knee_bad = (90, 175)

        hip_good = (60, 70)
        hip_moderate = (40, 90)
        hip_bad = (40, 90)

        spine_good = (5, 15)
        spine_moderate = (2, 20)
        spine_bad = (0, 30)

    if camera_side == "back" and gait_type == "running":
        ankle_good = (20, 50)
        ankle_moderate = (15, 20)
        ankle_bad = (0, 15)

        knee_good = (0, 5)
        knee_moderate = (5, 10)
        knee_bad = (10, 30)

        hip_good = (0, 10)
        hip_moderate = (10, 20)
        hip_bad = (20, 40)

        spine_good = (1, 10)
        spine_moderate = (10, 20)
        spine_bad = (20, 30)

# Define ranges for color classification
    if camera_side == "side" and gait_type == "pickup pen": 
        # Spine (Trunk Flexion from neutral upright)
        spine_good = (30, 60)
        spine_moderate = (20, 30) # Too little flexion
        spine_moderate_upper = (60, 75) # Too much flexion
        spine_bad = (0, 20) # Very little flexion
        spine_bad_upper = (75, 90) # Excessive flexion

        # Hip Flexion
        hip_good = (50, 90)
        hip_moderate = (40, 50) # Not enough hip flexion
        hip_moderate_upper = (90, 100) # Deeper than expected
        hip_bad = (0, 40) # Primarily back bending
        hip_bad_upper = (100, 120) # Very deep / potentially unstable

        # Knee Flexion
        knee_good = (20, 70)
        knee_moderate = (10, 20) # Stiff legs
        knee_moderate_upper = (70, 90) # Deeper squat
        knee_bad = (0, 10) # Straight-legged
        knee_bad_upper = (90, 120) # Uncontrolled deep squat

        # Ankle Dorsiflexion (Positive angle means dorsiflexion from neutral)
        ankle_good = (10, 25)
        ankle_moderate = (5, 10) # Limited dorsiflexion
        ankle_moderate_upper = (25, 35) # Excessive dorsiflexion / instability
        ankle_bad = (0, 5) # Very limited mobility
        ankle_bad_upper = (35, 45) # Significant instability

    if camera_side == "back" and gait_type == "pickup pen": 
        # Spine Lateral Flexion / Rotation (Deviation from central axis)
        spine_good = (0, 5)
        spine_moderate = (5, 10)
        spine_bad = (10, 20)

        # Hip Abduction/Adduction (Pelvic Tilt/Shift)
        hip_good = (0, 5)
        hip_moderate = (5, 10)
        hip_bad = (10, 20)

        # Knee Valgus/Varus (Deviation from straight alignment)
        knee_good = (0, 5)
        knee_moderate = (5, 10)
        knee_bad = (10, 20)

        # Ankle Inversion/Eversion (Foot Rolling)
        ankle_good = (0, 5)
        ankle_moderate = (5, 10)
        ankle_bad = (10, 20)

    rom_values = [knee_right_rom_mean, hip_right_rom_mean, spine_segment_rom_mean, 
                hip_left_rom_mean, knee_left_rom_mean, ankle_left_rom_mean, ankle_right_rom_mean]

    joint_labels = ["Knee Right", "Hip Right", "Spine", "Hip Left", "Knee Left", "Ankle Left", "Ankle Right"]

    # Assign colors based on ROM value classifications using a gradient
    colors = [
        get_color(rom_values[0], knee_good, knee_moderate),  # Knee Right
        get_color(rom_values[1], hip_good, hip_moderate),    # Hip Right
        get_color(rom_values[2], spine_good, spine_moderate), # Spine
        get_color(rom_values[3], hip_good, hip_moderate),    # Hip Left
        get_color(rom_values[4], knee_good, knee_moderate),  # Knee Left
        get_color(rom_values[5], ankle_good, ankle_moderate),  # Ankle Left (Custom range)
        get_color(rom_values[6], ankle_good, ankle_moderate)   # Ankle Right (Custom range)
    ]

    # Define ideal ROM values (midpoint of the good range)
    ideal_rom_outer = [knee_good[1], hip_good[1], spine_good[1], hip_good[1], knee_good[1], ankle_good[1], ankle_good[1]]
    ideal_rom_inner = [knee_good[0], hip_good[0], spine_good[0], hip_good[0], knee_good[0], ankle_good[0], ankle_good[0]]
    moderate_rom_outer = [knee_moderate[1], hip_moderate[1], spine_moderate[1], hip_moderate[1], knee_moderate[1], ankle_moderate[1], ankle_moderate[1]]
    moderate_rom_inner = [knee_moderate[0], hip_moderate[0], spine_moderate[0], hip_moderate[0], knee_moderate[0], ankle_moderate[0], ankle_moderate[0]]
    bad_rom_outer = [knee_bad[1], hip_bad[1], spine_bad[1], hip_bad[1], knee_bad[1], ankle_bad[1], ankle_bad[1]]
    bad_rom_inner = [knee_bad[0], hip_bad[0], spine_bad[0], hip_bad[0], knee_bad[0], ankle_bad[0], ankle_bad[0]]
      
    # Create polar scatter plot with color-coded points
    spider_plot = go.Figure()
    # side walk --> moderate, poor, ideal, yours, poor inner
   
    # back walk --> poor 0.9, moderate 0.9, ideal 0.85, yours 0.75

    # side run --> moderate, poor, ideal, yours, poor inner

    # back run --> poor, moderate, ideal, yours

    # Plot ideal target ROM values


    spider_plot.add_trace(go.Scatterpolar(
        r=bad_rom_outer,
        theta=joint_labels,
        fill= 'toself', # 'toself' if side walking
        fillcolor='rgba(255, 76, 76, 0.9)', # fillcolor='rgba(255, 0, 0, 0.6)'  # red with 60% opacity
        name='Major Improvement Opportunity',
        marker=dict(color='#FF4C4C', size=0.1),
        line=dict(color='#FF4C4C', width=2)  # Dashed green outline for ideal ROM
    ))

    spider_plot.add_trace(go.Scatterpolar(
        r=moderate_rom_outer,
        theta=joint_labels,
        fill = 'toself',
        fillcolor='rgba(255, 215, 0, 0.9)',  # gold
        name='Minor Improvement Opportunity',
        marker=dict(color='#FFD700', size=0.1),
        line=dict(color='#FFD700', width=2)  # Dashed green outline for ideal ROM
    ))

    # Plot Stride Sweet Spot ROM values
    spider_plot.add_trace(go.Scatterpolar(
        r=ideal_rom_outer,
        theta=joint_labels,
        fill='toself',
        fillcolor='rgba(0, 255, 171, 0.85)',  # mint green
        name='Stride Sweet Spot',
        marker=dict(color='#00FFAB', size=0.1),
        line=dict(color='#00FFAB', width=2)  # Dashed green outline for ideal ROM
    ))

    # Plot actual values
    spider_plot.add_trace(go.Scatterpolar(
        r=rom_values,
        theta=joint_labels,
        fill='toself',
        name = 'Your Current Stride',
        fillcolor='rgba(30, 144, 255, 0.75)',  
        marker=dict(color='#1E90FF', size=0.01),
        line=dict(color='#1E90FF', width=2)
    ))

    # spider_plot.add_trace(go.Scatterpolar(
    #     r=bad_rom_inner,
    #     theta=joint_labels,
    #     fill='toself',
    #     fillcolor='rgba(255, 76, 76, 0.95)', # fillcolor='rgba(255, 0, 0, 0.6)'  # red with 60% opacity
    #     name='Poor Inner',  # Empty name to hide from legend
    #     marker=dict(color='#FF4C4C', size=0.1),
    #     line=dict(color='#FF4C4C', width=0.1)  # Dashed green outline for ideal ROM
    # ))

    # Get max range of motion value
    max_all_joint_angles = max(max(rom_values), max(bad_rom_outer), max(bad_rom_inner), max(ideal_rom_outer)) + 10

    spider_plot.update_layout(
        title="Range of Motion (°) vs Stride Sweet Spot",
        title_font=dict(size=36, color='white'),  # Set title color to white
        polar=dict(
            bgcolor='black',
            angularaxis=dict(
                tickfont=dict(size=26, color='white'),  # White theta labels
                color='white'
            ),
            radialaxis=dict(
                visible=True,
                range=[0, max_all_joint_angles],
                tickvals=[0, 30, 60, 90, 120, 150, 180],
                tickfont=dict(size=16, color='white'),  # White radial labels
                color='white'
            )
        ),
        paper_bgcolor='black',
        plot_bgcolor='black',
        font=dict(color='white'),  # Set all other text to white
        showlegend=True,
        legend=dict(
            font=dict(
                size=16,
                color='white'  # Legend text color
            )
        )
    )

    st.plotly_chart(spider_plot, key=f"spider_plot_{video_index}_{camera_side}_{hash(video_path)}")

    # st.markdown('### title')
    
    # KEY INSIGHT: Frontal and transverse plane motions (e.g., eversion, adduction) often play a more critical role in injury risk than sagittal plane mechanics

    # Asymmetries in ROM (e.g., >10–15% difference between limbs) are significant predictors of injury across joints (https://pmc.ncbi.nlm.nih.gov/articles/PMC11144664/)
    # Asymmetry ≥6.5° between ankles raises musculoskeletal injury risk by 4–5× in athletes (https://www.ejgm.co.uk/download/role-of-ankle-dorsiflexion-in-sports-performance-and-injury-risk-a-narrative-review-13412.pdf)
    # Asymmetry matters more than absolute values: ≥6.5° ankle dorsiflexion asymmetry quadruples injury risk (https://www.ejgm.co.uk/download/role-of-ankle-dorsiflexion-in-sports-performance-and-injury-risk-a-narrative-review-13412.pdf).
    # Muscle flexibility: Gastrocnemius-soleus tightness limits ankle ROM, altering proximal joint mechanics: https://pmc.ncbi.nlm.nih.gov/articles/PMC9865943/

    # Mean ROM for the assymetry bar plot
    left_hip = hip_left_peaks_mean - hip_left_mins_mean
    right_hip = hip_right_peaks_mean - hip_right_mins_mean
    left_knee = knee_left_peaks_mean - knee_left_mins_mean
    right_knee = knee_right_peaks_mean - knee_right_mins_mean
    left_ankle = ankle_left_peaks_mean - ankle_left_mins_mean
    right_ankle = ankle_right_peaks_mean - ankle_right_mins_mean

    asymmetry_bar_plot = plot_asymmetry_bar_chart(left_hip, right_hip, left_knee, right_knee, left_ankle, right_ankle)
    st.plotly_chart(asymmetry_bar_plot, key=f"asymmetry_bar_plot_{video_index}_{camera_side}_{hash(video_path)}")

    # update with decision trees (if elif, for each category)
    st.title('💡 How to improve your range of motion:')

    ankle_text_info = ""
    knee_text_info = ""
    hip_text_info = ""
    spine_text_info = ""

    # HIP FEEDBACK
    if hip_good[0] <= hip_right_rom_mean <= hip_good[1]:
        right_hip_text_summary = "STRIDE SWEET SPOT"
        if gait_type == "walking" and camera_side == "side":
            right_hip_text_info = "Hip flexion at initial contact (~30°) and extension during stance optimize propulsion."
        if gait_type == "running" and camera_side == "side":
            right_hip_text_info = "Hip flexion at initial contact (~50°) and extension during stance optimize propulsion."
        if gait_type == "walking" and camera_side == "back":
            right_hip_text_info = "Minimal motion maintains coronal alignment and reduces hip abductor fatigue."
        if gait_type == "running" and camera_side == "back":
            right_hip_text_info = "Minimal motion maintains coronal alignment and reduces hip abductor fatigue."

    elif hip_moderate[0] <= hip_right_rom_mean <= hip_moderate[1]:
        right_hip_text_summary = "MAJOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            right_hip_text_info = "Moderately limited hip range of motion increases lumbar spine compensation and hamstring strain."
        if gait_type == "running" and camera_side == "side":
            right_hip_text_info = "Moderately limited range of motion increases lumbar spine compensation and hamstring strain."
        if gait_type == "walking" and camera_side == "back":
            right_hip_text_info = "Moderate levels of increased pelvic drop heightens iliotibial band syndrome risk."
        if gait_type == "running" and camera_side == "back": 
            right_hip_text_info = "Moderate levels of increased pelvic drop heightens iliotibial band syndrome risk."

    elif hip_bad[0] <= hip_right_rom_mean <= hip_bad[1]:
        right_hip_text_summary = "MAJOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            right_hip_text_info = "Bad (<15° flexion-extension): Severe restriction (<10°) alters pelvic tilt and elevates lower back pain risk."
        if gait_type == "running" and camera_side == "side":
            right_hip_text_info = "Severe restriction (<40°) or poorly controlled motion (>90°) alters pelvic tilt and elevates lower back pain risk."
        if gait_type == "walking" and camera_side == "back":
            right_hip_text_info = "Excessive adduction correlates with tibial stress fractures and labral impingement."
        if gait_type == "running" and camera_side == "back": 
            right_hip_text_info = "Excessive adduction correlates with tibial stress fractures and labral impingement."

    if hip_good[0] <= hip_left_rom_mean <= hip_good[1]:
        left_hip_text_summary = "STRIDE SWEET SPOT"
        if gait_type == "walking" and camera_side == "side":
            left_hip_text_info = "Hip flexion at initial contact (~30°) and extension during stance optimize propulsion"
        if gait_type == "running" and camera_side == "side":
            left_hip_text_info = "Hip flexion at initial contact (~50°) and extension during stance optimize propulsion"
        if gait_type == "walking" and camera_side == "back":
            left_hip_text_info = "Minimal motion maintains coronal alignment and reduces hip abductor fatigue."
        if gait_type == "running" and camera_side == "back":
            left_hip_text_info = "Minimal motion maintains coronal alignment and reduces hip abductor fatigue."

    elif hip_moderate[0] <= hip_left_rom_mean <= hip_moderate[1]:
        left_hip_text_summary = "MINOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            left_hip_text_info = "Moderately limited hip range of motion increases lumbar spine compensation and hamstring strain."
        if gait_type == "running" and camera_side == "side":
            left_hip_text_info = "Moderately limited ROM increases lumbar spine compensation and hamstring strain."
        if gait_type == "walking" and camera_side == "back":
            left_hip_text_info = "Moderate levels of increased pelvic drop heightens iliotibial band syndrome risk."
        if gait_type == "running" and camera_side == "back": 
            left_hip_text_info = "Moderate levels of increased pelvic drop heightens iliotibial band syndrome risk."

    elif hip_bad[0] <= hip_left_rom_mean <= hip_bad[1]:
        left_hip_text_summary = "MAJOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            left_hip_text_info = "Bad (<15° flexion-extension): Severe restriction (<10°) alters pelvic tilt and elevates lower back pain risk."
        if gait_type == "running" and camera_side == "side":
            left_hip_text_info = "Severe restriction (<40°) or poorly controlled motion (>90°) alters pelvic tilt and elevates lower back pain risk."
        if gait_type == "walking" and camera_side == "back":
            left_hip_text_info = "Excessive adduction correlates with tibial stress fractures and labral impingement."
        if gait_type == "running" and camera_side == "back": 
            left_hip_text_info = "Excessive adduction correlates with tibial stress fractures and labral impingement."

   # KNEE FEEDBACK
    if knee_good[0] <= knee_right_rom_mean <= knee_good[1]:
        right_knee_text_summary = "STRIDE SWEET SPOT"
        if gait_type == "walking" and camera_side == "side":
            right_knee_text_info = "50-70° flexion during stance phase optimizes shock absorption."
        if gait_type == "running" and camera_side == "side":
            right_knee_text_info = "Good knee flexion during stance phase optimizes shock absorption."
        if gait_type == "walking" and camera_side == "back":
            right_knee_text_info = "Minimal medial knee deviation protects against patellofemoral knee pain."
        if gait_type == "running" and camera_side == "back":
            right_knee_text_info = "Minimal medial knee deviation protects against patellofemoral knee pain."

    elif knee_moderate[0] <= knee_right_rom_mean <= knee_moderate[1]:
        right_knee_text_summary = "MINOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            right_knee_text_info = "Moderately reduced flexion increases patellofemoral joint stress."
        if gait_type == "running" and camera_side == "side":
            right_knee_text_info = "Reduced flexion increases patellofemoral joint stress."
        if gait_type == "walking" and camera_side == "back":
            right_knee_text_info = "Moderate adduction/abduction correlates with early cartilage wear."
        if gait_type == "running" and camera_side == "back":
            right_knee_text_info = "Moderate adduction/abduction correlates with early cartilage wear."

    elif knee_bad[0] < knee_right_rom_mean:
        right_knee_text_summary = "MAJOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            right_knee_text_info = "You have limited knee flexion, which may reduce running efficiency. Consider deep squats, hamstring stretches, and eccentric loading to improve flexibility."
        if gait_type == "running" and camera_side == "side":
            right_knee_text_info = "Stiff-knee gait raises ACL injury risk due to poor energy dissipation."
        if gait_type == "walking" and camera_side == "back":
            right_knee_text_info = "High knee adduction valgus/varus motion can result in patellofemoral knee pain."
        if gait_type == "running" and camera_side == "back":
            right_knee_text_info = "High knee adduction valgus/varus motion can result in patellofemoral knee pain."

    if knee_good[0] < knee_left_rom_mean:
        left_knee_text_summary = "STRIDE SWEET SPOT"
        if gait_type == "walking" and camera_side == "side":
            left_knee_text_info = "50-70° knee flexion during stance phase optimizes shock absorption."
        if gait_type == "running" and camera_side == "side":
            left_knee_text_info = "Good knee flexion during stance phase optimizes shock absorption."
        if gait_type == "walking" and camera_side == "back":
            left_knee_text_info = "Minimal valgus/varus motion protects against patellofemoral knee pain."
        if gait_type == "running" and camera_side == "back":
            left_knee_text_info = "Minimal valgus/varus motion protects against patellofemoral knee pain."

    elif knee_moderate[0] <= knee_left_rom_mean <= knee_moderate[1]:
        left_knee_text_summary = "MINOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            left_knee_text_info = "Moderately reduced flexion increases patellofemoral joint stress."
        if gait_type == "running" and camera_side == "side":
            left_knee_text_info = "Moderately reduced flexion increases patellofemoral joint stress."
        if gait_type == "walking" and camera_side == "back":
            left_knee_text_info = "Moderate adduction/abduction correlates with early cartilage wear."
        if gait_type == "running" and camera_side == "back":
            left_knee_text_info = "Moderate adduction/abduction correlates with early cartilage wear."

    elif knee_bad[0] >= knee_left_rom_mean or knee_left_rom_mean >= knee_bad[1]:
        left_knee_text_summary = "MAJOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            left_knee_text_info = "You have limited knee flexion, which may reduce running efficiency. Consider deep squats, hamstring stretches, and eccentric loading to improve flexibility."
        if gait_type == "running" and camera_side == "side":
            left_knee_text_info = "Stiff-knee gait raises ACL injury risk due to poor energy dissipation."
        if gait_type == "walking" and camera_side == "back":
            left_knee_text_info = "High knee adduction valgus/varus motion can result in patellofemoral knee pain."
        if gait_type == "running" and camera_side == "back":
            left_knee_text_info = "High knee adduction valgus/varus motion can result in patellofemoral knee pain."

    # ANKLE FEEDBACK ---
    if ankle_good[0] <= ankle_right_rom_mean <= ankle_good[1]:
        right_ankle_text_summary = "STRIDE SWEET SPOT"
        if gait_type == "walking" and camera_side == "side":
            right_ankle_text_info = "Good ankle motion facilitates smooth heel-to-toe transition and shock absorption."
        if gait_type == "running" and camera_side == "side":
            right_ankle_text_info = "Good ankle motion facilitates smooth heel-to-toe transition and shock absorption."
        if gait_type == "walking" and camera_side == "back":
            right_ankle_text_info = "Linked to stable foot placement and reduced step-width variability. Recommended Shoe: Motion Control. Features:  Rigid heel counters 4/5 stiffness score) and reinforced arches.  High torsional rigidity 4/5 score) to restrict transverse plane tibial rotation. Extended medial posts for severe overpronators. Best for: Runners with chronic overpronation, posterior tibial tendon dysfunction, or ACL injury  risks."
        if gait_type == "running" and camera_side == "back":
            right_ankle_text_info = "Healthy ankle range of motion in the frontal plane allows the foot to move inward (inversion) and outward (eversion) smoothly, with a total range of about 35 degrees-typically up to 23 degrees of inversion and 12 degrees of eversion. This range supports stable, adaptable movement during running, helping the foot absorb shock and adjust to uneven surfaces."

    elif ankle_moderate[0] <= ankle_right_rom_mean <= ankle_moderate[1]:
        right_ankle_text_summary = "MINOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            right_ankle_text_info = "Slightly reduced ankle range of motion increases forefoot loading and compensatory knee motion."
        if gait_type == "running" and camera_side == "side":
            right_ankle_text_info = "Slightly reduced ankle range of motion increases forefoot loading and compensatory knee motion."
        if gait_type == "walking" and camera_side == "back":
            right_ankle_text_info = "Moderately limits lateral balance control, reducing walking stablity in older adults."
        if gait_type == "running" and camera_side == "back":
            right_ankle_text_info = "Moderately limits lateral balance control, reducing walking stablity in older adults."

    elif ankle_bad[0] >= ankle_right_rom_mean or ankle_right_rom_mean >= ankle_bad[1]:
        right_ankle_text_summary = "MAJOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            right_ankle_text_info = "Severe dorsiflexion deficits (<5°) or excessive plantarflexion (>50°) elevates risk of plantar fasciitis and Achilles tendinopathy."
        if gait_type == "running" and camera_side == "side":
            right_ankle_text_info = "Severe dorsiflexion deficits (<5°) or excessive plantarflexion elevates risk of plantar fasciitis and Achilles tendinopathy."
        if gait_type == "walking" and camera_side == "back":
            right_ankle_text_info = "Associated with instability, compensatory pelvic motion, and medial tibial stress syndrome."
        if gait_type == "running" and camera_side == "back":
            right_ankle_text_info = "Associated with instability, compensatory pelvic motion, and medial tibial stress syndrome."

    if ankle_good[0] <= ankle_left_rom_mean <= ankle_good[1]:
        left_ankle_text_summary = "STRIDE SWEET SPOT"
        if gait_type == "walking" and camera_side == "side":
            left_ankle_text_info = "Good ankle motion facilitates smooth heel-to-toe transition and shock absorption."
        if gait_type == "running" and camera_side == "side":
            left_ankle_text_info = "Good ankle motion facilitates smooth heel-to-toe transition and shock absorption."
        if gait_type == "walking" and camera_side == "back":
            left_ankle_text_info = "Healthy ankle range of motion in the frontal plane allows the foot to move inward (inversion) and outward (eversion) smoothly. This range supports stable, adaptable movement during activities like walking, helping the foot absorb shock and adjust to uneven surfaces."
        if gait_type == "running" and camera_side == "back":
            left_ankle_text_info = "Healthy ankle range of motion in the frontal plane allows the foot to move inward (inversion) and outward (eversion) smoothly, with a total range of about 35 degrees-typically up to 23 degrees of inversion and 12 degrees of eversion. This range supports stable, adaptable movement during running, helping the foot absorb shock and adjust to uneven surfaces."

    elif ankle_moderate[0] <= ankle_left_rom_mean <= ankle_moderate[1]:
        left_ankle_text_summary = "MINOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            left_ankle_text_info = "Reduced ankle range of motion increases forefoot loading and compensatory knee motion."
        if gait_type == "running" and camera_side == "side":
            left_ankle_text_info = "Reduced ankle range of motion increases forefoot loading and compensatory knee motion."
        if gait_type == "walking" and camera_side == "back":
            left_ankle_text_info = "Moderately limits lateral balance control, reducing walking stablity in older adults."
        if gait_type == "running" and camera_side == "back":
            left_ankle_text_info = "Moderately limits lateral balance control, reducing walking stablity in older adults."

    elif ankle_bad[0] >= ankle_left_rom_mean or ankle_left_rom_mean >= ankle_bad[1]:
        left_ankle_text_summary = "MAJOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            left_ankle_text_info = "Limited ankle range of motion elevates risks of plantar fasciitis and reduces lower-limb efficiency to push off during each stride."
        if gait_type == "running" and camera_side == "side":
            left_ankle_text_info = "Limited ankle range of motion elevates risks of plantar fasciitis and reduces lower-limb efficiency to push off during each stride."
        if gait_type == "walking" and camera_side == "back":
            left_ankle_text_info = "Associated with instability, compensatory pelvic motion, and medial tibial stress syndrome."
        if gait_type == "running" and camera_side == "back":
            left_ankle_text_info = "Associated with instability, compensatory pelvic motion, and medial tibial stress syndrome."

    # SPINE FEEDBACK ---
    if spine_good[0] <= spine_segment_rom_mean <= spine_good[1]:
        spine_text_summary = "STRIDE SWEET SPOT"
        if gait_type == "walking" and camera_side == "side":
            spine_text_info = "Neutral alignment (±2.5° from vertical) helps maintain natural lumbar lordosis/thoracic kyphosis for optimal shock absorption and energy transfer."    
        if gait_type == "running" and camera_side == "side":
            spine_text_info = "Neutral alignment (±7.5° from vertical) helps maintain natural lumbar lordosis/thoracic kyphosis for optimal shock absorption and energy transfer."    
        if gait_type == "walking" and camera_side == "back":
            spine_text_info = "Minimal lateral deviation (<2.5° per side) which correlates with hip abductor strength and balanced step width."
        if gait_type == "running" and camera_side == "back":
            spine_text_info = "Minimal lateral deviation (<5° per side) which correlates with hip abductor strength and balanced step width."

    elif spine_moderate[0] <= spine_segment_rom_mean <= spine_moderate[1]:
        spine_text_summary = "MINOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            spine_text_info = "Moderate forward lean (5-7°) or backward lean (3-5°) is associated with reduced hip extension or ankle mobility deficits, increasing lumbar spine compensatory flexion."
        if gait_type == "running" and camera_side == "side":
            spine_text_info = "Moderate forward lean or backward lean is associated with reduced hip extension or ankle mobility deficits, increasing lumbar spine compensatory flexion."
        if gait_type == "walking" and camera_side == "back":
            spine_text_info = "Moderate lateral lean (5-7° per side), often compensating for hip adduction or ankle inversion/eversion asymmetry"
        if gait_type == "running" and camera_side == "back":
            spine_text_info = "Moderate lateral lean (5-10° per side), often compensating for hip adduction or ankle inversion/eversion asymmetry"

    elif spine_bad[0] <= spine_segment_rom_mean <= spine_bad[1]:
        spine_text_summary = "MAJOR IMPROVEMENT OPPORTUNITY"
        if gait_type == "walking" and camera_side == "side":
            spine_text_info = '''Not enough trunk lean: Lack of forward lean (walking too upright) reduces forward propulsion, which limits ankle propulsion and increases risk of calf strain. " \
                           Too much trunk lean: Severe anterior/posterior tilt, altering pelvic orientation, is linked to hamstring strain (excessive forward lean) or facet joint compression (excessive backward lean).'''
        if gait_type == "running" and camera_side == "side":
            spine_text_info = "Not enough trunk lean: Lack of forward lean (running too upright) reduces forward propulsion, which limits ankle propulsion and increases risk of calf strain. Too much trunk lean: Severe anterior/posterior tilt, altering pelvic orientation, is linked to hamstring strain (excessive forward lean) or facet joint compression (excessive backward lean)."
        if gait_type == "walking" and camera_side == "back":
            spine_text_info = "Pronounced lateral bending (>10° per side), increases spinal disc shear forces and is associated with unilateral hip weakness or ankle instability."
        if gait_type == "running" and camera_side == "back":
            spine_text_info = "Pronounced lateral bending (>10° per side), increases spinal disc shear forces and is associated with unilateral hip weakness or ankle instability."

    text_info = {
        "left ankle": left_ankle_text_info if 'left_ankle_text_info' in locals() else "",
        "left knee": left_knee_text_info if 'left_knee_text_info' in locals() else "",
        "left hip": left_hip_text_info if 'left_hip_text_info' in locals() else "",
        "right ankle": right_ankle_text_info if 'right_ankle_text_info' in locals() else "",
        "right knee": right_knee_text_info if 'right_knee_text_info' in locals() else "",
        "right hip": right_hip_text_info if 'right_hip_text_info' in locals() else "",
        "spine": spine_text_info if 'spine_text_info' in locals() else "",

        "left ankle summary": left_ankle_text_summary if 'left_ankle_text_summary' in locals() else "",  # Make sure this line exists
        "left knee summary": left_knee_text_summary if 'left_knee_text_summary' in locals() else "",
        "left hip summary": left_hip_text_summary if 'left_hip_text_summary' in locals() else "",
        "right ankle summary": right_ankle_text_summary if 'right_ankle_text_summary' in locals() else "",
        "right knee summary": right_knee_text_summary if 'right_knee_text_summary' in locals() else "",
        "right hip summary": right_hip_text_summary if 'right_hip_text_summary' in locals() else "",
        "spine segment summary": spine_text_summary if 'spine_text_summary' in locals() else "",
    }

    with st.expander("Click here to see your spine segment angle data"):
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=filtered_time, y=filtered_spine_segment_angles, mode='lines', name="Spine Segment Angles"))
        fig.add_trace(go.Scatter(x=[frame_time, frame_time], y=[min(filtered_spine_segment_angles), max(filtered_spine_segment_angles)], mode='lines', line=dict(color='red', dash='dash'), name='Selected Frame'))
        fig.update_layout(title=f"Spine Segment Angles", xaxis_title="Time (s)", yaxis_title="Angle (degrees)")
        st.plotly_chart(fig, key=f"spine_segment_expander_{video_index}_{camera_side}_{hash(video_path)}")

        # Assuming filtered_time and filtered_spine_segment_angles are lists or numpy arrays
        spine_data = {
            "Time (s)": filtered_time,
            "Spine Segment Angles (degrees)": filtered_spine_segment_angles
        }

        # Create a DataFrame
        spine_df = pd.DataFrame(spine_data)

        # Convert DataFrame to CSV
        spine_csv = spine_df.to_csv(index=False).encode('utf-8')

        # Add download csv button
        st.download_button(
        label="Download Spine Segment Angle Data",
        data=spine_csv,
        file_name="spine_segment_angles_{camera_side}.csv",
        mime="text/csv",
        key=f"spine_segment_angles_{video_index}_{camera_side}_{hash(video_path)}"
    )
        github_url = "https://raw.githubusercontent.com/dholling4/PolarPlotter/main/"
        st.image(github_url + "photos/spine segmanet angle description.png", use_container_width =True)

    filtered_left_hip_angles = np.array(left_hip_angles)[mask]
    filtered_right_hip_angles = np.array(right_hip_angles)[mask]

    with st.expander("Click here to see your hip angle data"):
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=filtered_time, y=filtered_left_hip_angles, mode='lines', name="Left Hip"))
        fig.add_trace(go.Scatter(x=filtered_time, y=filtered_right_hip_angles, mode='lines', name="Right Hip"))
        fig.add_trace(go.Scatter(x=[frame_time, frame_time], y=[min(np.min(filtered_left_hip_angles), np.min(filtered_right_hip_angles)), max(np.max(filtered_left_hip_angles), np.max(filtered_left_hip_angles))], mode='lines', line=dict(color='red', dash='dash'), name='Selected Frame'))
        fig.update_layout(title=f"Hip Joint Angles", xaxis_title="Time (s)", yaxis_title="Angle (degrees)")
        st.plotly_chart(fig)

        # Convert DataFrame to CSV
        hip_csv = hip_df.to_csv(index=False).encode('utf-8')

        # Add download csv button
        st.download_button(
            label="Download Hip Angle Data",
            data=hip_csv,
            file_name="hip_angles_{camera_side}.csv",
            mime="text/csv",
            key=f"hip_angles_{video_index}_{camera_side}_{hash(video_path)}"
        )
        st.image(github_url + "photos/hip flexion angle.png", use_container_width =True)
        
    filtered_left_knee_angles = np.array(left_knee_angles)[mask]
    filtered_right_knee_angles = np.array(right_knee_angles)[mask]

    with st.expander("Click here to see your knee angle data"):
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=filtered_time, y=filtered_left_knee_angles, mode='lines', name="Left Knee"))
        fig.add_trace(go.Scatter(x=filtered_time, y=filtered_right_knee_angles, mode='lines', name="Right Knee"))
        fig.add_trace(go.Scatter(x=[frame_time, frame_time], y=[min(np.min(filtered_left_knee_angles), np.min(filtered_right_knee_angles)), max(np.max(filtered_left_knee_angles), np.max(filtered_left_knee_angles))], mode='lines', line=dict(color='red', dash='dash'), name='Selected Frame'))
        fig.update_layout(title=f"Knee Joint Angles", xaxis_title="Time (s)", yaxis_title="Angle (degrees)")
        st.plotly_chart(fig)

        knee_data = {
            "Time (s)": filtered_time,
            "Left Knee Angle (degrees)": filtered_left_knee_angles,
            "Right Knee Angle (degrees)": filtered_right_knee_angles
        }

        # Create a DataFrame
        knee_df = pd.DataFrame(knee_data)

        # Convert DataFrame to CSV
        knee_csv = knee_df.to_csv(index=False).encode('utf-8')

        # Add download csv button
        st.download_button(
            label="Download Knee Angle Data",
            data=knee_csv,
            file_name="knee_angles_{camera_side}.csv",
            mime="text/csv",
            key=f"knee_angles_{video_index}_{camera_side}_{hash(video_path)}"
        )

        st.image(github_url + "photos/knee flexion angle.png", use_container_width =True)
    
    filtered_left_ankle_angles = np.array(left_ankle_angles)[mask]
    filtered_right_ankle_angles = np.array(right_ankle_angles)[mask]

    with st.expander("Click here to see your ankle angle data"):
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=filtered_time, y=filtered_left_ankle_angles, mode='lines', name="Left Ankle"))
        fig.add_trace(go.Scatter(x=filtered_time, y=filtered_right_ankle_angles, mode='lines', name="Right Ankle"))
        fig.add_trace(go.Scatter(x=[frame_time, frame_time], y=[min(np.min(filtered_left_ankle_angles), np.min(filtered_right_ankle_angles)), max(np.max(filtered_left_ankle_angles), np.max(filtered_left_ankle_angles))], mode='lines', line=dict(color='red', dash='dash'), name='Selected Frame'))
        fig.update_layout(title=f"Ankle Joint Angles", xaxis_title="Time (s)", yaxis_title="Angle (degrees)")
        st.plotly_chart(fig)

        ankle_data = {
            "Time (s)": filtered_time,
            "Left Ankle Angle (degrees)": filtered_left_ankle_angles,
            "Right Ankle Angle (degrees)": filtered_right_ankle_angles
        }

        # Create a DataFrame
        ankle_df = pd.DataFrame(ankle_data)

        # Convert DataFrame to CSV
        ankle_csv = ankle_df.to_csv(index=False).encode('utf-8')

        # Add download csv button
        st.download_button(
            label="Download Ankle Angle Data",
            data=ankle_csv,
            file_name="ankle_angles_{camera_side}.csv",
            mime="text/csv",
            key=f"ankle_angles_{video_index}_{camera_side}_{hash(video_path)}"
        )     
        # show ankle plantarflexion angle figure
        st.image(github_url + "photos/ankle flexion angle.png", use_container_width =True)

    # Store data in DataFrame
    joint_angle_df = pd.DataFrame({
        "Time": filtered_time,
        "Spine": filtered_spine_segment_angles,
        "Left Hip": filtered_left_hip_angles, "Right Hip": filtered_right_hip_angles,
        "Left Knee": filtered_left_knee_angles, "Right Knee": filtered_right_knee_angles,
        "Left Ankle": filtered_left_ankle_angles, "Right Ankle": filtered_right_ankle_angles
    })

    # STRIDE CYCLE DETECTION
    with st.expander("Stride Cycle Analysis"):

        strides = [f"Stride {i+1}" for i in range(min(len(peaks_left), len(mins_left), len(peaks_right), len(mins_right)))]
        
        # Plotly bar plot showing peaks and minima side by side with thinner bars
        fig = go.Figure()
        column_left = "Left Hip Angle (degrees)"
        column_right = "Right Hip Angle (degrees)"
        fig.add_trace(go.Bar(
            y=hip_df[column_left].iloc[peaks_left][:len(strides)],
            x=strides,
            name="Left Peak Flexion",
            marker_color='lightblue',
            width=0.2
        ))
        
        fig.add_trace(go.Bar(
            y=hip_df[column_right].iloc[peaks_right][:len(strides)],
            x=strides,
            name="Right Peak Flexion",
            marker_color='lightgreen',
            width=0.2
        ))

        fig.add_trace(go.Bar(
            y=hip_df[column_left].iloc[mins_left][:len(strides)],
            x=strides,
            name="Left Min Flexion",
            marker_color='blue',
            width=0.2
        ))
        
        fig.add_trace(go.Bar(
            y=hip_df[column_right].iloc[mins_right][:len(strides)],
            x=strides,
            name="Right Min Flexion",
            marker_color='green',
            width=0.2
        ))
        
        fig.update_layout(
            title="Joint Flexion Angles Per Stride",
            yaxis_title="Hip Angle (degrees)",
            barmode='group',  # Ensures bars are side by side
            xaxis=dict(tickmode='array', tickvals=list(range(len(strides))), ticktext=strides)
        )
        
        st.plotly_chart(fig, key=f"hip_expander_{video_index}_{camera_side}_{hash(video_path)}")

        strides = [f"Stride {i+1}" for i in range(min(len(peaks_left), len(mins_left), len(peaks_right), len(mins_right)))]

        # Plotly bar plot showing peaks and minima side by side with thinner bars
        fig = go.Figure()
        column_left = "Left Knee Angle (degrees)"
        column_right = "Right Knee Angle (degrees)"

        fig.add_trace(go.Bar(
            y=knee_df[column_left].iloc[peaks_left][:len(strides)],
            x=strides,
            name="Left Peak Flexion",
            marker_color='lightblue',
            width=0.2
        ))

        fig.add_trace(go.Bar(
            y=knee_df[column_right].iloc[peaks_right][:len(strides)],
            x=strides,
            name="Right Peak Flexion",
            marker_color='lightgreen',
            width=0.2
        ))

        fig.add_trace(go.Bar(
            y=knee_df[column_left].iloc[mins_left][:len(strides)],
            x=strides,
            name="Left Min Flexion",
            marker_color='blue',
            width=0.2
        ))

        fig.add_trace(go.Bar(
            y=knee_df[column_right].iloc[mins_right][:len(strides)],
            x=strides,
            name="Right Min Flexion",
            marker_color='green',
            width=0.2
        ))

        fig.update_layout(
            title="Joint Flexion Angles Per Stride",
            yaxis_title="Knee Angle (degrees)",
            barmode='group',  # Ensures bars are side by side
            xaxis=dict(tickmode='array', tickvals=list(range(len(strides))), ticktext=strides)
        )

        st.plotly_chart(fig, key=f"knee_expander_{video_index}_{camera_side}_{hash(video_path)}")

        # ANKLE CYCLES

        strides = [f"Stride {i+1}" for i in range(min(len(peaks_left), len(mins_left), len(peaks_right), len(mins_right)))]

        # Plotly bar plot showing peaks and minima side by side with thinner bars
        fig = go.Figure()
        column_left = "Left Ankle Angle (degrees)"
        column_right = "Right Ankle Angle (degrees)"

        fig.add_trace(go.Bar(
            y=ankle_df[column_left].iloc[peaks_left][:len(strides)],
            x=strides,
            name="Left Peak Flexion",
            marker_color='lightblue',
            width=0.2
        ))

        fig.add_trace(go.Bar(
            y=ankle_df[column_right].iloc[peaks_right][:len(strides)],
            x=strides,
            name="Right Peak Flexion",
            marker_color='lightgreen',
            width=0.2
        ))

        fig.add_trace(go.Bar(
            y=ankle_df[column_left].iloc[mins_left][:len(strides)],
            x=strides,
            name="Left Min Flexion",
            marker_color='blue',
            width=0.2
        ))

        fig.add_trace(go.Bar(
            y=ankle_df[column_right].iloc[mins_right][:len(strides)],
            x=strides,
            name="Right Min Flexion",
            marker_color='green',
            width=0.2
        ))

        fig.update_layout(
            title="Joint Flexion Angles Per Stride",
            yaxis_title="Ankle Angle (degrees)",
            barmode='group',  # Ensures bars are side by side
            xaxis=dict(tickmode='array', tickvals=list(range(len(strides))), ticktext=strides)
        )

        st.plotly_chart(fig, key=f"ankle_expander_{video_index}_{camera_side}_{hash(video_path)}")

    ### END CROP ###
  # show tables
    df = pd.DataFrame({'Time': filtered_time, 'Spine Segment Angles': filtered_spine_segment_angles, 'Left Joint Hip': filtered_left_hip_angles, 'Right Hip': filtered_right_hip_angles, 'Left Knee': filtered_left_knee_angles, 'Right Knee': filtered_right_knee_angles, 'Left Ankle': filtered_left_ankle_angles, 'Right Ankle': filtered_right_ankle_angles})
    st.write('### Joint Angles (°)')

    st.dataframe(df)

    st.write('### Range of Motion')
    # create dataframe of range of motion
    
    df_rom = pd.DataFrame({'Joint': ['Spine Segment', 'Left Hip', 'Right Hip', 'Left Knee', 'Right Knee', 'Left Ankle', 'Right Ankle'], 
    'Min Angle (°)' : [np.min(filtered_spine_segment_angles), hip_left_mins_mean, hip_right_mins_mean, knee_left_mins_mean, knee_right_mins_mean, ankle_left_mins_mean, ankle_right_mins_mean],
    'Max Angle (°)' : [np.max(filtered_spine_segment_angles), hip_left_peaks_mean, hip_right_peaks_mean, knee_left_peaks_mean, knee_right_peaks_mean, ankle_left_peaks_mean, ankle_right_peaks_mean],
    'Range of Motion (°)': [np.ptp(filtered_spine_segment_angles), hip_left_peaks_mean - hip_left_mins_mean, hip_right_peaks_mean - hip_right_mins_mean, knee_left_peaks_mean - knee_left_mins_mean, knee_right_peaks_mean - knee_right_mins_mean, ankle_left_peaks_mean - ankle_left_mins_mean, ankle_right_peaks_mean - ankle_right_mins_mean]})
    
    # always show 1 decimal place
    df_rom['Min Angle (°)'] = df_rom['Min Angle (°)'].apply(lambda x: f"{x:.1f}")
    df_rom['Max Angle (°)'] = df_rom['Max Angle (°)'].apply(lambda x: f"{x:.1f}")
    df_rom['Range of Motion (°)'] = df_rom['Range of Motion (°)'].apply(lambda x: f"{x:.1f}")
    st.dataframe(df_rom)

    # pca_checkbox = st.checkbox("Perform Principle Component Analysis", value=False, key=f"pca_{video_index}_{camera_side}")
    # if pca_checkbox:
    #     perform_pca(joint_angle_df, video_index)

    _, __, pose_image_path = process_first_frame_report(video_path, video_index)
    pdf_path = generate_pdf(pose_image_path, df_rom, spider_plot, asymmetry_bar_plot, text_info, camera_side, gait_type, user_footwear)
    with open(pdf_path, "rb") as file:
        st.download_button("Download Stride Sync Report", file, "Stride_Sync_Report.pdf", "application/pdf", key=f"pdf_report_{video_index}_{camera_side}_{hash(video_path)}")

    # email me my Stride Sync Report
    email = st.text_input("Enter your email address to receive your Stride Sync Report",  
                        key=f"text_input_email_{video_index}_{camera_side}_{hash(video_path)}")

    if st.button("Email Stride Sync Report", 
                key=f"email_pdf_{video_index}_{camera_side}_{hash(video_path)}"):
        
        # Add validation
        if not email:
            st.error("❌ Please enter an email address.")
        elif not email.__contains__("@"):
            st.error("❌ Please enter a valid email address.")
        elif 'pdf_path' not in locals():
            st.error("❌ PDF report not generated. Please download the report first.")
        else:
            with st.spinner("Sending email..."):
                send_email(email, pdf_path)

def send_email(to_email, attachment_path):
    try:
        # Get email credentials
        if "EMAIL_ADDRESS" in st.secrets:
            sender_email = st.secrets["EMAIL_ADDRESS"]
            app_password = st.secrets["EMAIL_APP_PASSWORD"]
        else:
            load_dotenv()
            sender_email = os.getenv("EMAIL_ADDRESS")
            app_password = os.getenv("EMAIL_APP_PASSWORD")

        # Validate credentials
        if not sender_email or not app_password:
            st.error("❌ Email credentials not found. Please check your environment variables.")
            return

        # Create email message
        msg = EmailMessage()
        msg['Subject'] = "Stride Sync Report"
        msg['From'] = sender_email
        msg['To'] = to_email
        msg.set_content("Hi! Attached is your personalized gait report from Stride Sync. Feel free to reach out if you have any questions or would like to setup an appointment to discuss your results.")

        # Attach PDF
        with open(attachment_path, 'rb') as f:
            file_data = f.read()
            file_name = "Stride Sync Report " + str(datetime.now().strftime("%Y-%m-%d")) + ".pdf"
            msg.add_attachment(file_data, maintype='application', subtype='pdf', filename=file_name)

        # Send Email
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(sender_email, app_password)
            smtp.send_message(msg)
            
        st.success("✅ Email sent successfully!")
        
    except smtplib.SMTPAuthenticationError:
        st.error("❌ Email authentication failed. Please check your email credentials.")
    except smtplib.SMTPException as e:
        st.error(f"❌ Failed to send email: {str(e)}")
    except FileNotFoundError:
        st.error("❌ PDF file not found. Please generate the report first.")
    except Exception as e:
        st.error(f"❌ An error occurred: {str(e)}")

# TO DO:
# - Try to add article links like this: https://pmc.ncbi.nlm.nih.gov/articles/PMC3286897/
# - Neural Network to predict gait
# - Add more joints
# - Add more videos
# - Add more data sources (IMUs, wearables, heart rate)
# - Add more analysis
# - Add more visualizations
# - Add more interactivity
# - Add more features
# - Add more machine learning
# - Add more deep learning
# - Add more statistics
# - Add more physics (OpenSim)
# - Add more synthetic data
# - Add animations / rendering
# - Add step by step variation analysis

def main():
    os.environ["BROWSER"] = "/usr/bin/chromium"

    st.title("Biomechanics Analysis from Video")

    github_url = "https://raw.githubusercontent.com/dholling4/PolarPlotter/main/"

    persons = [
        {"image_url": github_url + "photos/runner treadmill figure.png", "name": "Joint Center Detection", "Motion Analysis from Video": " "}, 
    ]  
    # st.image(persons[0]["image_url"], caption=f"{persons[0]['name']}")
    
    # example_video_checkbox = st.checkbox("Try Example Videos", value=False)
    # if example_video_checkbox:
    #     example_video = st.radio("Select an example video", 
    #             ["Running video", "Pickup pen video"],
    #             index=0)  
        
    #     if example_video == "Running video":
    #         user_footwear = "Barefoot"
    #         camera_side = "side"
    #         video_url = github_url + "photos/barefoot running side trimmed 30-34.mov"
    #         st.video(video_url)
    #         for idx, video_file in enumerate([video_url]):
    #             output_txt_path = '/workspaces/PolarPlotter/results/joint_angles.txt'
    #             frame_number, frame_time, image_path = process_first_frame(video_file, video_index=idx)
    #             gait_type = "running"
    #             process_video(user_footwear, gait_type, camera_side, video_file, output_txt_path, frame_time, video_index=idx)

    #     if example_video == "Pickup pen video":
    #         user_footwear  = "Nike"
    #         camera_side = "side"
    #         gait_type = "pickup pen"
    #         video_url = github_url + "photos/pickup pen 3 sec demo.mp4"
    #         st.video(video_url)
    #         for idx, video_file in enumerate([video_url]):
    #             output_txt_path = '/workspaces/PolarPlotter/results/joint_angles.txt'
    #             frame_number, frame_time, image_path = process_first_frame(video_file, video_index=idx)
    #             process_video(user_footwear, gait_type, camera_side, video_file, output_txt_path, frame_time, video_index=idx)

    user_email = st.text_input("Enter your Email", key="user_email")
    user_footwear = st.text_input("Enter your footwear", key="user_footwear") # maybe checkbox neutral, support, stability --> Opens up a catalogue at their stores...

    # File uploader for user to upload their own video
    video_files = st.file_uploader("Upload side walking video(s)", type=["mp4", "avi", "mov"], accept_multiple_files=True, key="side_walking")
    if video_files:
        camera_side = "side"
        gait_type = "walking"
        for idx, video_file_side_walk in enumerate(video_files):
            file_name = video_file_side_walk.name
            ext = os.path.splitext(file_name)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_video_file:
                temp_video_file.write(video_file_side_walk.read())
                temp_video_path = temp_video_file.name
                temp_video_file.close()
                output_txt_path = '/workspaces/PolarPlotter/results/joint_angles.txt'
                frame_number, frame_time, image_path = process_first_frame(temp_video_path, video_index=idx)
                process_video(user_footwear, gait_type, camera_side, temp_video_path, output_txt_path, frame_time, video_index=idx)

    # File uploader for user to upload their own video
    video_files = st.file_uploader("Upload back walking video(s)", type=["mp4", "avi", "mov"], accept_multiple_files=True, key="back_walking")
    if video_files:
        camera_side = "back"
        gait_type = "walking"
        for idx, video_file_back_walk in enumerate(video_files):
            file_name = video_file_back_walk.name
            ext = os.path.splitext(file_name)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_video_file:
                temp_video_file.write(video_file_back_walk.read())
                temp_video_path = temp_video_file.name
                temp_video_file.close()
                output_txt_path = '/workspaces/PolarPlotter/results/joint_angles.txt'
                frame_number, frame_time, image_path = process_first_frame(temp_video_path, video_index=idx)
                process_video(user_footwear, gait_type, camera_side, temp_video_path, output_txt_path, frame_time, video_index=idx)
                
                # Add a button to clear the uploaded file
                if st.button("Clear Uploaded Video"):
                    st.session_state.uploaded_file = None # Clear the file from session state
                    st.session_state.video_uploader = None # Clear the widget's internal state

    video_files = st.file_uploader("Upload side running video(s)", type=["mp4", "avi", "mov"], accept_multiple_files=True, key="side_running")
    if video_files:
        camera_side = "side"
        gait_type = "running"
        for idx, video_file_side_run in enumerate(video_files):
            file_name = video_file_side_run.name
            ext = os.path.splitext(file_name)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_video_file:
                temp_video_file.write(video_file_side_run.read())
                temp_video_path = temp_video_file.name
                temp_video_file.close()
                output_txt_path = '/workspaces/PolarPlotter/results/joint_angles.txt'
                frame_number, frame_time, image_path = process_first_frame(temp_video_path, video_index=idx)
                process_video(user_footwear, gait_type, camera_side, temp_video_path, output_txt_path, frame_time, video_index=idx)

    # File uploader for back video(s)
    video_files = st.file_uploader("Upload back running video(s)", type=["mp4", "avi", "mov"], accept_multiple_files=True, key="back_running")
    
    if video_files:
        camera_side = "back"
        gait_type = "running"
        for idx, video_file_back_run in enumerate(video_files):
            file_name = video_file_back_run.name
            st.text(file_name)
            ext = os.path.splitext(file_name)[1].lower()
            allowed_exts = [".mp4", ".avi", ".mov", ".mpeg4"]
            if ext not in allowed_exts:
                st.warning(f"⚠️ Skipping file `{file_name}` due to unsupported extension.")
                continue
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_video_file:
                temp_video_file.write(video_file_back_run.read())
                temp_video_path = temp_video_file.name
                temp_video_file.close()
                output_txt_path = '/workspaces/PolarPlotter/results/joint_angles.txt'
                # process_first_frame(temp_video_path, video_index=idx)
                frame_number, frame_time, image_path = process_first_frame(temp_video_path, video_index=idx)
                process_video(user_footwear, gait_type, camera_side, temp_video_path, output_txt_path, frame_time, video_index=idx)

if __name__ == "__main__":
    main()


  

