import cv2
import numpy as np
import json
import sys
import math
import os
import redis
from pprint import pprint
from collections import deque

redisClient = redis.Redis(host='localhost', port=6380)
pprint(redisClient.info('server'))

OUT_PATH = os.environ.get("ARUCO_CAMERA_OUT_PATH") or "markers.json"

def detect_aruco_markers(frame):
    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Define the ArUco dictionary
    aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_1000)
    parameters = cv2.aruco.DetectorParameters()

    # detector
    detector = cv2.aruco.ArucoDetector(aruco_dict, parameters)

    # Detect markers
    corners, ids, rejected = detector.detectMarkers(gray)

    results = []
    if ids is not None:
        for i in range(len(ids)):
            c = corners[i][0]
            results.append({
                'id': int(ids[i][0]),
                'corners': c.tolist()
            })

    return results


def verify_markers(marker_history, n, m):
    verified_markers = []
    for marker_id in set(marker for frame in marker_history for marker in frame):
        count = sum(marker_id in frame for frame in marker_history)
        if count >= n:
            # Get the most recent detection of this marker
            for frame in reversed(marker_history):
                if marker_id in frame:
                    verified_markers.append(frame[marker_id])
                    break
    return verified_markers


previous = None


def main(n=3, m=5):
    global previous

    cap = cv2.VideoCapture(0)  # Open the default camera (usually the webcam)

    marker_history = deque(maxlen=m)
    frame_count = 0

    while True:
        frame_count += 1
        ret, frame = cap.read()
        if not ret:
            break

        markers = detect_aruco_markers(frame)

        # Convert markers to a dictionary with marker IDs as keys
        marker_dict = {marker['id']: marker for marker in markers}
        marker_history.append(marker_dict)

        verified_markers = verify_markers(marker_history, n, m) if len(marker_history) == m else []

        # Draw verified markers on the frame
        for marker in verified_markers:
            corners = np.array(marker['corners'], dtype=np.int32)
            cv2.polylines(frame, [corners], True, (0, 255, 0), 2)
            center = tuple(map(int, np.mean(corners, axis=0)))
            cv2.putText(frame, str(marker['id']), center, cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

        # Display the frame
        cv2.imshow('Aruco Detection', frame)

        aruco_tags_json = json.dumps(verified_markers)
        if previous != aruco_tags_json:
            print(f"publishing aruco tags: {aruco_tags_json}")
            redisClient.publish('identity', aruco_tags_json)
            previous = aruco_tags_json

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
