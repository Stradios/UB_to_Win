#!/bin/bash

# Define the source and destination paths
source_dir="gnome-shell"
destination_dir="$HOME/.local/share"

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


