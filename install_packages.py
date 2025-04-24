import subprocess
import sys

def install_packages():
    python_path = r"C:\Program Files (x86)\Python37-32\python.exe"
    packages = ["langchain-community", "PyPDF2"]
    
    print(f"Installing packages using {python_path}")
    
    for package in packages:
        print(f"Installing {package}...")
        try:
            subprocess.check_call([python_path, "-m", "pip", "install", package])
            print(f"Successfully installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"Failed to install {package}: {e}")
    
    print("Installation completed")

if __name__ == "__main__":
    install_packages() 