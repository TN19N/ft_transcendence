
function _build {
    docker-compose --env-file .\.env build --no-cache
}

function _start {
    docker-compose --env-file .\.env up -d
}

function _stop {
    docker-compose down 2> $null
}

function _clean {
    _stop
    docker-compose rm -sf 2> $null
}

function _fclean {
    _clean
    docker system prune -af 2> $null
    docker volume rm $(docker volume ls -q) 2> $null
}

Switch ( $args[0] ) {

    "stop"      { _stop }
    "clean"     { _clean }
    "fclean"    { _clean; _fclean }
    "build"     { _build }
    "start"     { _build; _start }
    Default     { Write-Host "Useg: $($MyInvocation.MyCommand.Name) [ start | stop | clean | fclean ]" }

}