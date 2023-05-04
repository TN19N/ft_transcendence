# colors
RED=\033[0;31m
GREEN=\033[0;32m
END=\033[0m

all: run

init:
	@ echo "${GREEN}Initializing...${END}"
	@ bash ./scripts/init.sh
	@ echo "${GREEN}Done!${END}"

build: init
	@ echo "${GREEN}Building containers...${END}"
	@ docker compose build
	@ echo "${GREEN}Done!${END}"

run: build
	@ echo "${GREEN}Starting containers...${END}"
	@ docker compose up --detach
	@ echo "${GREEN}Done!${END}"

stop:
	@ echo "${RED}Stopping containers...${END}"
	@ bash ./scripts/clean.sh stop
	@ echo "${RED}Done!${END}"

clean:
	@ echo "${RED}Cleaning up...${END}"
	@ bash ./scripts/clean.sh clean
	@ echo "${RED}Done!${END}"