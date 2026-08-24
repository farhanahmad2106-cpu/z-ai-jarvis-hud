import sys
import os
from PyQt6.QtCore import QUrl, Qt
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebEngineCore import QWebEngineProfile, QWebEnginePage

class JarvisDesktopHUDWindow(QMainWindow):
    def __init__(self, target_url="http://localhost:3000"):
        super().__init__()
        self.setWindowTitle("Z-AI JARVIS HUD - Local Desktop Assistant")
        self.setGeometry(100, 100, 1440, 900)
        
        # Dark theme background styling
        self.setStyleSheet("background-color: #030407;")

        # Create central container
        central_widget = QWidget(self)
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)

        # Initialize QWebEngineView for embedding high-end Web HUD
        self.browser = QWebEngineView()
        
        # Configure WebEngine Settings
        profile = QWebEngineProfile.defaultProfile()
        profile.setHttpCacheType(QWebEngineProfile.HttpCacheType.MemoryHttpCache)
        
        # Load local web app URL
        self.browser.setUrl(QUrl(target_url))
        layout.addWidget(self.browser)

def main():
    app = QApplication(sys.argv)
    app.setApplicationName("Z-AI JARVIS Desktop HUD")
    
    target_url = os.getenv("JARVIS_HUD_URL", "http://localhost:3000")
    window = JarvisDesktopHUDWindow(target_url=target_url)
    window.show()
    
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
