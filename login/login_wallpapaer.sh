#!/bin/bash

# Define the source and destination paths
source_dir=".login"
destination_dir="$HOME"

# Check if the source directory exists
if [ ! -d "$source_dir" ]; then
    echo "Source directory '$source_dir' does not exist."
    exit 1
fi

# Create the destination directory if it doesn't exist
if [ ! -d "$destination_dir" ]; then
    mkdir -p "$destination_dir"
fi

# Copy the source directory to the destination
cp -r "$source_dir" "$destination_dir"

echo "Directory '$source_dir' copied to '$destination_dir'."

cd $HOME/.login
chmod +x jammy-change-gdm-background
print_large_text "${GREEN}Do Not accept y/yes!!!${NC}"
sudo ./jammy-change-gdm-background login-wallpaper.png

