#!/bin/sh
# add " -vx" to the line above for script debugging

set -e

cwd=`dirname $0`
files=$cwd/data/*.json
certs=$cwd/certs
url='https://abelyaev.net/'
force=0

. $cwd/lib.sh

usage()
{
	cat >&2 <<EOT
Usage: exec.sh [--force]
  --force       - Don't make pase after each call
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
    curl --tlsv1.2 --cert $certs/storage-client-01.crt --key $certs/storage-client-01.key $url --cacert $certs/storage-server-ca.crt -X POST --data @$file -H 'Content-Type: application/json; charset=UTF-8'
done

echo "done!"
exit 0
