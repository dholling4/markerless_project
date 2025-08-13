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

# # GENERAL
# - Fix when video is uploaded 90 deg sideways (gives wrong results, uh oh!) --> it should be vertical, not landscape recording
# - Try to merge the side and back videos into one report (if feasible)
# - Add more personliazed insights based on the data (text and exercise recommendations as decision


st.title("Welcome to the Stride Sync App!")
  
st.write("This app analyzes your walking patterns using video input and provides insights into your gait.")

st.write("Got to Gait Page to upload and see the results of your video analysis.")