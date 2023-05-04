# colors
RED:=\033[0;31m
GREEN:=\033[0;32m
END:=\033[0m

UNAME:=$(shell uname)

ifeq ($(UNAME), Linux)
	ECHO:="echo -e"
else ifeq ($(UNAME), Darwin)
	ECHO:="echo"
else
	$(error $(UNAME) is not supported)
endif

all: run

init:
	@ $(ECHO) "${GREEN}Initializing...${END}"
	@ bash ./scripts/init.sh
	@ $(ECHO) "${GREEN}Done!${END}"

build: init
	@ $(ECHO) "${GREEN}Building containers...${END}"
	@ docker compose build
	@ $(ECHO) "${GREEN}Done!${END}"

run: build
	@ $(ECHO) "${GREEN}Starting containers...${END}"
	@ docker compose up --detach
	@ $(ECHO) "${GREEN}Done!${END}"

stop:
	@ $(ECHO) "${RED}Stopping containers...${END}"
	@ bash ./scripts/clean.sh stop
	@ $(ECHO) "${RED}Done!${END}"

clean:
	@ $(ECHO) "${RED}Cleaning up...${END}"
	@ bash ./scripts/clean.sh clean
	@ $(ECHO) "${RED}Done!${END}"