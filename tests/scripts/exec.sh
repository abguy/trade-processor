#!/bin/sh
# add " -vx" to the line above for script debugging

set -e

cwd=`dirname $0`
files=$cwd/data/*.json
certs=$cwd/certs
url='http://consumer.host/'
baseCommand='ab -r -n 100000 -c 20000 -p '
force=0

. $cwd/lib.sh

usage()
{
	cat >&2 <<EOT
Usage: exec.sh [--force]
  --force       - Don't make pause after each call
EOT
	exit 2
}

while [ "$#" -gt 0 ]; do
    case "$1" in
        --force)
            force=1
            [ "$#" -ge 1 ] && shift 1 || break
            ;;
        --help)
            usage
            shift
            ;;
        *)
            die "Unknown or deprecated option: $1"
    esac
done


for file in $files
do
    [ "$force" -eq 0 ] && pause
    echo "Sending $file"
    $baseCommand $file $url
done

echo "done!"
exit 0
