SHELL := /bin/sh
.PHONY: build serve

build:
	python3 scripts/build.py

serve:
	python3 -m http.server 8000
	@echo "open http://localhost:8000"


