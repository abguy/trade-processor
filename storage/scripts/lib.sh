#!/bin/sh

pause() {
    local dummy
    read -s -r -p "Press any key to continue..." -n 1 dummy
}

die()
{
    echo "ERROR: $*" >&2
    exit 1
}