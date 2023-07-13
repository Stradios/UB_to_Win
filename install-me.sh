#!/bin/bash

# Color variables
RED='\033[00;31m'
GREEN='\033[00;32m'
YELLOW='\033[00;33m'
BLUE='\033[00;34m'
PURPLE='\033[00;35m'
CYAN='\033[00;36m'
LIGHTGRAY='\033[00;37m'
LRED='\033[01;31m'
LGREEN='\033[01;32m'
LYELLOW='\033[01;33m'
LBLUE='\033[01;34m'
LPURPLE='\033[01;35m'
LCYAN='\033[01;36m'
WHITE='\033[01;37m'
NC='\033[0m' # No Color



# Function to display larger text
print_large_text() {
  local message="$1"
  local length=${#message}
  local line=""

  for ((i = 0; i < length; i++)); do
    line+="="
  done

  echo -e "\n${line}"
  echo -e "${message}"
  echo -e "${line}\n"
}


# Display 
print_large_text "${RED}Ubuntu-gnome to Win11 look${NC}"


echo -e "${LBLUE}                                   https://github.com/Stradios"


# Function to display a 3-second countdown
countdown() {
  for ((i = 3; i > 0; i--)); do
    echo -e "${BLUE}Starting in $i seconds...${NC}"
    sleep 1
  done
}


# Update and upgrade packages
print_large_text "${GREEN}Updating and upgrading packages...${NC}"
countdown
sudo apt update && sudo apt upgrade -y

clear

# Install Ubuntu restricted extras
print_large_text "${GREEN}Installing Ubuntu restricted extras...${NC}"
countdown
sudo apt-get install ubuntu-restricted-extras -y

clear
# Run Fluent GTK theme installation script
print_large_text "${GREEN}Running Fluent GTK theme installation script...${NC}"
countdown
cd ~/Downloads

# Clone the GitHub repository
git clone https://github.com/vinceliuice/Fluent-gtk-theme.git

# Change directory to the cloned repository
cd Fluent-gtk-theme

# Run the install.sh script
./install.sh -a

# Optional: Ask user if they want to remove the folder
read -p "Do you want to remove the 'Fluent-gtk-theme' folder from Downloads? (yes/no): " remove_folder

if [[ "$remove_folder" =~ ^[Yy][Ee][Ss]$ ]]; then
    # Remove the folder
    cd ..
    rm -rf Fluent-gtk-theme
    echo "Folder removed successfully!"
else
    echo "Folder not removed."
fi

# Optional: Print a success message
echo "Installation completed successfully!"

# Run Win11 Icon Theme theme installation script
print_large_text "${GREEN}Running Win11 Icon Theme installation script...${NC}"
countdown
cd ~/Downloads

# Clone the GitHub repository
git clone https://github.com/yeyushengfan258/Win11-icon-theme.git

# Change directory to the cloned repository
cd Win11-icon-theme

# Run the install.sh script
./install.sh -a

# Optional: Ask user if they want to remove the folder
read -p "Do you want to remove the 'Win11-icon-theme' folder from Downloads? (yes/no): " remove_folder

if [[ "$remove_folder" =~ ^[Yy][Ee][Ss]$ ]]; then
    # Remove the folder
    cd ..
    rm -rf Win11-icon-theme
    echo "Folder removed successfully!"
else
    echo "Folder not removed."
fi

# Optional: Print a success message
echo "Installation completed successfully!"

clear
# Run Instaling arcMenu icon
print_large_text "${GREEN}Instaling arcMenu icon...${NC}"
countdown

cd ~/Downloads/UB_to_Win
# Copy the file using sudo
sudo cp arcMenu.png /usr/share/icons


# Optional: Print a success message
echo "Installation completed successfully!"

clear
# Run Segoe Font UI Linux installation script
print_large_text "${GREEN}Running Segoe UI Linux installation script...${NC}"
countdown
cd ~/Downloads

# Clone the GitHub repository
git clone https://github.com/SpudGunMan/segoe-ui-linux

# Change directory to the cloned repository
cd segoe-ui-linux

# Run the install.sh script
sudo ./install.sh

# Optional: Ask user if they want to remove the folder
read -p "Do you want to remove the 'segoe-ui-linux' folder from Downloads? (yes/no): " remove_folder

if [[ "$remove_folder" =~ ^[Yy][Ee][Ss]$ ]]; then
    # Remove the folder
    cd ..
    rm -rf segoe-ui-linux
    echo "Folder removed successfully!"
else
    echo "Folder not removed."
fi

# Optional: Print a success message
echo "Installation completed successfully!"


clear
# Install GNOME Tweaks
print_large_text "${GREEN}Installing GNOME Tweaks...${NC}"
countdown
sudo apt install gnome-tweaks -y
gnome-tweaks

clear
# Insttaling GDM Login Wallpaper
print_large_text "${GREEN}Insttaling Wallpaper...${NC}"
print_large_text "${GREEN}Do Not if you dont want but it wil not mache the login!${NC}"

# Set the directory path
directory="$HOME/Downloads/UB_to_Win/wallpaper/"

# Launch the file manager
xdg-open "$directory"

clear
# Install Extension Manager via Flatpak
print_large_text "${GREEN}Install one of the following packages:'gir1.2-gmenu-3.0'or'gnome-menus for ArcMenu by andrew_z '${NC}"
countdown
sudo apt install gir1.2-gmenu-3.0 gnome-menus

clear
# Edit GDM custom configuration
print_large_text "${GREEN}Installing gnome-shell-Extension...${NC}"
# Display initial message
print_large_text "${RED}You need to reboot for this to apply!..${NC}"
countdown
cd ~/Downloads/UB_to_Win
sudo ./gnome-shell-copy.sh

clear
# Install Extension Manager via Flatpak
print_large_text "${GREEN}Installing Extension Manager via Flatpak...${NC}"
countdown
sudo apt install flatpak -y
sudo apt install gnome-software-plugin-flatpak -y
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install flathub com.mattjakeman.ExtensionManager

clear
# Insttaling GDM Login Wallpaper
print_large_text "${GREEN}Insttaling GDM Login Wallpaper...${NC}"
print_large_text "${GREEN}Do Not accept y/yes!!!${NC}"
print_large_text "${GREEN}You will be prompted to reboot after!!!${NC}"
countdown

cd ~/Downloads/UB_to_Win/login
sudo ./login_wallpapaer.sh
cd $HOME/.login
chmod +x jammy-change-gdm-background
sudo ./jammy-change-gdm-background login-wallpaper.jpg

clear
# Display initial message
print_large_text "${RED}Installation was Successful! ${NC}"

# Prompt the user
read -p "Would you like to Reboot the system? (yes/y or no/n): " answer

# Convert the answer to lowercase
answer="${answer,,}"

# Check the user's response
if [[ $answer == "yes" || $answer == "y" ]]; then
    echo "Rebooting..."
    sudo reboot
elif [[ $answer == "no" || $answer == "n" ]]; then
    echo "Exiting terminal."
    exit 0
else
    echo "Invalid input. Exiting terminal."
    exit 1
fi

