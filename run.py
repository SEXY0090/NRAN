import os, sys
try:
    __import__("NRAN").sykology()
except Exception as e:
    exit(str(e))
