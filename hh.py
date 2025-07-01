import os
import time

# Dog frames for simple running animation
frames = [
    r"""
       __
  (___()'`;\
  /,    /`
  \\--\\
""",
    r"""
       __
  (___()'`;\
  /,    /`
   \\--\\_
""",
    r"""
       __
  (___()'`;\
  /,    /`
  _//--//
""",
    r"""
       __
  (___()'`;\
  /,    /`
  //--//
"""
]

# Run animation loop
try:
    while True:
        for frame in frames:
            os.system('cls' if os.name == 'nt' else 'clear')  # Clear terminal
            print(frame)
            time.sleep(0.2)  # Pause for 0.2 seconds between frames
except KeyboardInterrupt:
    print("Dog stopped running! 🐾")
