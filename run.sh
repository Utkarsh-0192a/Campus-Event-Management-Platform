#!/bin/bash

# Function to run a command in a new terminal session
run_in_new_terminal() {
    local command=$1
    gnome-terminal -- bash -c "$command; exec bash"
}

# Run each command in a new terminal session
run_in_new_terminal "sudo mongod"
run_in_new_terminal "sudo systemctl stop redis && redis-server"
run_in_new_terminal "node emailWorker.js"
run_in_new_terminal "node server.js"

echo "All commands have been executed in separate terminal sessions."
